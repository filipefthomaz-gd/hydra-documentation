---
layout: home

hero:
  name: HYDRA
  text: Adaptive audio for Unity
  tagline: HYbrid Dynamically Responsive Audio — stem-based music, beat-synced transitions, spatial zones, and emotional mixing. Everything you need to make your game's audio react to what's happening.
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: Component Reference
      link: /reference/components

features:
  - icon: 🎵
    title: Stem-based music
    details: Compose AudioTracks from independent stems. Each stem can fade in or out at runtime, letting the music react to gameplay without cross-fading entire tracks.

  - icon: 🥁
    title: Beat-synced transitions
    details: Crossfade on the next beat, bar, or instantly. AudioTracksManager fires transitions at the musically correct moment so cuts never feel jarring.

  - icon: 🎭
    title: Emotional state mixing
    details: Drive the stem mix from two independent axes — Danger and Pace, Tension and Energy, anything you like. Designers author AnimationCurves; code calls SetEmotionalState.

  - icon: 🌍
    title: Spatial zones
    details: AudioBlendZone crossfades between two tracks as the player walks through a collider. AudioAcousticZone swaps reverb snapshots. AudioOcclusionController muffles audio through walls.

  - icon: 🔀
    title: Stochastic variation
    details: Weighted clip pools with history suppression stop repetitive earworms. AudioScatterer and AudioImpulse scatter ambient and one-shot sounds with random pitch, volume, and position.

  - icon: 🎬
    title: Cinematic sequences
    details: AudioSequence lines up tracks that play once and advance automatically, or loop until you call Skip. Perfect for cutscenes, story beats, and escalating musical arcs.
---
