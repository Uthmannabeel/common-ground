import {
  AvatarAnchorPointType,
  AvatarAttach,
  engine,
  Entity,
  Material,
  MeshRenderer,
  PlayerIdentityData,
  Transform
} from '@dcl/sdk/ecs'
import { Color4, Vector3 } from '@dcl/sdk/math'
import { syncEntity } from '@dcl/sdk/network'
import { Storage } from '@dcl/sdk/server'
import { SPARK_BY_ID, SparkId } from './content/sparks'
import { room } from './shared/messages'
import { CGFire, CGHeartbeat, CGWall } from './shared/schemas'
import { BOARDS, WALL_CAP, WallEntry, dayIndexNow, wallStorageKey } from './shared/types'

// Headless Multiplayer Server. Owns all shared social state: walls, embers,
// player sparks. Working state lives in memory; Storage writes happen at
// checkpoints only (debounced flush + retry), every boolean checked.
// This module is dynamically imported from index.ts inside isServer(), so
// @dcl/sdk/server never enters the client bundle path. It defines no
// components at module scope.

const HEARTBEAT_MS = 2000
const FLUSH_MS = 5000
const RESERVED_ENTITY_LIMIT = 512

const MAX_ANSWER_LEN = 80
const MAX_PROMPT_LEN = 200
const MAX_AUTHOR_LEN = 40

// In-memory working state (the Storage-backed truth).
const walls = new Map<number, WallEntry[]>()
let embers = 0
/** `${address}:${promptId}:${dayIndex}` — one answer per player per prompt per day. */
const answered = new Set<string>()
/** Storage keys with unflushed changes; kept dirty until a set() returns true. */
const dirty = new Set<string>()

// Synced entities, adopted from a previous run's CRDT snapshot or created.
const wallEntities = new Map<number, Entity>()
let fireEntity: Entity | null = null
let heartbeatEntity: Entity | null = null

// Founding entries by the builders (real humans, attributed as such) so no
// wall ever renders empty. Playtest answers accumulate on top from G5.
const FOUNDING_WALL: WallEntry[] = [
  { table: 0, promptId: 'music-1', prompt: 'Your most replayed song this year — what mood is it?', answer: 'Pure hype', author: 'Nabeel · builder', address: 'builder:nabeel', dayIndex: 0, sparks: [] },
  { table: 1, promptId: 'food-3', prompt: 'Street food at midnight or a long table with strangers?', answer: 'Whichever has music', author: 'Nabeel · builder', address: 'builder:nabeel', dayIndex: 0, sparks: [] },
  { table: 2, promptId: 'games-1', prompt: 'What actually keeps you playing?', answer: 'My friends are there', author: 'Nabeel · builder', address: 'builder:nabeel', dayIndex: 0, sparks: [] },
  { table: 3, promptId: 'art-3', prompt: 'Making things is mostly…', answer: 'Suffering that becomes joy', author: 'Nabeel · builder', address: 'builder:nabeel', dayIndex: 0, sparks: [] },
  { table: -1, promptId: 'daily:A campfire needs one more thing. What?', prompt: 'A campfire needs one more thing. What?', answer: 'Stories', author: 'Nabeel · builder', address: 'builder:nabeel', dayIndex: 0, sparks: [] }
]

export async function initServer(): Promise<void> {
  console.log('[SERVER] Common Ground server starting')
  await loadState()
  adoptOrCreateEntities()
  registerHandlers()
  engine.addSystem(serverTickSystem)
  console.log(`[SERVER] ready — embers: ${embers}, walls: ${BOARDS.map((t) => walls.get(t)?.length ?? 0).join('/')}`)
}

