# Future Improvements & Known Issues (Living)

This document is intentionally short and updated as we discover real-device quirks, performance limits, and UX refinements.

## Known gaps vs plan (today)

- **Drag-to-pop / gesture painting**: Not implemented. Current behavior supports multi-finger popping by pressing individual bubbles (one `Pressable` per cell), but not continuous swipe painting across the canvas.
- **“Inset shadow” realism**: The popped state uses border + reduced elevation; true inset shadow simulation is not implemented (RN shadow limitations).
- **Device calibration**: Haptics/audio “feel” has not been tuned on a physical iPhone yet (timing, fatigue, rate-limits).

## Known risks / sharp edges

- **FlashList v2 sizing**: `estimatedItemSize` isn’t available; the grid assumes uniform cell sizing. Any future change that makes rows variable-height can cause layout churn.
- **MMKV + New Architecture**: `react-native-mmkv` v4 relies on Nitro/new-arch integration. Native builds must be rebuilt after dependency changes; Jest uses a mock.
- **Audio concurrency**: Rapid bursts may overlap playback. Current implementation reuses one `Audio.Sound` instance; if clipping occurs, we may need a small pool or a throttled “polyphony” strategy.

## Improvements (high impact)

- **Gesture painting**: Add an opt-in “paint mode” gesture layer that maps touch points to bubble indices without causing FlashList scroll conflicts.
- **Per-burst audio strategy**: Implement a small `Sound` pool (e.g., 4–8) or a lightweight native audio strategy if overlap becomes audible.
- **Better neumorphism**: Add a highlight rim gradient (or dual-layer trick) for convex bubbles; explore subtle inner ring for popped state.
- **Stats UX**: Add “Session pops” and “Today pops” to the overlay; add a reset-confirm sheet for destructive actions.
- **Accessibility**: Provide reduced motion option, large touch targets in bottom zone, and a “sound off / haptics off” toggle.

## Improvements (low/medium impact)

- **Theme polish**: Slightly different bubble color than canvas to improve depth cues without adding clutter.
- **Performance instrumentation**: Add a debug-only FPS / render counter overlay to catch regressions.
- **Testing**: Add component-level tests for `advanceDailyStreak` edge cases (timezone boundaries) and store regression tests for streak/bestStreak.

## Change Log

- **2026-04-20**: Created as a living “next steps / issues” scratchpad for the project.

