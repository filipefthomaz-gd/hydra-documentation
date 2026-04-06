# Sequences

A **sequence** is an ordered playlist of `AudioTrack`s. Tracks can play once and advance automatically, or loop until you explicitly skip them. Use sequences for cutscenes, story beats, and musical arcs that unfold over time.

---

## AudioSequence

An `AudioSequence` is a ScriptableObject that holds the list of segments.

`Assets → Create → OCEAN → HYDRA → Audio Sequence`

Each **segment** has:

| Field | Type | Description |
|-------|------|-------------|
| **Track** | `AudioTrack` | The track to play for this segment. |
| **Mode** | `PlayOnce` / `Loop` | `PlayOnce` advances automatically when the clip ends. `Loop` stays on this segment until `Skip()` or `JumpTo()` is called. |
| **Transition Fade** | `float` | Fade-in duration in seconds when this segment starts. |

---

## AudioSequencePlayer

Add `AudioSequencePlayer` to a scene GameObject to run a sequence at runtime.

| Inspector field | Description |
|----------------|-------------|
| **Sequence** | The `AudioSequence` asset to play. |
| **Play On Awake** | Start from segment 0 when the scene loads. |

### Events

| Event | When it fires |
|-------|-------------|
| `OnSegmentChanged(int)` | Each time playback moves to a new segment. Passes the new index. |

---

## Playing and controlling a sequence

```csharp
AudioSequencePlayer seq; // assigned in Inspector or via GetComponent

// Start from the first segment
seq.Play();

// Stop with a 1-second fadeout
seq.Stop(fade: 1f);

// Advance to the next segment immediately
seq.Skip(fade: 0.5f);

// Jump directly to segment index 2
seq.JumpTo(2, fade: 0.5f);
```

### Read state

```csharp
int  index    = seq.CurrentSegmentIndex;  // -1 if stopped
bool playing  = seq.IsPlaying;
AudioTrackPlayer player = seq.CurrentPlayer;
```

---

## Typical setup — story music arc

```
AudioSequence: MainQuestArc
  [0] exploration_calm   — Loop        (player wanders)
  [1] tension_buildup    — PlayOnce    (auto-advances after ~30s)
  [2] boss_intro         — PlayOnce    (auto-advances when clip ends)
  [3] boss_loop          — Loop        (stays here until boss dies)
  [4] victory_sting      — PlayOnce
  [5] post_battle_calm   — Loop
```

In code, call `seq.Skip()` when the boss dies to advance from segment 3 to 4.

::: tip Null segments
If a segment's **Track** is null, `AudioSequencePlayer` skips it automatically and moves to the next one. Use this to add intentional gaps (silence) without needing empty assets.
:::
