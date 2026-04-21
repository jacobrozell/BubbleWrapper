import { ACHIEVEMENT_MVP } from '../../src/content/achievementsMvp';
import {
  achievementMet,
  claimableAchievements,
  newlyClaimableAchievementsSince,
  totalRewardFlair,
} from '../../src/economy/achievementsMvpLogic';

const base = {
  lifetimeContractsCompleted: 0,
  lifetimePops: 0,
  visitedProgress: false,
  visitedShop: false,
};

describe('achievementsMvpLogic', () => {
  test('claimableAchievements respects contract thresholds and claimed set', () => {
    const claimed = new Set<string>();
    const first = claimableAchievements(
      ACHIEVEMENT_MVP,
      { ...base, lifetimeContractsCompleted: 1 },
      claimed,
    );
    expect(new Set(first.map((x) => x.id))).toEqual(new Set(['first_contract']));
    expect(totalRewardFlair(first)).toBe(25);

    claimed.add('first_contract');
    const none = claimableAchievements(
      ACHIEVEMENT_MVP,
      { ...base, lifetimeContractsCompleted: 1 },
      claimed,
    );
    expect(none.map((x) => x.id)).not.toContain('first_contract');
  });

  test('first pop unlocks only pop achievement when tabs not visited', () => {
    const claimed = new Set<string>();
    const row = claimableAchievements(
      ACHIEVEMENT_MVP,
      { ...base, lifetimePops: 1 },
      claimed,
    );
    expect(row.map((x) => x.id)).toEqual(['first_pop']);
    expect(totalRewardFlair(row)).toBe(9);
  });

  test('onboarding trio grants 25 flair total', () => {
    const claimed = new Set<string>();
    const row = claimableAchievements(
      ACHIEVEMENT_MVP,
      { ...base, lifetimePops: 1, visitedProgress: true, visitedShop: true },
      claimed,
    );
    expect(new Set(row.map((x) => x.id))).toEqual(
      new Set(['first_pop', 'visited_progress', 'visited_shop']),
    );
    expect(totalRewardFlair(row)).toBe(25);
  });

  test('ten contracts achievement', () => {
    const claimed = new Set(['first_contract']);
    const ten = claimableAchievements(
      ACHIEVEMENT_MVP,
      { ...base, lifetimeContractsCompleted: 10 },
      claimed,
    );
    expect(ten.map((x) => x.id)).toEqual(['ten_contracts']);
  });

  test('achievementMet is exhaustive per track', () => {
    for (const d of ACHIEVEMENT_MVP) {
      expect(typeof achievementMet(d, base)).toBe('boolean');
    }
  });

  test('newlyClaimableAchievementsSince returns only new ids in definition order', () => {
    const claimed = new Set<string>();
    const input = {
      ...base,
      lifetimePops: 1,
      visitedProgress: true,
      visitedShop: true,
    };
    const prev = new Set<string>();
    const fresh = newlyClaimableAchievementsSince(
      ACHIEVEMENT_MVP,
      prev,
      input,
      claimed,
    );
    expect(fresh.map((d) => d.id)).toEqual([
      'first_pop',
      'visited_progress',
      'visited_shop',
    ]);

    const afterFirst = new Set(['first_pop']);
    const onlyTabs = newlyClaimableAchievementsSince(
      ACHIEVEMENT_MVP,
      afterFirst,
      input,
      claimed,
    );
    expect(onlyTabs.map((d) => d.id)).toEqual([
      'visited_progress',
      'visited_shop',
    ]);
  });
});
