# Common Ground — Roadmap

### Decentraland Friendzone Mobile Buildathon, and the six months after it

**Status date:** 23 August 2026 · **Hackathon wall:** 3 September · **Our lock:** 2 September, 18:00
**Repo:** https://github.com/Uthmannabeel/common-ground
**Revision:** rev A — two independent drafts (Claude, Codex) merged; where they disagreed, section 10 says what was decided and why. Every SDK mechanism named below was verified against the Decentraland docs vendored in the repo's own `.agents/skills/` or the `decentraland/docs` repository. Anything not verified says so.

\---

## 1\. The thesis

**Common Ground is Decentraland's social arrival layer: the place where a stranger's first five minutes become visible belonging, one real human connection, and a reason to come back with their crowd.**

Decentraland's own pitch is *"the kind of experiences where familiar faces keep showing up and newcomers always find their crowd."* The platform has the hangouts — screenings, live music, campfire meetups — but no mechanism for finding your crowd. Every event is a room of strangers. Common Ground is that mechanism, built as a place: what you love decides who you meet, every visit leaves a visible trace, and the trace makes the next stranger's arrival warmer than yours was.

It is a product, not a scene. The hackathon is chapter one.

## 2\. Why the current build is shallow — and what survives

The verdict is correct. Everything social in the current build renders as 2D cards and text on flat boards over a greybox plaza. The 3D world is scenery for a quiz. Judges play this in a 3D app on a phone, and they score what happens in 3D space — *"fresh, imaginative, memorable or surprising"* and *"ready to be featured"* are judged by eye, not by reading `server.ts`.

What survives, because it is the enabler of everything below: the server-authoritative persistence, the checked `Storage` writes, the dedup, the four-rung match ladder. That layer is what makes a world shaped by real humans *possible*. It was never the product. The product is what that data looks like when you walk into it.

**The fix is a rendering change, not a concept change.** Same server, same schema, same messages. The accumulated data becomes geometry instead of text.

## 3\. Phase 1 — the hackathon entry (ships 2 September)

### The retellable image

**"I walked into a clearing at night, glowing with lanterns that real people had left. I answered one question, my ember flew into the fire, the fire flared, and a trail of light grew across the ground to a lantern with a stranger's name on it."**

That is what a judge retells. It works at concurrency 1. It is built from data the server already holds.

### The judged ninety seconds, beat by beat

|Beat|What the judge sees in 3D|SDK mechanism (verified)|
|-|-|-|
|**Arrive**|A compact night clearing: one central fire, eight interest shrines around it, a ring of lanterns left by past visitors, ambient fire crackle after the first tap|Environment dressing: OpenDCL `GltfContainer` assets placed, not modelled. Fire and lanterns: `MeshRenderer` primitives with emissive `Material` — the same technique the existing campfire already uses. Sound: `AudioSource` loop, unlocked by the first tap|
|**Declare**|Tap three waist-high shrines. Each tap sends a coloured spark from the shrine to you; after three, they settle as three glowing charms on your avatar that everyone present can see|Shrines: large collider meshes + pointer events (no `hoverText` — touch has no hover). Spark flight: `Tween.Mode.Move`. Charms: `AvatarAttach` at `AAPT_SPINE`, emissive primitives in spark colours|
|**Answer**|Walk to the story stone at your table. The question and its answers are physical, large tap targets on the stone — not a 2D card. Tap one: an ember arcs from the stone into the fire, bursts, and the fire visibly grows|Stone text: `TextShape`. Ember: pooled entity, `TweenSequence` arc, `Tween.Mode.Scale` burst. Fire growth: the existing `flickerSystem` with amplitude driven by the synced `CGFire.embers`|
|**Meet**|A lantern elsewhere in the clearing ignites with another real person's name. A trail of light grows segment by segment across the ground from the fire to it. One sentence beside it: *"You and Amara both said 'Quiet, please.'"* The 2D reveal screen from the pending patch follows as the accessible summary, not the climax|Match: the existing server ladder. Lantern ignition: emissive `Material` swap on a pooled lantern entity. Trail: ~20 pooled emissive segments enabled in sequence. Sentence: `TextShape`. Rung-honest phrasing carried in the existing `answerAck`|
|**Leave a light**|Tap your table's empty lantern: it lights in your spark colour with your name. It will be there tomorrow, and the next stranger who shares your spark is led to it|Lanterns are `WallEntry` data rendered as geometry. Server-owned, synced per board via the existing `CGWall` components|
|**If someone else is there**|Their charms show what they love before a word is exchanged. When two present players share a spark or an answer, both see the same burst and the same trail between them|`AvatarAttach` (same scene only — accepted). Shared burst and trail: server-authoritative `syncEntity`, a small new `CGEvent` component|

