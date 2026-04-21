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
  test('respects prestige and comfort tiers', () => {
    expect(earnCreditsPerPop({ prestigeCount: 0, creditsPerPopTier: 0 })).toBe(
      1,
    );
    expect(earnCreditsPerPop({ prestigeCount: 10, creditsPerPopTier: 2 })).toBe(
      Math.floor(2.2 * 1.1),
    );
  });
});

describe('nextTierPrice', () => {
  test('returns null when maxed', () => {
    const def = findUpgrade(UPGRADE_IDS.popSoundMuted)!;
    expect(nextTierPrice(def, 0)).toBe(2400);
    expect(nextTierPrice(def, 1)).toBe(null);
  });
});