async function loadState(): Promise<void> {
  for (const table of BOARDS) {
    const raw = await Storage.get<string>(wallStorageKey(table))
    let entries: WallEntry[] = []
    if (raw) {
      try {
        entries = JSON.parse(raw)
      } catch {
        console.log(`[SERVER] corrupt wall ${table}, starting empty`)
      }
    }
    walls.set(table, entries)
  }
  const rawEmbers = await Storage.get<string>('embers')
  embers = rawEmbers ? parseInt(rawEmbers) || 0 : 0

  // First boot ever: seed the founding entries so no wall renders empty.
  const total = BOARDS.reduce((n, t) => n + (walls.get(t)?.length ?? 0), 0)
  if (total === 0 && embers === 0) {
    for (const entry of FOUNDING_WALL) walls.get(entry.table)?.push(entry)
    embers = FOUNDING_WALL.length
    for (const table of BOARDS) dirty.add(wallStorageKey(table))
    dirty.add('embers')
    console.log('[SERVER] first boot — seeded founding wall entries')
  }

  // Rebuild the per-day dedup set from whatever the ring buffers still hold.
  for (const entries of walls.values()) {
    for (const e of entries) answered.add(`${e.address}:${e.promptId}:${e.dayIndex}`)
  }
}

/**
 * After a server restart the CRDT snapshot may already contain our synced
 * entities from the previous run. Adopt them (matching on component fields,
 * never network ids), remove duplicates, create whatever is missing — then
 * overwrite their payloads with the Storage-backed truth.
 */
function adoptOrCreateEntities(): void {
  for (const [entity, data] of engine.getEntitiesWith(CGWall)) {
    if (((entity as number) & 0xffff) < RESERVED_ENTITY_LIMIT) continue
    if (wallEntities.has(data.table)) engine.removeEntity(entity)
    else wallEntities.set(data.table, entity)
  }
  for (const [entity] of engine.getEntitiesWith(CGFire)) {
    if (((entity as number) & 0xffff) < RESERVED_ENTITY_LIMIT) continue
    if (fireEntity !== null) engine.removeEntity(entity)
    else fireEntity = entity
  }
  for (const [entity] of engine.getEntitiesWith(CGHeartbeat)) {
    if (((entity as number) & 0xffff) < RESERVED_ENTITY_LIMIT) continue
    if (heartbeatEntity !== null) engine.removeEntity(entity)
    else heartbeatEntity = entity
  }

  for (const table of BOARDS) {
    const json = JSON.stringify(walls.get(table) ?? [])
    const existing = wallEntities.get(table)
    if (existing !== undefined && CGWall.getOrNull(existing) !== null) {
      CGWall.getMutable(existing).entriesJson = json
    } else {
      const entity = engine.addEntity()
      CGWall.create(entity, { table, entriesJson: json })
      syncEntity(entity, [CGWall.componentId])
      wallEntities.set(table, entity)
    }
  }

  if (fireEntity !== null && CGFire.getOrNull(fireEntity) !== null) {
    CGFire.getMutable(fireEntity).embers = embers
  } else {
    fireEntity = engine.addEntity()
    CGFire.create(fireEntity, { embers })
    syncEntity(fireEntity, [CGFire.componentId])
  }

  // First heartbeat published immediately so the first client after a cold
  // start detects liveness without waiting a full interval.
  if (heartbeatEntity !== null && CGHeartbeat.getOrNull(heartbeatEntity) !== null) {
    CGHeartbeat.getMutable(heartbeatEntity).at = Date.now()
  } else {
    heartbeatEntity = engine.addEntity()
    CGHeartbeat.create(heartbeatEntity, { at: Date.now() })
    syncEntity(heartbeatEntity, [CGHeartbeat.componentId])
  }
}

