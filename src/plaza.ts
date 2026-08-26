import {
  engine,
  Entity,
  Transform,
  MeshRenderer,
  MeshCollider,
  Material,
  TextShape,
  InputAction,
  pointerEventsSystem
} from '@dcl/sdk/ecs'
import { Color4, Quaternion, Vector3 } from '@dcl/sdk/math'
import { todaysQuestion } from './content/dailyQuestions'
import { dayIndexNow } from './shared/types'
import { store } from './state'

// M1 greybox: primitives + emissive materials only, no asset downloads.
// The G2 art pass replaces geometry; layout, names, and interaction points stay.

export const TABLE_COUNT = 4

export const TABLE_NAMES = ['Ember', 'Driftwood', 'Lantern', 'North Star']

export const TABLE_POSITIONS = [
  Vector3.create(4, 0, 4),
  Vector3.create(12, 0, 4),
  Vector3.create(4, 0, 12),
  Vector3.create(12, 0, 12)
]

export const STAND_POSITION = Vector3.create(8, 0, 10.6)

const CENTER = Vector3.create(8, 0, 8)

const WOOD = Color4.fromHexString('#5C4033')
const STONE = Color4.fromHexString('#6E6E6E')
const GROUND = Color4.fromHexString('#3A2E2A')
const FLAME = Color4.fromHexString('#FF7A29')

export interface PlazaHandlers {
  onTableTapped: (table: number) => void
  onQuestionStandTapped: () => void
}

let flame: Entity | null = null
const tableBoards: Entity[] = []
let plazaBoard: Entity | null = null

export function buildPlaza(handlers: PlazaHandlers): void {
  buildGround()
  buildCampfire()
  for (let i = 0; i < TABLE_COUNT; i++) buildTable(i, handlers)
  buildQuestionStand(handlers)
  engine.addSystem(flickerSystem)
  store.onWallChange(refreshBoards)
  refreshBoards()
}

function buildGround(): void {
  const ground = engine.addEntity()
  Transform.create(ground, {
    position: Vector3.create(8, 0.01, 8),
    rotation: Quaternion.fromEulerDegrees(90, 0, 0),
    scale: Vector3.create(15.5, 15.5, 1)
  })
  MeshRenderer.setPlane(ground)
  Material.setPbrMaterial(ground, { albedoColor: GROUND, roughness: 1 })
}

function buildCampfire(): void {
  const ring = engine.addEntity()
  Transform.create(ring, {
    position: Vector3.create(CENTER.x, 0.15, CENTER.z),
    scale: Vector3.create(1.8, 0.3, 1.8)
  })
  MeshRenderer.setCylinder(ring)
  MeshCollider.setCylinder(ring)
  Material.setPbrMaterial(ring, { albedoColor: STONE, roughness: 1 })

  flame = engine.addEntity()
  Transform.create(flame, {
    position: Vector3.create(CENTER.x, 0.9, CENTER.z),
    scale: Vector3.create(0.8, 1.2, 0.8)
  })
  // Cone: cylinder with zero top radius.
  MeshRenderer.setCylinder(flame, 0.5, 0)
  Material.setPbrMaterial(flame, {
    albedoColor: FLAME,
    emissiveColor: Color4.fromHexString('#FFB347'),
    emissiveIntensity: 4,
    roughness: 1
  })
}

function buildTable(index: number, handlers: PlazaHandlers): void {
  const pos = TABLE_POSITIONS[index]
  const toCenter = Math.atan2(CENTER.x - pos.x, CENTER.z - pos.z) * (180 / Math.PI)

  const top = engine.addEntity()
  Transform.create(top, {
    position: Vector3.create(pos.x, 0.85, pos.z),
    scale: Vector3.create(2.2, 0.12, 2.2)
  })
  MeshRenderer.setCylinder(top)
  MeshCollider.setCylinder(top)
  Material.setPbrMaterial(top, { albedoColor: WOOD, roughness: 0.9 })

  const base = engine.addEntity()
  Transform.create(base, {
    position: Vector3.create(pos.x, 0.4, pos.z),
    scale: Vector3.create(0.5, 0.8, 0.5)
  })
  MeshRenderer.setCylinder(base)
  Material.setPbrMaterial(base, { albedoColor: WOOD, roughness: 0.9 })

  for (const side of [-1, 1]) {
    const bench = engine.addEntity()
    Transform.create(bench, {
      position: Vector3.create(pos.x + side * 1.7, 0.25, pos.z),
      scale: Vector3.create(0.5, 0.5, 2.0)
    })
    MeshRenderer.setBox(bench)
    MeshCollider.setBox(bench)
    Material.setPbrMaterial(bench, { albedoColor: WOOD, roughness: 0.9 })
  }

  const sign = engine.addEntity()
  Transform.create(sign, {
    position: Vector3.create(pos.x, 2.4, pos.z),
    rotation: Quaternion.fromEulerDegrees(0, toCenter + 180, 0)
  })
  TextShape.create(sign, {
    text: TABLE_NAMES[index],
    fontSize: 3,
    textColor: Color4.fromHexString('#F3E9DC')
  })

  // Answer wall: a board behind the table, facing the campfire.
  const awayX = pos.x + (pos.x - CENTER.x) * 0.35
  const awayZ = pos.z + (pos.z - CENTER.z) * 0.35
  const board = engine.addEntity()
  Transform.create(board, {
    position: Vector3.create(awayX, 1.6, awayZ),
    rotation: Quaternion.fromEulerDegrees(0, toCenter + 180, 0),
    scale: Vector3.create(2.6, 1.8, 1)
  })
  MeshRenderer.setPlane(board)
  Material.setPbrMaterial(board, { albedoColor: Color4.fromHexString('#241B14'), roughness: 1 })

  // Text sits 0.01m in front of the backing panel (toward the campfire) so the
  // two planes never z-fight — same trick as the plaza stand below.
  const toCenterLen = Math.hypot(CENTER.x - awayX, CENTER.z - awayZ)
  const boardText = engine.addEntity()
  Transform.create(boardText, {
    position: Vector3.create(
      awayX + ((CENTER.x - awayX) / toCenterLen) * 0.01,
      1.6,
      awayZ + ((CENTER.z - awayZ) / toCenterLen) * 0.01
    ),
    rotation: Quaternion.fromEulerDegrees(0, toCenter + 180, 0)
  })
  TextShape.create(boardText, {
    text: '',
    fontSize: 1,
    textColor: Color4.fromHexString('#F3E9DC')
  })
  tableBoards[index] = boardText

  pointerEventsSystem.onPointerDown(
    { entity: top, opts: { button: InputAction.IA_POINTER, hoverText: `Sit at ${TABLE_NAMES[index]}` } },
    () => handlers.onTableTapped(index)
  )
}

