# Common Ground — Full Build Plan

### Decentraland Friendzone Mobile Buildathon · DoraHacks

**Status date:** 22 August 2026 · **Effective wall:** 3 September · **Our lock:** 2 September, 18:00
**Repo:** https://github.com/Uthmannabeel/common-ground (public, required)
**Prize pool:** $8,000 in MANA — 1st $3,000 · 2nd $2,000 · 3rd $1,500 · 4th $1,000 · 5th $500. Top 10 get featured in Decentraland Mobile Discover.
**Revision:** rev B, 22 Aug — rebuilt after an audit of the repo against this plan. Every number below was checked against the live event page, the GitHub API, the source, or Decentraland's docs. Where a claim could not be verified it says so.

\---

## 1\. The event, in one paragraph

Build a **mobile-first social World inside Decentraland** — a hangout, multiplayer activity, or co-op game designed for phones from the start. There is **no demo day and no pitch**: judges open the real Decentraland Mobile App during Sep 5–11 and play it unsupervised. The product *is* the pitch. Everything below is organized around surviving a solo judge's first five minutes on a phone.

Quoted judge philosophy: *"A simple, polished and enjoyable mobile experience may score higher than a technically complex project that is difficult to understand, performs poorly or lacks meaningful social interaction."*

**Two facts that change how we play it.** The event page lists the deadline as `2026/09/04 01:00` with **no timezone stated** — so we treat **3 September as the wall** and the 4th as a day that may not exist. And the field is **125 registered hackers with 0 BUIDLs submitted** as of today: three times the number we assumed, but entries land in the final 48 hours and most registrations never become submissions. The real threat is not 125 rivals, it is the handful who deploy something complete, stable and genuinely social. Being finished on the 2nd beats being ambitious on the 4th.

## 2\. Eligibility hard gates (pass/fail — miss one and nothing else matters)

1. Scene **deployed in a Decentraland World**, publicly accessible through judging (Sep 11). ❌ **not met — nothing is deployed**
2. **Meaningful social interaction** — *"Empty venues and single-player experiences without a meaningful social component are not eligible."* ❌ **not met — no shared state exists**
3. **Persistent standalone** — no host, event, or moderator required. Must work for a judge who arrives alone at 3 a.m. ❌ **not met — depends on gate 2**
4. **Designed and tested for mobile** — touch controls, small screens, tested on a real budget Android. ⚠️ never tested on a device
5. **Open source, public GitHub repo** with license and README. ❌ **not met — no LICENSE file; README is the untouched SDK7 template**
6. **Submitted through DoraHacks before the deadline** — our lock is Sep 2, 18:00.
7. **Original** — not used in past Decentraland competitions. Reusing open asset catalogs is explicitly allowed. ✅
8. Complies with Buildathon T\&C and Decentraland Terms of Use.

**Gates 1, 2, 3 and 5 are open today.** Gates 1 and 5 are under two hours of work between them. Gate 2 is the real project and it drives the whole schedule in section 7. The only submission requirement DoraHacks actually states is "GitHub/Gitlab/Bitbucket Link Required" — the repo is the one artifact a judge is guaranteed to open, so it is not optional polish.

## 3\. The concept

**Common Ground** — a campfire plaza World where *what you love decides where you sit.*

The judge's first five minutes:

1. **Arrive → pick your sparks.** Three taps on floating interest emblems (music, games, food, travel…). No typing, no forms.
2. **The World seats you.** You are placed at the campfire table with the highest spark overlap — against whoever is present, and against everyone who has been here before.
3. **You meet someone.** A tap-to-answer icebreaker keyed to your sparks. When you answer, the World names a real person who answered the same way: *"You and **Amara** both said 'Quiet, please.' — 3 of 4 tonight."* Their emblems and yours flare where they overlap. **This is the Spark Match moment, and it fires whether or not anyone else is online.**
4. **You add to the fire.** Every answer anyone has ever given adds one ember to the central campfire. You watch it grow and read *"you brought it to 1,247."*
5. **You leave a light for the next stranger.** A lantern addressed to whoever arrives next who shares your rarest spark. Someone will find it. You will have found one.

**The structural fix this revision makes.** The old plan built for a *pair* but every point is scored by a judge who is *alone*, and it patched that with "async traces" — a wall of past answers. But a wall is something you *read*, and reading three lines of 3D text off a board is exactly what an empty venue feels like from the inside. So the async layer stops being a wall you read and becomes **a person you meet**: a named collision with a real human in the past, and a lantern left for a real human in the future. Same concept, same Spark Match branding — it just no longer needs a second person online at 3 a.m. to score.

