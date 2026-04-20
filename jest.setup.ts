jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

jest.mock('expo-av', () => ({
  Audio: {
    setAudioModeAsync: jest.fn(async () => undefined),
    Sound: {
      createAsync: jest.fn(async () => ({
        sound: {
          setRateAsync: jest.fn(async () => undefined),
          setPositionAsync: jest.fn(async () => undefined),
          playAsync: jest.fn(async () => undefined),
        },
      })),
    },
  },
}));

const mockMmkvStore = new Map<string, string>();

jest.mock('react-native-mmkv', () => ({
  createMMKV: () => ({
    getString: (key: string) => mockMmkvStore.get(key),
    set: (key: string, value: unknown) => {
      mockMmkvStore.set(key, String(value));
    },
    remove: (key: string) => {
      mockMmkvStore.delete(key);
    },
    clearAll: () => {
      mockMmkvStore.clear();
    },
  }),
}));
