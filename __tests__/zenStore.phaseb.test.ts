import { COSMETIC_IDS } from '../src/content/cosmetics';
import { UPGRADE_IDS } from '../src/content/upgrades';
import * as formulas from '../src/economy/formulas';
import {
  advanceCompany,
  advanceCompanyWithSelection,
  commitPop,
  confirmPrestige,
  getGameSnapshot,
  purchaseCosmetic,
  purchaseUpgrade,
  refreshSheetOnly,
  resetZenStoreForTests,
  synchronizePendingContractOffers,
} from '../src/storage/zenStore';

describe('zenStore Phase B', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    resetZenStoreForTests();
  });

  test('contract completes at quota and commitPop no-ops after', () => {
    jest.spyOn(formulas, 'quotaForCompany').mockReturnValue(2);
    commitPop(1_000);
    commitPop(2_000);
    const g = getGameSnapshot();
    expect(g.contractComplete).toBe(true);
    expect(g.popsThisContract).toBe(2);
    expect(g.lifetimePops).toBe(2);
    commitPop(3_000);
    expect(getGameSnapshot().lifetimePops).toBe(2);
  });

  test('advanceCompany clears contract and increments index', () => {
    jest.spyOn(formulas, 'quotaForCompany').mockReturnValue(1);
    commitPop(1_000);
    expect(getGameSnapshot().contractComplete).toBe(true);
    advanceCompany();
    const g = getGameSnapshot();
    expect(g.contractComplete).toBe(false);
    expect(g.companyIndex).toBe(1);
    expect(g.popsThisContract).toBe(0);
    expect(g.companiesCompleted).toBe(1);
  });

  test('advanceCompanyWithSelection sets companyIndex from chosen offer', () => {
    jest.spyOn(formulas, 'quotaForCompany').mockReturnValue(1);
    commitPop(1_000);
    synchronizePendingContractOffers();
    const offers = getGameSnapshot().pendingContractOffers;
    expect(offers).toHaveLength(3);
    const hardest = offers.reduce((a, b) => (a.companyIndex > b.companyIndex ? a : b));
    const hardestIdx = offers.findIndex((o) => o.companyIndex === hardest.companyIndex);
    advanceCompanyWithSelection(hardestIdx);
    expect(getGameSnapshot().companyIndex).toBe(hardest.companyIndex);
  });

  test('refreshSheetOnly bumps sheet reset without changing contract', () => {
    jest.spyOn(formulas, 'quotaForCompany').mockReturnValue(10);
    commitPop(1_000);
    const before = getGameSnapshot();
    const v0 = before.sheetResetVersion;
    refreshSheetOnly();
    const after = getGameSnapshot();
    expect(after.sheetResetVersion).toBe(v0 + 1);
    expect(after.popsThisContract).toBe(before.popsThisContract);
    expect(after.companyIndex).toBe(before.companyIndex);
  });

  test('advanceCompany grants Flair for first-contract achievement', () => {
    jest.spyOn(formulas, 'quotaForCompany').mockReturnValue(1);
    commitPop(1_000);
    advanceCompany();
    const g = getGameSnapshot();
    expect(g.flair).toBe(30);
    expect(g.lifetimeContractsCompleted).toBe(1);
    expect(g.claimedAchievementIds).toContain('first_contract');
  });

  test('cosmetic purchase spends Flair and survives prestige', () => {
    jest.spyOn(formulas, 'quotaForCompany').mockReturnValue(1);
    commitPop(1_000);
    advanceCompany();
    expect(purchaseCosmetic(COSMETIC_IDS.bubbleOutlineBlue)).toBe('ok');
    const mid = getGameSnapshot();
    expect(mid.flair).toBe(5);
    expect(mid.hasBlueBubbleOutline).toBe(true);

    jest.spyOn(formulas, 'earnCreditsPerPop').mockReturnValue(10_000);
    commitPop(2_000);
    expect(purchaseUpgrade(UPGRADE_IDS.creditsPerPop)).toBe('ok');
    confirmPrestige();
    const g = getGameSnapshot();
    expect(g.prestigeCount).toBe(1);
    expect(g.credits).toBe(0);
    expect(g.ownedUpgrades[UPGRADE_IDS.creditsPerPop] ?? 0).toBe(0);
    expect(g.flair).toBe(5);
    expect(g.hasBlueBubbleOutline).toBe(true);
    expect(g.lifetimeContractsCompleted).toBe(1);
  });

  test('purchaseUpgrade deducts credits and prestige hard-resets', () => {
    jest.spyOn(formulas, 'earnCreditsPerPop').mockReturnValue(10_000);
    commitPop(1_000);
    expect(purchaseUpgrade(UPGRADE_IDS.creditsPerPop)).toBe('ok');
    // First credits_per_pop tier costs 500 (see upgrades content).
    expect(getGameSnapshot().credits).toBe(9_500);
    confirmPrestige();
    const g = getGameSnapshot();
    expect(g.prestigeCount).toBe(1);
    expect(g.credits).toBe(0);
    expect(g.companyIndex).toBe(0);
    expect(g.ownedUpgrades[UPGRADE_IDS.creditsPerPop] ?? 0).toBe(0);
    expect(g.companiesCompleted).toBe(0);
    expect(g.lifetimePops).toBe(1);
  });
});
