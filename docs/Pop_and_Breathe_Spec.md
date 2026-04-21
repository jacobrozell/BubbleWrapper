# Pop & Breathe — Product & Engineering Spec

## Vision

Pop & Breathe is an **offline-first**, **distraction-minimal** tactile zen app: a field of neumorphic bubbles you pop with immediate sensory feedback. The primary goal is a **zero-latency feel** on iPhone: haptics and audio fire instantly on touch, visuals follow on the UI thread.

## Principles

- **Offline only**: no network calls; all persistence is local.
- **Immediate feedback**: `onPressIn` ordering is **haptics → audio + visual compression** (audio skipped when Sound is off in Progress).
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

### Phase B tokens (`theme/tokens.ts`)

Extended tokens include **ambient** gradient endpoints, **tray** (`playfieldFrame*`), **contract bar** (`contractBarFill` / `contractBarTrack`), **Credits** accent (`currencyAccent`), and **Shop** row affordances (`shopAffordable` / `shopUnaffordable` / `shopOwned`).

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

- **Press in**: `impactMedium` (primary pop cue); **no-op when Haptics off** in Progress preferences.
- **Optional micro**: `selectionChanged` for UI toggles (e.g. preferences).
- **Pop complete (press out)**: `notificationSuccess` (soft success; rate-limited if needed later).

All haptics must **fail silently** on unsupported platforms.

### Audio

- One short **pop** sample, **preloaded** at session start.
- Per interaction **playback rate** randomized in a **snappy** band (see `engine/audio.ts`).
- Audio mode: respect silent switch where platform allows; prefer **ducking** other audio on Android.
- **Sound off** in Progress skips `playPop()`; **Muted pop layer** Shop upgrade lowers accent layer volume.

## Architecture

### Engines

- `theme/tokens.ts` — colors, radii, spacing, neuomorphic style builders + Phase B UI tokens.
- `engine/physics.ts` — spring + scale constants.
- `engine/haptics.ts` — mapping + safe fallbacks + `zenStore` haptics toggle.
- `engine/audio.ts` — preload + `playPop()` + pitch helper + `zenStore` sound / upgrade hooks.
- `storage/zenStore/` — MMKV persistence (`createMMKV` in `zenStore/backend.ts`) + pub/sub for UI refresh (memory fallback on web); **`storage/useZenStore.ts`** subscribes screens; **contract, Credits, Flair, cosmetics, MVP achievements, prestige, Shop**.
- `storage/statsLogic.ts` — pure streak/day math (unit-tested).
- `economy/formulas.ts` — pure quota / prestige / earn-rate helpers (unit-tested).
- `content/companies.ts`, `content/upgrades.ts`, `content/cosmetics.ts`, `content/achievementsMvp.ts` — static tables for contracts, Credit upgrades, Flair cosmetics, and MVP achievements.
- `gestures/gestureZones.ts` — legacy bottom band constant (optional; main chrome is tabs).

### Navigation

- `@react-navigation/native` + **bottom tabs**: **Pop** · **Progress** · **Shop** (`navigation/RootTabs.tsx`, `App.tsx` `NavigationContainer`).

### Screens / Components

- `screens/PopScreen.tsx` — contract header, ambient layer, framed tray, `ZenCanvas`, contract-complete modal (**Next Company**).
- `screens/ProgressScreen.tsx` — stats, prestige flow + confirm modal, theme / haptics / sound preferences.
- `screens/ShopScreen.tsx` — Credit-priced upgrades, Flair-priced cosmetics, purchase feedback.
- `ZenCanvas` — FlashList grid; pull-to-refresh calls `refreshSheetOnly()`; pops call `commitPop()`.
- `BubbleItem` — press state machine + Reanimated scale; **blocked when contract complete** (`popsDisabled`); optional **hit slop** from Shop.

## Data Schema (MMKV)

