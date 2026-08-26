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
      }
    ]
  })
  active.push({ entity, endsAt: Date.now() + ARC_MS })
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
