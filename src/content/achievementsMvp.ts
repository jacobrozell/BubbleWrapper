/**
 * MVP achievements: grant **Flair** on unlock (auto-claim when threshold met).
 * Long-term Phase 3: sector tags, ladders, Progress UI polish.
 */
export type AchievementMvpDef = {
  id: string;
  title: string;
  description: string;
  /** Fires when lifetime contracts completed (all-time, not reset by prestige) reaches this. */
  thresholdLifetimeContracts: number;
  rewardFlair: number;
};

export const ACHIEVEMENT_MVP: AchievementMvpDef[] = [
  {
    id: 'first_contract',
    title: 'First shipment out the door',
    description: 'Complete one client contract.',
    thresholdLifetimeContracts: 1,
    rewardFlair: 30,
  },
  {
    id: 'ten_contracts',
    title: 'Department regular',
    description: 'Complete 10 client contracts (lifetime).',
    thresholdLifetimeContracts: 10,
    rewardFlair: 40,
  },
];