function registerHandlers(): void {
  room.onMessage('setSparks', (data, context) => {
    if (!context) return
    const address = context.from.toLowerCase()
    const sparks = (data.sparks ?? []).slice(0, 3).map((s) => String(s).slice(0, 16))
    // Sparks change rarely — a direct checked write is within checkpoint
    // discipline. On failure the retry rides the flush cycle via dirty-marking.
    Storage.player.set(address, 'sparks', JSON.stringify(sparks)).then((ok) => {
      if (!ok) console.log(`[SERVER] sparks write failed for ${address}`)
    })
    attachCharms(address, sparks as SparkId[])
  })

  room.onMessage('postAnswer', (data, context) => {
    if (!context) return
    const address = context.from.toLowerCase()
    const table = data.table
    if (!BOARDS.includes(table)) return
    const promptId = String(data.promptId).slice(0, 120)
    const answer = String(data.answer).trim().slice(0, MAX_ANSWER_LEN)
    const prompt = String(data.prompt).trim().slice(0, MAX_PROMPT_LEN)
    const author = String(data.author).trim().slice(0, MAX_AUTHOR_LEN) || 'a stranger'
    const sparks = (data.sparks ?? []).slice(0, 3).map((s) => String(s).slice(0, 16))
    if (answer.length === 0 || prompt.length === 0) return

    const dayIndex = dayIndexNow(Date.now())
    const dedupKey = `${address}:${promptId}:${dayIndex}`
    if (answered.has(dedupKey)) {
      room.send(
        'answerAck',
        { promptId, accepted: false, reason: 'You already answered this one today. Come back tomorrow.', matchName: '', matchAnswer: '', matchRung: 0, matchSparks: [], matchKey: '', sameCount: 0, totalCount: 0 },
        { to: [context.from] }
      )
      return
    }

    const entries = walls.get(table) ?? []

    // Cross-time Spark Match, resolved down a ladder that never dead-ends
    // while the wall has any other human on it. Found before this answer
    // joins the wall. Most recent wins within a rung.
    const match = findMatch(entries, address, promptId, answer, sparks)
    const matchName = match ? match.entry.author : ''

    entries.push({ table, promptId, prompt, answer, author, address, dayIndex, sparks })
    while (entries.length > WALL_CAP) entries.shift()
    walls.set(table, entries)
    answered.add(dedupKey)
    embers++

    const samePrompt = entries.filter((e) => e.promptId === promptId)
    const sameCount = samePrompt.filter((e) => e.answer === answer).length
    const totalCount = samePrompt.length

    const wallEntity = wallEntities.get(table)
    if (wallEntity !== undefined) {
      const mutable = CGWall.getMutableOrNull(wallEntity)
      if (mutable) mutable.entriesJson = JSON.stringify(entries)
    }
    if (fireEntity !== null) {
      const fire = CGFire.getMutableOrNull(fireEntity)
      if (fire) fire.embers = embers
    }
    dirty.add(wallStorageKey(table))
    dirty.add('embers')

    room.send(
      'answerAck',
      {
        promptId,
        accepted: true,
        reason: '',
        matchName,
        matchAnswer: match ? match.entry.answer : '',
        matchRung: match ? match.rung : 0,
        matchSparks: match ? match.entry.sparks ?? [] : [],
        matchKey: match ? `${match.entry.address}:${match.entry.promptId}:${match.entry.dayIndex}` : '',
        sameCount,
        totalCount
      },
      { to: [context.from] }
    )

    // Co-present players share the moment: everyone sees the burst at this
    // board when a match fires.
    if (match) {
      room.send('matchEvent', { table, nameA: author, nameB: match.entry.author, rung: match.rung })
    }
  })
}

/**
 * The match ladder. Each rung is a strictly looser test; the first rung with a
 * hit wins, newest entry first. Rung 4 cannot fail unless this player is the
 * only human who has ever answered at this board.
 *   1  same prompt, same answer, shares a spark
 *   2  same prompt, shares a spark
 *   3  same prompt, same answer
 *   4  anyone else on this wall
 */
