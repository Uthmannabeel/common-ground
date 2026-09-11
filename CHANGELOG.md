# Changelog

Gate letters refer to the build plan in `docs/process/build-plan-rev-b.md`.

## 2026-09-11
- Three more phone screenshots confirmed the full loop on device. Table sign raised and cue cleared so they no longer overlap the stones; matched name plate halved. Redeployed.
- First phone screenshot: tap path confirmed working on device (wall shows answers, lantern standing). Avatar charm orbs disabled: the mobile client ignored their scale and drew one unit-sized sphere around the avatar. Redeployed.

## 2026-09-10
- Redeployed with the audit fixes (entity bafkreib3kwqc72wylff5c3z7pa5as4nax34azyqy2aipd463okv4gijy7e).
- Acted on an external code audit. UI now uses one coordinate system (SDK virtual scaling opted out). Stones render four answers and their text sits in front of the backing faces. Lantern placement uses an unsigned shift and stays inside the parcel footprint. Server flush is revision-checked so an in-flight save cannot drop a newer answer; every submitted answer is validated against the authored content bank. Table seating now scores real wall overlap.
- README and JUDGE.md reworded to match: matching memory is the last 40 answers per board, seating is by overlap with past answerers.

## 2026-09-09
- Redeployed with the first on-device fixes (entity bafkreic4sn7cii65ing73zeovvru3w7y62tfjois67gkugvozy3fnjmmxa).

## 2026-09-07
- First on-device report: the action button on the phone did nothing at a table. Tap targets now accept any input button, not only the mouse click.
- Table and pillar labels say what happens ("Get Lantern's question"), and every tap confirms itself with a toast pointing at the stones.

## 2026-09-06
- Redeployed to `commonground.dcl.eth` with the interactable-area UI fix (entity bafkreieigj3gi6jtgqe3hm7hf3dumypml4mjdx4gmzp7b2ql4oz5hdf6z4).
- JUDGE.md with a two-minute judging path and QR code; repo topics, homepage, and GitHub Pages landing site.
- UI laid out inside the client's interactable area so no scene button sits under the mobile joystick, chat, or interact button.
- README rewritten to match the shipped build.
- Planning trail committed under `docs/process/`.

## 2026-08-29
- First production deploy to `commonground.dcl.eth`. World reports healthy and accepting users.
- `logsPermissions` pointed at the NAME-holding wallet.

## 2026-08-26
- G6 (pulled forward): responsive UI from live canvas info, portrait readability bump, two-column spark grid, always-visible tap cues.
- G2.5: matched lantern ignites with the stranger's name, trail of light from fire to lantern, avatar charm orbs, story stones replace 2D cards, shared burst for co-present players.
- G2: lantern field rendered from wall entries, ember arc into a fire that grows with every answer, procedural crackle and chime audio, daily question readable without a tap, count and recency stamps.
- Spark Match ladder: four rungs that never dead-end, cross-time pairing, full-screen reveal.

## 2026-08-23
- G1: server-authoritative persistence on the Decentraland Multiplayer Server with `Storage`, heartbeat liveness, checkpointed flush, restart reconciliation, cross-time Spark Match foundation.
- G0.5: `@dcl/sdk` auth-server branch pinned, `main()` split on `isServer()`.
- Day-0 eligibility: MIT license, `worldConfiguration`, icebreakers extended to full 28-pair coverage.

## 2026-08-13
- Walking skeleton: spark picker, pairing, icebreakers, greybox plaza.
- Project scaffolded from the SDK7 scene template.
