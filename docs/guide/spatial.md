# Spatial Audio

HYDRA includes four components for positional and environmental audio. They all work from Unity's physics layer — attach them to GameObjects with Colliders and they react automatically to the player entering and leaving.

---

## AudioBlendZone

Crossfades between two tracks based on where the listener is within a trigger collider. As the player walks from one side to the other, the mix shifts continuously from Track A to Track B.

Add `AudioBlendZone` to any GameObject. It requires a **trigger Collider** on the same object.

| Field | Description |
|-------|-------------|
| **Track A** | Track audible when blend = 0 (start of the blend axis). |
| **Track B** | Track audible when blend = 1 (end of the blend axis). |
| **Blend Axis** | Local-space direction along which the blend is calculated. Default: `Vector3.right`. |
| **Listener** | The transform to track (e.g. the player root). Falls back to any object tagged `Player`, then `Camera.main`. |
| **Entry Fade Duration** | Fade-in duration applied when the listener enters the zone. |

### How blending works

HYDRA projects the listener's local position onto the blend axis and normalises it against the collider's local bounds. The result is a 0–1 factor:

- **0** → only Track A is audible.
- **0.5** → both tracks play at equal volume.
- **1** → only Track B is audible.

Both tracks are started when the listener enters the trigger. Volume is updated every frame.

::: tip Blend axis orientation
For a zone where the music changes as you walk north, set **Blend Axis** to `(0, 0, 1)` (local forward). For east-to-west, use `(1, 0, 0)`. The axis is in the zone's local space, so you can rotate the GameObject to orient the transition in any direction.
:::

---

## AudioAcousticZone

Swaps the active `AudioMixerSnapshot` when the listener enters or exits a trigger. Use this to change reverb profiles between acoustic environments — open air, indoors, cave, corridor.

Add `AudioAcousticZone` to any GameObject with a trigger Collider.

| Field | Description |
|-------|-------------|
| **Inside Snapshot** | Snapshot to apply when the listener enters. |
| **Outside Snapshot** | Snapshot to restore when the listener exits. |
| **Enter Transition Time** | Seconds to blend between snapshots on enter. |
| **Exit Transition Time** | Seconds to blend between snapshots on exit. |
| **Listener** | Transform to track. Falls back to objects tagged `Player`. |

::: info Mixer Snapshots
Create snapshots in your Unity `AudioMixer` asset and expose them. Each snapshot stores a full set of mixer parameter values — reverb send levels, EQ, compressor settings, whatever you like.
:::

---

## AudioOcclusionController

Muffles audio through walls in real time using a raycast from the sound source to the listener. As walls block the ray, an `AudioLowPassFilter` is tightened on every stem source to simulate the sound being heard through geometry.

Add `AudioOcclusionController` to any GameObject that also has an `AudioTrackPlayer`. The component is automatically associated via `RequireComponent`.

| Field | Description |
|-------|-------------|
| **Listener** | The listener Transform. Falls back to `Camera.main`. |
| **Occlusion Layers** | LayerMask for geometry that blocks audio. |
| **Max Hits** | Maximum wall hits counted per ray. More hits = stronger occlusion. |
| **Update Interval** | Seconds between raycasts. Lower = more responsive; higher = cheaper. |
| **Occluded Cutoff Hz** | Low-pass filter cutoff when fully occluded. Typical: 600–1200 Hz. |
| **Occluded Resonance Q** | Resonance strength when fully occluded. Higher = more pronounced muffling. |
| **Smooth Time** | Seconds to blend between open and occluded states (SmoothDamp). |

The component creates an `AudioLowPassFilter` on each stem's `AudioSource` automatically at startup — you don't need to add them manually.

::: tip Performance
Set **Update Interval** to `0.1` or higher for distant or unimportant sources. The default `0.05` (20 updates/second) is appropriate for player-adjacent sources.
:::

---

## AudioDistanceControl

Scales individual stem volumes based on distance between a target and the player. Unlike Unity's built-in 3D audio rolloff (which works on the `AudioSource`), this operates per-stem — so different layers of the same track can fade at different distances.

Add `AudioDistanceControl` to any scene GameObject.

| Field | Description |
|-------|-------------|
| **Target** | The sound source position (e.g. a speaker in the world). |
| **Player** | The listener's Transform. |
| **Audio Track** | The `AudioTrackPlayer` whose stems are controlled. |
| **Stem Distances** | Per-stem distance curve definition. |

Each **Stem Distance** entry has:

| Field | Description |
|-------|-------------|
| **Stem ID** | Must match a stem ID in the track. |
| **Max Volume Distance** | Distance at which the stem plays at full volume. |
| **No Volume Distance** | Distance at which the stem is completely silent. |

Volume is linearly interpolated between the two distances.

```
Stem "bass":   Max Volume: 5m → No Volume: 20m
Stem "treble": Max Volume: 2m → No Volume: 10m
```

Result: bass carries further, treble drops off faster — as in real acoustics.