function findMatch(
  entries: WallEntry[],
  address: string,
  promptId: string,
  answer: string,
  sparks: string[]
): { entry: WallEntry; rung: number } | null {
  const sharesSpark = (e: WallEntry) => (e.sparks ?? []).some((s) => sparks.includes(s))
  const rungs: ((e: WallEntry) => boolean)[] = [
    (e) => e.promptId === promptId && e.answer === answer && sharesSpark(e),
    (e) => e.promptId === promptId && sharesSpark(e),
    (e) => e.promptId === promptId && e.answer === answer,
    () => true
  ]
  for (let r = 0; r < rungs.length; r++) {
    for (let i = entries.length - 1; i >= 0; i--) {
      const e = entries[i]
      if (e.address !== address && rungs[r](e)) return { entry: e, rung: r + 1 }
    }
  }
  return null
}

// ── Avatar charms ──────────────────────────────────────────────────────
// Server-created so every client sees them: three glowing orbs at the spine
// in the player's spark colours. Synced per the per-player entity rules —
// auto-allocated ids, identity in the AvatarAttach avatarId itself.

const charms = new Map<string, Entity[]>()

function attachCharms(address: string, sparks: SparkId[]): void {
  removeCharms(address)
  const orbs: Entity[] = []
  sparks.forEach((spark, i) => {
    const color = SPARK_BY_ID.get(spark)?.color
    if (!color) return
    const orb = engine.addEntity()
    Transform.create(orb, {
      position: Vector3.create((i - 1) * 0.22, 0.32, 0.16),
      scale: Vector3.create(0.09, 0.09, 0.09)
    })
    MeshRenderer.setSphere(orb)
    Material.setPbrMaterial(orb, {
      albedoColor: Color4.fromHexString(color),
      emissiveColor: Color4.fromHexString(color),
      emissiveIntensity: 3,
      roughness: 1
    })
    AvatarAttach.create(orb, { avatarId: address, anchorPointId: AvatarAnchorPointType.AAPT_SPINE })
    syncEntity(orb, [
      Transform.componentId,
      MeshRenderer.componentId,
      Material.componentId,
      AvatarAttach.componentId
    ])
    orbs.push(orb)
  })
  charms.set(address, orbs)
}

function removeCharms(address: string): void {
  const orbs = charms.get(address)
  if (!orbs) return
  for (const orb of orbs) engine.removeEntity(orb)
  charms.delete(address)
}

/** Charms of players who left the scene are swept every few seconds. */
function sweepCharms(): void {
  const present = new Set<string>()
  for (const [, identity] of engine.getEntitiesWith(PlayerIdentityData)) {
    present.add(identity.address.toLowerCase())
  }
  for (const address of [...charms.keys()]) {
    if (!present.has(address)) removeCharms(address)
  }
}

let heartbeatAcc = 0
let flushAcc = 0
let flushing = false
let sweepAcc = 0

function serverTickSystem(dt: number): void {
  heartbeatAcc += dt * 1000
  flushAcc += dt * 1000
  sweepAcc += dt * 1000

  if (heartbeatAcc >= HEARTBEAT_MS && heartbeatEntity !== null) {
    heartbeatAcc = 0
    const hb = CGHeartbeat.getMutableOrNull(heartbeatEntity)
    if (hb) hb.at = Date.now()
  }

  if (sweepAcc >= 5000) {
    sweepAcc = 0
    sweepCharms()
  }

  if (flushAcc >= FLUSH_MS && dirty.size > 0 && !flushing) {
    flushAcc = 0
    void flush()
  }
}

/** Debounced checkpoint flush. Failed writes stay dirty and retry next cycle. */
async function flush(): Promise<void> {
  flushing = true
  try {
    for (const key of [...dirty]) {
      const value = key === 'embers' ? String(embers) : JSON.stringify(walls.get(keyTable(key)) ?? [])
      const ok = await Storage.set(key, value)
      if (ok) dirty.delete(key)
      else console.log(`[SERVER] flush failed for ${key} — will retry`)
    }
  } finally {
    flushing = false
  }
}

function keyTable(storageKey: string): number {
  if (storageKey === 'wall:plaza') return -1
  return parseInt(storageKey.split(':')[2])
}
