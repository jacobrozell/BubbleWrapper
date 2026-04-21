/**
 * MVP achievements: grant **Flair** when the player claims them on Progress
 * (threshold must be met first). Long-term Phase 3: sector tags, ladders.
 */
export type AchievementMvpDef =
  | {
      id: string;
      title: string;
      description: string;
      track: 'lifetime_pops';
      threshold: number;
      rewardFlair: number;
    }
  | {
      id: string;
      title: string;
      description: string;
      track: 'visited_progress';
      rewardFlair: number;
    }
  | {
      id: string;
      title: string;
      description: string;
      track: 'visited_shop';
      rewardFlair: number;
    }
  | {
      id: string;
      title: string;
      description: string;
      track: 'lifetime_contracts';
      threshold: number;
      rewardFlair: number;
    };

export const ACHIEVEMENT_MVP: AchievementMvpDef[] = [
  {
    id: 'first_pop',
    title: 'First pop',
    description: 'Pop any bubble once.',
    track: 'lifetime_pops',
    threshold: 1,
    rewardFlair: 9,
  },
  {
    id: 'visited_progress',
    title: 'Paperwork filed',
    description: 'Open the Progress tab.',
    track: 'visited_progress',
    rewardFlair: 8,
  },
  {
    id: 'visited_shop',
    title: 'Procurement visit',
    description: 'Open the Shop tab.',
    track: 'visited_shop',
    rewardFlair: 8,
  },
  {
    id: 'first_contract',
    title: 'First shipment out the door',
    description: 'Complete one client contract.',
    track: 'lifetime_contracts',
    threshold: 1,
    rewardFlair: 25,
  },
  {
    id: 'ten_contracts',
    title: 'Department regular',
    description: 'Complete 10 client contracts (lifetime).',
    track: 'lifetime_contracts',
    threshold: 10,
    rewardFlair: 40,
  },
];
