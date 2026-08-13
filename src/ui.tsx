import { Color4 } from '@dcl/sdk/math'
import ReactEcs, { Label, ReactEcsRenderer, ScreenInsetArea, UiEntity } from '@dcl/sdk/react-ecs'
import { PICKS_REQUIRED, SPARKS, SparkId } from './content/sparks'

// M2: every interaction is a tap on a large target. No text input anywhere.
// Sizes are tuned for a 6-inch screen at the 1920x1080 virtual canvas.

const INK = Color4.fromHexString('#F3E9DC')
const PANEL = Color4.create(0.09, 0.06, 0.05, 0.94)
const PANEL_SOFT = Color4.create(0.16, 0.11, 0.09, 1)
const ACCENT = Color4.fromHexString('#FF7A29')
const DIM = Color4.create(0.95, 0.91, 0.86, 0.55)

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

export function setupUi() {
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
        </UiEntity>
      </ScreenInsetArea>
    </UiEntity>
  )
}

function SparkPicker() {
  const ready = picked.length === PICKS_REQUIRED
  return (
    <UiEntity
      uiTransform={{
        width: 1240,
        height: 820,
        flexDirection: 'column',
        alignItems: 'center',
        padding: 40,
        pointerFilter: 'block'
      }}
      uiBackground={{ color: PANEL }}
    >
      <Label value="What do you love?" fontSize={54} color={INK} uiTransform={{ height: 70 }} />
      <Label
        value={`Pick ${PICKS_REQUIRED} sparks. They decide where you sit.`}
        fontSize={30}
        color={DIM}
        uiTransform={{ height: 50, margin: '0 0 24px 0' }}
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
                width: 270,
                height: 120,
                margin: 8,
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: selected ? 5 : 0,
                borderColor: INK,
                pointerFilter: 'block'
              }}
              uiBackground={{
                color: selected ? Color4.fromHexString(spark.color) : PANEL_SOFT
              }}
              onMouseDown={() => toggleSpark(spark.id)}
            >
              <Label value={spark.label} fontSize={32} color={INK} />
            </UiEntity>
          )
        })}
      </UiEntity>
      <UiEntity
        uiTransform={{
          width: 440,
          height: 100,
          margin: '28px 0 0 0',
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
          fontSize={36}
          color={ready ? Color4.fromHexString('#241B14') : DIM}
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
  return (
    <UiEntity
      uiTransform={{
        width: 1000,
        flexDirection: 'column',
        alignItems: 'center',
        padding: 48,
        pointerFilter: 'block'
      }}
      uiBackground={{ color: PANEL }}
    >
      <Label value={s.title} fontSize={30} color={ACCENT} uiTransform={{ height: 46 }} />
      <Label
        value={s.prompt}
        fontSize={40}
        color={INK}
        textAlign="middle-center"
        uiTransform={{ width: '100%', height: 130, margin: '8px 0 20px 0' }}
      />
      {s.answers.map((answer) => (
        <UiEntity
          key={answer}
          uiTransform={{
            width: 820,
            height: 96,
            margin: 8,
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
          <Label value={answer} fontSize={32} color={INK} />
        </UiEntity>
      ))}
      <UiEntity
        uiTransform={{
          width: 300,
          height: 70,
          margin: '20px 0 0 0',
          justifyContent: 'center',
          alignItems: 'center',
          pointerFilter: 'block'
        }}
        onMouseDown={() => {
          screen = { kind: 'none' }
        }}
      >
        <Label value="Not now" fontSize={26} color={DIM} />
      </UiEntity>
    </UiEntity>
  )
}

function Toast(props: { text: string }) {
  return (
    <UiEntity
      uiTransform={{
        positionType: 'absolute',
        position: { bottom: 140 },
        width: 1100,
        height: 110,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
      }}
      uiBackground={{ color: PANEL }}
    >
      <Label value={props.text} fontSize={32} color={INK} textAlign="middle-center" />
    </UiEntity>
  )
}