Target: enter, walk ten metres, three taps, one answer, witness the transformation, reach the lantern — under ninety seconds, with no instruction.

### Budgets, stated

Claim **2×2 parcels** in `scene.json` (Worlds have no parcel limit; change the claim, not the layout). That yields 40,000 triangles, **800 entities, 46 materials, 23 textures**.

* Lanterns: render the newest **150**. Older ones fold into the ember count and the ambient glow. **Eight shared materials**, one per spark colour — never one per lantern.
* Synced payload: lanterns ride the existing per-board `CGWall` JSON (five boards × ~30 lanterns × ~100 bytes ≈ 3 KB each) — the **13 KB per-message cap** is why they are split, not one list.
* Trail segments: 20, pooled, one material. In-flight embers: 10, pooled. Shrines 8, stones 8–12, fire 1, props from one or two OpenDCL GLBs.
* Estimated: ~220 entities, ~25 materials. Headroom is deliberate — the mobile guidance is "comfortably below."

### What changes in the 10-day schedule — and what does not

Every gate date from the build plan (rev C) stands. Only the contents of G2–G4 change, and each change is paid for by a cut that was already authorised.

|Date|Gate|Now means|
|-|-|-|
|**Sun 23**|G0|**Unchanged: buy the NAME, deploy the greybox, open it on the phone, DoraHacks draft, playtesters messaged.** Nothing below exists until this returns 200|
|**Mon 24 – Tue 25**|G1|Done (`e463b0b`). Apply `spark-match.patch`. Use the recovered days for G2|
|**Wed 26**|G2 — *data becomes geometry*|Lanterns rendered from wall entries in spark colours. Ember arc + fire flare on answer. Crackle loop + match chime|
|**Thu 27**|G2.5 — *the climax*|The trail to a named lantern. Avatar charms. Story stones replace 2D cards on the judged path. Live shared burst for co-present players|
|**Fri 28**|G3 — **hard stop**|Unchanged criterion — alone, on a phone, on the deployed World: arrive → declare → answer → meet a named real human → leave a light → close, reopen, it is all still there. Plus: every match-ladder branch walked against production data|
|**Sat 29**|G4 — *the clearing*|OpenDCL dressing placed, palette unified, the hero composition from spawn. This is now the product, not polish — it is never on the cut ladder|
|**Sun 30**|G5 — *playtest + the device decision*|Public playtest on production. **Decision gate:** if the 3D ritual is not smooth on the budget phone, ship the floor (below) and spend Mon–Tue on it|
|**Mon 31**|G6|Mobile and performance pass; numbers written down|
|**Tue 1 Sep**|G7|Freeze at the start of the day. Solo-judge audit. Video and screenshots from the frozen build|
|**Wed 2 Sep, 18:00**|G8|Submit. Thursday stays free|

**The floor.** If the ritual is not working on a phone by the G5 decision gate, the eligible fallback is rev C's build plus the patch: lanterns as geometry (the cheapest of the new items — they are the existing wall data with a mesh) and the 2D reveal. That build is complete, stable and eligible. The ambitious version has a floor; it cannot take the entry down with it.

**Paid for by:** live seating by overlap (cut ladder rung 1 in rev C), the streak counter, the leaderboard, the ember-toss minigame, the duel, and all 2D text boards as a primary surface.

## 4\. Phase 2 — 5 September → October: the living campfire

**Headline: the fire remembers who came, and every day gives the community a reason to gather.**

Judging, then the Discover window, then the Regenesis Grants S2 application. The product's job in this phase is to prove people come back without anyone hosting.

* **Reciprocal lanterns.** On return: *"Three people found your light since Tuesday — Amara sent 🔥."* Player-scoped `Storage` for what you sent and what came back. This is the emotional return hook; the daily question is the scheduled one.
* **The Campfire Minute.** One short daily gathering window at a fixed time where everyone present answers the same question and sees the connections form live — scheduled but hostless, driven by the server's own clock (the heartbeat pattern already in `server.ts`). A weekly **constellation reveal**: every match of the week drawn as joined stars above the clearing. The sky is the long memory; the trail is the first-visit image.
* **Seasons.** The clearing's palette and sky shift weekly by date index — no backend, the same trick as the daily questions. The place is visibly different from last week.
* **Kindling.** Return visits add small extra embers to your avatar charms (`AvatarAttach`). A streak you wear, not a number you read.
* **Performance hardening** on the cheapest phones; **Discover featuring** if top 10 — keep the World deployed and untouched through judging.

