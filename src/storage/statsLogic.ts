/** UTC calendar day `YYYY-MM-DD` (stable for streak math). */
export function utcDayString(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

export function previousUtcDayString(day: string): string {
  const t = Date.parse(`${day}T12:00:00.000Z`);
  if (Number.isNaN(t)) return day;
  return utcDayString(new Date(t - 86400000));
}

/**
 * Daily streak: increments once per UTC day on first qualifying event.
 * Returns updated streak fields for storage.
 */
export function advanceDailyStreak(args: {
  today: string;
  lastStreakDate: string | null;
  currentStreak: number;
}): { lastStreakDate: string; currentStreak: number } {
  const { today, lastStreakDate, currentStreak } = args;
  if (lastStreakDate === today) {
    return { lastStreakDate: today, currentStreak };
  }
  if (lastStreakDate == null) {
    return { lastStreakDate: today, currentStreak: 1 };
  }
  if (lastStreakDate === previousUtcDayString(today)) {
    return { lastStreakDate: today, currentStreak: currentStreak + 1 };
  }
  return { lastStreakDate: today, currentStreak: 1 };
}
