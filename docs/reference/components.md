# Component Reference

Quick-reference for every MonoBehaviour and ScriptableObject in HYDRA.

---

## ScriptableObjects

### AudioGroup

`Assets → Create → OCEAN → HYDRA → AudioGroup`

Central asset for a mixer group. Referenced by `AudioTrack`, `AudioScatterer`, `AudioImpulse`, and `AudioManager`.

| Member | Type | Description |
|--------|------|-------------|
| `type` | `AudioGroupType` | `SFX`, `Dialogue`, `Music`, or `Ambience`. |
| `mixer` | `AudioMixerGroup` | The Unity mixer group this asset maps to. |
| `volumeGroup` | `bool` | Enable to allow HYDRA to fade this group's volume. |
| `volumePropertyId` | `string` | Exposed mixer parameter name for volume (e.g. `"MusicVolume"`). |
| `pitchGroup` | `bool` | Enable to allow pitch control. |
| `pitchPropertyId` | `string` | Exposed mixer parameter name for pitch. |
| `duckTargets` | `List<AudioDuckTarget>` | Groups this group ducks when it starts playing. |
| `SetVolume(float)` | method | Set the mixer volume directly (dB). |
| `OnVolumeChange` | `UnityEvent<float>` | Fired whenever the volume changes. |

---

### AudioTrack

`Assets → Create → OCEAN → HYDRA → Audio Track`

Defines a piece of music or ambience as a set of synchronized stems.

| Member | Type | Description |
|--------|------|-------------|
| `Group` | `AudioGroup` | Mixer group for all stems. |
| `BPM` | `float` | Tempo for beat-synced transitions. |
| `Loop` | `bool` | Whether all stems loop. |
| `Stems` | `List<AudioStem>` | The list of stem definitions. |
| `Parameters` | `List<AudioParameter>` | Named parameter mappings for vertical control. |

**Extension method:** `await track.Play()` — plays via `AudioManager.Instance`.

---

### AudioStem *(serializable class)*

| Member | Type | Description |
|--------|------|-------------|
| `id` | `string` | Unique stem identifier. |
| `audioClip` | `AudioClip` | Default clip. |
| `maximumVolume` | `float` | Volume ceiling (0–1). |
| `isActive` | `bool` | Starts audible if true. |
| `multipleClips` | `bool` | Random pool mode. |
| `audioClips` | `List<AudioClip>` | Pool for random selection. |
| `useWeightedClips` | `bool` | Weighted stochastic mode. |
| `weightedClips` | `List<WeightedAudioClip>` | Weighted pool. |
| `historySize` | `int` | Suppression window (0–8). |

---

### AudioParameter *(serializable class)*

| Member | Type | Description |
|--------|------|-------------|
| `name` | `string` | Name used in `SetParameter(name, value)`. |
| `curves` | `List<StemParameterCurve>` | Per-stem response curves. |

---

### AudioEmotionalState

`Assets → Create → OCEAN → HYDRA → Emotional State`

Drives the stem mix from two independent 0–1 axes.

| Member | Type | Description |
|--------|------|-------------|
| `axisALabel` | `string` | Display name for axis A (cosmetic). |
| `axisBLabel` | `string` | Display name for axis B (cosmetic). |
| `stemMappings` | `List<EmotionalStemMapping>` | Per-stem axis response curves. |

---

### AudioSequence

`Assets → Create → OCEAN → HYDRA → Audio Sequence`

Ordered playlist of `AudioTrack` segments.

| Member | Type | Description |
|--------|------|-------------|
| `Segments` | `List<AudioSequenceSegment>` | The segment list. |

---

### Transition

`Assets → Create → OCEAN → HYDRA → Transition`

Describes a single state-triggered track switch.

| Member | Type | Description |
|--------|------|-------------|
| `from` | `AudioTrack` | Source track. |
| `to` | `AudioTrack` | Destination track. |
| `type` | `Trigger` | `Immediate`, `OnBeat`, `OnDownBeat`, `OnBar`. |
| `duration` | `float` | Crossfade time. |
| `variable` | `string` | Variable name checked by `SetInt`. |
| `state` | `int` | Required variable value. |
| `stingers` | `List<AudioTrack>` | Optional one-shot stingers. |

---

