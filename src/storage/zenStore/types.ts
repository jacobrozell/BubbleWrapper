import type { ContractOffer } from '../../content/offerGeneration';

export type ThemeMode = 'light' | 'dark';

export type StatsSnapshot = {
  lifetimePops: number;
  sessionStart: number | null;
  bestStreak: number;
  currentStreak: number;
  lastStreakDate: string | null;
};

export type GameSnapshot = StatsSnapshot & {
  credits: number;
  companyIndex: number;
  companyName: string;
  flavorLine: string;
  quotaPops: number;
  popsThisContract: number;
  contractComplete: boolean;
  prestigeCount: number;
  prestigeMultiplier: number;
  prestigeNextDelta: number;
  companiesCompleted: number;
  sheetResetVersion: number;
  ownedUpgrades: Record<string, number>;
  hasSeenPrestigeExplainer: boolean;
  hapticsEnabled: boolean;
  soundEnabled: boolean;
  touchTargetTier: number;
  creditsPerPopTier: number;
  traySkinId: string | null;
  popSoundMutedOwned: boolean;
  flair: number;
  lifetimeContractsCompleted: number;
  ownedCosmetics: Record<string, number>;
  claimedAchievementIds: string[];
  hasBlueBubbleOutline: boolean;
  /** Cosmetic: custom unpopped bubble fill (#RRGGBB). Empty string = theme default. */
  bubbleTintHex: string;
  visitedProgressTab: boolean;
  visitedShopTab: boolean;
  pendingContractOffers: ContractOffer[];
  selectedOfferIndex: number;
  recommendedOfferIndex: number;
  activeModifierIds: string[];
};

export type PurchaseResult = 'ok' | 'maxed' | 'unaffordable' | 'unknown';

export type CosmeticPurchaseResult =
  | 'ok'
  | 'owned'
  | 'unaffordable'
  | 'unknown';
