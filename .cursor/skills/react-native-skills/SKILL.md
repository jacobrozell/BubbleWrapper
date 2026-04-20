---
name: react-native-skills
description: Performance-first React Native/Expo mobile engineering guidelines. Use when building or refactoring React Native apps, especially for scrolling lists (FlashList), gesture/animation work (Reanimated/Gesture Handler), navigation responsiveness, state management to reduce re-renders, monorepo/native dependency configuration, or when the user mentions RN/Expo performance, memory, jank, 60fps, virtualization, or native patterns.
---

# React Native Skills

## Scope

Apply these rules when working on:
- React Native or Expo apps
- Performance fixes (jank, slow screens, memory spikes, dropped frames)
- Large lists / feeds / galleries
- Gesture-driven UI and animations
- Navigation and “native feel”
- Monorepos and native dependency/config issues

## Defaults (choose the safest high-performance path)

- Prefer **measuring first** (render counts, list FPS, JS vs UI thread) before rewriting.
- Prefer **stable props** and **memoization** over “global state everywhere”.
- Prefer **virtualized lists** for anything beyond small, static content.
- Prefer **UI-thread animations** (Reanimated) for continuous motion/gestures.

## Workflow

1. Identify the bottleneck category:
   - List/scroll
   - Animation/gesture
   - Navigation/interaction
   - State/rendering
   - Configuration/build/native deps

2. Apply the relevant checklist below.
3. Verify improvement by re-checking the original symptom.

## Lists and scrolling (FlashList-first)

Use FlashList when:
- A screen renders a feed/gallery/grid
- Items contain images/video
- Data can exceed ~30 items or can grow

Rules:
- Use **FlashList** and set:
  - `estimatedItemSize`
  - `keyExtractor` (stable)
- Keep `renderItem` stable (`useCallback`) and item components stable (`React.memo`).
- Avoid creating new objects/functions in render paths of list rows.
- Move expensive work out of render:
  - precompute derived fields
  - memoize selectors/derived props
- Images:
  - set explicit sizes
  - avoid layout thrash from unknown dimensions

Anti-patterns:
- Nested vertical virtualized lists unless unavoidable
- Large inline anonymous components inside `renderItem`
- Passing changing inline style objects to every row

## Animations and gestures (Reanimated + UI thread)

Use Reanimated for:
- Continuous animations
- Gesture-driven interactions (drag, swipe, pinch)
- Anything that must remain smooth during JS load

Rules:
- Prefer **shared values** + worklets for per-frame updates.
- Keep gesture callbacks lean; don’t bridge to JS on every frame.
- If you need JS side effects, debounce/throttle and trigger on end states.
- Prefer GPU-friendly transforms (`translate`, `scale`, `rotate`, `opacity`) over layout changes.

Anti-patterns:
- Updating React state every gesture tick
- Animating layout properties that cause repeated layout/measure passes

## State management and renders (minimize re-renders)

Rules:
- Keep state **local** by default; lift only when necessary.
- Avoid “god stores” that cause broad subscription churn.
- Ensure selectors are stable and narrow (subscribe to the smallest slice).
- Memoize:
  - derived values (`useMemo`)
  - callbacks passed down (`useCallback`)
  - row/item components (`React.memo`)
- Keep props stable (avoid recreating arrays/objects in parent render).

Diagnostics:
- If a screen janks, suspect:
  - repeated re-renders
  - list rows re-rendering on scroll
  - expensive synchronous JS during interaction

## Navigation (native feel and responsiveness)

Rules:
- Prefer navigation patterns that match platform expectations.
- Avoid heavy synchronous work during transitions.
- Keep screen mounts light; defer non-critical fetch/compute.
- Memoize header components and options if they’re computed from props/state.

## Monorepo and native configuration (dependency tree safety)

Rules:
- When adding native dependencies, verify:
  - Expo compatibility (if using Expo)
  - Android/iOS configuration requirements
  - version alignment across workspace packages
- Prefer minimal native surface area; don’t add multiple overlapping libraries for the same job.
- When diagnosing build/config issues:
  - list the current RN/Expo versions and platform targets
  - identify whether it’s managed Expo vs prebuild/bare
  - isolate the smallest repro change

## Output expectations (how to respond)

When applying this skill:
- Propose the **default best-practice implementation** (FlashList/Reanimated/memoization) first.
- Call out 1–3 **high-impact changes** before lower-signal tweaks.
- If refactoring, provide a safe migration path (incremental steps) and identify risks.