**Why it matters:** a repeatable appointment that does not need a crowd, and the first real return-rate number for the grant application.

**What could kill it:** the daily question becoming a chore. The world must transform with participation — if the only thing that changes is a counter, nobody returns. Gate every ritual on "what does the clearing look like afterwards."

## 5\. Phase 3 — November → December: circles

**Headline: Common Ground stops identifying similarities and starts forming recurring small groups.**

Grant-funded. Visitors join one or two **Circles** — a shared spark and a preferred gathering time. Each Circle has its own camp beyond the clearing, a weekly ritual, and a persistent collective artifact.

* **Camps** via multi-scene Worlds (`--multi-scene`): a Music Grove, a Makers' Yard, the Pitch. Per-scene entity budgets solve the district's size. Navigation with `teleportTo`.
* **The weekly fire** of a Circle only completes when several members contribute; each completed week adds a physical object to the camp — a banner, a totem, a constellation segment. Familiar names accumulate around its lantern ring. *Your* fire being there is the retention engine.
* **Claimable, named fires.** A group of friends lights one; it persists; strangers find it by spark.
* **Creator layer.** A Circle's host authors its questions — multiple-choice only. No free text anywhere is the built-in moderation defence, and it stays until a moderation layer exists.
* **Host controls** via an authenticated external service through `signedFetch` — only when moderation workload proves it necessary, not before.

**This is the Regenesis and Creator Success proposition:** not "fund more content" but "fund Decentraland's newcomer-to-community funnel." The pitch is numbers (section 8).

**What could kill it:** eight empty camps make the product feel deader than one full clearing. Open a Circle's camp only when enough real members exist; until then its ritual happens in the central clearing. Density is gated on metrics, never on ambition.

## 6\. Phase 4 — January → February: the social front door

**Headline: every newcomer gets a living route into Decentraland's actual communities.**

* **Recommendations.** Your sparks, answers and attendance produce three suggested Circles and a weekly itinerary of relevant gatherings — rules on the Multiplayer Server over stored preferences, no ML, no external API.
* **A physical discovery map** in the clearing: `MeshRenderer` + `TextShape` + pointer events. Familiar faces shown as present; destinations reachable with `teleportTo` / `changeRealm`.
* **Newcomer nights** run by community hosts inside Common Ground; Circles that outgrow it graduate into their own Decentraland venues and keep a doorway from the clearing. That graduation is the ecosystem story grants exist to fund.
* **Distribution levers, as grant line items:** renting the smallest suitable LAND unlocks the Places listing (the FAQ requires LAND or a rental alongside the NAME) and allows a small Genesis City outpost near foot traffic that points home. A published aggregate feed — "which sparks are live at Common Ground now" — for other scenes and the events calendar to read.
* **Creator Success deliverable:** an open-source, drop-in "fire" template other creators can put in their own scenes.

**Stated plainly:** portable experiences are *"not currently supported in the latest versions of Decentraland."* There is no roadmap fiction here about carrying your charms across the whole platform. If that capability returns, spark charms become a wearable and identity travels — a contingency, not a plan.

**What could kill it:** becoming a directory with a pretty lobby. Every recommendation must end in a hosted ritual or a recurring group, never an outbound link.

## 7\. Cut from the concept entirely

* The ember-toss minigame and the this-or-that duel.
* Streak badges and leaderboards as numbers — the lantern field and the charms *are* the streak.
* 2D text boards as the primary social surface — lanterns replace them.
* Four fixed "tables" as furniture — they become fires people light.
* The full-screen reveal as the *climax* — it stays as the accessible summary after the trail.
* Showing all 52 questions as breadth on the judged path — they are the rotation pool, not the pitch.
* Any claim that the World has a community before real people have left traces. Builder seeds are attributed as builders.
* Bots, simulated visitors, free-text input, a chat system, and an external backend before scale demands one.

## 8\. What to measure — the grant application is numbers

All of this is countable on the server with zero analytics vendor. A weekly `metrics` key in World `Storage`, read with `npx sdk-commands storage scene`.

|Metric|What it proves|
|-|-|
|Arrivals → three sparks declared|Onboarding works with no instruction (funnel)|
|Answers per arrival · matches by ladder rung|Social value is real, and honest — rung 1 vs rung 4 ratio|
|Lanterns lit · lanterns found · replies sent|The async loop closes|
|Return rate (player-scope `lastSeen`) · Campfire Minute attendance|Retention without a host|
|Co-presence events (two real players matched live)|The live layer is used, not just possible|
|Circle joins · weekly fires completed|Phase 3's density gate|