## MonoBehaviours

### AudioManager

Singleton. Central registry and controller. Implements `IAudioManager`.

| Member | Description |
|--------|-------------|
| `audioGroups` | All managed `AudioGroup` assets. |
| `AudioTracks` | Live list of all registered `AudioTrackPlayer`s. |
| `RegisterAudioTrack(player)` | Called automatically by `AudioTrackPlayer.Awake`. |
| `UnregisterAudioTrack(player)` | Called automatically by `AudioTrackPlayer.OnDestroy`. |
| `CreateAudioTrack(track, parent, fade, playOnAwake)` | Instantiates and registers a new player. |
| `GetAudioTrackPlayer(track)` | Returns the first registered player for a track. |
| `PlayAudioTrack(track, duration)` | Async play via the manager. |
| `StopAudioTrack(track, duration)` | Stop by track reference. |
| `StopAudioTracksOfGroup(group, duration)` | Stop all players of a group. |
| `IsPlaying(group)` | True if any player in the group is active. |
| `Crossfade(track, duration)` | Stop the group, fade in the new track. |
| `Crossfade(track, duration, timing)` | Beat-synced crossfade. |
| `PushSnapshot()` | Save all group volumes to a stack. |
| `PopSnapshot(fade)` | Restore the last saved snapshot. |
| `SetAudioGroupVolume(type, volume)` | Set a group's volume (linear 0–1). |
| `FadeAudioGroupVolume(type, to, duration)` | Fade a group's volume. |
| `SimpleTransition(tracks, duration)` | Legacy: fade out current globals, fade in new tracks. |

---

### AudioTrackPlayer

Controls playback of a single `AudioTrack`. One `AudioSource` per stem.

| Member | Description |
|--------|-------------|
| `audioTrack` | The `AudioTrack` asset being played. |
| `emotionalState` | Optional `AudioEmotionalState` asset. |
| `IsPlaying` | True if any stem source is playing. |
| `Metronome` | The internal `Metronome` for beat events. |
| `Stems` | Live list of `AudioStem`s. |
| `AudioSources` | Read-only list of stem `AudioSource`s. |
| `OnStarted` | Event fired when `Play` is called. |
| `OnStopped` | Event fired when `Stop` is called. |
| `OnTransitionClipEnd` | Event fired when a stinger clip finishes. |
| `Play(fade)` | Play all active stems. |
| `Play(id, fade)` | Fade in a single stem. |
| `PlayLooped(fade)` | Force-loop all stems and play. |
| `PlayOnce(fade)` | Force single-shot and play; returns `CoRunner`. |
| `Stop(fade)` | Fade out and stop. |
| `ForceStop()` | Stop immediately (no fade). |
| `Mute(fade)` | Fade all stems to zero. |
| `Mute(id, fade)` | Fade one stem to zero. |
| `FadeVolume(id, target, fade)` | Fade one stem to a target volume. |
| `SetVolume(volume)` | Set all stems' raw volume instantly. |
| `SetVolume(id, volume)` | Set one stem's raw volume instantly. |
| `SetParameter(name, value, fade)` | Drive a named parameter curve set. |
| `PlayOnBeat(id, fade)` | Fade in a stem on the next beat. |
| `StopOnBeat(id, fade)` | Fade out a stem on the next beat. |
| `SoloStem(id, fade)` | Mute all stems except one. |
| `ClearSolo(fade)` | Restore all stems to their `isActive` defaults. |
| `SetEmotionalState(axisA, axisB, fade)` | Drive the mix from two emotional axes. |
| `AddTransitionClip(transition)` | Play a stinger and fire `OnTransitionClipEnd`. |
| `DestroyAll(duration)` | Fade out and destroy the entire GameObject. |

---

### AudioTracksManager

State-machine-style track switcher. Manages one "active track" and transitions between tracks via variables.

| Member | Description |
|--------|-------------|
| `audioTrack` | Currently playing track. |
| `transitions` | List of `Transition` assets. |
| `multipleTracks` | Pre-instantiate all tracks at startup. |
| `audioTracks` | Full track list (used only when `multipleTracks` is on). |
| `SetInt(key, value)` | Update a variable and check for a matching transition. |
| `TransitionTo(track, duration)` | Immediate crossfade. |
| `TransitionTo(track, timing, duration)` | Beat-synced crossfade. |
| `QueueTransition(transition)` | Enqueue a transition to fire after the current one. |

