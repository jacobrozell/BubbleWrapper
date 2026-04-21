import {
  buildContractOffers,
  mixOfferSeed,
  quotaOffsetsPermutation,
  recommendedOfferIndex,
} from '../../src/content/offerGeneration';

describe('offerGeneration', () => {
  test('buildContractOffers is deterministic for same inputs', () => {
    const a = buildContractOffers({
      companyIndexAtComplete: 2,
      lifetimeContractsCompleted: 5,
      prestigeCount: 0,
    });
    const b = buildContractOffers({
      companyIndexAtComplete: 2,
      lifetimeContractsCompleted: 5,
      prestigeCount: 0,
    });
    expect(a).toEqual(b);
  });

  test('buildContractOffers returns three distinct next indices cur+1..+3', () => {
    const cur = 4;
    const offers = buildContractOffers({
      companyIndexAtComplete: cur,
      lifetimeContractsCompleted: 1,
      prestigeCount: 0,
    });
    expect(offers).toHaveLength(3);
    const idx = offers.map((o) => o.companyIndex).sort((x, y) => x - y);
    expect(idx).toEqual([cur + 1, cur + 2, cur + 3]);
    for (const o of offers) {
      expect(o.modifierIds).toEqual([]);
    }
  });

  test('recommendedOfferIndex picks lowest companyIndex', () => {
    const offers = [
      { companyIndex: 7, modifierIds: [] as string[] },
      { companyIndex: 5, modifierIds: [] },
      { companyIndex: 6, modifierIds: [] },
    ];
    expect(recommendedOfferIndex(offers)).toBe(1);
  });

  test('mixOfferSeed changes with any input dimension', () => {
    const base = mixOfferSeed(0, 0, 0);
    expect(mixOfferSeed(1, 0, 0)).not.toBe(base);
    expect(mixOfferSeed(0, 1, 0)).not.toBe(base);
    expect(mixOfferSeed(0, 0, 1)).not.toBe(base);
  });

  test('quotaOffsetsPermutation is a permutation of 1,2,3', () => {
    for (let seed = 0; seed < 50; seed++) {
      const p = quotaOffsetsPermutation(seed);
      const sorted = [...p].sort((a, b) => a - b);
      expect(sorted).toEqual([1, 2, 3]);
    }
  });
});
