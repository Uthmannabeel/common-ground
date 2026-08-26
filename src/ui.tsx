import { engine, UiCanvasInformation } from '@dcl/sdk/ecs'
import { Color4 } from '@dcl/sdk/math'
import ReactEcs, { Label, ReactEcsRenderer, ScreenInsetArea, UiEntity } from '@dcl/sdk/react-ecs'
import { isMobile } from '@dcl/sdk/platform'
import { PICKS_REQUIRED, SPARKS, SparkId } from './content/sparks'

// M2: every interaction is a tap on a large target. No text input anywhere.
// G6: sizes are authored for desktop 1920x1080 (unchanged from the tuned
// originals) and rescaled each frame from the live canvas, so the same
// screens survive portrait phones. Judging is hands-on in the DCL mobile
// app — portrait is the primary target.

const INK = Color4.fromHexString('#F3E9DC')
const PANEL = Color4.create(0.09, 0.06, 0.05, 0.94)
const PANEL_SOFT = Color4.create(0.16, 0.11, 0.09, 1)
const ACCENT = Color4.fromHexString('#FF7A29')
const DIM = Color4.create(0.95, 0.91, 0.86, 0.55)
const INK_DARK = Color4.fromHexString('#241B14')

// --- Responsive scale -------------------------------------------------------

const canvas = { width: 1920, height: 1080 }

function canvasSystem() {
  const c = UiCanvasInformation.getOrNull(engine.RootEntity)
  if (c && c.width > 0 && c.height > 0) {
    canvas.width = c.width
    canvas.height = c.height
  }
}

function portrait(): boolean {
  return canvas.height > canvas.width
}

// getPlatform() reports asynchronously (null at first), so a portrait aspect
// is the fallback signal — no desktop client runs portrait.
function mobileUi(): boolean {
  return isMobile() || portrait()
}

/**
 * Rescale a desktop design size to the live canvas. Desktop-tuned UI reads
 * far too small on a phone, so portrait gets a heavy readability bump;
 * landscape mobile gets a light one (its height budget can't fit more —
 * the picker alone stacks ~9 design rows).
 */
function t(n: number): number {
  const base = Math.min(canvas.width, canvas.height) / 1080
  const bump = portrait() ? 2.2 : mobileUi() ? 1.35 : 1
  return Math.round(n * base * bump)
}

function panelWidth(desktopMax: number): number {
  return portrait()
    ? Math.round(canvas.width * 0.94)
    : Math.min(Math.round(canvas.width * 0.9), t(desktopMax))
}

// --- Screens ----------------------------------------------------------------

type Screen =
  | { kind: 'none' }
  | { kind: 'picker' }
  | {
      kind: 'card'
      title: string
      prompt: string
      answers: string[]
      onAnswer: (answer: string) => void
    }
  | { kind: 'toast'; text: string; until: number }
  | { kind: 'reveal'; r: Reveal }

export interface Reveal {
  name: string
  line: string
  sharedSparks: string[]
  count: string
}

let screen: Screen = { kind: 'none' }
let picked: SparkId[] = []
let onPickerConfirm: (sparks: SparkId[]) => void = () => {}

export function showPicker(onConfirm: (sparks: SparkId[]) => void): void {
  picked = []
  onPickerConfirm = onConfirm
  screen = { kind: 'picker' }
}

export function showCard(
  title: string,
  prompt: string,
  answers: string[],
  onAnswer: (answer: string) => void
): void {
  screen = { kind: 'card', title, prompt, answers, onAnswer }
}

export function showToast(text: string, seconds = 4): void {
  screen = { kind: 'toast', text, until: Date.now() + seconds * 1000 }
}

/** The Spark Match moment. Stays up until dismissed — it is the screenshot. */
export function showReveal(r: Reveal): void {
  screen = { kind: 'reveal', r }
}

export function setupUi() {
  engine.addSystem(canvasSystem)
  ReactEcsRenderer.setUiRenderer(Root, { virtualWidth: 1920, virtualHeight: 1080 })
}

