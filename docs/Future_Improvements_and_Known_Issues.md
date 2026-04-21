# Future Improvements & Known Issues (Living)

This document is intentionally short and updated as we discover real-device quirks, performance limits, and UX refinements.

## Known gaps vs plan (today)

| Gap | Plan / today |
|-----|----------------|
| **Drag-to-pop / gesture painting** | Not implemented. Multi-finger popping works via one `Pressable` per cell; no continuous swipe painting across the canvas. |
| **“Inset shadow” realism** | Popped state uses border + reduced elevation; true inset shadow simulation not implemented (RN shadow limits). |
| **Device calibration** | Haptics/audio “feel” not tuned on a physical iPhone yet (timing, fatigue, rate-limits). |

## Known risks / sharp edges

- **FlashList v2 sizing**: `estimatedItemSize` isn’t available; the grid assumes uniform cell sizing. Any future change that makes rows variable-height can cause layout churn.
- **MMKV + New Architecture**: `react-native-mmkv` v4 relies on Nitro/new-arch integration. Native builds must be rebuilt after dependency changes; Jest uses a mock.
- **Audio concurrency**: Mitigated with a small multi-slot pool in `engine/audio.ts` (still bounded; extreme spam can reuse a busy slot).

## Known issues (screens / interaction)

_(none open right now)_

## Improvements (high impact)

- **Gesture painting**: Add an opt-in “paint mode” gesture layer that maps touch points to bubble indices without causing FlashList scroll conflicts.
- **Per-burst audio strategy**: ~~Implement a small `Sound` pool~~ **Done (2026-04-20):** round-robin pool of paired primary/accent `Sound`s; revisit native/polyphony if still audible under load.
- **Better neumorphism**: Add a highlight rim gradient (or dual-layer trick) for convex bubbles; explore subtle inner ring for popped state.
- **Stats UX**: Add “Session pops” and “Today pops” to the overlay; add a reset-confirm sheet for destructive actions.
- **Accessibility**: Provide reduced motion option, large touch targets in bottom zone, and a “sound off / haptics off” toggle.

## Gameplay / progression (future)

- **Choose next company + run modifiers**: Let the player pick which company (or narrative equivalent) to help next. Runs can grant **bonuses or penalties** as lightweight modifiers (economy, time pressure, comfort/sensory tuning, scoring) so sessions stay varied, without overwhelming the core pop-and-breathe loop. **Spec:** [`Choose_Next_Company_Spec.md`](Choose_Next_Company_Spec.md).

| Phase (spec §12) | Scope | Status |
|------------------|--------|--------|
| **A** | Three deterministic next-company offers + persistence (`pendingOffersJson`, selection, `advanceCompanyWithSelection`); no modifier chips yet | **Shipped** (in app) |
| **B** | `runModifiers` content + economy + quota modifiers + chips in offer UI / header | **Deferred** — spec ready; implement when prioritized |
| **C** | Challenge offers, completion-bonus hook, header polish | **Deferred** — after B |

## Improvements (low/medium impact)

- **Theme polish**: Slightly different bubble color than canvas to improve depth cues without adding clutter.
- **Performance instrumentation**: Add a debug-only FPS / render counter overlay to catch regressions.
- **Testing**: Add component-level tests for `advanceDailyStreak` edge cases (timezone boundaries) and store regression tests for streak/bestStreak.

## Change Log

- **2026-04-21**: Added **two tables** here (known gaps vs plan; choose-next-company phase status). Phases **B/C deferred**; phase **A shipped** (offer picker + store).
- **2026-04-21**: **Added** draft spec for choose-next-company + run modifiers: [`Choose_Next_Company_Spec.md`](Choose_Next_Company_Spec.md).
- **2026-04-20**: **Fixed** Progress tab: `ScrollView` + bottom inset padding so content scrolls and Preferences rows are reachable (Preferences live on Progress, not a separate Settings screen).
- **2026-04-20**: **Added** pop sound slot pool for burst pops (see `engine/audio.ts`).
- **2026-04-20**: Documented known issues: Progress screen scroll/interaction, Settings preferences not tappable.
- **2026-04-20**: Added future idea: choose-next-company flow with bonus/penalty run modifiers (design TBD).
- **2026-04-20**: Created as a living “next steps / issues” scratchpad for the project.

