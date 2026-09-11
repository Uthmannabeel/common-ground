import { SparkId, sparkRarity } from './content/sparks'
import { ICEBREAKERS, Icebreaker, pairIcebreakers, soloIcebreakers } from './content/icebreakers'

// M4: deterministic, offline-tolerant, instant on a phone. No runtime AI.

/** Weighted overlap: count of shared sparks, rarest shared spark breaks ties. */
export function overlapScore(a: SparkId[], b: SparkId[]): number {
  const shared = a.filter((s) => b.includes(s))
  if (shared.length === 0) return 0
  const rarest = Math.max(...shared.map(sparkRarity))
  // Shared count dominates; rarity of the best shared spark breaks ties.
  return shared.length * 100 + rarest
}

export function sharedSparks(a: SparkId[], b: SparkId[]): SparkId[] {
  return a.filter((s) => b.includes(s)).sort((x, y) => sparkRarity(y) - sparkRarity(x))
}

/**
 * Solo path table choice: deterministic from the player's rarest spark, so a
 * lone visitor with niche picks still lands somewhere that "matches" them.
 * Live pairing (concurrency 2+) replaces this at the sync layer.
 */
/**
 * Seat by overlap with the people who have actually answered at each table:
 * the table whose best past contributor shares the most with me wins. With
 * no overlap anywhere (or an empty World) the rarest spark decides, so the
 * choice is still deterministic and every table stays reachable.
 */
export function chooseTable(
  sparks: SparkId[],
  tableCount: number,
  wallOf: (table: number) => { address: string; sparks: string[] }[] = () => [],
  myAddress = ''
): number {
  if (sparks.length === 0) return 0
  let best = -1
  let bestScore = 0
  for (let t = 0; t < tableCount; t++) {
    for (const e of wallOf(t)) {
      if (e.address === myAddress || !e.sparks || e.sparks.length === 0) continue
      const score = overlapScore(sparks, e.sparks as SparkId[])
      if (score > bestScore) {
        bestScore = score
        best = t
      }
    }
  }
  if (best >= 0) return best
  const rarest = Math.max(...sparks.map(sparkRarity))
  return rarest % tableCount
}

/**
 * Concurrency-1 pairing partner: the most recent past human at this table
 * who shares the most with me (overlapScore), read straight off the synced
 * wall. Returns null only when no other human has ever answered here — and
 * then pickIcebreaker falls back to a solo prompt exactly as before.
 */
export function pastPartnerSparks(
  mine: SparkId[],
  wall: { address: string; sparks: string[] }[],
  myAddress: string
): SparkId[] | null {
  let best: SparkId[] | null = null
  let bestScore = 0
  for (let i = wall.length - 1; i >= 0; i--) {
    const e = wall[i]
    if (e.address === myAddress || !e.sparks || e.sparks.length === 0) continue
    const theirs = e.sparks as SparkId[]
    const score = overlapScore(mine, theirs)
    if (score > bestScore) {
      bestScore = score
      best = theirs
    }
  }
  return best
}

function hashString(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

/**
 * Pick an icebreaker for a table session. Pair-specific prompts for the two
 * rarest shared sparks win; solo prompts for the player's rarest spark are the
 * concurrency-1 fallback. Varies by day and table so returning players see
 * fresh prompts without any randomness disagreeing between clients.
 */
export function pickIcebreaker(
  mine: SparkId[],
  theirs: SparkId[] | null,
  dayIndex: number,
  table: number,
  answeredToday: ReadonlySet<string> = new Set()
): Icebreaker {
  const seed = hashString(`${dayIndex}:${table}`)

  // Preference order, best first: prompts written for a spark pair this
  // player shares with the past partner, then that shared spark alone, then
  // the player's own sparks rarest first, then anything authored.
  const pools: Icebreaker[][] = []
  if (theirs) {
    const shared = sharedSparks(mine, theirs)
    for (let i = 0; i < shared.length; i++) {
      for (let j = i + 1; j < shared.length; j++) {
        pools.push(pairIcebreakers(shared[i], shared[j]))
      }
    }
    if (shared.length > 0) pools.push(soloIcebreakers(shared[0]))
  }
  for (const spark of [...mine].sort((a, b) => sparkRarity(b) - sparkRarity(a))) {
    pools.push(soloIcebreakers(spark))
  }
  pools.push(ICEBREAKERS)

  // One answer per person per prompt per day is the rule, so a table that
  // kept offering the same question would dead-end every returning visitor
  // for the rest of the day. Walk the same preference order, skipping what
  // this player has already answered today.
  for (const pool of pools) {
    const fresh = pool.filter((i) => !answeredToday.has(i.id))
    if (fresh.length > 0) return fresh[seed % fresh.length]
  }
  // Every authored prompt used up today: fall back to the plain preference
  // order. The server refuses it and the player is told to come back.
  for (const pool of pools) {
    if (pool.length > 0) return pool[seed % pool.length]
  }
  return ICEBREAKERS[seed % ICEBREAKERS.length]
}
