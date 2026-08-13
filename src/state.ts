import { SparkId } from './content/sparks'

// M3 seam: every read/write of shared social state goes through this store
// interface. Today it is backed by local session state (the designed fallback);
// the multiplayer implementation replaces `createStore` without touching callers.

export interface WallEntry {
  /** Table index 0-3, or -1 for the plaza daily-question wall. */
  table: number
  prompt: string
  answer: string
  author: string
  dayIndex: number
}

export interface PlayerState {
  sparks: SparkId[]
  /** Table the player has been seated at, -1 before seating. */
  table: number
}

export interface Store {
  getLocalPlayer(): PlayerState
  setSparks(sparks: SparkId[]): void
  setTable(table: number): void
  addWallEntry(entry: WallEntry): void
  getWallEntries(table: number): WallEntry[]
  /** Fires after any wall change so 3D boards can re-render. */
  onWallChange(listener: () => void): void
}

// Founding entries written by the builders (real humans, attributed as such)
// so no wall ever renders empty. Playtest answers accumulate on top from G2.
const FOUNDING_WALL: WallEntry[] = [
  { table: 0, prompt: 'Your most replayed song this year — what mood is it?', answer: 'Pure hype', author: 'Nabeel · builder', dayIndex: 0 },
  { table: 1, prompt: 'Street food at midnight or a long table with strangers?', answer: 'Whichever has music', author: 'Nabeel · builder', dayIndex: 0 },
  { table: 2, prompt: 'What actually keeps you playing?', answer: 'My friends are there', author: 'Nabeel · builder', dayIndex: 0 },
  { table: 3, prompt: 'Making things is mostly…', answer: 'Suffering that becomes joy', author: 'Nabeel · builder', dayIndex: 0 },
  { table: -1, prompt: 'A campfire needs one more thing. What?', answer: 'Stories', author: 'Nabeel · builder', dayIndex: 0 }
]

function createStore(): Store {
  const local: PlayerState = { sparks: [], table: -1 }
  const wall: WallEntry[] = [...FOUNDING_WALL]
  const listeners: (() => void)[] = []

  return {
    getLocalPlayer: () => local,
    setSparks: (sparks) => {
      local.sparks = [...sparks]
    },
    setTable: (table) => {
      local.table = table
    },
    addWallEntry: (entry) => {
      wall.push(entry)
      for (const l of listeners) l()
    },
    getWallEntries: (table) => wall.filter((e) => e.table === table),
    onWallChange: (listener) => {
      listeners.push(listener)
    }
  }
}

export const store: Store = createStore()
