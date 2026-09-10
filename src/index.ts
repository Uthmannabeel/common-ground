import { isServer } from '@dcl/sdk/network'
import { getPlayer } from '@dcl/sdk/src/players'
import { todaysQuestion } from './content/dailyQuestions'
import { SPARK_BY_ID, SparkId } from './content/sparks'
import { burstAt, emberArc, initEffects, playChime, showTrail, startAmbience } from './effects'
import { igniteLantern, initLanterns } from './lanterns'
import { chooseTable, pastPartnerSparks, pickIcebreaker } from './pairing'
import { buildPlaza, fireFlare, STAND_POSITION, TABLE_COUNT, TABLE_NAMES, TABLE_POSITIONS } from './plaza'
import { initStones, showStones } from './stones'
// Static imports so registerMessages/defineComponent run at module load on
// both roles — the engine seals after initial load. Server-only code (which
// imports @dcl/sdk/server) is dynamically imported inside isServer() instead.
import './shared/messages'
import './shared/schemas'
import { store } from './state'
import { setupUi, showPicker, showReveal, showToast } from './ui'

function dayIndex(): number {
  return Math.floor(Date.now() / 86_400_000)
}

function playerName(): string {
  return getPlayer()?.name ?? 'a stranger'
}

function playerAddress(): string {
  return (getPlayer()?.userId ?? '').toLowerCase()
}

export async function main() {
  // Single codebase, two roles: the headless Multiplayer Server owns all
  // shared state; clients render and send intents. See src/server.ts.
  if (isServer()) {
    const { initServer } = await import('./server')
    await initServer()
    return
  }
  store.initNetwork()
  store.onAnswerAck(onAnswerAck)
  store.onMatchEvent((ev) => {
    // Every present player shares the burst where a match just fired.
    burstAt(ev.table === -1 ? STAND_POSITION : TABLE_POSITIONS[ev.table] ?? STAND_POSITION)
    fireFlare(0.4)
  })
  buildPlaza({ onTableTapped, onQuestionStandTapped })
  initLanterns()
  initStones()
  initEffects(() => fireFlare())
  setupUi()
  showPicker(onSparksConfirmed)
}

function onSparksConfirmed(sparks: SparkId[]): void {
  startAmbience()
  store.setSparks(sparks)
  const table = chooseTable(sparks, TABLE_COUNT, (t) => store.getWallEntries(t), playerAddress())
  store.setTable(table)
  const labels = sparks.map((s) => SPARK_BY_ID.get(s)?.label).join(', ')
  showToast(`${labels} — your table is ${TABLE_NAMES[table]}. Go sit; it has a question for you.`, 6)
}

function onTableTapped(table: number): void {
  const me = store.getLocalPlayer()
  if (me.sparks.length === 0) {
    showPicker(onSparksConfirmed)
    return
  }
  // Cross-time pairing: the past human at this table who shares the most
  // with me decides the prompt, so pair-specific icebreakers are reachable
  // at concurrency 1. Live pairing (G4) only swaps in a present player here.
  const theirs = pastPartnerSparks(me.sparks, store.getWallEntries(table), playerAddress())
  const icebreaker = pickIcebreaker(me.sparks, theirs, dayIndex(), table)
  // Story stones: the question and answers are physical tap targets in the
  // world — the judged path never opens a 2D card.
  showStones(TABLE_POSITIONS[table], icebreaker.prompt, icebreaker.answers, (answer) => {
    submitAnswer({
      table,
      promptId: icebreaker.id,
      prompt: icebreaker.prompt,
      answer,
      author: playerName(),
      sparks: me.sparks
    })
  })
  // Immediate on-screen confirmation: the stones stand beyond the table and
  // can sit outside a narrow portrait view, so the tap must visibly land.
  showToast(`Three stones rose behind ${TABLE_NAMES[table]}. Tap one to answer.`, 5)
}

function onQuestionStandTapped(): void {
  const q = todaysQuestion(Date.now())
  showStones(STAND_POSITION, q.prompt, q.answers, (answer) => {
    submitAnswer({
      table: -1,
      promptId: `daily:${q.prompt}`,
      prompt: q.prompt,
      answer,
      author: playerName(),
      sparks: store.getLocalPlayer().sparks
    })
  })
  showToast('Three stones rose behind the pillar. Tap one to answer.', 5)
}

function submitAnswer(entry: { table: number; promptId: string; prompt: string; answer: string; author: string; sparks: string[] }): void {
  store.addWallEntry(entry)
  // Your ember arcs from where you answered into the fire, which flares.
  emberArc(entry.table === -1 ? STAND_POSITION : TABLE_POSITIONS[entry.table])
  if (!store.isServerAlive()) {
    showToast('The campfire is still waking up — your answer will catch in a moment.', 5)
  }
}

function onAnswerAck(ack: {
  accepted: boolean
  reason: string
  matchName: string
  matchAnswer: string
  matchRung: number
  matchSparks: string[]
  matchKey: string
  sameCount: number
  totalCount: number
}): void {
  if (!ack.accepted) {
    showToast(ack.reason, 5)
    return
  }
  if (ack.matchName === '') {
    // Only possible when this player is the first human ever at this board.
    showToast('Yours is the first answer here. It waits on the wall for the next stranger.', 6)
    return
  }
  // The Spark Match: a named collision with a real human, as a screen — not a toast.
  const mine = store.getLocalPlayer().sparks
  const shared = mine.filter((s) => ack.matchSparks.includes(s))
  const sharedLabels = shared.map((s) => SPARK_BY_ID.get(s)?.label ?? s)
  let line: string
  switch (ack.matchRung) {
    case 1:
      line = `You and ${ack.matchName} both said "${ack.matchAnswer}"`
      break
    case 2:
      line = `${ack.matchName} shares your spark — they said "${ack.matchAnswer}"`
      break
    case 3:
      line = `${ack.matchName} said exactly that too`
      break
    default:
      line = `${ack.matchName} was here before you — they said "${ack.matchAnswer}"`
  }
  playChime()
  // The climax: the matched lantern ignites with their name and a trail of
  // light grows across the ground from the fire to it. The reveal screen is
  // the accessible summary that follows.
  const lanternPos = igniteLantern(ack.matchKey, ack.matchName)
  if (lanternPos) showTrail(lanternPos)
  showReveal({
    name: ack.matchName,
    line,
    sharedSparks: sharedLabels,
    count: `${ack.sameCount} of ${ack.totalCount} here agree with you`
  })
}
