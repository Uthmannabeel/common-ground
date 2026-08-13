import { getPlayer } from '@dcl/sdk/src/players'
import { todaysQuestion } from './content/dailyQuestions'
import { SPARK_BY_ID, SparkId } from './content/sparks'
import { chooseTable, pickIcebreaker } from './pairing'
import { buildPlaza, TABLE_COUNT, TABLE_NAMES } from './plaza'
import { store } from './state'
import { setupUi, showCard, showPicker, showToast } from './ui'

function dayIndex(): number {
  return Math.floor(Date.now() / 86_400_000)
}

function playerName(): string {
  return getPlayer()?.name ?? 'a stranger'
}

export function main() {
  buildPlaza({ onTableTapped, onQuestionStandTapped })
  setupUi()
  showPicker(onSparksConfirmed)
}

function onSparksConfirmed(sparks: SparkId[]): void {
  store.setSparks(sparks)
  const table = chooseTable(sparks, TABLE_COUNT)
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
  // Solo path: the table asks. Live pairing replaces `theirs: null` at G1.
  const icebreaker = pickIcebreaker(me.sparks, null, dayIndex(), table)
  showCard(`The ${TABLE_NAMES[table]} table asks`, icebreaker.prompt, icebreaker.answers, (answer) => {
    store.addWallEntry({
      table,
      prompt: icebreaker.prompt,
      answer,
      author: playerName(),
      dayIndex: dayIndex()
    })
    showToast(`Your answer is on the ${TABLE_NAMES[table]} wall.`)
  })
}

function onQuestionStandTapped(): void {
  const q = todaysQuestion(Date.now())
  showCard("Today's Question", q.prompt, q.answers, (answer) => {
    store.addWallEntry({
      table: -1,
      prompt: q.prompt,
      answer,
      author: playerName(),
      dayIndex: dayIndex()
    })
    showToast('Your answer joins the plaza wall.')
  })
}
