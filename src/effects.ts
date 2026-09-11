import {
  AudioSource,
  EasingFunction,
  engine,
  Entity,
  Material,
  MeshRenderer,
  Transform,
  Tween,
  TweenSequence
} from '@dcl/sdk/ecs'
import { Color4, Vector3 } from '@dcl/sdk/math'

// Answer feedback: an ember arcs from where you answered into the fire and
// the fire flares. Ambient crackle unlocks on the first tap (mobile audio
// rule); the match chime plays under the Spark Match reveal.

const FIRE_TOP = Vector3.create(8, 1.3, 8)
const EMBER_COLOR = Color4.fromHexString('#FFB347')
const ARC_MS = 900

interface ActiveEmber {
  entity: Entity
  endsAt: number
}

const pool: Entity[] = []
const active: ActiveEmber[] = []

let crackleEntity: Entity | null = null
let chimeEntity: Entity | null = null
let ambienceOn = false
let onLand: (() => void) | null = null

export function initEffects(landedCallback: () => void): void {
  onLand = landedCallback

  crackleEntity = engine.addEntity()
  Transform.create(crackleEntity, { position: Vector3.create(8, 0.6, 8) })
  chimeEntity = engine.addEntity()
  Transform.create(chimeEntity, { position: Vector3.create(8, 1.5, 8) })

  engine.addSystem(emberSystem)
  engine.addSystem(trailSystem)
  engine.addSystem(burstSystem)
}

/** Called on the first meaningful tap — mobile browsers gate audio on a gesture. */
export function startAmbience(): void {
  if (ambienceOn || crackleEntity === null) return
  ambienceOn = true
  AudioSource.create(crackleEntity, {
    audioClipUrl: 'assets/audio/crackle.wav',
    playing: true,
    loop: true,
    volume: 0.55
  })
}

export function playChime(): void {
  if (chimeEntity === null) return
  AudioSource.playSound(chimeEntity, 'assets/audio/chime.wav')
}

/** Send an ember from a world position into the fire. */
export function emberArc(from: Vector3): void {
  const entity = pool.pop() ?? makeEmber()
  const start = Vector3.create(from.x, from.y + 0.9, from.z)
  const mid = Vector3.create(
    (start.x + FIRE_TOP.x) / 2,
    Math.max(start.y, FIRE_TOP.y) + 1.6,
    (start.z + FIRE_TOP.z) / 2
  )
  Transform.createOrReplace(entity, { position: start, scale: Vector3.create(0.16, 0.16, 0.16) })
  Tween.createOrReplace(entity, {
    mode: Tween.Mode.Move({ start, end: mid }),
    duration: ARC_MS / 2,
    easingFunction: EasingFunction.EF_EASEOUTQUAD,
    currentTime: 0
  })
  // No loop field: the sequence plays once — rise to mid, fall into the fire.
  TweenSequence.createOrReplace(entity, {
    sequence: [
      {
        mode: Tween.Mode.Move({ start: mid, end: FIRE_TOP }),
        duration: ARC_MS / 2,
        easingFunction: EasingFunction.EF_EASEINQUAD
      },
      {
        mode: Tween.Mode.Scale({ start: Vector3.create(0.16, 0.16, 0.16), end: Vector3.Zero() }),
        duration: 120,
        easingFunction: EasingFunction.EF_LINEAR
      }
    ]
  })
  active.push({ entity, endsAt: Date.now() + ARC_MS + 200 })
}

function makeEmber(): Entity {
  const entity = engine.addEntity()
  MeshRenderer.setSphere(entity)
  Material.setPbrMaterial(entity, {
    albedoColor: EMBER_COLOR,
    emissiveColor: EMBER_COLOR,
    emissiveIntensity: 4,
    roughness: 1
  })
  return entity
}

// ── The trail of light ─────────────────────────────────────────────────
// Grows segment by segment across the ground from the fire to the matched
// lantern — the climax a judge walks. Pooled emissive spheres, one material.

const TRAIL_N = 20
const TRAIL_STEP_MS = 90
const TRAIL_HOLD_MS = 9000
const TRAIL_COLOR = Color4.fromHexString('#F3E9DC')

const trailSegments: Entity[] = []
let trailRevealed = 0
let trailPoints: Vector3[] = []
let nextSegmentAt = 0
let trailEndsAt = 0

