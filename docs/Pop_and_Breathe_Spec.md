# Pop & Breathe — Product & Engineering Spec

## Vision

Pop & Breathe is an **offline-first**, **distraction-minimal** tactile zen app: a field of neumorphic bubbles you pop with immediate sensory feedback. The primary goal is a **zero-latency feel** on iPhone: haptics and audio fire instantly on touch, visuals follow on the UI thread.

## Principles

- **Offline only**: no network calls; all persistence is local.
- **Immediate feedback**: `onPressIn` ordering is **haptics → audio → visual compression**.
- **Calm UI**: no feeds, badges, or secondary chrome during zen mode.
- **Performance**: virtualized grid (FlashList), Reanimated-driven motion, avoid JS-thread churn during bursts.

## Visual System

### Palette (light)

- Canvas background: `#e8ecf0`
- Bubble surface: `#e8ecf0` (same family as canvas; separation via shadow)
- Soft shadow (iOS): low-opacity cool gray; highlight toward top-left convention for “raised” neuomorphic look.

### Palette (dark)

- Canvas background: `#1c1f24`
- Bubble surface: `#23272e`
- Shadows/highlights adjusted for dark elevation (subtle light rim, darker bottom shadow).

### Neumorphic Rules

- **Unpopped**: convex appearance via paired shadow + highlight (single-shadow approximation on RN is acceptable; depth reads via border + shadow).
- **Popped**: **inset** read via inner border, slightly reduced elevation, optional subtle inner shadow simulation with semi-opaque border.

## Interaction Physics (constants)

Shared across UI and animations:

| Constant | Value |
|----------|-------|
| Spring stiffness | `300` |
| Spring damping | `20` |
| Spring mass | `0.5` |
| Press-in scale | `0.92` |

## Sensory Mapping

### Haptics

- **Press in**: `impactLight` (primary pop cue).
- **Optional micro**: `selectionChanged` reserved for future UI toggles.
- **Pop complete (press out)**: `notificationSuccess` (soft success; rate-limited if needed later).

All haptics must **fail silently** on unsupported platforms.

### Audio

- One short **pop** sample, **preloaded** at session start.
- Per interaction **playback rate** randomized in **`1.0 ± 0.05`** (implemented as `0.95..1.05`).
- Audio mode: respect silent switch where platform allows; prefer **ducking** other audio on Android.

## Architecture

### Engines

- `theme/tokens.ts` — colors, radii, spacing, neuomorphic style builders.
- `engine/physics.ts` — spring + scale constants.
- `engine/haptics.ts` — mapping + safe fallbacks.
- `engine/audio.ts` — preload + `playPop()` + pitch helper.
- `storage/zenStore.ts` — MMKV persistence (`createMMKV`) + pub/sub for UI refresh (memory fallback on web).
- `storage/statsLogic.ts` — pure streak/day math (unit-tested).
- `gestures/gestureZones.ts` — bottom interaction band height.

### Screens / Components

- `ZenScreen` — layout, theme, bottom-zone gestures, overlay orchestration.
- `ZenCanvas` — FlashList grid of bubbles (FlashList v2 measures rows without `estimatedItemSize`; keep rows uniform for stable layout).
- `BubbleItem` — press state machine + Reanimated scale.
- `StatsOverlay` — swipe-up reveal; swipe-down dismiss.

## Data Schema (MMKV)

| Key | Type | Meaning |
|-----|------|---------|
| `lifetimePops` | number | All-time pops |
| `sessionStart` | number (ms) | First pop timestamp of current install session (set on first pop) |
| `bestStreak` | number | Best consecutive **daily** streak |
| `currentStreak` | number | Current consecutive **daily** streak |
| `lastStreakDate` | string (`YYYY-MM-DD`) | Last UTC day streak was advanced |
| `theme` | `"light"` \| `"dark"` | Active theme |

## Gesture Dictionary

| Zone | Gesture | Action |
|------|---------|--------|
| Bottom band | Swipe up | Open stats overlay |
| Bottom band (overlay closed) | Swipe down | Reset current bubble sheet (regenerate grid) |
| Stats overlay | Swipe down | Close overlay |
| Bubble cell | Press in | Haptic + audio + compress |
| Bubble cell | Press out | Pop visual + stats increment |

**Gesture conflict policy**: bottom band is a dedicated hit region **below** the FlashList; the list owns the main canvas. Avoid nested competing vertical pans on the same hit target.

## Sprint Roadmap (implementation trace)

1. **Foundation**: Expo + TS, Reanimated, Gesture Handler, FlashList, MMKV, tokens, bubble press machine, grid.
2. **Sensory**: haptics + preloaded audio + pitch variance; multi-finger pops via independent cells; perf hygiene (memoization, stable props).
3. **Zen integration**: stats overlay + bottom gestures + persistence + theme toggle in overlay.

## Change Log

- **2026-04-20**: Initial in-repo spec authored from the implementation plan; baseline RN scaffold and feature modules landed alongside this document.
- **2026-04-20**: Implemented Expo app shell, FlashList `ZenCanvas`, Reanimated `BubbleItem`, bottom-zone gestures + `StatsOverlay`, MMKV-backed `zenStore`, haptics + preloaded pop audio with pitch variance, and Jest coverage for pure stats/audio helpers.
