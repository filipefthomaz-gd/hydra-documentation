# Getting Started

## What is HYDRA?

HYDRA (HYbrid Dynamically Responsive Audio) is OCEAN's adaptive audio system. It wraps Unity's `AudioSource` and `AudioMixer` APIs into a higher-level layer built around three ideas:

- **Stems** — a single music track is many synchronized layers, each faded independently.
- **Transitions** — crossfades happen at musically correct moments (beat, bar, or immediate).
- **Reactivity** — the mix responds to gameplay events, spatial position, and emotional state.

---

## Scene setup

### 1 — AudioManager

HYDRA requires one `AudioManager` in your scene. It acts as the central registry for all playing tracks and handles group-level volume, ducking, and snapshots.

Add the `AudioManager` component to a persistent GameObject (e.g. tagged `DontDestroyOnLoad`).

In the Inspector, configure:

| Field | What it is |
|-------|-----------|
| **Audio Groups** | List of `AudioGroup` assets — one per mixer group (SFX, Music, Dialogue, Ambience) |
| **Audio Parent** | Transform under which dynamically created track GameObjects are parented |
| **Generic Audio Prefab** | A barebones `AudioSource` prefab used for raw-clip transitions |

::: tip Dependency injection
`AudioManager` implements `IAudioManager` and binds itself via `Stream.DI`. Other systems can receive `IAudioManager` through constructor or field injection instead of using `AudioManager.Instance` directly.
:::

### 2 — AudioGroups

Create an `AudioGroup` asset for each mixer group you want HYDRA to manage:

`Assets → Create → OCEAN → HYDRA → AudioGroup`

| Field | What it is |
|-------|-----------|
| **Type** | `SFX`, `Dialogue`, `Music`, or `Ambience` |
| **Mixer** | The `AudioMixerGroup` this asset represents |
| **Volume Group** | Toggle on and set the exposed parameter name (e.g. `MusicVolume`) to allow fading |
| **Ducking** | List of other groups this group ducks when it plays (see [Auto-Ducking](/guide/transitions#auto-ducking)) |

---

## Your first AudioTrack

An `AudioTrack` is a ScriptableObject that describes a single piece of music (or ambience) as a set of **stems**.

`Assets → Create → OCEAN → HYDRA → Audio Track`

Configure it:

1. Set **Group** to your Music `AudioGroup`.
2. Set **Loop** to `true` for looping music.
3. Set **BPM** to the track's tempo (used for beat-synced transitions).
4. Under **Stems**, add one entry per layer — give each a unique **ID** (e.g. `drums`, `bass`, `melody`) and assign its `AudioClip`.
5. Mark **isActive** on the stems that should start audible.

---

## Playing a track

### Option A — AudioInitializer (no code)

Add the `AudioInitializer` component to any scene GameObject, assign your `AudioTrack` assets to its list, and they start playing when the scene loads.

### Option B — AudioTracksManager (transitions)

Add `AudioTracksManager` to a GameObject when you need the track to transition to other tracks based on game state. See [Transitions](/guide/transitions) for full details.

### Option C — code

```csharp
// Play a track through the manager (fade in over 1 second)
await AudioManager.Instance.PlayAudioTrack(myTrack, fadeDuration: 1f);

// Or via the extension method on AudioTrack
await myTrack.Play();

// Stop it
AudioManager.Instance.StopAudioTrack(myTrack, fadeDuration: 1f);
```

---

## Next steps

- [Audio Tracks](/guide/audio-tracks) — stems, parameters, and clip variation
- [Transitions](/guide/transitions) — beat-synced crossfades and the Transition asset
- [Sequences](/guide/sequences) — ordered track playlists
- [Vertical Mixing](/guide/vertical-mixing) — fading stems and emotional state
- [Spatial Audio](/guide/spatial) — blend zones, acoustic zones, and occlusion
- [Variation](/guide/variation) — scatterers, impulses, and stochastic clips
