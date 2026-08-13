// The plaza's daily community question. Date-indexed rotation — no cron,
// no backend job: dayIndex % length picks today's question everywhere.
// Tap-to-answer only; answers accumulate on the plaza wall.

export interface DailyQuestion {
  prompt: string
  answers: string[]
}

export const DAILY_QUESTIONS: DailyQuestion[] = [
  { prompt: 'What would make today a good day?', answers: ['Good news', 'Good food', 'Good company', 'Quiet, please'] },
  { prompt: 'Morning person or creature of the night?', answers: ['Sunrise crew', 'Night owl', 'Whatever the deadline says'] },
  { prompt: 'A stranger smiles at you. You…', answers: ['Smile back, obviously', 'Panic politely', 'Wonder what they know'] },
  { prompt: 'The best conversations happen…', answers: ['Around food', 'On long walks', 'At 2am', 'With strangers'] },
  { prompt: 'What are you secretly good at?', answers: ['Remembering song lyrics', 'Finding shortcuts', 'Reading people', 'Doing nothing, elegantly'] },
  { prompt: 'Pick a superpower for one day only:', answers: ['Fly', 'Read minds', 'Pause time', 'Speak every language'] },
  { prompt: 'Your ideal weekend has exactly how many plans?', answers: ['Zero', 'One good one', 'Back to back to back'] },
  { prompt: 'What do you do when a song you love comes on?', answers: ['Full volume, no shame', 'Quiet head nod', 'Show someone immediately'] },
  { prompt: 'The world gets one global holiday. It celebrates…', answers: ['Naps', 'Neighbours', 'Finished projects', 'The ocean'] },
  { prompt: 'You find a door that wasn\'t there yesterday. You…', answers: ['Open it, obviously', 'Knock first', 'Pretend I saw nothing'] },
  { prompt: 'Rain outside. Honest feeling?', answers: ['Cozy and pleased', 'Cancelled everything, thriving', 'Personally attacked'] },
  { prompt: 'What makes a place feel like home?', answers: ['The people', 'The food smells', 'My own corner', 'Knowing the shortcuts'] },
  { prompt: 'You get a free hour today. It goes to…', answers: ['Sleep, no contest', 'A hobby I neglect', 'Someone I miss', 'Absolutely nothing'] },
  { prompt: 'The advice you\'d give your younger self:', answers: ['Worry less', 'Start earlier', 'Keep the friends', 'Buy the ticket'] },
  { prompt: 'First thing you notice about a new place?', answers: ['The sounds', 'The light', 'The people watching', 'Where the exits are'] },
  { prompt: 'A talent show, and you must enter. Your act:', answers: ['Something musical', 'Something funny', 'Something nobody expects', 'Dramatic reading of my chats'] },
  { prompt: 'What\'s worth waking up early for?', answers: ['A flight somewhere', 'Fresh bread', 'Empty streets', 'Nothing. Nothing is.'] },
  { prompt: 'Your comfort rewatch / replay / reread is…', answers: ['A show I know by heart', 'A game world I live in', 'The same three songs', 'Old photos, honestly'] },
  { prompt: 'How do you celebrate small wins?', answers: ['Treat myself to food', 'Tell exactly one person', 'Quiet fist pump', 'Immediately set a new goal'] },
  { prompt: 'A campfire needs one more thing. What?', answers: ['Stories', 'Snacks', 'Music', 'Comfortable silence'] },
  { prompt: 'What do you collect, officially or not?', answers: ['Screenshots and photos', 'Books I\'ll read someday', 'Tickets and small papers', 'Browser tabs'] },
  { prompt: 'The best gift is…', answers: ['Something handmade', 'Something I\'d never buy myself', 'Time together', 'Food. It\'s food.'] },
  { prompt: 'Lost in a new city, no phone. Your move:', answers: ['Follow the crowd', 'Ask a shopkeeper', 'Climb something tall', 'Embrace being lost'] },
  { prompt: 'What season are you, as a person?', answers: ['Dry season sun', 'Rainy season peace', 'Harmattan mystery', 'Whatever mango season is'] },
  { prompt: 'The skill you\'d download instantly:', answers: ['Every instrument', 'Every language', 'Cooking mastery', 'Perfect memory'] },
  { prompt: 'Your unpopular food opinion — how strong is it?', answers: ['I\'d defend it in court', 'Whispered among friends', 'I have none, I accept all food'] },
  { prompt: 'What deserves more applause in daily life?', answers: ['Good drivers', 'People who reply fast', 'Whoever holds the door', 'Anyone who shows up'] },
  { prompt: 'A message in a bottle washes up. It should contain…', answers: ['A map', 'A joke', 'A phone number', 'A recipe'] },
  { prompt: 'When do you feel most like yourself?', answers: ['Creating something', 'Moving — walking, playing', 'Around my people', 'Alone with my thoughts'] },
  { prompt: 'Tomorrow-you will thank today-you for…', answers: ['Sleeping on time', 'Sending that message', 'Starting the thing', 'Drinking water, probably'] }
]

export function todayIndex(nowMs: number): number {
  return Math.floor(nowMs / 86_400_000) % DAILY_QUESTIONS.length
}

export function todaysQuestion(nowMs: number): DailyQuestion {
  return DAILY_QUESTIONS[todayIndex(nowMs)]
}
