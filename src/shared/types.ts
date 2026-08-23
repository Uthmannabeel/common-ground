// Shared shapes and constants for the social state. Server is the only writer;
// clients read synced components and send intents via shared/messages.

export interface WallEntry {
  /** Table index 0-3, or -1 for the plaza daily-question wall. */
  table: number
  /** Icebreaker id, or `daily:<prompt>` for the plaza question. */
  promptId: string
  prompt: string
  answer: string
  /** Display name at answer time — attribution only, never identity. */
  author: string
  /** Lowercased wallet address; identity for dedup and cross-time matching. */
  address: string
  dayIndex: number
}

/** Tables 0-3 plus the plaza wall (-1). */
export const BOARDS = [-1, 0, 1, 2, 3]

/** Ring-buffer cap per wall, enforced server-side. */
export const WALL_CAP = 40

export function wallStorageKey(table: number): string {
  return table === -1 ? 'wall:plaza' : `wall:table:${table}`
}

export function dayIndexNow(now: number): number {
  return Math.floor(now / 86_400_000)
}
