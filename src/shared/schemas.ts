import { engine, Schemas } from '@dcl/sdk/ecs'
import { isServer } from '@dcl/sdk/network'
import { AUTH_SERVER_PEER_ID } from '@dcl/sdk/network/message-bus-sync'

// Synced components. Definitions run on both roles (both need the componentId);
// the validators below make every one of them server-writes-only.

/** One entity per answer board; readers match on the `table` field. */
export const CGWall = engine.defineComponent('cg::Wall', {
  table: Schemas.Int,
  /** JSON-encoded WallEntry[], server-capped at WALL_CAP. */
  entriesJson: Schemas.String
})

/** The campfire: one world-persisted integer. Every answer adds an ember. */
export const CGFire = engine.defineComponent('cg::Fire', {
  embers: Schemas.Int
})

/**
 * Server-liveness heartbeat, kept separate from CGFire so the 2s pulse never
 * re-sends wall or fire payloads. Clients track the client-observed time of
 * change, not the value (stale CRDT snapshots must not read as alive).
 */
export const CGHeartbeat = engine.defineComponent('cg::Heartbeat', {
  at: Schemas.Int64
})

if (isServer()) {
  const serverOnly = (v: { senderAddress: string }) => v.senderAddress === AUTH_SERVER_PEER_ID
  CGWall.validateBeforeChange(serverOnly)
  CGFire.validateBeforeChange(serverOnly)
  CGHeartbeat.validateBeforeChange(serverOnly)
}
