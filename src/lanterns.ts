import { Billboard, engine, Entity, Material, MeshRenderer, TextShape, Transform } from '@dcl/sdk/ecs'
import { Color4, Vector3 } from '@dcl/sdk/math'
import { SPARK_BY_ID, SparkId } from './content/sparks'
import { WallEntry } from './shared/types'
import { store } from './state'

// The lantern field: every wall entry is a lantern a real person left,
// standing in an arc behind that entry's board, lit in the author's first
// spark colour. Data rendered as geometry — the same synced walls the boards
// read, so the field grows live as answers land.

const PER_BOARD_CAP = 15
const CENTER = Vector3.create(8, 0, 8)

/** Arc base angle (radians, atan2(x-8, z-8)) per board; -1 is the plaza wall. */
const BOARD_ANGLE = new Map<number, number>([
  [0, Math.atan2(4 - 8, 4 - 8)],
  [1, Math.atan2(12 - 8, 4 - 8)],
  [2, Math.atan2(4 - 8, 12 - 8)],
  [3, Math.atan2(12 - 8, 12 - 8)],
  [-1, Math.atan2(0, 1)]
])

const POST = Color4.fromHexString('#4A3728')
const NEUTRAL = Color4.fromHexString('#FFB347')

interface Lantern {
  post: Entity
  head: Entity
}

const lanterns = new Map<string, Lantern>()
let namePlate: Entity | null = null
/** The ignited lantern survives display-cap eviction while it carries the name. */
let pinnedKey: string | null = null

export function initLanterns(): void {
  store.onWallChange(rebuild)
  rebuild()
}

/**
 * The matched lantern ignites: brighter, larger head, and the one shared
 * name plate moves above it — the name at the end of the trail. The lantern
 * is created on demand if it sits beyond the per-board display cap (it is
 * still real data, just old).
 */
export function igniteLantern(key: string, name: string): Vector3 | null {
  pinnedKey = key
  let lantern = lanterns.get(key)
  if (!lantern) {
    const entry = findEntryByKey(key)
    if (!entry) return null
    rebuildOne(entry)
    lantern = lanterns.get(key)
    if (!lantern) return null
  }
  const head = Material.getMutableOrNull(lantern.head)
  if (head?.material?.$case === 'pbr') head.material.pbr.emissiveIntensity = 5
  const t = Transform.getMutableOrNull(lantern.head)
  const pos = t ? t.position : null
  if (t) t.scale = Vector3.create(0.36, 0.42, 0.36)
  if (pos) {
    if (namePlate === null) {
      namePlate = engine.addEntity()
      Billboard.create(namePlate)
      TextShape.create(namePlate, { text: '', fontSize: 2, textColor: Color4.fromHexString('#F3E9DC') })
    }
    Transform.createOrReplace(namePlate, { position: Vector3.create(pos.x, 1.75, pos.z) })
    TextShape.getMutable(namePlate).text = name
    return Vector3.create(pos.x, 1.14, pos.z)
  }
  return null
}

function findEntryByKey(key: string): WallEntry | null {
  for (const table of [-1, 0, 1, 2, 3]) {
    for (const e of store.getWallEntries(table)) {
      if (e.address !== '' && entryKey(e) === key) return e
    }
  }
  return null
}

function entryKey(e: WallEntry): string {
  return `${e.address}:${e.promptId}:${e.dayIndex}`
}

function hashString(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

function lanternColor(e: WallEntry): Color4 {
  const first = (e.sparks ?? [])[0] as SparkId | undefined
  const spark = first ? SPARK_BY_ID.get(first) : undefined
  return spark ? Color4.fromHexString(spark.color) : NEUTRAL
}

/**
 * Deterministic spot in the board's arc: same entry, same place, on every
 * client and every visit. Radius rows 7.2/8.3/9.4 from the fire, ±40° spread.
 */
function lanternPosition(e: WallEntry): Vector3 {
  const h = hashString(entryKey(e))
  const base = BOARD_ANGLE.get(e.table) ?? 0
  const angle = base + (((h >> 3) % 81) - 40) * (Math.PI / 180)
  const radius = 7.2 + (h % 3) * 1.1
  return Vector3.create(
    CENTER.x + Math.sin(angle) * radius,
    0,
    CENTER.z + Math.cos(angle) * radius
  )
}

function rebuild(): void {
  const wanted = new Map<string, WallEntry>()
  for (const table of [-1, 0, 1, 2, 3]) {
    const entries = store.getWallEntries(table)
    for (const e of entries.slice(-PER_BOARD_CAP)) {
      // Local pending echoes have no address yet — skip until confirmed.
      if (e.address === '') continue
      wanted.set(entryKey(e), e)
    }
  }

  for (const [key, lantern] of lanterns) {
    if (!wanted.has(key) && key !== pinnedKey) {
      engine.removeEntity(lantern.post)
      engine.removeEntity(lantern.head)
      lanterns.delete(key)
    }
  }

  for (const [key, e] of wanted) {
    if (lanterns.has(key)) continue
    rebuildOne(e)
  }
}

function rebuildOne(e: WallEntry): void {
  const key = entryKey(e)
  if (lanterns.has(key)) return
  const pos = lanternPosition(e)
  const color = lanternColor(e)

  const post = engine.addEntity()
  Transform.create(post, {
    position: Vector3.create(pos.x, 0.5, pos.z),
    scale: Vector3.create(0.07, 1.0, 0.07)
  })
  MeshRenderer.setCylinder(post)
  Material.setPbrMaterial(post, { albedoColor: POST, roughness: 1 })

  const head = engine.addEntity()
  Transform.create(head, {
    position: Vector3.create(pos.x, 1.14, pos.z),
    scale: Vector3.create(0.26, 0.3, 0.26)
  })
  MeshRenderer.setBox(head)
  Material.setPbrMaterial(head, {
    albedoColor: color,
    emissiveColor: color,
    emissiveIntensity: 2.2,
    roughness: 1
  })

  lanterns.set(key, { post, head })
}
