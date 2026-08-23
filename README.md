# Common Ground

**A campfire plaza where what you love decides where you sit.**

Common Ground is a mobile-first social World for [Decentraland](https://decentraland.org), built for the [Friendzone Mobile Buildathon](https://dorahacks.io/hackathon/friendzone) (Aug–Sep 2026). Strangers pick three interest "sparks", the World seats them at the campfire table with the highest overlap, and a tap-to-answer icebreaker gives them their first sentence of conversation — with the people present now, and with everyone who has ever been here.

## How it plays (no typing, no voice, no tutorial)

1. **Arrive → pick your sparks.** Three taps on floating interest emblems (music, games, food, travel, art, movies, sports, tech…).
2. **The World seats you** at the table with the highest spark overlap — against present players and everyone who came before.
3. **You meet someone.** Answer an icebreaker keyed to your sparks and the World names a real person who answered the same way. That's the **Spark Match** — it fires whether or not anyone else is online.
4. **You add to the fire.** Every answer ever given adds one ember to the central campfire; you watch it grow.
5. **You leave a light** — a lantern addressed to the next stranger who shares your rarest spark.

Everything is playable with taps alone. No chat, no mic, no text entry, no runtime AI, no external APIs.

## Architecture

- **Scene:** Decentraland SDK7, TypeScript. Portrait-first touch UI (spark picker, icebreaker cards, daily question).
- **State:** Decentraland-hosted Multiplayer Server (`authoritativeMultiplayer`) with `Storage` persistence — server-authoritative walls, embers, lanterns, and player sparks. No third-party backend.
- **Social engine:** deterministic tag-overlap scoring (rarest shared spark breaks ties) over an authored icebreaker bank — all content written at build time and shipped in the repo (`src/content/`).
- **Assets:** greybox plaza + catalog assets (OpenDCL / Genesis Plaza packs), Scene Optimizer pass before every deploy. Attribution in [ASSETS.md](ASSETS.md) as assets are added.

```
src/
  index.ts      entry — splits client/server on isServer()
  plaza.ts      the campfire plaza environment
  ui.tsx        touch UI: spark picker, cards, boards
  pairing.ts    overlap scoring + table assignment
  state.ts      state store (server-persisted via Storage)
  content/      sparks, icebreakers, daily questions (authored, static)
```

## Run it from scratch

```bash
git clone https://github.com/Uthmannabeel/common-ground.git
cd common-ground
npm install
npm run start        # local preview in the browser
npm run build        # type-check + production build
```

Deploying to the `commonground` Decentraland World requires a wallet holding that NAME:

```bash
npm run deploy -- --target-content https://worlds-content-server.decentraland.org
```

## Beyond the buildathon

- Full 28-pair icebreaker coverage and seasonal daily-question packs
- Spark constellations: persistent friend threads between people who matched across time
- More plazas — themed grounds (music ground, maker ground) sharing one identity
- Localized content banks; the engine is language-agnostic by design

## License

[MIT](LICENSE)