| Key | Type | Meaning |
|-----|------|---------|
| `lifetimePops` | number | All-time pops (persists through prestige) |
| `sessionStart` | number (ms) | First pop timestamp of current install session (set on first pop) |
| `bestStreak` | number | Best consecutive **daily** streak |
| `currentStreak` | number | Current consecutive **daily** streak |
| `lastStreakDate` | string (`YYYY-MM-DD`) | Last UTC day streak was advanced |
| `theme` | `"light"` \| `"dark"` | Active theme |
| `credits` | number | Soft currency (Shop) |
| `companyIndex` | number | Active company slot (wrapped roster) |
| `popsThisContract` | number | Progress toward current quota |
| `contractComplete` | 0 \| 1 | Contract satisfied; blocks further **counted** pops until Next Company |
| `prestigeCount` | number | Times career prestige committed |
| `companiesCompleted` | number | Contracts cleared via **Next Company** |
| `sheetResetVersion` | number | Bumped on sheet refresh or company advance (grid remount) |
| `ownedUpgradesJson` | string | JSON map of `upgradeId` → tiers owned |
| `hasSeenPrestigeExplainer` | 0 \| 1 | First-time prestige hint flag |
| `hapticsEnabled` | 0 \| 1 | Master haptics toggle |
| `soundEnabled` | 0 \| 1 | Master pop audio toggle |
| `flair` | number | **Flair** — currency from achievements; spent on **cosmetics** only |
| `lifetimeContractsCompleted` | number | All-time contracts cleared (not reset by prestige) |
| `phase3EconomyMigrated` | 0 \| 1 | One-time migration flag for Flair / lifetime counters |
| `ownedCosmeticsJson` | string | JSON map of `cosmeticId` → `1` when owned |
| `claimedAchievementsJson` | string | JSON string array of claimed MVP achievement ids |

## Gesture Dictionary

| Zone | Gesture | Action |
|------|---------|--------|
| Pop · FlashList | Pull down (refresh control) | **New sheet** — `refreshSheetOnly()`; contract progress unchanged |
| Pop · Bubble cell | Press in | Haptic + audio (if enabled) + compress (blocked when `contractComplete`) |
| Pop · Bubble cell | Press out | Pop visual + `commitPop()` (same block rule) |
| Tabs | Tap | Switch **Pop** / **Progress** / **Shop** |

**Gesture conflict policy**: tab bar is primary chrome; the list owns the main canvas. Avoid nested competing vertical pans on the same hit target.

## Sprint Roadmap (implementation trace)

1. **Foundation**: Expo + TS, Reanimated, Gesture Handler, FlashList, MMKV, tokens, bubble press machine, grid.
2. **Sensory**: haptics + preloaded audio + pitch variance; multi-finger pops via independent cells; perf hygiene (memoization, stable props).
3. **Zen integration**: stats overlay + bottom gestures + persistence + theme toggle in overlay.
4. **Phase B**: bottom tabs, contract + Credits economy, Shop + prestige, framed Pop playfield, `StatsOverlay` removed in favor of **Progress**.

## Change Log

- **2026-04-20**: Initial in-repo spec authored from the implementation plan; baseline RN scaffold and feature modules landed alongside this document.
- **2026-04-20**: Implemented Expo app shell, FlashList `ZenCanvas`, Reanimated `BubbleItem`, bottom-zone gestures + `StatsOverlay`, MMKV-backed `zenStore`, haptics + preloaded pop audio with pitch variance, and Jest coverage for pure stats/audio helpers.
- **2026-04-21**: Phase B — React Navigation tabs (`PopScreen`, `ProgressScreen`, `ShopScreen`), contract/Credits/prestige/Shop in `zenStore`, content + `economy/formulas`, ambient + tray on Pop, contract-complete modal, preferences and prestige confirm on Progress, pull-to-refresh = new sheet only; removed `StatsOverlay` / `ZenScreen`.
- **2026-04-21**: Phase 3 MVP — **Flair** currency (achievement rewards), lifetime contract counter, MVP achievements (`content/achievementsMvp.ts`), **Cosmetics** section in Shop (`content/cosmetics.ts`, `purchaseCosmetic`), blue bubble outline cosmetic, `achievementsMvpLogic` + tests; prestige keeps Flair, cosmetics, and achievement claims.