**Cold-start survivability:** every beat above works at concurrency 1. A second player upgrades the encounter from across-time to live, instantly. No bots, no fakery, no simulated players — real humans, seeded by real playtests, and every builder-written seed attributed as a builder.

**What we deliberately do NOT build:** no runtime AI, no external APIs, no photos/profiles, no chat system of our own. **No-keystroke doctrine:** the full social payoff must be scoreable with zero typing and zero voice. On a phone, a solo judge will never open chat or mic.

## 4\. Scoring doctrine — one design decision per judged criterion

|Criterion|The decision that wins it|
|-|-|
|Mobile-first experience|One-thumb play, finger-sized tap targets, portrait-first canvas, never was desktop|
|Social value|Every answer resolves into a **named match with a real human**, live or across time — zero typing|
|Mobile UX \& accessibility|Three-tap onboarding, no tutorial, no text entry; a persistent objective, not a toast that vanishes|
|Performance \& optimization|Hard budgets below, Scene Optimizer every deploy, **one measured number** on a budget Android quoted in the submission|
|Creativity \& originality|The Spark Match ignition and a campfire that visibly grows with every answer ever given|
|Retention \& discovery|Daily question readable **without tapping**, walls with date/count stamps ("Day 12 · 47 answers"), free Places listing|
|Overall execution|The descope ladder — whatever ships is complete and stable, never ambitious and broken|

**Performance budgets, stated.** At one parcel the scene limits are `n×10000` triangles, `n×200` entities, `log2(n+1)×20` materials, `log2(n+1)×10` textures — so **10,000 triangles, 200 entities, 20 materials, 10 textures**. The greybox already makes roughly 25 `setPbrMaterial` calls, so materials are the binding constraint before any art exists. Measure in Creator Hub; if materials block us, widen the parcel claim in `scene.json` (Worlds have had **no parcel limit since January 2023**, and one NAME grants 100 MB) — **change the parcel claim, not the layout.** A small full plaza loads fast and reads as intimate; a large empty one reads as an empty venue. Device target: loads and holds a smooth frame rate on our cheapest Android, measured and written down.

On past-winner evidence: the 2024 DCLGX jam data (optimization separated 1st from 2nd; winners had no weak axis) is directionally useful but that jam ran on different criteria, a fixed 64×64m footprint and a 160,000-triangle cap. **The seven criteria above are the actual rubric.** Keep the balanced-excellence self-audit because it is good practice, not because of another competition's scorecard.

## 5\. Technical architecture — six modules

|#|Module|Responsibility|Key technique|
|-|-|-|-|
|M1|World shell \& environment|Plaza, tables, emblems, the growing campfire — photographs well on a phone|Greybox + strong lighting is the floor. OpenDCL catalog (8,800+ free assets), Scene Optimizer before every deploy. Log source and license for every asset **at download time**|
|M2|Mobile UX layer|Spark picker, icebreaker cards, daily-question UI, the Spark Match reveal|SDK7 UI, three-tap onboarding, no text input. Portrait-first canvas, tap affordances that are not `hoverText`, a persistent objective marker|
|M3|**Multiplayer state service** (engineering keystone)|Server-authoritative persistence: sparks, matches, walls, embers, lanterns|**Decentraland hosts and deploys the server for us, free, published with the scene.** `@dcl/sdk@auth-server` + `Storage` (World and Player scope). Schema, bounds and checked writes specified below|
|M4|Social engine (concept centrepiece)|Who you match with, and what you talk about first|Deterministic tag-overlap scoring, rarest shared spark breaks ties. Matches against present players **and** stored past players. Authored icebreaker bank, zero runtime AI|
|M5|The campfire|The shared object everyone contributes to|One world-persisted integer. Every answer adds an ember; flame scale is a function of the count. Cannot break, cannot desync, is the visual centrepiece|
|M6|Retention \& discovery|30 date-indexed daily questions, dated walls, lanterns, Places listing|No cron, no backend job. All async content date/count-stamped. Never set `placesConfig.optOut`|

**M3, specified.** The old plan called M3 "the sync seam" and left it at that; a label is not an architecture, and the current `Store` interface has no presence, peer, match or subscription operations, so swapping its implementation cannot produce M3 without changing every caller. What we actually build:

