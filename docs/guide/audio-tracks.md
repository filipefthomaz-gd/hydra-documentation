# Audio Tracks

## AudioTrack

An `AudioTrack` is the central ScriptableObject. Everything playable in HYDRA starts here.

`Assets → Create → OCEAN → HYDRA → Audio Track`

### Settings

| Field | Type | Description |
|-------|------|-------------|
| **Group** | `AudioGroup` | The mixer group this track routes to. |
| **Loop** | `bool` | Whether all stems loop. |
| **BPM** | `float` | Tempo used for beat-synced transitions. Set to `0` to disable. |

### Stems

Each entry in the **Stems** list is an `AudioStem` — one synchronized layer of the track.

| Field | Type | Description |
|-------|------|-------------|
| **ID** | `string` | Unique name for this layer, e.g. `drums`, `bass`, `melody`. Must be unique within the track. |
| **Audio Clip** | `AudioClip` | The default clip to play. |
| **Maximum Volume** | `float` | The volume ceiling when this stem is fully active (0–1). |
| **Is Active** | `bool` | Whether this stem starts playing. Inactive stems are silent until explicitly faded in. |

::: tip Stem IDs
Every method that targets a specific stem takes its ID as a string. Keep IDs short and consistent — `drums`, `bass`, `lead`, `sfx`. They must match exactly (case-sensitive) in code and in `AudioParameter` and `AudioEmotionalState` assets.
:::

---

## Clip variation

A stem can play more than one clip. There are two modes:

### Random pool (`multipleClips`)

Toggle **Multiple Clips** on a stem and add clips to the list. On every `Play` of a non-looped stem, HYDRA picks one at random (uniform probability).

```
Stem: footstep
  ✓ Multiple Clips
  Clips: [step_a, step_b, step_c, step_d]
```

### Weighted variation (`useWeightedClips`)

Toggle **Weighted Variation** for finer control. Each entry has a **weight** (0.01–10). Higher weight = picked more often. HYDRA uses **history suppression** to avoid the same clip playing back to back.

| Field | Description |
|-------|-------------|
| **Weighted Clips** | List of clip + weight pairs. |
| **History Size** | How many recently played indices to suppress before they can repeat. Default: 2. |

```
Stem: ambient_bird
  ✓ Weighted Variation
  [crow.wav,  weight: 1]
  [robin.wav, weight: 3]   ← 3× more likely
  [jay.wav,   weight: 2]
  History Size: 2
```

::: info Weighted vs Multiple Clips
If **both** toggles are on, weighted variation takes priority. Use weighted when probability control matters; use multiple clips for simple equal-chance variation.
:::

---

## Parameters

**Parameters** let you map a single 0–1 float value to multiple stem volumes simultaneously, using an `AnimationCurve` per stem.

Add entries under the **Parameters** foldout on an `AudioTrack`.

| Field | Description |
|-------|-------------|
| **Name** | The parameter name used in code: `player.SetParameter("tension", 0.8f)`. |
| **Curves** | One `StemParameterCurve` per stem. Each curve maps parameter value (X) to volume factor (Y). |

### Example — Tension parameter

```
Parameter: "tension"
  drums  → curve: flat at 0 until 0.3, then rises to 1
  strings → curve: linear 0→1
  choir  → curve: only audible above 0.7
```

In code:

```csharp
trackPlayer.SetParameter("tension", 0.75f, fade: 0.5f);
```

This is more powerful than fading stems individually because all curves respond to a single value at once.

---

## Playing a track in code

```csharp
// Get the player for a track that is already registered
AudioTrackPlayer player = AudioManager.Instance.GetAudioTrackPlayer(myTrack);

// Play all active stems with a 1-second fade
player.Play(fade: 1f);

// Play looped (forces loop = true on all stems)
player.PlayLooped(fade: 0.5f);

// Play once (forces loop = false, returns a CoRunner that completes when done)
CoRunner run = player.PlayOnce(fade: 0.5f);
run.OnComplete += () => Debug.Log("Track finished");

// Stop with a 2-second fadeout
player.Stop(fade: 2f);

// Stop immediately
player.ForceStop();
```

---

## Playing a specific stem

```csharp
// Fade in one stem by ID
player.Play("melody", fade: 0.5f);

// Fade out one stem by ID
player.Mute("melody", fade: 0.5f);

// Mute all stems without stopping the AudioSources
player.Mute(fade: 1f);

// Set raw volume (0–1, scaled by the stem's maximumVolume)
player.SetVolume("drums", 0.5f);
```
