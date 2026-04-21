import {
  commitPop,
  getStatsSnapshot,
  getTheme,
  resetZenStoreForTests,
  setTheme,
} from '../src/storage/zenStore';

describe('zenStore', () => {
  beforeEach(() => {
    resetZenStoreForTests();
  });

  test('commitPop increments lifetime pops and freezes session start after first pop', () => {
    commitPop(1_000);
    const s1 = getStatsSnapshot();
    expect(s1.lifetimePops).toBe(1);
    expect(s1.sessionStart).toBe(1_000);

    commitPop(2_000);
    const s2 = getStatsSnapshot();
    expect(s2.lifetimePops).toBe(2);
    expect(s2.sessionStart).toBe(1_000);
  });

  test('setTheme persists and is readable', () => {
    setTheme('dark');
    expect(getTheme()).toBe('dark');
  });
});
