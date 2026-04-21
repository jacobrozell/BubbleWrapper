import type { UpgradeDef } from '../content/upgrades';

/** Pops required for contract at this company index (placeholder curve). */
export function quotaForCompany(companyIndex: number): number {
  const n = Math.max(0, Math.floor(companyIndex));
  return 350 + 50 * n;
}

/**
 * Prestige multiplier applied to Credit earn (and display).
 * f(n)=0.12*n per prestige, total bonus capped at +200% => multiplier cap 3.
 */
export function prestigeMultiplierFromCount(prestigeCount: number): number {
  const n = Math.max(0, prestigeCount);
  return 1 + Math.min(0.12 * n, 2);
}

/** Delta multiplier after one more prestige (for Progress UI). */
export function prestigeMultiplierDeltaNext(prestigeCount: number): number {
  const cur = prestigeMultiplierFromCount(prestigeCount);
  const next = prestigeMultiplierFromCount(prestigeCount + 1);
  return next - cur;
}

export type EarnCreditsInput = {
  prestigeCount: number;
  /** Number of purchased tiers for credits_per_pop upgrade. */
  creditsPerPopTier: number;
};

/**
 * Credits earned per successful pop.
 * Base 1 × prestigeMultiplier × (1 + 0.05 per comfort tier).
 */
export function earnCreditsPerPop(input: EarnCreditsInput): number {
  const mult = prestigeMultiplierFromCount(input.prestigeCount);
  const tier = Math.max(0, Math.floor(input.creditsPerPopTier));
  const comfort = 1 + 0.05 * tier;
  return Math.max(1, Math.floor(1 * mult * comfort));
}

/** Stub: flat bonus when advancing company (product can replace). */
export function contractCompletionCreditsBonus(): number {
  return 0;
}

export function nextTierPrice(
  def: UpgradeDef,
  ownedTierCount: number,
): number | null {
  if (ownedTierCount >= def.tiers.length) return null;
  return def.tiers[ownedTierCount]!.priceCredits;
}
