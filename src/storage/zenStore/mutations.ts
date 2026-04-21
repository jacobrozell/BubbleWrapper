import { COSMETIC_IDS, findCosmetic } from '../../content/cosmetics';
import {
  buildContractOffers,
  recommendedOfferIndex,
} from '../../content/offerGeneration';
import { aggregateModifierEffects } from '../../content/runModifiers';
import { findUpgrade } from '../../content/upgrades';
import {
  contractCompletionCreditsBonus,
  earnCreditsPerPop,
  quotaForCompany,
} from '../../economy/formulas';

import { ACHIEVEMENT_MVP } from '../../content/achievementsMvp';
import { achievementMet } from '../../economy/achievementsMvpLogic';
import { advanceDailyStreak, utcDayString } from '../statsLogic';

import { backend } from './backend';
import {
  bumpSheetReset,
  ensurePhase3EconomyMigration,
  parseContractOffersJson,
  readAchievementProgressInput,
  readActiveModifierIds,
  readClaimedAchievementsSet,
  readPendingContractOffers,
  readOwnedCosmetics,
  readOwnedUpgrades,
  writeClaimedAchievementsSet,
  writeOwnedCosmetics,
  writeOwnedUpgrades,
} from './helpers';
import { KEYS } from './keys';
import { readNumber, readString, writeNumber, writeString } from './io';
import { emit } from './subscription';
import type {
  CosmeticPurchaseResult,
  PurchaseResult,
  ThemeMode,
} from './types';

export function setTheme(theme: ThemeMode): void {
  writeString(KEYS.theme, theme);
  emit();
}

export function setHapticsEnabled(enabled: boolean): void {
  writeNumber(KEYS.hapticsEnabled, enabled ? 1 : 0);
  emit();
}

export function getHapticsEnabled(): boolean {
  return readNumber(KEYS.hapticsEnabled, 1) === 1;
}

export function setSoundEnabled(enabled: boolean): void {
  writeNumber(KEYS.soundEnabled, enabled ? 1 : 0);
  emit();
}

export function getSoundEnabled(): boolean {
  return readNumber(KEYS.soundEnabled, 1) === 1;
}

export function setHasSeenPrestigeExplainer(seen: boolean): void {
  writeNumber(KEYS.hasSeenPrestigeExplainer, seen ? 1 : 0);
  emit();
}

export function recordProgressTabOpened(): void {
  ensurePhase3EconomyMigration();
  if (readNumber(KEYS.visitedProgressTab, 0) === 1) {
    return;
  }
  writeNumber(KEYS.visitedProgressTab, 1);
  emit();
}

export function recordShopTabOpened(): void {
  ensurePhase3EconomyMigration();
  if (readNumber(KEYS.visitedShopTab, 0) === 1) {
    return;
  }
  writeNumber(KEYS.visitedShopTab, 1);
  emit();
}

const HEX6 = /^#[0-9a-fA-F]{6}$/;

export function setBubbleTintHex(hex: string): void {
  ensurePhase3EconomyMigration();
  const owned = readOwnedCosmetics();
  if ((owned[COSMETIC_IDS.bubbleTint] ?? 0) < 1) {
    return;
  }
  const next = HEX6.test(hex) ? hex : '';
  writeString(KEYS.bubbleTintHex, next);
  emit();
}

export function setBubbleOutlineHex(hex: string): void {
  ensurePhase3EconomyMigration();
  const owned = readOwnedCosmetics();
  if ((owned[COSMETIC_IDS.bubbleOutlineBlue] ?? 0) < 1) {
    return;
  }
  const next = HEX6.test(hex) ? hex : '';
  writeString(KEYS.bubbleOutlineHex, next);
  emit();
}

/**
 * One transactional pop commit: lifetime, streak, credits, contract progress.
 * No-op when contract already complete (blocked pops — see Pop tab P4).
 */
