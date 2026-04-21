/**
 * Stable upgrade IDs for persistence across app versions.
 * Tiers: index 0 = first purchase, then sequential.
 */
export type UpgradeCategory = 'comfort' | 'sensory' | 'cosmetic';

export type UpgradeTierDef = {
  priceCredits: number;
  effectLabel: string;
};

export type UpgradeDef = {
  id: string;
  title: string;
  category: UpgradeCategory;
  tiers: UpgradeTierDef[];
};

export const UPGRADE_IDS = {
  creditsPerPop: 'credits_per_pop',
  touchTarget: 'touch_target',
  popSoundMuted: 'pop_sound_muted',
  trayCorporateDark: 'tray_corporate_dark',
} as const;

export const UPGRADES: UpgradeDef[] = [
  {
    id: UPGRADE_IDS.creditsPerPop,
    title: 'Contract efficiency',
    category: 'comfort',
    tiers: [
      { priceCredits: 500, effectLabel: '+5% Credits per pop' },
      { priceCredits: 2500, effectLabel: '+5% more (stacked)' },
      { priceCredits: 8000, effectLabel: '+5% more (stacked)' },
    ],
  },
  {
    id: UPGRADE_IDS.touchTarget,
    title: 'Bigger touch target',
    category: 'comfort',
    tiers: [
      { priceCredits: 800, effectLabel: '+4pt hit slop' },
      { priceCredits: 3200, effectLabel: '+4pt more' },
    ],
  },
  {
    id: UPGRADE_IDS.popSoundMuted,
    title: 'Muted pop layer',
    category: 'sensory',
    tiers: [{ priceCredits: 2400, effectLabel: 'Quieter accent layer' }],
  },
  {
    id: UPGRADE_IDS.trayCorporateDark,
    title: 'Corporate Dark tray',
    category: 'cosmetic',
    tiers: [{ priceCredits: 5000, effectLabel: 'Executive rim finish' }],
  },
];

export function findUpgrade(id: string): UpgradeDef | undefined {
  return UPGRADES.find((u) => u.id === id);
}