* **Keys and scope.** World scope: `wall:plaza`, `wall:table:{0..3}`, `embers`, `lanterns`. Player scope: `sparks`, `streak`.
* **Bounds.** Every wall key is a ring buffer capped at 40 entries. One answer per player per prompt per day, enforced server-side. This is what stops a single visitor from burying every other human's answer — the current build has no such limit and boards show only the last three.
* **Checked writes.** `Storage.set()` resolves **`false`** on failure and never throws. An unchecked boolean is a silently lost answer. Check every one.
* **Throttling.** The runtime allows **40 in-flight host calls** total and rejects the excess immediately rather than queueing. Keep working state in memory on the server; write at checkpoints (round end, player leaves, debounced 30s), never per tap.
* **Server owns everything.** Match assignment, ember count and validation happen server-side, guarded by `isServer()`. Only the server calls `syncEntity`. A client-reported value is not authoritative just because a server stored it.

**Serverless multiplayer is not an option here.** `syncEntity` and MessageBus sync live players to each other and forget everything: the docs are explicit that "the scene state is not persisted when all players leave the scene." Only the Multiplayer Server has `Storage`.

**Stack:** Decentraland SDK7 · TypeScript · Decentraland-hosted Multiplayer Server (no third-party backend) · Blender + OpenDCL assets · tested in the real DCL Mobile App on a budget Android · public GitHub.

**Lanes for a team:** A = build lead (M2, M3) · B = world \& art (M1, M5) · C = social systems \& content (M4, M6). Lanes collapse cleanly to fewer people time-slicing.

## 6\. Where we are today (22 Aug) — honest status

**Verified done:**

* Registered on DoraHacks. Public repo live with an SDK7 scaffold.
* **`npm run build` passes, typecheck clean** on `@dcl/sdk 7.26.0`. Confirmed on a fresh clone.
* Spark picker, table seating, tap-to-answer icebreaker cards, daily question, answers appending to in-session walls. **30 daily questions** authored.

**Verified NOT done — the previous revision of this plan overstated several of these:**

* **No LICENSE file.** GitHub's license endpoint returns 404. Gate 5 is open.
* **README is still `# SDK7 Template scene`** — the untouched boilerplate.
* **`scene.json` has no `worldConfiguration` block** and `"owner"` is empty, so the scene cannot be published to a World at all. Nothing has ever been deployed; last commit was 13 August, 2 commits total.
* **No persistence and no shared state.** `createStore()` is a module-local object. Every visitor gets a private copy of the wall seeded with 5 builder-written entries; two people in the plaza cannot see each other. This is the load-bearing feature and it is 0% built.
* **Icebreakers: 36, not \~150** — 24 solo (3 per spark) and 12 pair, covering 12 of the 28 possible spark pairs.
* **The 12 pair-specific icebreakers are unreachable.** The solo path calls `pickIcebreaker(sparks, null, …)`, and with `theirs === null` the pair branch is skipped entirely. The best-written third of the content never appears.
* **Seating ignores other players.** `overlapScore()` is written, correct, and **never called**. `chooseTable()` returns `rarest % 4` — a pure function of your own highest-index spark. Across the 56 possible three-spark selections the distribution is 10.7% / 17.9% / 28.6% / 42.9%, so nearly half of all visitors are sent to one table.
* **Not started:** Spark Match moment, any co-op activity, lanterns, streaks, leaderboard, share link, date/count stamps, live pairing, environment art, playtests, video, submission page.

**Against the previous must-ship list, 2 of 8 items exist.** That is the number the schedule below is built on.

**Known defects to fix in passing** (all confirmed in the source): assigned seating is never enforced — `store.setTable()` is written but never read, so you can tap any table; `pickIcebreaker` can return `undefined` from an empty pool and the caller immediately reads `.prompt`; `getLocalPlayer()` returns the mutable internal object, bypassing the setters; table board text is coplanar with its backing panel (`plaza.ts:139` and `:148` share a position — the plaza stand gets it right with a 0.01m offset at `:187`/`:196`); tap affordances use `hoverText`, which does not exist on touch screens; the UI canvas is `1920×1080` landscape with fixed pixel panels; today's question is invisible until tapped; the wall array is unbounded.

## 7\. Recovery schedule — 22 Aug → 2 Sep

