import type { AchievementMvpDef } from '../content/achievementsMvp';

export function claimableAchievements(
  defs: readonly AchievementMvpDef[],
  lifetimeContractsCompleted: number,
  claimedIds: ReadonlySet<string>,
): AchievementMvpDef[] {
  return defs.filter(
    (d) =>
      lifetimeContractsCompleted >= d.thresholdLifetimeContracts &&
      !claimedIds.has(d.id),
  );
}

export function totalRewardFlair(defs: readonly AchievementMvpDef[]): number {
  return defs.reduce((sum, d) => sum + d.rewardFlair, 0);
}
