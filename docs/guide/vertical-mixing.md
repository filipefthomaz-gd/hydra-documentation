# Vertical Mixing

Vertical mixing means changing the loudness of individual stems within a playing track — adding a percussion layer, muting a melody, or blending a full mix in response to gameplay events.

All vertical controls live on `AudioTrackPlayer`.

---

## Fading a stem by volume

```csharp
AudioTrackPlayer player; // the track that's playing

// Fade "drums" to 50% of its maximum volume over 0.5 seconds
player.FadeVolume("drums", target: 0.5f, fade: 0.5f);

// Fade "melody" all the way out
player.FadeVolume("melody", target: 0f, fade: 1f);

// Restore "drums" to full volume
player.Play("drums", fade: 0.5f);

// Silence "drums" (same as FadeVolume to 0)
player.Mute("drums", fade: 0.5f);
```

`FadeVolume`'s `target` is a 0–1 fraction, scaled by the stem's `maximumVolume` defined in the `AudioTrack` asset.

---

## Beat-synced stem control

Bring a stem in or out on the next metronome beat — keeps the mix change musically aligned.

```csharp
// Fade "choir" in on the next beat
player.PlayOnBeat("choir", fade: 0.5f);

// Fade "choir" out on the next beat
player.StopOnBeat("choir", fade: 0.5f);
```

::: tip
The track's **BPM** must be set for beat-sync to work. Without it the track has no metronome and the call fires immediately.
:::

---

## Parameters

Parameters let you drive multiple stems from a single 0–1 value. Each stem has a curve that maps the parameter value to a volume target, so designers control the relationship — not programmers.

Define parameters in the `AudioTrack` asset's **Parameters** foldout. See [Audio Tracks — Parameters](/guide/audio-tracks#parameters) for setup.

```csharp
// Slide "tension" to 0.8 — every curve in the parameter is evaluated and faded
player.SetParameter("tension", value: 0.8f, fade: 0.5f);

// Tension eases off
player.SetParameter("tension", 0.2f, fade: 1f);
```

---

## Solo / unsolo

Isolate one stem for playback testing or dramatic effect:

```csharp
// Silence everything except "bass"
player.SoloStem("bass", fade: 0.3f);

// Restore all stems to their isActive defaults
player.ClearSolo(fade: 0.3f);
```

---

## Emotional state

The most expressive vertical control is the **emotional state system**. Instead of manipulating individual stems, you move two abstract axes (e.g. Danger and Pace) and let a designer-authored asset translate those into stem volumes.

### Setup

1. Create an `AudioEmotionalState` asset:
   `Assets → Create → OCEAN → HYDRA → Emotional State`

2. Name your axes — e.g. **Axis A: Danger**, **Axis B: Pace**.

3. Add a **Stem Mapping** for each stem in the track:
   - **Stem ID** — must match the stem ID in the `AudioTrack`.
   - **Axis A Curve** — volume factor as a function of axis A (x: 0–1, y: 0–1).
   - **Axis B Curve** — volume factor as a function of axis B.
   - Final volume = `curveA(axisA) × curveB(axisB)`.

4. Assign the asset to the `AudioTrackPlayer`'s **Emotional State** field.

### Runtime

```csharp
AudioTrackPlayer player; // has an AudioEmotionalState assigned

// High danger (0.9), medium pace (0.5) — 0.5s crossfade
player.SetEmotionalState(axisA: 0.9f, axisB: 0.5f, fade: 0.5f);

// Calm state — very low danger, slow pace
player.SetEmotionalState(0.1f, 0.1f, fade: 2f);
```

Both axes are clamped to [0, 1]. The call does nothing if no `AudioEmotionalState` asset is assigned.

### Design example

```
AudioEmotionalState: CombatMix
  Axes: Danger / Pace

  Stem "drums":
    Axis A (Danger): flat 0 until 0.3, rises to 1 by 0.7
    Axis B (Pace):   linear 0→1

  Stem "strings":
    Axis A (Danger): linear 0→1
    Axis B (Pace):   constant 1

  Stem "bass":
    Axis A (Danger): sigmoid — near 0 below 0.5, near 1 above 0.5
    Axis B (Pace):   linear 0→1

  Stem "ambient_pad":
    Axis A (Danger): inverted — full at 0, silent at 1
    Axis B (Pace):   constant 1
```

At danger=0.9, pace=0.8: drums and bass are loud, strings are swelling, ambient pad is nearly silent.
At danger=0.1, pace=0.1: only the ambient pad is audible — a quiet, tense moment.

---

## VerticalAudioTransition (trigger-based)

The `VerticalAudioTransition` component fires stem play/mute commands when a physics trigger is exited. Useful for environmental triggers — a player leaving a collider fades stems in or out.

Add it to a GameObject with a `BoxCollider` trigger:

| Field | Description |
|-------|-------------|
| **Track Player** | The `AudioTrackPlayer` to control. |
| **Transitions** | List of stem commands to fire on exit. |

Each transition entry has:

| Field | Description |
|-------|-------------|
| **ID** | Stem ID to target. |
| **State** | `Play` or `Stop`. |
| **Duration** | Fade time in seconds. |
