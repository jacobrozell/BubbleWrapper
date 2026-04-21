import { ACHIEVEMENT_MVP } from '../../src/content/achievementsMvp';
import {
  claimableAchievements,
  totalRewardFlair,
} from '../../src/economy/achievementsMvpLogic';

describe('achievementsMvpLogic', () => {
  test('claimableAchievements respects thresholds and claimed set', () => {
    const claimed = new Set<string>();
    const first = claimableAchievements(ACHIEVEMENT_MVP, 1, claimed);
    expect(first.map((x) => x.id)).toEqual(['first_contract']);
    expect(totalRewardFlair(first)).toBe(30);

    claimed.add('first_contract');
    const none = claimableAchievements(ACHIEVEMENT_MVP, 1, claimed);
    expect(none).toEqual([]);

    const ten = claimableAchievements(ACHIEVEMENT_MVP, 10, new Set(['first_contract']));
    expect(ten.map((x) => x.id)).toEqual(['ten_contracts']);
  });
});