export function commitPop(now = Date.now()): void {
  if (readNumber(KEYS.contractComplete, 0) === 1) {
    return;
  }

  const pops = readNumber(KEYS.lifetimePops, 0) + 1;
  writeNumber(KEYS.lifetimePops, pops);

  if (readString(KEYS.sessionStart) == null) {
    writeNumber(KEYS.sessionStart, now);
  }

  const today = utcDayString(new Date(now));
  const lastStreakDate = readString(KEYS.lastStreakDate) ?? null;
  const currentStreak = readNumber(KEYS.currentStreak, 0);
  const next = advanceDailyStreak({ today, lastStreakDate, currentStreak });
  writeString(KEYS.lastStreakDate, next.lastStreakDate);
  writeNumber(KEYS.currentStreak, next.currentStreak);

  const best = readNumber(KEYS.bestStreak, 0);
  if (next.currentStreak > best) {
    writeNumber(KEYS.bestStreak, next.currentStreak);
  }

  const owned = readOwnedUpgrades();
  const prestigeCount = readNumber(KEYS.prestigeCount, 0);
  const creditsTier = owned['credits_per_pop'] ?? 0;
  const runAgg = aggregateModifierEffects(readActiveModifierIds());
  const earnedRaw = earnCreditsPerPop({
    prestigeCount,
    creditsPerPopTier: creditsTier,
  });
  const earned = Math.max(
    1,
    Math.floor(earnedRaw * runAgg.creditsPerPopMultiplier),
  );
  const credits = readNumber(KEYS.credits, 0) + earned;
  writeNumber(KEYS.credits, credits);

  const companyIndex = readNumber(KEYS.companyIndex, 0);
  const baseQuota = quotaForCompany(companyIndex);
  const quota = Math.max(1, Math.floor(baseQuota + runAgg.quotaDelta));
  const ptc = readNumber(KEYS.popsThisContract, 0) + 1;
  writeNumber(KEYS.popsThisContract, ptc);

  if (ptc >= quota) {
    writeNumber(KEYS.contractComplete, 1);
  }

  ensurePhase3EconomyMigration();
  emit();
}

/** @deprecated Use commitPop — alias for tests and legacy call sites. */
export function recordPop(now = Date.now()): void {
  commitPop(now);
}

/** Pull-to-refresh: new sheet only; contract state unchanged. */
export function refreshSheetOnly(): void {
  bumpSheetReset();
  emit();
}

/**
 * When `contractComplete`, ensure `pendingOffersJson` holds the deterministic trio
 * (survives restart mid-modal). Idempotent if three valid offers already exist.
 */
export function synchronizePendingContractOffers(): void {
  if (readNumber(KEYS.contractComplete, 0) !== 1) {
    return;
  }
  const existing = parseContractOffersJson(readString(KEYS.pendingOffersJson));
  if (existing && existing.length === 3) {
    return;
  }
  const cur = readNumber(KEYS.companyIndex, 0);
  const lcc = readNumber(KEYS.lifetimeContractsCompleted, 0);
  const pi = readNumber(KEYS.prestigeCount, 0);
  const offers = buildContractOffers({
    companyIndexAtComplete: cur,
    lifetimeContractsCompleted: lcc,
    prestigeCount: pi,
  });
  writeString(KEYS.pendingOffersJson, JSON.stringify(offers));
  writeNumber(KEYS.selectedOfferIndex, recommendedOfferIndex(offers));
  emit();
}

export function setSelectedOfferIndex(index: number): void {
  if (readNumber(KEYS.contractComplete, 0) !== 1) {
    return;
  }
  writeNumber(KEYS.selectedOfferIndex, Math.max(0, Math.floor(index)));
  emit();
}

/**
 * Confirms the chosen next engagement after a contract completes.
 * Clears pending offers, applies `companyIndex` + run modifier ids for the new run,
 * then bumps lifetime counters (replaces legacy `advanceCompany` +1-only behavior).
 *
 * @param offerIndex Optional row index (0–2). When omitted, uses `selectedOfferIndex`
 * from storage after synchronizing pending offers (normal UI path).
 */
export function advanceCompanyWithSelection(offerIndex?: number): void {
  if (readNumber(KEYS.contractComplete, 0) !== 1) {
    return;
  }
  synchronizePendingContractOffers();
  const offers = readPendingContractOffers();
  if (offers.length !== 3) {
    return;
  }
  const fromStore = readNumber(KEYS.selectedOfferIndex, 0);
  const raw =
    offerIndex != null && Number.isFinite(offerIndex)
      ? Math.floor(offerIndex)
      : fromStore;
  const i = Math.max(0, Math.min(offers.length - 1, raw));
  const chosen = offers[i]!;

  ensurePhase3EconomyMigration();
  const bonus = contractCompletionCreditsBonus();
  if (bonus > 0) {
    writeNumber(KEYS.credits, readNumber(KEYS.credits, 0) + bonus);
  }

  writeNumber(KEYS.companyIndex, chosen.companyIndex);
  writeString(
    KEYS.activeModifierIdsJson,
    JSON.stringify(chosen.modifierIds ?? []),
  );
  backend.delete(KEYS.pendingOffersJson);
  writeNumber(KEYS.selectedOfferIndex, 0);
  writeNumber(KEYS.popsThisContract, 0);
  writeNumber(KEYS.contractComplete, 0);
  const cc = readNumber(KEYS.companiesCompleted, 0) + 1;
  writeNumber(KEYS.companiesCompleted, cc);
  const lt = readNumber(KEYS.lifetimeContractsCompleted, 0) + 1;
  writeNumber(KEYS.lifetimeContractsCompleted, lt);
  bumpSheetReset();
  emit();
}

