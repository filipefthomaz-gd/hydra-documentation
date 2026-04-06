# API Reference

Complete method signatures for the most commonly used HYDRA classes.

---

## IAudioManager

The interface implemented by `AudioManager`. Inject this to decouple your code from the singleton.

```csharp
public interface IAudioManager
{
    // Query
    bool IsPlaying(AudioGroup group);

    // Track lifecycle
    AudioTrackPlayer CreateAudioTrack(AudioTrack track, Transform parent,
                                      float fadeDuration = 0, bool playOnAwake = false);
    AudioTrackPlayer GetAudioTrackPlayer(AudioTrack track);
    void RegisterAudioTrack(AudioTrackPlayer player);
    void UnregisterAudioTrack(AudioTrackPlayer player);

    // Play / Stop
    Task PlayAudioTrack(AudioTrack track, float duration = 0f);
    void StopAudioTrack(AudioTrack track, float duration = 0f);
    void StopAudioTracksOfGroup(AudioGroup group, float duration = 0f);

    // Crossfade
    void Crossfade(AudioTrack track, float duration);
    void Crossfade(AudioTrack track, float duration, Transition.Trigger timing);

    // Snapshots
    void PushSnapshot();
    void PopSnapshot(float fade = 0.5f);
}
```

---

## AudioManager (additional members)

These members exist on `AudioManager` but are not part of `IAudioManager`:

```csharp
// Volume control (all AudioGroups of a type)
void SetAudioGroupVolume(AudioGroupType type, float volume);      // linear 0–1
void SetAudioGroupVolumeDb(AudioGroupType type, float db);       // decibels

Surfer FadeAudioGroupVolume(AudioGroupType type, float to, float duration,
                            Mode mode = default, Easing.Type easing = default);
Surfer FadeAudioGroupVolume(AudioGroupType type, float from, float to, float duration,
                            Mode mode = default, Easing.Type easing = default);

// Convenience
AudioGroup GetAudioGroupFromType(AudioGroupType type);
static float VolumeToAttenuation(float volume);   // linear → dB
static float AttenuationToVolume(float attenuation); // dB → linear

// Legacy transition (fades out all global sources, creates new ones)
void SimpleTransition(List<AudioTrack> tracks, float duration);
void SimpleTransition(List<AudioClip> clips, float duration);
```

---

## AudioTrackPlayer

```csharp
// Initialisation
void Init();
void InitFade(float fade);
void PlayOnAwake(bool state);
void InitializeAudioSources(float fade = 0);

// Playback
CoRunner Play(float fade = 0.5f);
CoRunner PlayLooped(float fade = 0.5f);
CoRunner PlayOnce(float fade = 0.5f);
void     Play(string stemId, float fade = 0.5f);
void     Stop(float fade = 0.5f);
void     ForceStop();

// Volume
void Mute(float fade = 0.5f);
void Mute(string stemId, float fade = 0.5f);
void SetVolume(float volume);
void SetVolume(string stemId, float volume);
void DestroyAll(float duration);

// Vertical controls
void FadeVolume(string stemId, float target, float fade = 0.5f);
void SetParameter(string paramName, float value, float fade = 0.5f);
void PlayOnBeat(string stemId, float fade = 0.5f);
void StopOnBeat(string stemId, float fade = 0.5f);
void SoloStem(string stemId, float fade = 0.5f);
void ClearSolo(float fade = 0.5f);
void SetEmotionalState(float axisA, float axisB, float fade = 0.5f);

// Stingers
void AddTransitionClip(AudioTrack transition);

// Properties
bool                IsPlaying    { get; }
Metronome           Metronome    { get; }
List<AudioStem>     Stems        { get; }
IReadOnlyList<AudioSource> AudioSources { get; }

// Events
UnityEvent OnStarted           { get; }
UnityEvent OnStopped           { get; }
UnityEvent OnTransitionClipEnd { get; }
```

---

## AudioTracksManager

```csharp
// Variable-driven transitions
void SetInt(string key, int value);

// Manual transitions
void TransitionTo(AudioTrack to, float duration = 0.5f);
void TransitionTo(AudioTrack to, Transition.Trigger timing, float duration = 0.5f);

// Queued transitions
void QueueTransition(Transition t);
```

---

## AudioSequencePlayer

```csharp
void Play();
void Stop(float fade = 0.5f);
void Skip(float fade = 0.5f);
void JumpTo(int index, float fade = 0.5f);

int              CurrentSegmentIndex { get; }
AudioTrackPlayer CurrentPlayer       { get; }
bool             IsPlaying           { get; }

UnityEvent<int> OnSegmentChanged;   // passes new segment index
```

---

## AudioImpulse

```csharp
void Play();
```

---

## AudioTrack extension

```csharp
// Shorthand to play a track via AudioManager.Instance
await myTrack.Play();
```

---

## Transition.Trigger enum

```csharp
public enum Trigger
{
    Immediate,   // No sync — fires right away
    OnBeat,      // Waits for the next metronome beat
    OnDownBeat,  // Waits for the next bar (downbeat)
    OnBar,       // Alias for OnDownBeat
}
```

---

## AudioGroupType enum

```csharp
public enum AudioGroupType { SFX, Dialogue, Music, Ambience }
```

---

## SequenceMode enum

```csharp
public enum SequenceMode
{
    PlayOnce,   // Plays through, then auto-advances to the next segment
    Loop,       // Loops until Skip() or JumpTo() is called
}
```

---

## WeightedAudioClip *(serializable)*

```csharp
public class WeightedAudioClip
{
    public AudioClip clip;
    [Range(0.01f, 10f)]
    public float weight = 1f;   // relative probability — higher = more frequent
}
```

---

## AudioDuckTarget *(serializable)*

```csharp
public class AudioDuckTarget
{
    public AudioGroup victim;        // group to duck
    public float attenuationDb;      // negative dB reduction, e.g. -12
    public float attackTime;         // seconds to reach ducked level
    public float releaseTime;        // seconds to restore original level
}
```

---

## AudioSequenceSegment *(serializable)*

```csharp
public class AudioSequenceSegment
{
    public AudioTrack    track;
    public SequenceMode  mode = SequenceMode.PlayOnce;
    public float         transitionFade = 0.5f;
}
```

---

## EmotionalStemMapping *(serializable)*

```csharp
public class EmotionalStemMapping
{
    public string         stemId;
    public AnimationCurve axisACurve;   // x: axis A value, y: volume factor
    public AnimationCurve axisBCurve;   // x: axis B value, y: volume factor
}
// Final stem volume = Clamp01(axisACurve(axisA) × axisBCurve(axisB))
```
