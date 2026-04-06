# Transitions

## AudioTracksManager

`AudioTracksManager` is the GameObject component that drives state-based music transitions. Add it to a scene object and assign your starting `AudioTrack`. It manages a single "currently playing" track and switches between tracks when game variables change.

### Inspector fields

| Field | Description |
|-------|-------------|
| **Audio Track** | The track that starts playing when the scene loads. |
| **Transitions** | List of `Transition` assets describing every possible track switch. |
| **Multiple Tracks** | Toggle on if all tracks should be pre-instantiated (no dynamic creation per switch). |
| **Audio Tracks** | *(Multiple Tracks only)* The full list of tracks to pre-create. |

---

## Transition asset

A `Transition` ScriptableObject describes a single track switch.

`Assets → Create → OCEAN → HYDRA → Transition`

| Field | Description |
|-------|-------------|
| **From** | The track that must be playing for this transition to fire. |
| **To** | The track to switch to. |
| **Type** | When to fire: `Immediate`, `OnBeat`, `OnDownBeat`, `OnBar`. |
| **Duration** | Crossfade length in seconds. |
| **Variable** | Variable name checked by `SetInt`. |
| **State** | Value the variable must equal to trigger this transition. |
| **Stingers** | Optional pool of one-shot tracks. One is picked at random and plays before the switch. |

### Timing modes

| Mode | When it fires |
|------|-------------|
| `Immediate` | Fires right away, no sync. |
| `OnBeat` | Waits for the next metronome beat. |
| `OnDownBeat` | Waits for the next bar (downbeat). |
| `OnBar` | Same as `OnDownBeat`. |

::: tip BPM required for beat-sync
Beat and bar timing relies on the **BPM** set on the current `AudioTrack`. If BPM is `0`, the transition falls back to immediate.
:::

---

## Triggering transitions via variables

Call `SetInt` at any time to update a variable. `AudioTracksManager` checks whether any `Transition` asset matches and fires it if so.

```csharp
// Somewhere in gameplay code
AudioTracksManager musicManager = FindObjectOfType<AudioTracksManager>();

// Variable "combat" reaching value 1 triggers the matching Transition
musicManager.SetInt("combat", 1);

// Leaving combat
musicManager.SetInt("combat", 0);
```

---

## Manual transitions

You can also transition programmatically without using variables or `Transition` assets:

```csharp
// Immediate crossfade to a track (0.5s)
musicManager.TransitionTo(bossTrack, duration: 0.5f);

// On the next bar
musicManager.TransitionTo(bossTrack, Transition.Trigger.OnBar, duration: 1f);

// On the next beat
musicManager.TransitionTo(explorationTrack, Transition.Trigger.OnBeat, duration: 0.5f);
```

---

## Queued transitions

Chain transitions back-to-back. The next one fires as soon as the previous switch completes.

```csharp
// Queue up an intro stinger → then loop the main theme
musicManager.QueueTransition(introTransition);
musicManager.QueueTransition(mainThemeTransition);
```

---

## Stingers

A stinger is a short one-shot track that plays during the transition — a musical punctuation mark (e.g. a fanfare, a hit, a sting). Assign one or more `AudioTrack` assets to the **Stingers** list on a `Transition`. HYDRA picks one at random, plays it to completion, then fires the crossfade.

---

## Crossfade from code (AudioManager)

For cases where you don't need an `AudioTracksManager`, call `Crossfade` directly on `AudioManager`. It fades out all currently playing tracks in the same group and fades in the new one.

```csharp
IAudioManager audio; // injected

// Immediate crossfade
audio.Crossfade(newTrack, duration: 1f);

// Beat-synced crossfade
audio.Crossfade(newTrack, duration: 1f, timing: Transition.Trigger.OnBar);
```

---

## Auto-ducking

When an `AudioGroup` starts playing, HYDRA can automatically reduce the volume of other groups — for example, SFX ducking the music during a shot.

Configure ducking on the source `AudioGroup` asset under the **Ducking** foldout:

| Field | Description |
|-------|-------------|
| **Victim** | The group to duck. |
| **Attenuation dB** | How much to reduce (negative, e.g. `-12`). |
| **Attack Time** | Seconds to reach the ducked level. |
| **Release Time** | Seconds to restore the original level. |

Ducking is fully automatic — it fires whenever any track in the source group starts or stops playing.

---

## Snapshots

Snapshots let you save and restore the entire AudioGroup volume state as a stack — useful for cutscenes that silence everything, then restore the game mix.

```csharp
// Save current volumes
audio.PushSnapshot();

// ... cutscene plays, volumes change ...

// Restore previous volumes with a 0.5s fade
audio.PopSnapshot(fade: 0.5f);
```

Calls can be nested — each `PushSnapshot` pushes onto the stack, each `PopSnapshot` restores the top entry.