Sequenced by what each piece buys, not by module order. **Persistence is the eligibility floor and comes first; live pairing is a bonus a solo judge may never see and comes last.** The previous revision had these backwards. Weekdays below are correct — 22 August 2026 is a **Saturday**.

|Dates|Gate|Must be true at the end|
|-|-|-|
|**Sat 22 Aug**|**G0 (unblock)**|NAME claimed, `worldConfiguration` added, LICENSE added, README replaced, SDK pinned, **first deploy live and opened on the phone**. Discord joined. Playtesters messaged for the 30th. Cut list agreed and not revisited.|
|**Sun 23 Aug**|**G0.5 (server branch)**|`@dcl/sdk@auth-server` + `@dcl/js-runtime@auth-server` installed, `main()` split on `isServer()`, `"authoritativeMultiplayer": true` confirmed in `scene.json`, redeployed, server logs readable in production.|
|**Mon 24 – Tue 25**|**G1 (persistence)**|World and Player `Storage` live with the schema in section 5. Walls bounded and deduped, every `set()` result checked. Answers survive closing the app. Tested with two devices, a reload, a disconnect, and a cold empty server.|
|**Wed 26 Aug**|**G2 (the moment)**|`overlapScore()` wired in. Answers resolve into a named cross-time match. Campfire grows with the ember count. Lantern gesture works. Date/count stamps on every board; today's question readable without tapping.|
|**Thu 27 Aug**|**G3 (eligibility) — hard stop**|Alone, on a phone, on the deployed World: pick sparks → answer → get a named match with a real prior human → see the fire grow → leave a lantern → close the app, reopen, traces still there. **If this fails, all feature work stops until it passes.**|
|**Fri 28 – Sat 29**|**G4 (live tier)**|Bonus only. Real-time seating by overlap, two-player Spark Match, presence and departure handling. **If not stable by Saturday evening, ship without it.** In parallel and cheaply: extend the icebreaker bank to full 28-pair coverage.|
|**Sun 30 Aug**|**G5 (playtest)**|First public playtest via the Friendzone Discord — real strangers, own phones, on production. Their answers become the content a judge meets. Test cold arrival, someone leaving mid-match, repeated tapping, a judge arriving alone.|
|**Mon 31 Aug**|**G6 (mobile \& perf)**|Portrait canvas, tap affordances, persistent objective, coplanar boards fixed. Performance measured on the cheapest phone and **written down**: load time, frame rate, avatar count. Second playtest if turnout allows.|
|**Tue 1 Sep**|**G7 (freeze)**|**Feature freeze at the start of the day.** Solo-judge audit with someone who has never seen it, zero guidance. Score 1–5 on all seven criteria; remaining effort goes to the **lowest** axis. Video and portrait screenshots recorded from the frozen build. README and BUIDL copy written today.|
|**Wed 2 Sep, 18:00**|**G8 (submitted)**|Clean install, rebuild, redeploy, smoke-test on two devices, open every public link from a different account and device — then **submit**. Not draft. Thursday the 3rd stays completely free.|
|**3 – 11 Sep**|**G9 (judging watch)**|Deploy freeze. Daily two-minute in-app check. Minimal-diff emergency fixes only. Friends hang out in the World Sep 5–11 so judges may hit the live loop — real humans only, never bots.|

## 8\. Must-ship list vs. descope ladder

**Must ship (never cut):** deployed World · LICENSE and real README · server-backed persistence · the named cross-time Spark Match · the growing campfire · daily question and dated walls · full loop scoreable with zero typing or voice · mobile performance within budget · content seeded by a real playtest.

**Cut now — decided today, not on 1 September:**

1. **Ember-toss rhythm minigame** — replaced by the campfire. A co-op game with netcode and a solo ghost is the highest-risk, lowest-return item on the old list, and a half-finished minigame is exactly the "technically complex but performs poorly" case the judging philosophy penalizes.
2. **This-or-that duel** — was already rung 1 of the old ladder.
3. **Streaks and leaderboard** — they reward return visits judges will not make.
4. **Solo ghost mode** — existed only to prop up the cut minigame.

**Cut ladder if we fall behind (top rung goes first, no debate):**

1. Live two-player pairing (the async path already carries the score)
2. Lantern gesture (the named match carries the story alone)
3. Environment art beyond greybox-plus-lighting
4. Spark Match visual *richness* — degrades to a simple named highlight; the moment itself never disappears

