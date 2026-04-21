# Cross-platform (Pop & Breathe)

## Supported targets

- **Production:** **iOS** and **Android** only.
- **Web:** **development preview only** — convenient for quick layout or shared JS checks in the browser. No store release, no parity SLA, and native-only modules may no-op, throw, or behave differently.

## Native (iOS vs Android)

Document or decide explicitly when behavior diverges:

| Area | Notes |
|------|--------|
| **Persistence** | `react-native-mmkv` is native-first; behavior on web is not a product concern (see Web below). |
| **Haptics** | `expo-haptics` — intensity and availability differ by OS; document if you add OS-specific tuning. |
| **Audio** | `expo-av` — permissions, background audio, and autoplay policies differ; note any capability flags in iOS/Android project config. |
| **Safe area** | Notches, Android display cutouts, keyboard — use `react-native-safe-area-context` consistently; call out any screen that opts out. |
| **Back behavior** | Android hardware back vs iOS gesture — align with React Navigation where it matters. |

**Code organization:** Keep platform-specific branching mostly in UI (`src/screens/`, `src/components/`). Prefer small helpers (e.g. haptics, audio wrappers) over scattered `Platform.OS` checks. Use `*.ios.tsx` / `*.android.tsx` when layout or APIs truly diverge.

**Builds:** Document EAS (or bare) profiles, env vars, and anything in `app.json` / `app.config.*` that differs per platform (e.g. audio background modes).

## Web (dev only)

- **Run:** `npm run web` (Expo) when you need a browser preview.
- **Expectations:** Feature parity with native is **not** required. Only requirement is “useful enough to not block local iteration” — if web crashes on boot, a small guard (e.g. skip or stub native-only init when `Platform.OS === 'web'`) is acceptable; avoid building a full web storage stack unless dev preview depends on it.
- **Typical gaps:** MMKV, haptics, and other native modules may be missing or limited on web; do not treat web-only breakages as release blockers.

## CI / quality

- **CI:** Lint and tests (Node/Jest) are the shared gate. **Dedicated web export/build is optional** while web stays dev-only.
- When upgrading **Reanimated**, **Gesture Handler**, **FlashList**, or other native-heavy deps, sanity-check **both** iOS and Android after upgrade.

## Related

- Layer boundaries: `.cursor/rules/architecture-layers.mdc`
- Repo dev setup: `README.md`
