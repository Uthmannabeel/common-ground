import { engine } from '@dcl/sdk/ecs'
import { isStateSyncronized } from '@dcl/sdk/network'
import { SparkId } from './content/sparks'
import { room } from './shared/messages'
import { CGFire, CGHeartbeat, CGWall } from './shared/schemas'
import { WallEntry, dayIndexNow } from './shared/types'

// M3 client side: reads come from server-synced components, writes are intents
// sent to the Multiplayer Server (buffered until the room syncs). A pending
// local echo keeps the loop responsive and degrades gracefully if the server
// is unreachable — cross-session persistence is server-only.

export interface PlayerState {
  sparks: SparkId[]
  /** Table the player has been seated at, -1 before seating. */
  table: number
}

export interface NewWallEntry {
  table: number
  promptId: string
  prompt: string
  answer: string
  author: string
  sparks: string[]
}

export interface AnswerAck {
  promptId: string
  accepted: boolean
  reason: string
  matchName: string
  matchAnswer: string
  matchRung: number
  matchSparks: string[]
  /** Lantern key of the matched entry — '' when no match. */
  matchKey: string
  sameCount: number
  totalCount: number
}

export interface MatchEvent {
  table: number
  nameA: string
  nameB: string
  rung: number
}

export interface Store {
  getLocalPlayer(): PlayerState
  setSparks(sparks: SparkId[]): void
  setTable(table: number): void
  addWallEntry(entry: NewWallEntry): void
  getWallEntries(table: number): WallEntry[]
  /** Fires after any wall change so 3D boards can re-render. */
  onWallChange(listener: () => void): void
  /** Fires when the server answers a postAnswer from this client. */
  onAnswerAck(listener: (ack: AnswerAck) => void): void
  /** Fires on every client when any match fires anywhere in the World. */
  onMatchEvent(listener: (ev: MatchEvent) => void): void
  /** True while a server heartbeat has been observed recently. */
  isServerAlive(): boolean
  getEmbers(): number
}

const HEARTBEAT_FRESHNESS_MS = 6000

interface Outbox {
  sparks: SparkId[] | null
  answers: NewWallEntry[]
}

function createStore(): Store & { initNetwork(): void } {
  const local: PlayerState = { sparks: [], table: -1 }
  const wallListeners: (() => void)[] = []
  const ackListeners: ((ack: AnswerAck) => void)[] = []
  const matchListeners: ((ev: MatchEvent) => void)[] = []

  // Answers optimistically shown until the same entry arrives via sync
  // (or the server rejects it in the ack).
  let pending: WallEntry[] = []
  const outbox: Outbox = { sparks: null, answers: [] }

  // Parsed-wall cache keyed by table; invalidated by JSON string identity.
  const jsonCache = new Map<number, { json: string; entries: WallEntry[] }>()
  let lastFingerprint = ''

  let heartbeatValue = 0
  let heartbeatSeenAt = 0

  function serverEntries(table: number): WallEntry[] {
    for (const [, data] of engine.getEntitiesWith(CGWall)) {
      if (data.table !== table) continue
      const cached = jsonCache.get(table)
      if (cached && cached.json === data.entriesJson) return cached.entries
      let entries: WallEntry[] = []
      try {
        entries = JSON.parse(data.entriesJson)
      } catch {
        entries = []
      }
      jsonCache.set(table, { json: data.entriesJson, entries })
      return entries
    }
    return []
  }

  function prunePending(): void {
    if (pending.length === 0) return
    pending = pending.filter((p) => {
      return !serverEntries(p.table).some(
        (e) => e.promptId === p.promptId && e.answer === p.answer && e.author === p.author
      )
    })
  }

  function networkSystem(dt: number): void {
    // Liveness: track the client-observed time the heartbeat changed, never
    // the server timestamp itself — stale snapshots must not read as alive.
    for (const [, hb] of engine.getEntitiesWith(CGHeartbeat)) {
      if (hb.at !== heartbeatValue) {
        heartbeatValue = hb.at as number
        heartbeatSeenAt = Date.now()
      }
      break
    }

    // Flush buffered intents once the room transport is up.
    if (isStateSyncronized()) {
      if (outbox.sparks !== null) {
        room.send('setSparks', { sparks: outbox.sparks })
        outbox.sparks = null
      }
      while (outbox.answers.length > 0) {
        const a = outbox.answers.shift()!
        room.send('postAnswer', a)
      }
    }

    // Change detection: cheap fingerprint over the synced walls. Ember count
    // is included so equal-length content changes still trigger a refresh.
    let fp = ''
    for (const [, data] of engine.getEntitiesWith(CGWall)) {
      fp += `${data.table}:${data.entriesJson.length};`
    }
    for (const [, fire] of engine.getEntitiesWith(CGFire)) {
      fp += `e${fire.embers}`
      break
    }
    if (fp !== lastFingerprint) {
      lastFingerprint = fp
      prunePending()
      for (const l of wallListeners) l()
    }
  }

  return {
    initNetwork() {
      engine.addSystem(networkSystem)
      room.onMessage('answerAck', (data) => {
        const ack = data as AnswerAck
        if (!ack.accepted) {
          // Server refused (e.g. already answered today) — drop the echo.
          pending = pending.filter((p) => p.promptId !== ack.promptId)
          for (const l of wallListeners) l()
        }
        for (const l of ackListeners) l(ack)
      })
      room.onMessage('matchEvent', (data) => {
        for (const l of matchListeners) l(data as MatchEvent)
      })
    },
    // Copy out so callers can't mutate store state around the setters.
    getLocalPlayer: () => ({ sparks: [...local.sparks], table: local.table }),
    setSparks: (sparks) => {
      local.sparks = [...sparks]
      outbox.sparks = [...sparks]
    },
    setTable: (table) => {
      local.table = table
    },
    addWallEntry: (entry) => {
      pending.push({ ...entry, address: '', dayIndex: dayIndexNow(Date.now()) })
      outbox.answers.push(entry)
      for (const l of wallListeners) l()
    },
    getWallEntries: (table) => [
      ...serverEntries(table),
      ...pending.filter((p) => p.table === table)
    ],
    onWallChange: (listener) => {
      wallListeners.push(listener)
    },
    onAnswerAck: (listener) => {
      ackListeners.push(listener)
    },
    onMatchEvent: (listener) => {
      matchListeners.push(listener)
    },
    isServerAlive: () => heartbeatSeenAt !== 0 && Date.now() - heartbeatSeenAt < HEARTBEAT_FRESHNESS_MS,
    getEmbers: () => {
      for (const [, fire] of engine.getEntitiesWith(CGFire)) return fire.embers
      return 0
    }
  }
}

export const store = createStore()
