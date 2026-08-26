import { Schemas } from '@dcl/sdk/ecs'
import { registerMessages } from '@dcl/sdk/network'

// Client -> server intents and server -> client acks. Must load at module
// scope (static import from index.ts) — registerMessages defines a component
// internally and the engine seals after initial module load.

export const room = registerMessages({
  // Client -> server
  setSparks: Schemas.Map({
    sparks: Schemas.Array(Schemas.String)
  }),
  postAnswer: Schemas.Map({
    table: Schemas.Int,
    promptId: Schemas.String,
    prompt: Schemas.String,
    answer: Schemas.String,
    author: Schemas.String,
    sparks: Schemas.Array(Schemas.String)
  }),

  // Server -> one client: the result of a postAnswer, including the
  // cross-time Spark Match when another human answered the same way.
  answerAck: Schemas.Map({
    promptId: Schemas.String,
    accepted: Schemas.Boolean,
    reason: Schemas.String,
    /** '' only when the wall is completely empty — the ladder never dead-ends otherwise. */
    matchName: Schemas.String,
    matchAnswer: Schemas.String,
    /** Which rung matched: 1 same answer+shared spark · 2 shared spark · 3 same answer · 4 anyone on the wall · 0 none. */
    matchRung: Schemas.Int,
    matchSparks: Schemas.Array(Schemas.String),
    sameCount: Schemas.Int,
    totalCount: Schemas.Int
  })
})