---

### AudioSequencePlayer

Plays an `AudioSequence` segment by segment.

| Member | Description |
|--------|-------------|
| `sequence` | The `AudioSequence` asset. |
| `IsPlaying` | True if a segment is currently active. |
| `CurrentSegmentIndex` | Index of the current segment, or -1. |
| `CurrentPlayer` | The `AudioTrackPlayer` for the current segment. |
| `OnSegmentChanged` | `UnityEvent<int>` — fires on each segment change. |
| `Play()` | Start from segment 0. |
| `Stop(fade)` | Stop and clean up. |
| `Skip(fade)` | Advance to the next segment. |
| `JumpTo(index, fade)` | Jump to a specific segment. |

---

### AudioBlendZone

Crossfades two tracks based on listener position inside a trigger collider.

| Field | Description |
|-------|-------------|
| `trackA` | Track at blend = 0. |
| `trackB` | Track at blend = 1. |
| `blendAxis` | Local-space blend direction. |
| `listener` | Transform to track. |
| `entryFadeDuration` | Fade-in on trigger enter. |

---

### AudioAcousticZone

Swaps `AudioMixerSnapshot` on trigger enter/exit.

| Field | Description |
|-------|-------------|
| `insideSnapshot` | Snapshot applied on enter. |
| `outsideSnapshot` | Snapshot restored on exit. |
| `enterTransitionTime` | Blend time on enter. |
| `exitTransitionTime` | Blend time on exit. |
| `listener` | Transform to track. |

---

### AudioOcclusionController

Real-time raycast-based low-pass filter occlusion. Requires `AudioTrackPlayer` on the same GameObject.

| Field | Description |
|-------|-------------|
| `listener` | Listener transform. |
| `occlusionLayers` | Geometry layers that block audio. |
| `maxHits` | Max wall hits per ray. |
| `updateInterval` | Seconds between raycasts. |
| `occludedCutoffHz` | Low-pass cutoff when fully occluded. |
| `occludedResonanceQ` | Filter resonance when fully occluded. |
| `smoothTime` | Blend speed between states. |

---

### AudioDistanceControl

Per-stem volume falloff by distance between a target and the player.

| Field | Description |
|-------|-------------|
| `target` | Sound source position. |
| `player` | Listener position. |
| `audioTrack` | The `AudioTrackPlayer` to control. |
| `stemDistances` | List of `StemVolumeDistance` entries (stem ID, max/no-volume distances). |

---

### AudioScatterer

Randomly spawns ambient one-shot sounds around a listener.

| Field | Description |
|-------|-------------|
| `clips` | Clip pool. |
| `listener` | Spawn centre. |
| `spawnRadius` | Spawn area radius. |
| `minSpawnDistance` | Min gap between consecutive spawn positions. |
| `eventsPerMinute` | Average spawn rate. |
| `baseVolume / volumeVariation` | Volume and variation. |
| `basePitch / pitchVariation` | Pitch and variation. |
| `audioGroup` | Mixer routing. |

---

### AudioImpulse

Pooled one-shot sound with weighted clip selection and rate limiting.

| Field | Description |
|-------|-------------|
| `clip` | Fallback single clip. |
| `weightedClips` | Weighted clip pool (overrides single clip). |
| `historySize` | Recent-play suppression window. |
| `pitchRange` | Random pitch range per play. |
| `volumeRange` | Random volume range per play. |
| `minInterval` | Cooldown between plays in seconds. |
| `audioGroup` | Mixer routing. |
| `poolSize` | Pre-created source count. |
| `Play()` | Fire a one-shot. Rate-limited. |

---

### AudioInitializer

Convenience component. Creates and starts a list of `AudioTrack`s when the scene loads.

| Field | Description |
|-------|-------------|
| `audioTracks` | Tracks to start at scene load. |

---

### VerticalAudioTransition

Fires stem play/mute commands on a `BoxCollider` trigger exit.

| Field | Description |
|-------|-------------|
| `trackPlayer` | Target `AudioTrackPlayer`. |
| `transitions` | List of stem ID + Play/Stop + duration entries. |
