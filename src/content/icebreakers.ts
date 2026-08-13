import { SparkId } from './sparks'

// Authored at build time, reviewed by hand — nothing calls an AI at runtime.
// Every icebreaker resolves through tap-to-answer cards (no-keystroke doctrine):
// the answer options ARE the conversation starter, and both players see the reveal.

export interface Icebreaker {
  id: string
  /** One spark = solo prompt for that interest. Two sparks = pair-specific prompt. */
  sparks: SparkId[]
  prompt: string
  answers: string[]
}

export const ICEBREAKERS: Icebreaker[] = [
  // ── Music ──────────────────────────────────────────────────────────
  {
    id: 'music-1',
    sparks: ['music'],
    prompt: 'Your most replayed song this year — what mood is it?',
    answers: ['Pure hype', 'Soft and sad', 'Guilty pleasure']
  },
  {
    id: 'music-2',
    sparks: ['music'],
    prompt: 'Concert tickets fall from the sky. Where are you standing?',
    answers: ['Front row, ears ringing', 'Middle, best sound', 'Back, vibing alone']
  },
  {
    id: 'music-3',
    sparks: ['music'],
    prompt: 'One is gone forever. Which survives?',
    answers: ['Headphones', 'Speakers', 'Live shows']
  },

  // ── Movies & Series ────────────────────────────────────────────────
  {
    id: 'movies-1',
    sparks: ['movies'],
    prompt: 'A perfect movie night is…',
    answers: ['Something that scares me', 'Something that wrecks me', 'Something dumb and fun']
  },
  {
    id: 'movies-2',
    sparks: ['movies'],
    prompt: 'You can live inside one for a week. Pick the world:',
    answers: ['Space opera', 'Cozy small town', 'Heist crew']
  },
  {
    id: 'movies-3',
    sparks: ['movies'],
    prompt: 'Honest answer — how many shows have you abandoned mid-season?',
    answers: ['Zero, I finish everything', 'A few, no regrets', 'I am a serial abandoner']
  },

  // ── Food ───────────────────────────────────────────────────────────
  {
    id: 'food-1',
    sparks: ['food'],
    prompt: 'Last meal on Earth. What region is cooking?',
    answers: ['West Africa', 'East Asia', 'The Mediterranean']
  },
  {
    id: 'food-2',
    sparks: ['food'],
    prompt: 'Which one is the real crime?',
    answers: ['Cold fries', 'Weak pepper', 'Warm soda']
  },
  {
    id: 'food-3',
    sparks: ['food'],
    prompt: 'Street food at midnight or a long table with strangers?',
    answers: ['Street food, always', 'Long table, always', 'Whichever has music']
  },

  // ── Sports ─────────────────────────────────────────────────────────
  {
    id: 'sports-1',
    sparks: ['sports'],
    prompt: 'What are you really watching for?',
    answers: ['The skill', 'The drama', 'My team, right or wrong']
  },
  {
    id: 'sports-2',
    sparks: ['sports'],
    prompt: 'A last-minute loss haunts you for…',
    answers: ['Ten minutes', 'The whole week', 'Years. Decades.']
  },
  {
    id: 'sports-3',
    sparks: ['sports'],
    prompt: 'Play one professionally for a year:',
    answers: ['Football', 'Basketball', 'Something nobody expects']
  },

  // ── Games ──────────────────────────────────────────────────────────
  {
    id: 'games-1',
    sparks: ['games'],
    prompt: 'What actually keeps you playing?',
    answers: ['Winning', 'The story', 'My friends are there']
  },
  {
    id: 'games-2',
    sparks: ['games'],
    prompt: 'Your save file habits say you are…',
    answers: ['A hoarder of potions', 'A rusher of main quests', 'Lost in side quests forever']
  },
  {
    id: 'games-3',
    sparks: ['games'],
    prompt: 'Rage quit: real strategy or character flaw?',
    answers: ['Strategy. Protect the peace', 'Flaw, and I own it', 'I have never rage quit (lie)']
  },

  // ── Travel ─────────────────────────────────────────────────────────
  {
    id: 'travel-1',
    sparks: ['travel'],
    prompt: 'Free ticket anywhere, leaves in 3 hours. You pack…',
    answers: ['One bag, zero plan', 'A full itinerary', 'Snacks first, then clothes']
  },
  {
    id: 'travel-2',
    sparks: ['travel'],
    prompt: 'The best part of any trip is…',
    answers: ['The food you can\'t name', 'Getting properly lost', 'The stories after']
  },
  {
    id: 'travel-3',
    sparks: ['travel'],
    prompt: 'Mountains, ocean, or a city that never sleeps?',
    answers: ['Mountains', 'Ocean', 'The city']
  },

  // ── Tech ───────────────────────────────────────────────────────────
  {
    id: 'tech-1',
    sparks: ['tech'],
    prompt: 'A gadget breaks. Your first move:',
    answers: ['Open it up myself', 'Search until 2am', 'Accept its death with grace']
  },
  {
    id: 'tech-2',
    sparks: ['tech'],
    prompt: 'Which future arrives first?',
    answers: ['Robots doing my chores', 'Cities on other planets', 'Neither, and that\'s fine']
  },
  {
    id: 'tech-3',
    sparks: ['tech'],
    prompt: 'Your phone home screen is…',
    answers: ['Ruthlessly organised', 'Beautiful chaos', 'I fear looking at it']
  },

  // ── Art & Making ───────────────────────────────────────────────────
  {
    id: 'art-1',
    sparks: ['art'],
    prompt: 'You get one creative superpower:',
    answers: ['Draw anything I imagine', 'Build anything with my hands', 'Finish every project I start']
  },
  {
    id: 'art-2',
    sparks: ['art'],
    prompt: 'A museum at night, lights on, just you. First room?',
    answers: ['The old masters', 'The weird modern wing', 'The gift shop, honestly']
  },
  {
    id: 'art-3',
    sparks: ['art'],
    prompt: 'Making things is mostly…',
    answers: ['Joy', 'Suffering that becomes joy', 'Procrastination with style']
  },

  // ── Pair-specific ──────────────────────────────────────────────────
  {
    id: 'music-games-1',
    sparks: ['music', 'games'],
    prompt: 'Best game soundtrack ever — does it slap outside the game?',
    answers: ['Yes, it\'s in my rotation', 'Only while playing', 'Soundtracks are background, fight me']
  },
  {
    id: 'music-movies-1',
    sparks: ['music', 'movies'],
    prompt: 'A film scene made unforgettable purely by its song. That song was…',
    answers: ['A needle drop I still hunt', 'The score, no lyrics needed', 'Silence — the bravest choice']
  },
  {
    id: 'music-travel-1',
    sparks: ['music', 'travel'],
    prompt: 'The airport playlist question: departures sound like…',
    answers: ['Something triumphant', 'Something melancholy', 'Podcasts, I\'m a fraud']
  },
  {
    id: 'food-travel-1',
    sparks: ['food', 'travel'],
    prompt: 'You travel somewhere ONLY to eat one thing. It\'s…',
    answers: ['A street stall legend', 'A grandmother\'s recipe', 'A restaurant I can\'t afford']
  },
  {
    id: 'food-movies-1',
    sparks: ['food', 'movies'],
    prompt: 'The correct cinema snack is…',
    answers: ['Popcorn, obviously', 'Smuggled real food', 'Nothing — respect the film']
  },
  {
    id: 'games-tech-1',
    sparks: ['games', 'tech'],
    prompt: 'Graphics, framerate, or the machine that runs both?',
    answers: ['Eye candy first', 'Smooth or nothing', 'I just love the hardware']
  },
  {
    id: 'games-sports-1',
    sparks: ['games', 'sports'],
    prompt: 'Sports games: real skill or button luck?',
    answers: ['Real skill, I\'d know', 'Luck wearing a costume', 'The rematch decides']
  },
  {
    id: 'tech-art-1',
    sparks: ['tech', 'art'],
    prompt: 'AI-made art: tool, threat, or collaborator?',
    answers: ['A new kind of brush', 'A threat to the craft', 'Depends who\'s holding it']
  },
  {
    id: 'travel-art-1',
    sparks: ['travel', 'art'],
    prompt: 'You bring one thing back from every trip:',
    answers: ['Photos, thousands', 'A sketchbook page', 'Something I bargained badly for']
  },
  {
    id: 'sports-travel-1',
    sparks: ['sports', 'travel'],
    prompt: 'Watch your sport live in its home country — which trip?',
    answers: ['Football in Brazil', 'Basketball in the States', 'Anything with a wild home crowd']
  },
  {
    id: 'music-art-1',
    sparks: ['music', 'art'],
    prompt: 'Album covers: do they change how the music sounds?',
    answers: ['Completely', 'A little, admit it', 'I\'ve never looked at one']
  },
  {
    id: 'movies-games-1',
    sparks: ['movies', 'games'],
    prompt: 'Game adaptations of movies, movies of games — who wins?',
    answers: ['Games make better movies now', 'Movies still can\'t play fair', 'Both should stop trying']
  }
]

/** All pair-specific icebreakers for an exact spark pair, order-independent. */
export function pairIcebreakers(a: SparkId, b: SparkId): Icebreaker[] {
  return ICEBREAKERS.filter(
    (i) => i.sparks.length === 2 && i.sparks.includes(a) && i.sparks.includes(b)
  )
}

export function soloIcebreakers(spark: SparkId): Icebreaker[] {
  return ICEBREAKERS.filter((i) => i.sparks.length === 1 && i.sparks[0] === spark)
}
