import { COSMETIC_IDS } from '../../content/cosmetics';
import { companyAt } from '../../content/companies';
import { recommendedOfferIndex } from '../../content/offerGeneration';
import { aggregateModifierEffects } from '../../content/runModifiers';
import {
  prestigeMultiplierDeltaNext,
  prestigeMultiplierFromCount,
  quotaForCompany,
} from '../../economy/formulas';

import {
  ensurePhase3EconomyMigration,
  readActiveModifierIds,
  readClaimedAchievementsSet,
  readOwnedCosmetics,
  readOwnedUpgrades,
  readPendingContractOffers,
} from './helpers';
import { KEYS } from './keys';
import { readNumber, readString } from './io';
import type { GameSnapshot, StatsSnapshot, ThemeMode } from './types';

export function getStatsSnapshot(): StatsSnapshot {
  const sessionRaw = readString(KEYS.sessionStart);
  const sessionStart =
    sessionRaw == null || sessionRaw === '' ? null : Number(sessionRaw);
  return {
    lifetimePops: readNumber(KEYS.lifetimePops, 0),
    sessionStart:
      sessionStart != null && Number.isFinite(sessionStart)
        ? sessionStart
        : null,
    bestStreak: readNumber(KEYS.bestStreak, 0),
    currentStreak: readNumber(KEYS.currentStreak, 0),
    lastStreakDate: readString(KEYS.lastStreakDate) ?? null,
  };
}

export function getGameSnapshot(): GameSnapshot {
  ensurePhase3EconomyMigration();
  const stats = getStatsSnapshot();
  const companyIndex = readNumber(KEYS.companyIndex, 0);
  const co = companyAt(companyIndex);
  const owned = readOwnedUpgrades();
  const cosmetics = readOwnedCosmetics();
  const prestigeCount = readNumber(KEYS.prestigeCount, 0);
  const trayOwned = (owned['tray_corporate_dark'] ?? 0) > 0;
  const pendingContractOffers = readPendingContractOffers();
  const selectedOfferIndex = readNumber(KEYS.selectedOfferIndex, 0);
  const recommendedOfferIndexValue =
    pendingContractOffers.length > 0
      ? recommendedOfferIndex(pendingContractOffers)
      : 0;
  const activeModifierIds = readActiveModifierIds();
  const runAgg = aggregateModifierEffects(activeModifierIds);

  return {
    ...stats,
    credits: readNumber(KEYS.credits, 0),
    companyIndex,
    companyName: co.name,
    flavorLine: co.flavorLine,
    quotaPops: Math.max(
      1,
      Math.floor(quotaForCompany(companyIndex) + runAgg.quotaDelta),
    ),
    popsThisContract: readNumber(KEYS.popsThisContract, 0),
    contractComplete: readNumber(KEYS.contractComplete, 0) === 1,
    prestigeCount,
    prestigeMultiplier: prestigeMultiplierFromCount(prestigeCount),
    prestigeNextDelta: prestigeMultiplierDeltaNext(prestigeCount),
    companiesCompleted: readNumber(KEYS.companiesCompleted, 0),
    sheetResetVersion: readNumber(KEYS.sheetResetVersion, 0),
    ownedUpgrades: { ...owned },
    hasSeenPrestigeExplainer: readNumber(KEYS.hasSeenPrestigeExplainer, 0) === 1,
    hapticsEnabled: readNumber(KEYS.hapticsEnabled, 1) === 1,
    soundEnabled: readNumber(KEYS.soundEnabled, 1) === 1,
    touchTargetTier: owned['touch_target'] ?? 0,
    creditsPerPopTier: owned['credits_per_pop'] ?? 0,
    traySkinId: trayOwned ? 'tray_corporate_dark' : null,
    popSoundMutedOwned: (owned['pop_sound_muted'] ?? 0) > 0,
    flair: readNumber(KEYS.flair, 0),
    lifetimeContractsCompleted: readNumber(KEYS.lifetimeContractsCompleted, 0),
    ownedCosmetics: { ...cosmetics },
    claimedAchievementIds: [...readClaimedAchievementsSet()].sort(),
    hasBlueBubbleOutline: (cosmetics[COSMETIC_IDS.bubbleOutlineBlue] ?? 0) > 0,
    bubbleTintHex: readString(KEYS.bubbleTintHex) ?? '',
    visitedProgressTab: readNumber(KEYS.visitedProgressTab, 0) === 1,
    visitedShopTab: readNumber(KEYS.visitedShopTab, 0) === 1,
    pendingContractOffers,
    selectedOfferIndex,
    recommendedOfferIndex: recommendedOfferIndexValue,
    activeModifierIds,
  };
}

export function getTheme(): ThemeMode {
  const t = readString(KEYS.theme);
  return t === 'dark' ? 'dark' : 'light';
}