/** Draw the trail from the fire to `to`, revealing over ~2 seconds. */
export function showTrail(to: Vector3): void {
  if (trailSegments.length === 0) {
    for (let i = 0; i < TRAIL_N; i++) {
      const seg = engine.addEntity()
      MeshRenderer.setSphere(seg)
      Material.setPbrMaterial(seg, {
        albedoColor: TRAIL_COLOR,
        emissiveColor: TRAIL_COLOR,
        emissiveIntensity: 3,
        roughness: 1
      })
      Transform.create(seg, { position: Vector3.create(8, -2, 8), scale: Vector3.Zero() })
      trailSegments.push(seg)
    }
  }
  const from = Vector3.create(8, 0.12, 8)
  trailPoints = []
  for (let i = 0; i < TRAIL_N; i++) {
    const t = (i + 1) / TRAIL_N
    // Slight sideways bow so the trail reads as drawn, not ruled.
    const bow = Math.sin(t * Math.PI) * 0.6
    const dx = to.x - from.x
    const dz = to.z - from.z
    const len = Math.hypot(dx, dz) || 1
    trailPoints.push(
      Vector3.create(
        from.x + dx * t + (-dz / len) * bow,
        0.12,
        from.z + dz * t + (dx / len) * bow
      )
    )
  }
  trailRevealed = 0
  nextSegmentAt = Date.now()
  trailEndsAt = Date.now() + TRAIL_HOLD_MS
}

function trailSystem(): void {
  const now = Date.now()
  if (trailRevealed < trailPoints.length && now >= nextSegmentAt) {
    const seg = trailSegments[trailRevealed]
    Transform.createOrReplace(seg, {
      position: trailPoints[trailRevealed],
      scale: Vector3.create(0.14, 0.05, 0.14)
    })
    trailRevealed++
    nextSegmentAt = now + TRAIL_STEP_MS
  }
  if (trailEndsAt !== 0 && now >= trailEndsAt) {
    for (const seg of trailSegments) {
      Transform.createOrReplace(seg, { position: Vector3.create(8, -2, 8), scale: Vector3.Zero() })
    }
    trailEndsAt = 0
    trailRevealed = 0
    trailPoints = []
  }
}

// ── Shared burst ───────────────────────────────────────────────────────
// Every present player sees the same pop at the board where a match fired.

let burstEntity: Entity | null = null
let burstEndsAt = 0

export function burstAt(pos: Vector3): void {
  if (burstEntity === null) {
    burstEntity = engine.addEntity()
    MeshRenderer.setSphere(burstEntity)
    Material.setPbrMaterial(burstEntity, {
      albedoColor: Color4.create(1, 0.7, 0.28, 0.7),
      emissiveColor: EMBER_COLOR,
      emissiveIntensity: 3.5,
      roughness: 1
    })
    Transform.create(burstEntity, { position: Vector3.create(8, -2, 8), scale: Vector3.Zero() })
  }
  const start = Vector3.create(0.1, 0.1, 0.1)
  const end = Vector3.create(2.4, 2.4, 2.4)
  Transform.createOrReplace(burstEntity, { position: Vector3.create(pos.x, 1.3, pos.z), scale: start })
  // The tween itself ends at scale zero. On the phone (11 Sep) a burst that
  // was expanded by a tween and then parked by a plain Transform write stayed
  // at full size: the renderer kept the tween's final state and ignored the
  // scene's reset. Letting the tween own the whole grow-then-vanish makes the
  // sphere disappear even if the park write below is never honoured.
  Tween.createOrReplace(burstEntity, {
    mode: Tween.Mode.Scale({ start, end }),
    duration: 550,
    easingFunction: EasingFunction.EF_EASEOUTQUAD,
    currentTime: 0
  })
  TweenSequence.createOrReplace(burstEntity, {
    sequence: [
      {
        mode: Tween.Mode.Scale({ start: end, end: Vector3.Zero() }),
        duration: 300,
        easingFunction: EasingFunction.EF_EASEINQUAD
      }
    ]
  })
  burstEndsAt = Date.now() + 1000
}

function burstSystem(): void {
  if (burstEndsAt !== 0 && Date.now() >= burstEndsAt && burstEntity !== null) {
    Tween.deleteFrom(burstEntity)
    TweenSequence.deleteFrom(burstEntity)
    Transform.createOrReplace(burstEntity, { position: Vector3.create(8, -2, 8), scale: Vector3.Zero() })
    burstEndsAt = 0
  }
}

function emberSystem(): void {
  const now = Date.now()
  for (let i = active.length - 1; i >= 0; i--) {
    if (now < active[i].endsAt) continue
    const { entity } = active[i]
    Tween.deleteFrom(entity)
    TweenSequence.deleteFrom(entity)
    // Park out of sight instead of removing — pooled for the next arc.
    Transform.createOrReplace(entity, {
      position: Vector3.create(8, -2, 8),
      scale: Vector3.Zero()
    })
    pool.push(entity)
    active.splice(i, 1)
    if (onLand) onLand()
  }
}
