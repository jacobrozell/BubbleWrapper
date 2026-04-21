# Test coverage (living)

Update this file whenever you add, remove, or materially change tests or the behaviors they guard.

## Purposeful tests

Tests exist to **catch real mistakes**, not to pad metrics. Each case should tie to a **user-visible outcome, persisted rule, or documented formula** (see specs in `docs/`). Skip redundant coverage of deprecated aliases unless the alias itself must keep working for migrations. Prefer **deterministic** setups (`resetZenStoreForTests`, `jest.spyOn` on small deps) over flaky timing or unbounded random sampling.

## How we test

| Layer | Goal | Typical location |
| --- | --- | --- |
| **Pure logic** | Formulas, content rules, audio math — fast, no RN | `src/economy/*`, `src/content/*`, `src/engine/*` → `__tests__/**/*.test.ts` |
| **Store / persistence** | Game state, migrations, contract flow — use `resetZenStoreForTests()` | `src/storage/zenStore/` → `__tests__/zenStore*.test.ts` |
| **UI** | User-visible flows (tabs, pop → progress) | Prefer thin screens + tested logic; add `@testing-library/react-native` when you want render/interaction tests (`*.test.tsx`) |

Run: `npm test`  
Coverage: `npm run test:coverage` → terminal summary plus `coverage/lcov.info` (CI) and `coverage/index.html` (open in a browser for per-file lines).

Jest config: `jest.config.js`, mocks: `jest.setup.ts`. Instrumented paths: `collectCoverageFrom` in `jest.config.js` (all of `src/` except `navigation/types.ts`).

## Coverage as a feature indicator

Jest reports **lines / statements / branches / functions** executed during tests. Use it as a **compass**, not a definition of done: high % on `zenStore` still misses wrong business rules; 0% on a screen may be fine if logic lives in tested modules.

**Workflow**

1. Pick a **feature slice** (row below) and its primary `src/` paths.
2. Run `npm run test:coverage`; in `coverage/index.html`, filter or drill into those paths.
3. Note gaps (red files or untested branches) and either add tests or move logic into a tested module.
4. Optionally record **roll-up %** or a short note in [Changelog](#changelog) when you close a milestone (e.g. “Choose next company: `offerGeneration` ~90% lines”).

**Feature ↔ code map** (update paths when you split or rename files)

| Feature / component | Primary `src/` paths | What coverage should reflect |
| --- | --- | --- |
| Pop / bubble play | `screens/PopScreen.tsx`, `components/ZenCanvas.tsx`, `engine/physics.ts`, `gestures/gestureZones.ts` | Interaction + physics; often low until RNTL or extracted hooks |
| Audio | `engine/audio.ts` | Side effects mocked in Jest; pair % with `audioPitch`-style unit tests |
| Haptics | `engine/haptics.ts` | Often thin wrappers; % may stay low; validate critical calls manually or with spies |
| Progress / stats UI | `screens/ProgressScreen.tsx`, `storage/statsLogic.ts` | Strong % on `statsLogic`; screens optional |
| Shop / economy UI | `screens/ShopScreen.tsx`, `economy/formulas.ts`, `economy/achievementsMvpLogic.ts` | Formulas usually high; screens track over time |
| Game state & contracts | `storage/zenStore/`, `storage/useZenStore.ts`, `content/offerGeneration.ts`, `content/runModifiers.ts`, `content/companies.ts` | Highest priority for % + branch coverage |
| Choose next company / offers | `content/offerGeneration.ts`, related `zenStore` branches | Align with `docs/Choose_Next_Company_Spec.md` |
| Cosmetics / theme | `theme/tokens.ts`, `theme/bubbleCosmetic.ts`, `content/cosmetics.ts` | Data + small helpers vs presentation |
| Shell / nav | `navigation/RootTabs.tsx`, `navigation/rootNavigationRef.ts`, `App.tsx`, `components/AchievementBannerHost.tsx` | Smoke tests when you add them; % is secondary |

**Optional later:** add `coverageThreshold` in `jest.config.js` per glob (e.g. minimum line % on `src/economy/**`) once baselines stabilize.

## Coverage matrix

| User / product area | Behavior under test | Test file(s) | Gaps (next tests) |
| --- | --- | --- | --- |
| Pop → stats | Lifetime pops, session start, theme persistence | `__tests__/zenStore.test.ts` | — |
| Economy math | Credits, prestige, quotas, contract bonus | `__tests__/economy/formulas.test.ts` | Edge cases you care about (caps, rounding) |
| Achievements (MVP) | Claimable / flair totals; banner diff (`newlyClaimableAchievementsSince`) | `__tests__/economy/achievementsMvpLogic.test.ts` | Integration with `zenStore` if logic duplicates |
| Audio | Pitch / playback-related pure logic | `__tests__/audioPitch.test.ts` | `audio.ts` integration only if bugs appear |
| Stats / streaks | Daily streak helpers | `__tests__/statsLogic.test.ts` | UTC boundary cases if reported |
| Phase B game loop | Contract complete, advance company, shop actions, offers | `__tests__/zenStore.phaseb.test.ts`, `__tests__/content/offerGeneration.test.ts` | `runModifiers` paths, full “choose next company” flow |
| Navigation / tabs | Tab labels, deep links | — | Smoke test with RNTL + mocked nav when added |
| Screens (Pop / Progress / Shop) | Layout, gestures, lists | — | Extract handlers → unit test; or RNTL after adding devDependency |

## Changelog

| Date | Change |
| --- | --- |
| 2026-04-20 | Initial matrix; `npm test`; `npm run test:coverage`, Jest `collectCoverageFrom`, feature↔path map, `coverage/` gitignored. |
| 2026-04-20 | Purposeful-testing notes; `zenStore` smoke uses `commitPop`; tighter credits / audio assertions. |
| 2026-04-20 | Achievement tap-to-claim banner: `newlyClaimableAchievementsSince` unit test; shell hosts `AchievementBannerHost` + `rootNavigationRef`. |