/** @deprecated Prefer `advanceCompanyWithSelection()` after `synchronizePendingContractOffers`. */
export function advanceCompany(): void {
  if (readNumber(KEYS.contractComplete, 0) !== 1) {
    return;
  }
  synchronizePendingContractOffers();
  advanceCompanyWithSelection();
}

export type ClaimMvpAchievementResult =
  | 'ok'
  | 'not_ready'
  | 'already_claimed'
  | 'unknown';

/** Awards Flair for one MVP achievement after the player claims it on Progress. */
export function claimMvpAchievement(
  achievementId: string,
): ClaimMvpAchievementResult {
  ensurePhase3EconomyMigration();
  const def = ACHIEVEMENT_MVP.find((d) => d.id === achievementId);
  if (!def) return 'unknown';

  const claimed = readClaimedAchievementsSet();
  if (claimed.has(achievementId)) return 'already_claimed';

  const input = readAchievementProgressInput();
  if (!achievementMet(def, input)) return 'not_ready';

  claimed.add(achievementId);
  writeClaimedAchievementsSet(claimed);
  writeNumber(KEYS.flair, readNumber(KEYS.flair, 0) + def.rewardFlair);
  emit();
  return 'ok';
}

export function purchaseCosmetic(cosmeticId: string): CosmeticPurchaseResult {
  ensurePhase3EconomyMigration();
  const def = findCosmetic(cosmeticId);
  if (!def) return 'unknown';

  const ownedMap = readOwnedCosmetics();
  if ((ownedMap[cosmeticId] ?? 0) > 0) {
    return 'owned';
  }

  const price = def.priceFlair;
  const flair = readNumber(KEYS.flair, 0);
  if (flair < price) {
    return 'unaffordable';
  }

  writeNumber(KEYS.flair, flair - price);
  ownedMap[cosmeticId] = 1;
  writeOwnedCosmetics(ownedMap);
  emit();
  return 'ok';
}

export function purchaseUpgrade(upgradeId: string): PurchaseResult {
  const def = findUpgrade(upgradeId);
  if (!def) return 'unknown';

  const ownedMap = readOwnedUpgrades();
  const owned = ownedMap[upgradeId] ?? 0;
  if (owned >= def.tiers.length) {
    return 'maxed';
  }

  const price = def.tiers[owned]!.priceCredits;
  const credits = readNumber(KEYS.credits, 0);
  if (credits < price) {
    return 'unaffordable';
  }

  writeNumber(KEYS.credits, credits - price);
  ownedMap[upgradeId] = owned + 1;
  writeOwnedUpgrades(ownedMap);
  emit();
  return 'ok';
}

/**
 * Prestige: hard reset of career progression (credits, contract, Credit-tier upgrades).
 * Keeps lifetimePops, daily streak stats, Flair, cosmetics, achievement claims,
 * and lifetimeContractsCompleted; increments prestigeCount.
 */
export function confirmPrestige(): void {
  const pc = readNumber(KEYS.prestigeCount, 0) + 1;
  writeNumber(KEYS.prestigeCount, pc);
  writeNumber(KEYS.credits, 0);
  writeNumber(KEYS.companyIndex, 0);
  writeNumber(KEYS.popsThisContract, 0);
  writeNumber(KEYS.contractComplete, 0);
  writeOwnedUpgrades({});
  writeNumber(KEYS.companiesCompleted, 0);
  backend.delete(KEYS.pendingOffersJson);
  writeNumber(KEYS.selectedOfferIndex, 0);
  backend.delete(KEYS.activeModifierIdsJson);
  bumpSheetReset();
  emit();
}
