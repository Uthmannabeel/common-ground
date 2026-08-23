// Headless Multiplayer Server entry (G0.5). Runs only when isServer() is true.
// G1 (persistence) adds here: Storage-backed walls/embers/lanterns per the
// schema in the build plan — World scope `wall:plaza`, `wall:table:{0..3}`,
// `embers`, `lanterns`; Player scope `sparks`, `streak`. Working state lives
// in memory; Storage writes happen at checkpoints only, every result checked.

export function initServer(): void {
  console.log('[SERVER] Common Ground server up')
}
