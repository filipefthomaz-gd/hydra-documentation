# Variation

Sounding alive means never sounding mechanical. HYDRA provides two dedicated components for ambient and one-shot variation, plus the stochastic clip system baked into stems.

---

## AudioScatterer

`AudioScatterer` randomly spawns one-shot sounds around the listener at a configurable rate. Use it for ambient layers — birds, wind gusts, distant footsteps, environmental chatter. Each sound is a temporary `AudioSource` that is destroyed when it finishes playing.

Add `AudioScatterer` to any scene GameObject.

| Field | Description |
|-------|-------------|
| **Clips** | Pool of `AudioClip`s. One is picked at random per spawn event (uniform). |
| **Listener** | The transform at the centre of the spawn area. Falls back to `Camera.main`. |
| **Spawn Radius** | Radius in metres around the listener within which sounds may spawn (XZ plane). |
| **Min Spawn Distance** | Minimum metres between consecutive spawn positions. Prevents clustering. |
| **Events Per Minute** | Average number of spawn events per minute. The actual interval varies ±25% to avoid a metronomic feel. |
| **Base Volume** | Playback volume (0–1). |
| **Volume Variation** | Symmetric random volume offset per spawn (e.g. `0.1` = ±0.1). |
| **Base Pitch** | Base pitch multiplier. |
| **Pitch Variation** | Symmetric random pitch offset per spawn. |
| **Audio Group** | Routes spawned sounds through this mixer group. Optional. |

The scatterer runs as long as the component is enabled. Disable it to pause all spawning.

### Example — forest ambience

```
AudioScatterer: Forest Birds
  Clips: [crow_caw, robin_chirp, jay_call, distant_coo]
  Spawn Radius: 30m
  Min Spawn Distance: 5m
  Events Per Minute: 8
  Base Volume: 0.7
  Volume Variation: 0.15
  Base Pitch: 1.0
  Pitch Variation: 0.08
  Audio Group: Ambience
```

---

## AudioImpulse

`AudioImpulse` is for one-shot reactive sounds — footsteps, button clicks, impact hits, anything that fires in response to a game event. It pre-pools `AudioSource`s and supports weighted clip selection with history suppression and a minimum interval rate limiter.

Add `AudioImpulse` to any scene GameObject. Call `Play()` from any script or animation event.

| Field | Description |
|-------|-------------|
| **Clip** | Fallback single clip when no weighted clips are provided. |
| **Weighted Clips** | Pool of `WeightedAudioClip` entries (clip + weight). When populated, overrides the single clip. |
| **History Size** | How many recent clip indices to suppress before they can repeat. |
| **Pitch Range** | `x` = min pitch, `y` = max pitch. Randomised per play. |
| **Volume Range** | `x` = min volume, `y` = max volume. Randomised per play. |
| **Min Interval** | Seconds of cooldown between calls. Calls within this window are silently ignored. Prevents double-hits. |
| **Audio Group** | Mixer group for all pooled sources. Optional. |
| **Pool Size** | Number of `AudioSource`s pre-created. Default: 4. Set higher for rapid-fire sounds. |

```csharp
// Wire this up in your footstep system, OnCollisionEnter, or an Animation Event
[SerializeField] AudioImpulse footstepImpulse;

void OnFootstep()
{
    footstepImpulse.Play();
}
```

::: tip Pool sizing
For footsteps at a fast run, set pool size to 4–6. For occasional impact hits, 2 is usually fine. The impulse silently skips if the pool is exhausted (all sources are still playing).
:::

---

## Stochastic clips on stems

For music stems that need variation — e.g. a percussion hit that sounds slightly different each bar — use **Weighted Variation** directly on the `AudioStem` in your `AudioTrack` asset.

See [Audio Tracks — Clip Variation](/guide/audio-tracks#clip-variation) for full details.

The key difference from `AudioImpulse`:

- **AudioImpulse** is for SFX triggered by game events.
- **Stem weighted variation** is for music/ambience clips that are re-picked automatically on each `Play` of a non-looped stem.

---

## Comparing the variation tools

| Tool | Best for | Spatial | Mixer routing |
|------|----------|---------|---------------|
| `AudioScatterer` | Ambient ambient sounds spread in space | Yes (XZ scatter) | Via `AudioGroup` |
| `AudioImpulse` | One-shot reactive SFX at a fixed position | No (pooled at parent) | Via `AudioGroup` |
| Stem weighted clips | Music / ambience clip variation on a track | Inherits from track | Inherits from `AudioGroup` |
