import {
  engine,
  Entity,
  InputAction,
  Material,
  MeshCollider,
  MeshRenderer,
  pointerEventsSystem,
  TextShape,
  Transform
} from '@dcl/sdk/ecs'
import { Color4, Quaternion, Vector3 } from '@dcl/sdk/math'

// Story stones: the question and its answers are physical, large tap targets
// in the world — not a 2D card. One pooled set materialises at whichever
// board was tapped; a slab tap answers and the set sinks away. Slabs are big
// and self-evidently tappable (touch has no hover).

const STONE = Color4.fromHexString('#3B3B3B')
const SLAB = Color4.fromHexString('#5C4033')
const SLAB_GLOW = Color4.fromHexString('#FFB347')
const INK = Color4.fromHexString('#F3E9DC')
const CENTER = Vector3.create(8, 0, 8)
const PARKED = Vector3.create(8, -4, 8)
const MAX_SLABS = 3

let promptStone: Entity | null = null
let promptText: Entity | null = null
const slabs: { body: Entity; text: Entity }[] = []
let currentAnswers: string[] = []
let currentCb: ((answer: string) => void) | null = null

export function initStones(): void {
  promptStone = engine.addEntity()
  Transform.create(promptStone, { position: PARKED, scale: Vector3.create(2.6, 1.2, 0.18) })
  MeshRenderer.setBox(promptStone)
  Material.setPbrMaterial(promptStone, { albedoColor: STONE, roughness: 1 })

  promptText = engine.addEntity()
  Transform.create(promptText, { position: PARKED })
  TextShape.create(promptText, { text: '', fontSize: 1.4, textColor: INK })

  for (let i = 0; i < MAX_SLABS; i++) {
    const body = engine.addEntity()
    Transform.create(body, { position: PARKED, scale: Vector3.create(1.5, 0.6, 0.14) })
    MeshRenderer.setBox(body)
    MeshCollider.setBox(body)
    Material.setPbrMaterial(body, {
      albedoColor: SLAB,
      emissiveColor: SLAB_GLOW,
      emissiveIntensity: 0.6,
      roughness: 1
    })

    const text = engine.addEntity()
    Transform.create(text, { position: PARKED })
    TextShape.create(text, { text: '', fontSize: 1.1, textColor: INK })

    const index = i
    pointerEventsSystem.onPointerDown(
      { entity: body, opts: { button: InputAction.IA_POINTER, hoverText: 'Answer' } },
      () => {
        const answer = currentAnswers[index]
        const cb = currentCb
        hideStones()
        if (answer !== undefined && cb) cb(answer)
      }
    )
    slabs.push({ body, text })
  }
}

export function showStones(anchor: Vector3, prompt: string, answers: string[], onAnswer: (answer: string) => void): void {
  if (promptStone === null || promptText === null) return
  currentAnswers = answers.slice(0, MAX_SLABS)
  currentCb = onAnswer

  // The set faces the campfire, standing on the far side of the board.
  const yaw = Math.atan2(CENTER.x - anchor.x, CENTER.z - anchor.z) * (180 / Math.PI)
  const rot = Quaternion.fromEulerDegrees(0, yaw + 180, 0)
  const len = Math.hypot(anchor.x - CENTER.x, anchor.z - CENTER.z) || 1
  const awayX = (anchor.x - CENTER.x) / len
  const awayZ = (anchor.z - CENTER.z) / len
  // Toward-fire unit vector, used to lift text off its backing face.
  const inX = -awayX * 0.02
  const inZ = -awayZ * 0.02

  const baseX = anchor.x + awayX * 1.6
  const baseZ = anchor.z + awayZ * 1.6

  Transform.createOrReplace(promptStone, {
    position: Vector3.create(baseX, 2.15, baseZ),
    rotation: rot,
    scale: Vector3.create(2.6, 1.2, 0.18)
  })
  Transform.createOrReplace(promptText, {
    position: Vector3.create(baseX + inX, 2.15, baseZ + inZ),
    rotation: rot
  })
  TextShape.getMutable(promptText).text = wrap(prompt, 30)

  // Slabs spread along the axis perpendicular to the fire direction.
  const sideX = -awayZ
  const sideZ = awayX
  const n = currentAnswers.length
  currentAnswers.forEach((answer, i) => {
    const offset = (i - (n - 1) / 2) * 1.75
    const x = baseX + sideX * offset
    const z = baseZ + sideZ * offset
    Transform.createOrReplace(slabs[i].body, {
      position: Vector3.create(x, 1.15, z),
      rotation: rot,
      scale: Vector3.create(1.5, 0.6, 0.14)
    })
    Transform.createOrReplace(slabs[i].text, {
      position: Vector3.create(x + inX, 1.15, z + inZ),
      rotation: rot
    })
    TextShape.getMutable(slabs[i].text).text = wrap(answer, 18)
  })
  for (let i = n; i < MAX_SLABS; i++) park(slabs[i])
}

export function hideStones(): void {
  if (promptStone) Transform.createOrReplace(promptStone, { position: PARKED, scale: Vector3.Zero() })
  if (promptText) Transform.createOrReplace(promptText, { position: PARKED })
  for (const s of slabs) park(s)
  currentAnswers = []
  currentCb = null
}

function park(s: { body: Entity; text: Entity }): void {
  Transform.createOrReplace(s.body, { position: PARKED, scale: Vector3.Zero() })
  Transform.createOrReplace(s.text, { position: PARKED })
}

function wrap(text: string, width: number): string {
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
