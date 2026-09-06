# Common Ground

**A campfire plaza built out of what strangers share.**

Common Ground is a mobile-first social World for [Decentraland](https://decentraland.org), built for the [Friendzone Mobile Buildathon](https://dorahacks.io/hackathon/friendzone) (Aug–Sep 2026). You tap three interest "sparks", the plaza seats you at the campfire table with the highest overlap, and one tapped answer makes the World name a real person who answered the same way, whether they are standing next to you or visited a week ago.

**Play:** https://decentraland.org/jump/?realm=commonground.dcl.eth
**World:** `commonground.dcl.eth` (in the Decentraland mobile app, search "Common Ground")
**Judging?** [JUDGE.md](JUDGE.md) is the two-minute path with a QR code.

## How it plays (no typing, no voice, no tutorial)

1. **Pick three sparks.** Music, Movies & Series, Food, Sports, Games, Travel, Tech, Art & Making. Three taps.
2. **The World seats you.** Four tables (Ember, Driftwood, Lantern, North Star). You are sent to the one with the highest spark overlap, scored against present players and everyone who came before.
3. **Answer at the stones.** Tap your table and three story stones rise with an icebreaker written for your sparks. Tap one.
4. **Your ember joins the fire.** The answer arcs into the central campfire, which grows with every answer ever given.
5. **Spark Match.** The World tells you, by name, who answered the same way: "You and Amara both said 'At 2am'." Their lantern lights up with their name and a trail of light draws itself from the fire to it. If they are here now, both of you see the same burst.
6. **A new question every day.** The plaza pillar shows today's question, readable from the fire, rotating by date. Every board carries a stamp such as "23 answers · latest today".

Everything is a tap. No chat, no mic, no text entry, no runtime AI, no external APIs.

## What makes it work when the plaza is empty

- **Named cross-time matching.** A four-rung match ladder (same answer and shared spark, shared spark, same answer, anyone before you) means the reveal never dead-ends, and the wording is honest to the rung. It fires at concurrency one because the World remembers everyone.
- **A world made of its own data.** Every answer anyone has given is a lantern in an arc behind that board, lit in the author's spark colour. The fire's size is the total count. Nothing is decorative.
- **Retention that is legible on the first visit.** Date-indexed daily question, count and recency stamps, and a jump link that lands you at the fire.

## Mobile-first specifics

- UI is laid out inside the client's reported interactable area (`UiCanvasInformation.interactableArea`), so no scene button sits under the joystick, chat, or interaction button. Hardware notches are handled separately by `ScreenInsetArea`.
- Portrait gets a 2.2× readability bump and a two-column spark grid; landscape phones get 1.35×; desktop is unchanged.
- Always-visible "tap …" cues on tables and the question pillar, because touch has no hover.
- Primitives and emissive materials only. No textures, no particle systems, no point lights. Sound is two small procedural WAVs. No SDK features unsupported on the mobile client.

## Architecture

- **Scene:** Decentraland SDK7, TypeScript, one codebase split on `isServer()`.
- **State:** Decentraland-hosted Multiplayer Server (`authoritativeMultiplayer: true`) with `Storage` persistence. Server-authoritative answer walls (40-entry ring per board, per-player-per-prompt-per-day dedup), ember count, heartbeat liveness, checkpointed flush, and restart reconciliation. No third-party backend.
- **Social engine:** deterministic tag-overlap scoring (shared count dominates, rarest shared spark breaks ties) over an authored content bank shipped in the repo: 8 sparks, 53 icebreakers with full 28-pair coverage, 30 daily questions.
- **Assets:** built entirely from SDK primitives; the two audio files in `assets/audio/` are generated in-repo.

```
src/
  index.ts        entry: splits client/server on isServer(); Spark Match ladder
  server.ts       authoritative server: walls, embers, heartbeat, Storage, charm orbs
  state.ts        client store over server-synced components; intents + pending echo
  pairing.ts      overlap scoring + table assignment
  plaza.ts        the campfire plaza: fire, four tables, question pillar, tap cues
  stones.ts       story stones: physical prompt + tap slabs facing the fire
  lanterns.ts     lantern field rendered from wall entries; matched lantern ignites
  effects.ts      ember arc, trail of light, shared burst, sound
  ui.tsx          touch UI: spark picker, reveal screen, toasts
  shared/         types, schemas, and messages used by both sides
  content/        sparks, icebreakers, daily questions (authored, static)
```

## Run it from scratch

```bash
git clone https://github.com/Uthmannabeel/common-ground.git
cd common-ground
npm install
npm run start        # local preview in the browser (starts the multiplayer server too)
npm run build        # production bundle + type check
```

Deploying to the `commonground` World requires a wallet holding that NAME:

```bash
npm run deploy -- --target-content https://worlds-content-server.decentraland.org
```

## Beyond the buildathon

- Spark constellations: persistent friend threads between people who matched across time
- More plazas: themed grounds (music ground, maker ground) sharing one identity
- Seasonal daily-question packs and localized content banks; the engine is language-agnostic by design

## License

[MIT](LICENSE)
