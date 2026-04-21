import { Platform, TurboModuleRegistry } from 'react-native';

import { advanceDailyStreak, utcDayString } from './statsLogic';

/** Nitro loads at import-time in react-native-mmkv v4 — avoid importing MMKV unless native Nitro exists (e.g. Expo Go has no Nitro). */
function isNitroNativeAvailable(): boolean {
  if (Platform.OS === 'web') return false;
  try {
    return TurboModuleRegistry.get('NitroModules') != null;
  } catch {
    return false;
  }
}

export type ThemeMode = 'light' | 'dark';

const KEYS = {
  lifetimePops: 'lifetimePops',
  sessionStart: 'sessionStart',
  bestStreak: 'bestStreak',
  currentStreak: 'currentStreak',
  lastStreakDate: 'lastStreakDate',
  theme: 'theme',
} as const;

type StorageBackend = {
  getString(key: string): string | undefined;
  set(key: string, value: string | number | boolean): void;
  delete(key: string): void;
  clearAll?: () => void;
};

function createMemoryBackend(): StorageBackend {
  const map = new Map<string, string>();
  return {
    getString(key) {
      return map.get(key);
    },
    set(key, value) {
      map.set(key, String(value));
    },
    delete(key) {
      map.delete(key);
    },
    clearAll() {
      map.clear();
    },
  };
}

function createMmkvBackend(): StorageBackend | null {
  if (Platform.OS === 'web') return null;
  if (!isNitroNativeAvailable()) return null;
  try {
    const { createMMKV } =
      require('react-native-mmkv') as typeof import('react-native-mmkv');
    const mmkv = createMMKV({ id: 'pop-breathe' });
    return {
      getString: (key) => mmkv.getString(key),
      set: (key, value) => {
        mmkv.set(key, typeof value === 'string' ? value : String(value));
      },
      delete: (key) => {
        mmkv.remove(key);
      },
      clearAll: () => {
        mmkv.clearAll();
      },
    };
  } catch {
    return null;
  }
}

const backend: StorageBackend = createMmkvBackend() ?? createMemoryBackend();

const listeners = new Set<() => void>();

function emit(): void {
  for (const l of listeners) l();
}

export function subscribeZenStore(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Clears persisted keys for automated tests. */
export function resetZenStoreForTests(): void {
  if (backend.clearAll) backend.clearAll();
  else (Object.values(KEYS) as string[]).forEach((key) => backend.delete(key));
  emit();
}

function readNumber(key: string, fallback = 0): number {
  const raw = backend.getString(key);
  if (raw == null || raw === '') return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

function readString(key: string): string | undefined {
  return backend.getString(key);
}

function writeNumber(key: string, value: number): void {
  backend.set(key, value);
}

function writeString(key: string, value: string): void {
  backend.set(key, value);
}

export function getStatsSnapshot(): {
  lifetimePops: number;
  sessionStart: number | null;
  bestStreak: number;
  currentStreak: number;
  lastStreakDate: string | null;
} {
  const sessionRaw = backend.getString(KEYS.sessionStart);
  const sessionStart =
    sessionRaw == null || sessionRaw === ''
      ? null
      : Number(sessionRaw);
  return {
    lifetimePops: readNumber(KEYS.lifetimePops, 0),
    sessionStart:
      sessionStart != null && Number.isFinite(sessionStart)
        ? sessionStart
        : null,
    bestStreak: readNumber(KEYS.bestStreak, 0),
    currentStreak: readNumber(KEYS.currentStreak, 0),
    lastStreakDate: readString(KEYS.lastStreakDate) ?? null,
  };
}

export function getTheme(): ThemeMode {
  const t = readString(KEYS.theme);
  return t === 'dark' ? 'dark' : 'light';
}

export function setTheme(theme: ThemeMode): void {
  writeString(KEYS.theme, theme);
  emit();
}

export function recordPop(now = Date.now()): void {
  const pops = readNumber(KEYS.lifetimePops, 0) + 1;
  writeNumber(KEYS.lifetimePops, pops);

  if (readString(KEYS.sessionStart) == null) {
    writeNumber(KEYS.sessionStart, now);
  }

  const today = utcDayString(new Date(now));
  const lastStreakDate = readString(KEYS.lastStreakDate) ?? null;
  const currentStreak = readNumber(KEYS.currentStreak, 0);
  const next = advanceDailyStreak({ today, lastStreakDate, currentStreak });
  writeString(KEYS.lastStreakDate, next.lastStreakDate);
  writeNumber(KEYS.currentStreak, next.currentStreak);

  const best = readNumber(KEYS.bestStreak, 0);
  if (next.currentStreak > best) {
    writeNumber(KEYS.bestStreak, next.currentStreak);
  }

  emit();
}
