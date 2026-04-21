import { findUpgrade, UPGRADE_IDS } from '../../src/content/upgrades';
import {
  earnCreditsPerPop,
  nextTierPrice,
  prestigeMultiplierDeltaNext,
  prestigeMultiplierFromCount,
  quotaForCompany,
} from '../../src/economy/formulas';

describe('quotaForCompany', () => {
  test('linear placeholder', () => {
    expect(quotaForCompany(0)).toBe(350);
    expect(quotaForCompany(1)).toBe(400);
    expect(quotaForCompany(10)).toBe(850);
  });

  test('floors negative index to 0', () => {
    expect(quotaForCompany(-3)).toBe(350);
  });
});

describe('prestigeMultiplierFromCount', () => {
  test('starts at 1', () => {
    expect(prestigeMultiplierFromCount(0)).toBe(1);
  });

  test('increments by 12% per prestige before cap', () => {
    expect(prestigeMultiplierFromCount(1)).toBeCloseTo(1.12, 5);
    expect(prestigeMultiplierFromCount(5)).toBeCloseTo(1.6, 5);
  });

  test('caps total bonus at +200%', () => {
    expect(prestigeMultiplierFromCount(100)).toBe(3);
  });
});

describe('prestigeMultiplierDeltaNext', () => {
  test('reports incremental gain', () => {
    expect(prestigeMultiplierDeltaNext(0)).toBeCloseTo(0.12, 5);
  });
});

describe('earnCreditsPerPop', () => {
  test('base case is 1 credit at zero prestige and no comfort tiers', () => {
    expect(earnCreditsPerPop({ prestigeCount: 0, creditsPerPopTier: 0 })).toBe(1);
  });

  test('floors prestige multiplier × comfort bonus (e.g. 2.2 × 1.1 → 2)', () => {
    // prestigeMultiplierFromCount(10)=2.2, tier 2 → comfort 1.1 → floor(2.42)=2
    expect(earnCreditsPerPop({ prestigeCount: 10, creditsPerPopTier: 2 })).toBe(2);
  });
});

describe('nextTierPrice', () => {
  test('returns null when maxed', () => {
    const def = findUpgrade(UPGRADE_IDS.popSoundMuted)!;
    expect(nextTierPrice(def, 0)).toBe(2400);
    expect(nextTierPrice(def, 1)).toBe(null);
  });
});
