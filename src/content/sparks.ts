// The eight interest emblems a visitor picks from on arrival.
// Rarity order drives the pairing tiebreak: later entries are treated as
// rarer, so a shared niche interest outranks a shared common one
// ("peak shared enthusiasm beats average similarity").

export type SparkId =
  | 'music'
  | 'movies'
  | 'food'
  | 'sports'
  | 'games'
  | 'travel'
  | 'tech'
  | 'art'

export interface Spark {
  id: SparkId
  label: string
  /** Hex color used for the emblem tile, table glow, and wall accents. */
  color: string
}

// Ordered from most common to rarest pick (assumed until server data exists).
export const SPARKS: Spark[] = [
  { id: 'music', label: 'Music', color: '#E4572E' },
  { id: 'movies', label: 'Movies & Series', color: '#F3A712' },
  { id: 'food', label: 'Food', color: '#A8C686' },
  { id: 'sports', label: 'Sports', color: '#4C9F70' },
  { id: 'games', label: 'Games', color: '#5C80BC' },
  { id: 'travel', label: 'Travel', color: '#30BCED' },
  { id: 'tech', label: 'Tech', color: '#9B5DE5' },
  { id: 'art', label: 'Art & Making', color: '#F15BB5' }
]

export const SPARK_BY_ID = new Map(SPARKS.map((s) => [s.id, s]))

/** Lower index = more common. Used by the pairing tiebreak. */
export function sparkRarity(id: SparkId): number {
  return SPARKS.findIndex((s) => s.id === id)
}

export const PICKS_REQUIRED = 3
