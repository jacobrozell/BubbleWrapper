import { Platform, TurboModuleRegistry } from 'react-native';

/** Nitro loads at import-time in react-native-mmkv v4 — avoid importing MMKV unless native Nitro exists (e.g. Expo Go has no Nitro). */
function isNitroNativeAvailable(): boolean {
  if (Platform.OS === 'web') return false;
  try {
    return TurboModuleRegistry.get('NitroModules') != null;
  } catch {
    return false;
  }
}

export type StorageBackend = {
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

export const backend: StorageBackend =
  createMmkvBackend() ?? createMemoryBackend();