**Never on any ladder: server-backed persistence.** The previous revision's stated fallback was "descope to the local-state fallback and keep building." That fallback *is* the disqualifier — it removes the only shared state in the product. Cut art, lanterns, activities and live pairing first, in that order.

**Performance ladder (if any phone stutters):** decorative props → texture resolutions → particles/lighting FX → table count (4→2) → Spark Match visual richness. The core loop and the campfire are never on this ladder.

## 9\. Top risks

|Risk|Score|Standing mitigation|
|-|-|-|
|Solo judge reads the World as empty (disqualifier)|25|The named cross-time match makes the social layer an *interaction*, not a decoration. G3 is a hard stop. Walls seeded by a real playtest|
|Persistence not finished in time|20|Front-loaded to days 2–3, before anything depends on it. Server is platform-hosted, so there is no infrastructure to build|
|Mobile performance fails on real phones|20|Budgets stated in section 4, Scene Optimizer in the pipeline, cheapest phone is the canary every deploy|
|Scope creep vs. part-time weeks|16|Four features already cut in section 8. Cut ladder pre-agreed. Judge-philosophy quote is the standing tiebreak|
|Auth-server branch swap breaks the build|12|Done on day 2 while nothing depends on it, on a pinned version, with a redeploy to confirm before moving on|
|Platform/deploy friction|12|Deploy on day 1, test in the real mobile app always, Discord support channel and workshops are the escalation path|
|Submission package incomplete|10|Sep 2 lock, video and README written on the 1st from the frozen build, checklist re-run before submit|
|Judging-week outage|10|Deploy freeze after G8, daily check, minimal-diff emergency protocol|

## 10\. Submission package (written 1 Sep, locked 2 Sep)

* **DoraHacks BUIDL page** — lead with the thesis ("a named place where what you love decides where you sit") and **one measured number** (e.g. "stable on a 4 GB Android with 15 avatars").
* **Demo video, 2–3 min, phone-recorded** — the solo experience first, because that is what judges get: arrive, pick sparks, get named-matched with a real person, watch the fire grow, leave a lantern. Then the two-device version if we have it. Show strangers meeting; don't describe architecture. **Note: a video is not a stated submission requirement — only a repo link is. It is an edge, never a blocker.**
* **GitHub README** — concept, controls, architecture sketch, run-from-scratch steps, asset attribution, license, and a "beyond the buildathon" roadmap (this is the incubation signal — Regenesis Labs Grants S2 and Creator Success select from these submissions).
* **World link + portrait screenshots** of the Spark Match, the campfire, the walls.
* **Eligibility checklist** (section 2) run one final time, including a check that `fixedAdapter` is absent from `scene.json`.

## 11\. Operating rules

* **Deploy early, deploy always** — redeploys are free; the deployed World is the only build that counts. Nine days of local-only work produced zero verified progress.
* **Phone first** — nothing is "done" until touched on the budget phone in the real mobile app.
* **Daily 10-minute checkpoint** — what closed yesterday, what closes today, any trigger red.
* **Out-finish, don't out-build** — 125 registered, 0 submitted, 5 prizes. The historical failure mode of strong developers is over-scope plus incomplete submission. Complete package, submitted 48h early, wins.
* **Press the content asymmetry** — but honestly: we have 36 icebreakers, not 150. Getting to full 28-pair coverage is a few hours of writing and it is the one axis a solo builder can genuinely out-work the field on. It happens in parallel with G4, never instead of G1–G3.
* **One competitor scan, one hour, at G5** — expect an empty BUIDL page, because entries land in the last 48 hours. Adjust positioning only, never scope.
* **Attend the workshops** — mobile testing, performance, deployment; the people teaching are adjacent to the people judging.

## 12\. Day-0 fixes, paste-ready

**`scene.json` — deploy to a World.** Root level, not nested. The NAME must be owned by the wallet signing the deploy.

```json
{
  "worldConfiguration": { "name": "commonground.dcl.eth" },
  "scene": { "parcels": ["0,0"], "base": "0,0" }
}
```

If materials become the binding constraint later, widen the claim only — not the layout:

```json
"scene": { "parcels": ["0,0", "0,1", "1,0", "1,1"], "base": "0,0" }
```

**`package.json` — make the build reproducible.** Currently `@dcl/sdk` is `"latest"` against a pinned `@dcl/js-runtime@7.25.0`, so a clean install in the final week can silently change the SDK and invalidate a tested build.

