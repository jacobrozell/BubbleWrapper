import {
  getStatsSnapshot,
  getTheme,
  recordPop,
  resetZenStoreForTests,
  setTheme,
} from '../src/storage/zenStore';

describe('zenStore', () => {
  beforeEach(() => {
    resetZenStoreForTests();
  });

  test('recordPop increments lifetime pops and sets session start once', () => {
    recordPop(1_000);
    const s1 = getStatsSnapshot();
    expect(s1.lifetimePops).toBe(1);
    expect(s1.sessionStart).toBe(1_000);

    recordPop(2_000);
    const s2 = getStatsSnapshot();
    expect(s2.lifetimePops).toBe(2);
    expect(s2.sessionStart).toBe(1_000);
  });

  test('setTheme persists and is readable', () => {
    setTheme('dark');
    expect(getTheme()).toBe('dark');
  });
});
