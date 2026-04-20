import {
  advanceDailyStreak,
  previousUtcDayString,
  utcDayString,
} from '../src/storage/statsLogic';

describe('statsLogic', () => {
  test('utcDayString is stable UTC day format', () => {
    expect(utcDayString(new Date('2026-04-20T03:00:00.000Z'))).toBe('2026-04-20');
  });

  test('previousUtcDayString steps back one day', () => {
    expect(previousUtcDayString('2026-04-20')).toBe('2026-04-19');
  });

  test('advanceDailyStreak increments once per day', () => {
    const first = advanceDailyStreak({
      today: '2026-04-20',
      lastStreakDate: null,
      currentStreak: 0,
    });
    expect(first).toEqual({ lastStreakDate: '2026-04-20', currentStreak: 1 });

    const sameDay = advanceDailyStreak({
      today: '2026-04-20',
      lastStreakDate: '2026-04-20',
      currentStreak: 1,
    });
    expect(sameDay).toEqual({ lastStreakDate: '2026-04-20', currentStreak: 1 });
  });

  test('advanceDailyStreak continues across consecutive days', () => {
    const next = advanceDailyStreak({
      today: '2026-04-21',
      lastStreakDate: '2026-04-20',
      currentStreak: 3,
    });
    expect(next).toEqual({ lastStreakDate: '2026-04-21', currentStreak: 4 });
  });

  test('advanceDailyStreak resets after a gap', () => {
    const reset = advanceDailyStreak({
      today: '2026-04-21',
      lastStreakDate: '2026-04-18',
      currentStreak: 9,
    });
    expect(reset).toEqual({ lastStreakDate: '2026-04-21', currentStreak: 1 });
  });
});
