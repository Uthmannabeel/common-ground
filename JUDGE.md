# Judging Common Ground in two minutes

**A campfire plaza built out of what strangers share.** Playable alone, on a phone, with taps only. The World remembers every visitor, so the social payoff fires at concurrency one.

## 1. Open the World

Scan on the phone that has the Decentraland mobile app installed:

![Jump to Common Ground](images/judge-qr.png)

Or open the link directly:

```
https://decentraland.org/jump/?realm=commonground.dcl.eth
```

The mobile app presents the World in landscape; the layout also holds in portrait and on the desktop client.

## 2. Play (about 90 seconds)

1. **Pick three sparks.** The picker is on screen at spawn. Tap any three.
2. **Walk to your table.** A toast names it (Ember, Driftwood, Lantern, or North Star) and the table carries a "tap" cue. Tap it.
3. **Answer at the stones.** Slabs rise with a question written for your sparks and its answers. Tap one.
4. **Watch the ember fly** into the fire, then read the Spark Match screen: a real person, by name, who answered the way you did. Their lantern lights with their name and a trail of light draws itself from the fire to it.
5. **Look around.** Each lantern in the arc behind a board is one of the most recent answers there. The fire's size is the count of every answer ever given. The pillar shows today's question and each board carries a stamp such as "23 answers · latest today".

If a second person is present when a match fires, both of you see the same burst.

## 3. What to look for, mapped to the criteria

| Criterion | Where it shows up |
|---|---|
| Mobile-First Experience | Designed for one thumb: picker, stones, reveal are all large tap targets; no chat, mic, or keyboard anywhere in the loop |
| Social Value | Named cross-time matching: "You and Amara both said…" is a real visitor, present or past, so a solo judge still meets someone. The wording tells you how close the match is: same answer, shared spark, or simply someone who was here before you |
| Mobile UX & Accessibility | UI laid out inside the client's interactable area so nothing sits under the joystick, chat, or interact button; type scaled up for handsets; signs turn to face you; visible tap cues because touch has no hover |
| Performance | About 1.1 MB total download, primitives and emissive materials only, no textures, no particles, no point lights, two tiny procedural WAVs |
| Creativity & Originality | The plaza is made of its own data: lanterns are answers, the fire is the total, the match ladder never dead-ends and its wording is honest to how close the match is |
| Retention & Discovery | Date-rotated daily question readable from the fire, count and recency stamps on every board, and the promise that your answer becomes someone else's match |
| Overall Execution | Server-authoritative persistence on Decentraland's own Multiplayer Server, no third-party backend, open source under MIT |

## 4. What a cold or empty plaza looks like

- **Nobody else online:** expected and designed for. Matching works against the last 40 answers on the board (the founding entries seeded on first boot are labelled "builder"), so the reveal names someone as long as anyone else has answered there.
- **"Yours is the first answer here":** only possible if a board has never been answered by anyone, including the seed. If you see it, that is a bug rather than intended behaviour.
- **"You already answered this one today":** one answer per person per question per day, by design. Try another table or the daily question.
- **A brief syncing pause on arrival:** the client waits for the server state before it accepts the first answer, usually under two seconds.

## 5. Source

This repository, MIT licensed. Build plan, roadmap, and the decision trail are under [docs/process](docs/process/). Change history is in [CHANGELOG.md](CHANGELOG.md).