function Root() {
  if (screen.kind === 'toast' && Date.now() > screen.until) screen = { kind: 'none' }

  return (
    <UiEntity uiTransform={{ width: '100%', height: '100%' }}>
      <ScreenInsetArea>
        <UiEntity
          uiTransform={{
            width: '100%',
            height: '100%',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          {screen.kind === 'picker' && <SparkPicker />}
          {screen.kind === 'card' && <AnswerCard s={screen} />}
          {screen.kind === 'toast' && <Toast text={screen.text} />}
          {screen.kind === 'reveal' && <SparkMatch r={screen.r} />}
        </UiEntity>
      </ScreenInsetArea>
    </UiEntity>
  )
}

function SparkPicker() {
  const ready = picked.length === PICKS_REQUIRED
  const width = panelWidth(1240)
  const pad = t(40)
  // Portrait: 2 columns of 4. Landscape: 4 columns of 2. Tile width derives
  // from the panel so the grid always fits — no wrap surprises on any screen.
  const cols = portrait() ? 2 : 4
  const tileMargin = t(8)
  const tileW = Math.floor((width - pad * 2) / cols) - tileMargin * 2
  const tileH = t(120)
  return (
    <UiEntity
      uiTransform={{
        width,
        flexDirection: 'column',
        alignItems: 'center',
        padding: pad,
        pointerFilter: 'block'
      }}
      uiBackground={{ color: PANEL }}
    >
      <Label value="What do you love?" fontSize={t(54)} color={INK} uiTransform={{ height: t(70) }} />
      <Label
        value={`Pick ${PICKS_REQUIRED} sparks. They decide where you sit.`}
        fontSize={t(30)}
        color={DIM}
        uiTransform={{ height: t(50), margin: `0 0 ${t(24)}px 0` }}
      />
      <UiEntity
        uiTransform={{
          width: '100%',
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}
      >
        {SPARKS.map((spark) => {
          const selected = picked.includes(spark.id)
          return (
            <UiEntity
              key={spark.id}
              uiTransform={{
                width: tileW,
                height: tileH,
                margin: tileMargin,
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: selected ? t(5) : 0,
                borderColor: INK,
                pointerFilter: 'block'
              }}
              uiBackground={{
                color: selected ? Color4.fromHexString(spark.color) : PANEL_SOFT
              }}
              onMouseDown={() => toggleSpark(spark.id)}
            >
              <Label value={spark.label} fontSize={t(32)} color={INK} />
            </UiEntity>
          )
        })}
      </UiEntity>
      <UiEntity
        uiTransform={{
          width: Math.min(t(440), Math.round(width * 0.8)),
          height: t(100),
          margin: `${t(28)}px 0 0 0`,
          justifyContent: 'center',
          alignItems: 'center',
          pointerFilter: 'block'
        }}
        uiBackground={{ color: ready ? ACCENT : PANEL_SOFT }}
        onMouseDown={() => {
          if (!ready) return
          const sparks = [...picked]
          screen = { kind: 'none' }
          onPickerConfirm(sparks)
        }}
      >
        <Label
          value={ready ? 'Find my table' : `${picked.length} of ${PICKS_REQUIRED} picked`}
          fontSize={t(36)}
          color={ready ? INK_DARK : DIM}
        />
      </UiEntity>
    </UiEntity>
  )
}

function toggleSpark(id: SparkId): void {
  if (picked.includes(id)) {
    picked = picked.filter((p) => p !== id)
  } else if (picked.length < PICKS_REQUIRED) {
    picked = [...picked, id]
  }
}

function AnswerCard(props: { s: Extract<Screen, { kind: 'card' }> }) {
  const { s } = props
  const width = panelWidth(1000)
  const answerW = Math.round(width * 0.82)
  return (
    <UiEntity
      uiTransform={{
        width,
        flexDirection: 'column',
        alignItems: 'center',
        padding: t(48),
        pointerFilter: 'block'
      }}
      uiBackground={{ color: PANEL }}
    >
      <Label value={s.title} fontSize={t(30)} color={ACCENT} uiTransform={{ height: t(46) }} />
      <Label
        value={s.prompt}
        fontSize={t(40)}
        color={INK}
        textAlign="middle-center"
        uiTransform={{
          width: '100%',
          height: t(portrait() ? 200 : 130),
          margin: `${t(8)}px 0 ${t(20)}px 0`
        }}
      />
      {s.answers.map((answer) => (
        <UiEntity
          key={answer}
          uiTransform={{
            width: answerW,
            height: t(96),
            margin: t(8),
            justifyContent: 'center',
            alignItems: 'center',
            pointerFilter: 'block'
          }}
          uiBackground={{ color: PANEL_SOFT }}
          onMouseDown={() => {
            screen = { kind: 'none' }
            s.onAnswer(answer)
          }}
        >
          <Label value={answer} fontSize={t(32)} color={INK} />
        </UiEntity>
      ))}
      <UiEntity
        uiTransform={{
          width: t(300),
          height: t(70),
          margin: `${t(20)}px 0 0 0`,
          justifyContent: 'center',
          alignItems: 'center',
          pointerFilter: 'block'
        }}
        onMouseDown={() => {
          screen = { kind: 'none' }
        }}
      >
        <Label value="Not now" fontSize={t(26)} color={DIM} />
      </UiEntity>
    </UiEntity>
  )
}

function SparkMatch(props: { r: Reveal }) {
  const { r } = props
  const width = panelWidth(1100)
  // A long display name must not spill out of a portrait panel.
  const nameSize = portrait() ? t(44) : t(72)
  return (
    <UiEntity
      uiTransform={{
        width,
        flexDirection: 'column',
        alignItems: 'center',
        padding: t(56),
        pointerFilter: 'block'
      }}
      uiBackground={{ color: PANEL }}
    >
      <Label value="SPARK MATCH" fontSize={t(28)} color={ACCENT} uiTransform={{ height: t(44) }} />
      <Label
        value={r.name}
        fontSize={nameSize}
        color={INK}
        uiTransform={{ height: Math.round(nameSize * 1.35), margin: `${t(4)}px 0 0 0` }}
      />
      <Label
        value={r.line}
        fontSize={t(38)}
        color={INK}
        textAlign="middle-center"
        uiTransform={{
          width: '100%',
          height: t(portrait() ? 190 : 120),
          margin: `${t(12)}px 0 ${t(8)}px 0`
        }}
      />
      {r.sharedSparks.length > 0 && (
        <UiEntity
          uiTransform={{
            width: '100%',
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'center',
            margin: `${t(8)}px 0 0 0`
          }}
        >
          {r.sharedSparks.map((label) => {
            const spark = SPARKS.find((s) => s.label === label)
            return (
              <UiEntity
                key={label}
                uiTransform={{
                  height: t(64),
                  padding: `0 ${t(22)}px`,
                  margin: t(6),
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
                uiBackground={{ color: spark ? Color4.fromHexString(spark.color) : PANEL_SOFT }}
              >
                <Label value={label} fontSize={t(28)} color={INK} />
              </UiEntity>
            )
          })}
        </UiEntity>
      )}
      <Label value={r.count} fontSize={t(28)} color={DIM} uiTransform={{ height: t(48), margin: `${t(20)}px 0 0 0` }} />
      <UiEntity
        uiTransform={{
          width: t(440),
          height: t(96),
          margin: `${t(28)}px 0 0 0`,
          justifyContent: 'center',
          alignItems: 'center',
          pointerFilter: 'block'
        }}
        uiBackground={{ color: ACCENT }}
        onMouseDown={() => {
          screen = { kind: 'none' }
        }}
      >
        <Label value="Nice to meet you" fontSize={t(34)} color={INK_DARK} />
      </UiEntity>
    </UiEntity>
  )
}

function Toast(props: { text: string }) {
  // Mobile keeps the toast above the client's fixed HUD (interaction button
  // bottom-right, joystick bottom-left); portrait also gets a smaller font
  // and a taller box so long spawn toasts wrap to ~3 lines instead of clipping.
  const bottom = Math.round(canvas.height * (mobileUi() ? 0.22 : 0.13))
  return (
    <UiEntity
      uiTransform={{
        positionType: 'absolute',
        position: { bottom },
        width: panelWidth(1100),
        height: t(portrait() ? 150 : 110),
        justifyContent: 'center',
        alignItems: 'center',
        padding: t(20)
      }}
      uiBackground={{ color: PANEL }}
    >
      <Label
        value={props.text}
        fontSize={portrait() ? t(26) : t(32)}
        color={INK}
        textAlign="middle-center"
      />
    </UiEntity>
  )
}
