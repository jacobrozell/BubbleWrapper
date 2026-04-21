import type { AchievementMvpDef } from '../content/achievementsMvp';

export type AchievementProgressInput = {
  lifetimeContractsCompleted: number;
  lifetimePops: number;
  visitedProgress: boolean;
  visitedShop: boolean;
};

export function achievementMet(
  def: AchievementMvpDef,
  input: AchievementProgressInput,
): boolean {
  switch (def.track) {
    case 'lifetime_contracts':
      return input.lifetimeContractsCompleted >= def.threshold;
    case 'lifetime_pops':
      return input.lifetimePops >= def.threshold;
    case 'visited_progress':
      return input.visitedProgress;
    case 'visited_shop':
      return input.visitedShop;
  }
}

export function claimableAchievements(
  defs: readonly AchievementMvpDef[],
  input: AchievementProgressInput,
  claimedIds: ReadonlySet<string>,
): AchievementMvpDef[] {
  return defs.filter(
    (d) => achievementMet(d, input) && !claimedIds.has(d.id),
  );
}

/** Claimable defs that were not in the previous eligible id set (definition order). */
export function newlyClaimableAchievementsSince(
  defs: readonly AchievementMvpDef[],
  prevEligibleIds: ReadonlySet<string>,
  input: AchievementProgressInput,
  claimedIds: ReadonlySet<string>,
): AchievementMvpDef[] {
  return claimableAchievements(defs, input, claimedIds).filter(
    (d) => !prevEligibleIds.has(d.id),
  );
}

export function totalRewardFlair(defs: readonly AchievementMvpDef[]): number {
  return defs.reduce((sum, d) => sum + d.rewardFlair, 0);
}

/** Progress UI: current value, goal, and unit label for the meter line. */
export function achievementProgressParts(
  def: AchievementMvpDef,
  input: AchievementProgressInput,
): { current: number; target: number; unit: string } | null {
  switch (def.track) {
    case 'lifetime_contracts':
      return {
        current: Math.min(
          input.lifetimeContractsCompleted,
          def.threshold,
        ),
        target: def.threshold,
        unit: 'contracts',
      };
    case 'lifetime_pops':
      return {
        current: Math.min(input.lifetimePops, def.threshold),
        target: def.threshold,
        unit: 'pops',
      };
    case 'visited_progress':
      return {
        current: input.visitedProgress ? 1 : 0,
        target: 1,
        unit: 'visit',
      };
    case 'visited_shop':
      return {
        current: input.visitedShop ? 1 : 0,
        target: 1,
        unit: 'visit',
      };
  }
}