## 9\. Risks across the whole arc

1. **An empty world destroys the premise.** Traces make solo play meaningful; only rituals, real testers and density control create familiar faces. This is existential in every phase. Mitigation: the floor in Phase 1; metrics-gated expansion in Phase 3.
2. **3D ambition outruns mobile polish — by a developer with no 3D experience.** One beautiful clearing with three excellent effects beats four zones. Mitigation: primitives + emissive for every data object (no modelling); OpenDCL GLBs for dressing (placement, not creation); pooled entities; the G5 device decision gate with a pre-agreed floor.
3. **Still not deployed.** `commonground.dcl.eth` returned 404 at the time of writing. Everything in this document is theoretical until it returns 200, and the NAME must stay in the deploying wallet through 13 September.
4. **Distribution depends on gates we do not control** — Places' LAND requirement, Discover selection, grant timing. Mitigation: secure the World first; treat LAND rental and programs as accelerants; the product has **zero running cost** (hosted server, no backend), so it survives a quiet month without dying.
5. **Moderation as it grows.** No free text, ever, until there is a moderation layer. Display names are the only user-authored string, and they come from the platform.

## 10\. Where the two drafts disagreed, and what was decided

Both drafts independently arrived at: data rendered as geometry, lanterns, a growing fire, avatar charms, emissive not lights, sound, Circles as the Phase 3 engine, metrics-gated density, no portables, cut the counters and boards. Three reviewers now converge on the same axis — the diagnosis is settled.

|Question|Claude|Codex|Decided|
|-|-|-|-|
|The first-visit climax|A star-line in the sky|A ground trail to a named lantern|**Codex.** A phone user may never tilt the camera up; a trail is at eye level, it is a path you walk, and it ends at a name. The constellation becomes Phase 2's weekly long-memory image|
|Environment|Primitives + emissive, zero modelling|One authored OpenDCL clearing via `GltfContainer`|**Split.** GLB dressing for the environment (placement, no modelling risk); primitives for every data-driven object, because those must spawn from state|
|Answering|Keep 2D cards, 3–4 options|Physical story stones, two huge answer symbols|**Codex's stones, Claude's options.** Physical targets on the judged path; up to three answers so the authored bank and the "3 of 4 agree" stat survive|
|First deploy|Today|By 30 August|**Today.** 30 August is the device-decision gate, not the first deploy — eligibility and the phone feedback loop both start at the first 200|
|Phase 2 cadence|Weekly fire|Daily Campfire Minute|**Both.** Daily window, weekly constellation reveal|
|Phase 4 shape|Distribution levers (LAND, outpost, open feed)|The front door: recommendations, itinerary, graduation|**Codex's product, Claude's levers** as grant line items under it|

## 11\. What this roadmap stands on, and what it does not

**Verified this session:** event rules, prizes, post-event programs and Decentraland's self-description (event page); Worlds limits, multi-scene, storage budget, `worldConfiguration`, the Places LAND requirement, portable experiences unsupported (`decentraland/docs`); `AvatarAttach` anchors, `AudioSource` and the first-tap rule, `Tween`/`TweenSequence`, `teleportTo`/`changeRealm`, the server heartbeat pattern, `registerMessages`, `Storage` semantics and the 13 KB message cap (the SDK docs vendored in the repo's `.agents/skills/`); touch-only, no hover, no gestures, no dynamic lights (the mobile parity tracker, 21 Aug 2026); the current build at `e463b0b` builds clean on the `auth-server` pin.

**Not verified — marked so the first person to touch each item knows:** whether Buildathon Discover featuring bypasses the Places LAND requirement; LAND rental pricing and Genesis City outpost cost; Regenesis Grants S2 and Creator Success dates, eligibility and application requirements; multi-scene navigation UX on mobile; whether identical PBR materials dedupe against the material limit (measure in Creator Hub — and share materials regardless); real-device frame rate of the ritual, which is the 30 August decision; audio asset licensing for the crackle loop; the submission deadline's timezone.

\---

*Rev A, 23 August 2026. Two independent drafts — Claude and Codex — written against the same verified fact base and merged; disagreements and decisions in section 10. Intended to sit beside the build plan (rev C), which keeps the gate dates this roadmap reuses. The build plan is the floor; this is the ceiling. Nothing here was pushed to the repository.*
