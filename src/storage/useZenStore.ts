import { useMemo, useSyncExternalStore } from 'react';

import {
  getGameSnapshot,
  getTheme,
  getZenStoreGeneration,
  subscribeZenStore,
  type GameSnapshot,
  type ThemeMode,
} from './zenStore';

/**
 * Single React subscription to the zen store: re-renders when persistence emits.
 * Prefer this over ad-hoc `useEffect(() => subscribeZenStore(...))` in screens.
 */
export function useZenStore(): {
  game: GameSnapshot;
  themeMode: ThemeMode;
} {
  const generation = useSyncExternalStore(
    subscribeZenStore,
    getZenStoreGeneration,
    getZenStoreGeneration,
  );

  return useMemo(
    () => ({
      game: getGameSnapshot(),
      themeMode: getTheme(),
    }),
    // `generation` is the external-store epoch from MMKV emits (getters are not deps).
    // eslint-disable-next-line react-hooks/exhaustive-deps -- generation invalidates snapshot
    [generation],
  );
}