function buildQuestionStand(handlers: PlazaHandlers): void {
  const pillar = engine.addEntity()
  Transform.create(pillar, {
    position: Vector3.create(8, 0.9, 10.6),
    scale: Vector3.create(0.5, 1.8, 0.5)
  })
  MeshRenderer.setBox(pillar)
  MeshCollider.setBox(pillar)
  Material.setPbrMaterial(pillar, { albedoColor: STONE, roughness: 1 })

  // The question itself is readable from across the plaza — the retention
  // mechanic must not hide behind a tap.
  const title = engine.addEntity()
  Transform.create(title, {
    position: Vector3.create(8, 2.5, 10.6),
    rotation: Quaternion.fromEulerDegrees(0, 180, 0)
  })
  TextShape.create(title, {
    text: `TODAY'S QUESTION\n${wrapText(todaysQuestion(Date.now()).prompt, 26)}`,
    fontSize: 1.6,
    textColor: Color4.fromHexString('#FFB347')
  })

  const board = engine.addEntity()
  Transform.create(board, {
    position: Vector3.create(8, 1.4, 11.4),
    rotation: Quaternion.fromEulerDegrees(0, 0, 0),
    scale: Vector3.create(3.2, 2.0, 1)
  })
  MeshRenderer.setPlane(board)
  Material.setPbrMaterial(board, { albedoColor: Color4.fromHexString('#241B14'), roughness: 1 })

  plazaBoard = engine.addEntity()
  Transform.create(plazaBoard, {
    position: Vector3.create(8, 1.4, 11.39),
    rotation: Quaternion.fromEulerDegrees(0, 180, 0)
  })
  TextShape.create(plazaBoard, {
    text: '',
    fontSize: 1,
    textColor: Color4.fromHexString('#F3E9DC')
  })

  pointerEventsSystem.onPointerDown(
    { entity: pillar, opts: { button: InputAction.IA_POINTER, hoverText: 'Answer today\'s question' } },
    () => handlers.onQuestionStandTapped()
  )
}

function wrapText(text: string, width: number): string {
  const words = text.split(' ')
  const lines: string[] = []
  let line = ''
  for (const w of words) {
    if (line.length + w.length + 1 > width && line.length > 0) {
      lines.push(line)
      line = w
    } else {
      line = line.length === 0 ? w : `${line} ${w}`
    }
  }
  if (line.length > 0) lines.push(line)
  return lines.join('\n')
}

/** "23 answers · latest today" — retention legible in a single visit. */
function stampFor(entries: { dayIndex: number }[]): string {
  if (entries.length === 0) return ''
  const today = dayIndexNow(Date.now())
  const latest = Math.max(...entries.map((e) => e.dayIndex))
  const age = today - latest
  const when = age <= 0 ? 'today' : age === 1 ? 'yesterday' : `${age} days ago`
  return `${entries.length} answer${entries.length === 1 ? '' : 's'} · latest ${when}`
}

function formatEntries(table: number, max: number): string {
  const all = store.getWallEntries(table)
  const entries = all.slice(-max).reverse()
  const body = entries.map((e) => `"${e.answer}"\n— ${e.author}`).join('\n\n')
  return `${stampFor(all)}\n\n${body}`
}

function refreshBoards(): void {
  for (let i = 0; i < TABLE_COUNT; i++) {
    const board = tableBoards[i]
    if (board) TextShape.getMutable(board).text = formatEntries(i, 3)
  }
  if (plazaBoard) TextShape.getMutable(plazaBoard).text = formatEntries(-1, 4)
}

let t = 0
let flare = 0

/** Momentary surge when an ember lands — decays over ~1.5s. */
export function fireFlare(strength = 0.5): void {
  flare = Math.min(1.2, flare + strength)
}

function flickerSystem(dt: number): void {
  if (!flame) return
  t += dt
  flare = Math.max(0, flare - dt * 0.8)
  // The fire visibly grows with every answer ever given: log-scaled so the
  // first playtests transform it and the thousandth still moves it.
  const growth = Math.min(0.9, Math.log10(1 + store.getEmbers()) * 0.28)
  const s = 1 + 0.12 * Math.sin(t * 9) + 0.06 * Math.sin(t * 23) + flare * 0.35
  const base = 1 + growth + flare * 0.3
  const transform = Transform.getMutable(flame)
  transform.scale = Vector3.create(0.8 * base * s, 1.2 * base * (2 - s), 0.8 * base * s)
}
