# Which plan to run — a three-way verdict

### Decentraland Friendzone Mobile Buildathon · independent review of Nabeel's shortlist

**Status date:** 23 August 2026 · **Effective wall:** 3 September · **Repo:** https://github.com/Uthmannabeel/common-ground
**What this is:** Nabeel ranked four plans across two concepts and asked two reviewers (Claude and Codex) to check the ranking independently. Both reviews were written against the same verified fact base; where they disagree, section 4 says so plainly and does not average them away.

\---

## 1\. The rankings side by side

Criterion for every ranking below: **probability of winning 1st place ($3,000 MANA)** — not "best concept in the abstract."

|Rank|Nabeel|Claude|Codex|
|-|-|-|-|
|**1st**|The Roadmap|**The Roadmap**|**The Roadmap**|
|**2nd**|Common Ground rev B|**Common Ground rev B**|**One Crown**|
|**3rd**|One Crown|**One Crown**|Common Ground rev B|
|**4th**|Common Ground v1|**Common Ground v1**|Common Ground v1|

**Claude agrees with Nabeel's ranking exactly.** Codex agrees on 1st and 4th and swaps the middle two — it rates One Crown above rev B on pure ceiling, then names Nabeel's exact ordering as its own *safer* reorder. So the only live disagreement is **rev B vs One Crown at #2**, and section 4 is about that.

## 2\. Why the Roadmap is #1 — all three reviewers agree

The Roadmap is **not** "a better concept than rev B." It is rev B's build **plus** a 3D re-skin of the same server data, **with a floor that is the rev B build itself**, and a device-decision gate on 30 August that drops to that floor if the fancy version is not smooth on a phone.

* Same server, same schema, same messages. The accumulated data becomes **geometry** instead of text on flat boards: lanterns real people left that you walk to, an ember arcing from your answer into a fire that visibly grows, a trail of light leading to a stranger's name.
* It **dominates** rev B — identical floor, higher ceiling, and the ceiling is risk-bounded by a dated decision. That is not "riskier than rev B." It is "rev B with an upside option that has already been capped."
* The retellable image a judge remembers and repeats — *"I walked into a clearing glowing with lanterns real people left, answered one question, my ember flew into the fire, and a trail of light grew to a stranger's name"* — is worth the difference between $500 and $3,000, and it works with nobody else online.

**The condition that makes #1 real — load-bearing, not a footnote.** The Roadmap only beats rev B **while the floor stays green**: the 2D reveal and the lantern-as-geometry path keep working as the 3D is layered on top, and the 28 August eligibility gate (G3) is enforced as a hard stop. A developer with no 3D experience can burn the whole week chasing the ceiling and miss the floor. **If Nabeel cannot commit to honoring the 30 August device gate, his honest #1 is plain rev B.** The ranking is right; the discipline is its price.

## 3\. Why v1 is #4 — unanimous, no debate

It is built on false "already done" claims (a licence and README that did not exist, "~150 icebreakers" when there are 52, seating "by overlap" that never called the overlap function). Following it leads to a broken and possibly disqualified entry. It also spends effort on a co-op minigame that is exactly the "technically complex but performs poorly" case the judging philosophy penalises. It is the map that does not match the ground.

## 4\. The one real disagreement: rev B vs One Crown at #2

**Codex's case for One Crown #2.** It is the better *game*: a Simon-Says crown you steal by copying a real player's dance, with the throne holding a persistent clone of an absent player wearing their real wearables, dethronement notices, and leaderboards. More legibly mobile, more novel, better spectator value than a spark quiz. On raw ceiling — "could this take 1st if it ships" — One Crown is at least rev B's equal. **Its core wow is verified feasible:** `fetchAvatarFromCatalyst` + `AvatarShape` genuinely renders a dressed clone of any wallet. It is not vaporware.

**Claude's case for One Crown #3 (which is also Codex's own safe reorder, and Nabeel's).** The decisive argument is **timing, not taste**:

* One Crown's own kill-gate is **25 August**. The only moment the #2 plan ever matters is the Roadmap's **30 August** device gate — by then One Crown is already impossible. So One Crown exists purely as a *today* decision.
* And today it loses on **dominance**: it delivers the *same category* of wow the Roadmap already delivers — real people made visible in 3D — but with **zero of the game built**, on top of discarding the server-authoritative persistence that only started working this morning, for a developer with no prior Decentraland or 3D experience.
* Its clone feature carries two traps its plan does not mention: **Worlds servers do not expose `/lambdas`**, so the profile fetch must hit `peer.decentraland.org` explicitly; and an absent player's **NFT wearables are heavy GLBs** on the exact mobile-performance axis One Crown stakes its whole pitch on.

**Resolution for Nabeel specifically: rev B #2.** If he were an experienced DCL developer with an empty repo, Codex's One Crown #2 would be the right call — the concept ceiling is genuinely there. He is not, and the repo is not empty. The probability-weighted bet is the finished foundation, and the Roadmap already harvests One Crown's main advantage without the pivot risk.

**Two factual flags carried out of the One Crown document:** its "roughly 150 icebreakers" is v1's stale false number — the verified count is **52** with full 28-pair coverage; and its "placed third of nine" is a self-assessment from another drafting session, not an external result. Neither should be repeated as fact.

## 5\. What both reviewers converge on — and it outranks the whole ranking

Asked independently for the one thing every plan is missing, Claude and Codex returned the **same** answer: **a deployed World that has passed a real-phone judge run.**

At the time of writing, both `commonground.dcl.eth` and `onecrown.dcl.eth` return **HTTP 404** on the Worlds content server (checked against a known-live World returning 200, so it is a real negative). Nothing built this morning is visible to a judge. Every ranking on this page is theoretical until that URL returns 200 — and the gap between any two of these plans is **smaller than the gap between deployed and not**, which is two days already lost to a **≈ $7** NAME purchase.

**Bottom line: the ranking is Roadmap → rev B → One Crown → v1, and the ranking does not matter today. Rank second, deploy first.**

\---

## Verification notes

* **Verified this session:** repo state and HEAD `e463b0b` (builds clean on the `@dcl/sdk@auth-server` pin) via the GitHub API; deployment status via `worlds-content-server.decentraland.org` with a live-World control; the 52-icebreaker / 28-pair count from source; One Crown's absent-player clone feasibility against the repo's vendored `player-avatar` skill (`fetchAvatarFromCatalyst`, the `peer.decentraland.org` `/lambdas` requirement, undressed-without-explicit-wearables behaviour); the event rules, prizes, and judging criteria from the DoraHacks event page.
* **Not verified:** the submission deadline's timezone (3 September treated as the wall, a safety margin not a read fact); real-device frame rate of either 3D concept — which is the 30 August decision, not a claim; and the "placed third of nine" self-assessment in the One Crown document, which originates from another drafting session.
* Nothing in this review was pushed to the repository. Two independent reviews (Claude, Codex) merged; the one disagreement is section 4 and is left standing, not averaged.