```json
"devDependencies": {
  "@dcl/js-runtime": "7.26.0",
  "@dcl/sdk": "7.26.0"
}
```

Commit `package-lock.json`. On Sunday both move to the `auth-server` branch, which today resolves to `7.26.1-32239895147.commit-3c77d90` for both packages — pin that exact string once the swap works.

**Multiplayer server — the two commands and the split.**

```bash
npm install @dcl/sdk@auth-server
npm install @dcl/js-runtime@auth-server
```

```ts
import { isServer } from "@dcl/sdk/network"

export function main() {
  if (isServer()) { initServer(); return }
  initClient()
  setupUi()
}
```

Only the server calls `syncEntity`, always guarded by `isServer()`. The `"authoritativeMultiplayer": true` flag is added to `scene.json` automatically on first build — do not remove it, or the server never runs and `isServer()` is always false. Add the deploying wallet to `logsPermissions` and read production logs with `npx sdk-commands sdk-server-logs`.

**`Storage` — read, bound, write, and check the result.**

```ts
import { Storage } from "@dcl/sdk/server"

const raw = await Storage.get<string>("wall:plaza")
const entries = raw ? JSON.parse(raw) : []

entries.push(newEntry)
const ok = await Storage.set("wall:plaza", JSON.stringify(entries.slice(-40)))
if (!ok) console.error("wall not persisted — retry at next checkpoint")
```

Strings only, so `JSON.stringify` / `JSON.parse` everything. Write at checkpoints, never per tap.

**LICENSE.** MIT — shortest path to satisfying "open source" and it does not complicate the Regenesis Labs or Creator Success conversations afterwards. File must be at repo root and named `LICENSE` so GitHub detects it; the API returns 404 today, which is what a judge's tooling sees too.

## 13\. Platform traps that silently cost the prize

* **The "Single Player" toggle makes us ineligible.** Setting `fixedAdapter: "offline:offline"` — or ticking **Single Player** in Creator Hub's World Settings — means, per the docs, "each user joining that world will always be alone." Nothing warns you, and it converts the entry into exactly the single-player experience the rules exclude. Grep `scene.json` for `fixedAdapter` before every deploy.
* **Moving the NAME kills the World in 48 hours.** Worlds storage is a budget derived from the deploying wallet's NAME, LAND and MANA holdings; exceed it — including by transferring or selling — and the World becomes inaccessible after 48 hours. **Do not move the NAME or drain that wallet between now and 13 September.** Gate 1 requires continued public accessibility *throughout judging*.
* **Places listing is free discovery — do not opt out.** All Worlds are automatically listed on the Places page unless you opt out. Never set `placesConfig.optOut`.
* **Record asset provenance at download time.** OpenDCL and Genesis Plaza reuse is encouraged, but gate 8 is compliance with both sets of Terms. Log source, license and attribution as you go; reconstructing it at 2 a.m. on 1 September is how attribution sections end up wrong.

## 14\. What only Nabeel can do — today

* **Fund a wallet and buy the NAME.** 100 MANA ≈ **$6.80** at today's price, plus Ethereum gas — five times cheaper than the previous estimate of $30–40. This single purchase unblocks the entire chain and has been the blocker for nine days.
* **Verify `CommonGround` is available** before committing to it in copy, screenshots and the submission. Have a second name ready.
* **Deploy once today,** however ugly, and open it in the Decentraland mobile app on the test phone. Every remaining unknown resolves faster after the first real deploy.
* **Recruit playtesters now** for Sunday the 30th — named people, confirmed times, their own phones. This has a lead time nobody budgets for, and it is the input to the seeded content.
* **Keep the NAME in the deploying wallet through 13 September.**

\---

*Rev B, 22 August 2026 — supersedes the 22 Aug revision after an independent audit of the repository against the plan. Event facts read from the DoraHacks event and BUIDL pages on 22 Aug 2026; repository state, commit history, license status and full source read via the GitHub API; `npm install && npm run build` run against a clean clone (passes, typecheck clean, `@dcl/sdk 7.26.0`); platform behaviour quoted from the `decentraland/docs` repository; MANA price and NAME cost checked 22 Aug 2026 and will drift. **Unverified:** the submission deadline's timezone is not stated on the event page — the 3 September wall is a deliberate safety margin, not a read fact; and the mobile rendering behaviour of the 1920×1080 UI canvas is reasoned from source, not measured on a device — that measurement is the 31 August task.*
