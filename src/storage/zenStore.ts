import { Platform, TurboModuleRegistry } from 'react-native';

import { ACHIEVEMENT_MVP } from '../content/achievementsMvp';
import { companyAt } from '../content/companies';
import { COSMETIC_IDS, findCosmetic } from '../content/cosmetics';
import { findUpgrade } from '../content/upgrades';
import {
  claimableAchievements,
  totalRewardFlair,
} from '../economy/achievementsMvpLogic';
import {
  contractCompletionCreditsBonus,
  earnCreditsPerPop,
  prestigeMultiplierDeltaNext,
  prestigeMultiplierFromCount,
  quotaForCompany,
} from '../economy/formulas';

import { advanceDailyStreak, utcDayString } from './statsLogic';

/** Nitro loads at import-time in react-native-mmkv v4 — avoid importing MMKV unless native Nitro exists (e.g. Expo Go has no Nitro). */
function isNitroNativeAvailable(): boolean {
  if (Platform.OS === 'web') return false;
  try {
    return TurboModuleRegistry.get('NitroModules') != null;
  } catch {
    return false;
  }
}

export type ThemeMode = 'light' | 'dark';

const KEYS = {
  lifetimePops: 'lifetimePops',
  sessionStart: 'sessionStart',
  bestStreak: 'bestStreak',
  currentStreak: 'currentStreak',
  lastStreakDate: 'lastStreakDate',
  theme: 'theme',
  credits: 'credits',
  companyIndex: 'companyIndex',
  popsThisContract: 'popsThisContract',
  contractComplete: 'contractComplete',
  prestigeCount: 'prestigeCount',
  companiesCompleted: 'companiesCompleted',
  sheetResetVersion: 'sheetResetVersion',
  ownedUpgradesJson: 'ownedUpgradesJson',
  hasSeenPrestigeExplainer: 'hasSeenPrestigeExplainer',
  hapticsEnabled: 'hapticsEnabled',
  soundEnabled: 'soundEnabled',
  flair: 'flair',
  lifetimeContractsCompleted: 'lifetimeContractsCompleted',
  phase3EconomyMigrated: 'phase3EconomyMigrated',
  ownedCosmeticsJson: 'ownedCosmeticsJson',
  claimedAchievementsJson: 'claimedAchievementsJson',
} as const;

const ALL_KEYS: string[] = [...Object.values(KEYS)];

type StorageBackend = {
  getString(key: string): string | undefined;
  set(key: string, value: string | number | boolean): void;
  delete(key: string): void;
  clearAll?: () => void;
};

function createMemoryBackend(): StorageBackend {
  const map = new Map<string, string>();
  return {
    getString(key) {
      return map.get(key);
    },
    set(key, value) {
      map.set(key, String(value));
    },
    delete(key) {
      map.delete(key);
    },
    clearAll() {
      map.clear();
    },
  };
}

function createMmkvBackend(): StorageBackend | null {
  if (Platform.OS === 'web') return null;
  if (!isNitroNativeAvailable()) return null;
  try {
    const { createMMKV } =
      require('react-native-mmkv') as typeof import('react-native-mmkv');
    const mmkv = createMMKV({ id: 'pop-breathe' });
    return {
      getString: (key) => mmkv.getString(key),
      set: (key, value) => {
        mmkv.set(key, typeof value === 'string' ? value : String(value));
      },
      delete: (key) => {
        mmkv.remove(key);
      },
      clearAll: () => {
        mmkv.clearAll();
      },
    };
  } catch {
    return null;
  }
}

const backend: StorageBackend = createMmkvBackend() ?? createMemoryBackend();

const listeners = new Set<() => void>();

function emit(): void {
  for (const l of listeners) l();
}

export function subscribeZenStore(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Clears persisted keys for automated tests. */
export function resetZenStoreForTests(): void {
  if (backend.clearAll) backend.clearAll();
  else ALL_KEYS.forEach((key) => backend.delete(key));
  emit();
}

function readNumber(key: string, fallback = 0): number {
  const raw = backend.getString(key);
  if (raw == null || raw === '') return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

function readString(key: string): string | undefined {
  return backend.getString(key);
}

function writeNumber(key: string, value: number): void {
  backend.set(key, value);
}

function writeString(key: string, value: string): void {
  backend.set(key, value);
}

function readOwnedUpgrades(): Record<string, number> {
  const raw = readString(KEYS.ownedUpgradesJson);
  if (!raw) return {};
  try {
    const o = JSON.parse(raw) as unknown;
    if (typeof o !== 'object' || o == null || Array.isArray(o)) return {};
    return o as Record<string, number>;
  } catch {
    return {};
  }
}

function writeOwnedUpgrades(map: Record<string, number>): void {
  writeString(KEYS.ownedUpgradesJson, JSON.stringify(map));
}

function readOwnedCosmetics(): Record<string, number> {
  const raw = readString(KEYS.ownedCosmeticsJson);
  if (!raw) return {};
  try {
    const o = JSON.parse(raw) as unknown;
    if (typeof o !== 'object' || o == null || Array.isArray(o)) return {};
    return o as Record<string, number>;
  } catch {
    return {};
  }
}

function writeOwnedCosmetics(map: Record<string, number>): void {
  writeString(KEYS.ownedCosmeticsJson, JSON.stringify(map));
}

function readClaimedAchievementsSet(): Set<string> {
  const raw = readString(KEYS.claimedAchievementsJson);
  if (!raw) return new Set();
  try {
    const o = JSON.parse(raw) as unknown;
    if (!Array.isArray(o)) return new Set();
    return new Set(o.filter((x): x is string => typeof x === 'string'));
  } catch {
    return new Set();
  }
}

function writeClaimedAchievementsSet(set: Set<string>): void {
  writeString(
    KEYS.claimedAchievementsJson,
    JSON.stringify([...set].sort()),
  );
}

/** Grants Flair for any MVP achievements whose threshold is met and not yet claimed. */
function runAchievementClaims(lifetimeContracts: number): boolean {
  const claimed = readClaimedAchievementsSet();
  const claimable = claimableAchievements(
    ACHIEVEMENT_MVP,
    lifetimeContracts,
    claimed,
  );
  if (claimable.length === 0) return false;
  const add = totalRewardFlair(claimable);
  for (const c of claimable) {
    claimed.add(c.id);
  }
  writeNumber(KEYS.flair, readNumber(KEYS.flair, 0) + add);
  writeClaimedAchievementsSet(claimed);
  return true;
}

/**
 * One-time: seed lifetime contract counter from legacy `companiesCompleted`, then
 * backfill achievement Flair for thresholds already passed.
 */
function ensurePhase3EconomyMigration(): void {
  if (readNumber(KEYS.phase3EconomyMigrated, 0) === 1) {
    return;
  }
  const cc = readNumber(KEYS.companiesCompleted, 0);
  writeNumber(KEYS.lifetimeContractsCompleted, cc);
  runAchievementClaims(cc);
  writeNumber(KEYS.phase3EconomyMigrated, 1);
  emit();
}

function bumpSheetReset(): void {
  const v = readNumber(KEYS.sheetResetVersion, 0) + 1;
  writeNumber(KEYS.sheetResetVersion, v);
}

export type StatsSnapshot = {
  lifetimePops: number;
  sessionStart: number | null;
  bestStreak: number;
  currentStreak: number;
  lastStreakDate: string | null;
};

export function getStatsSnapshot(): StatsSnapshot {
  const sessionRaw = backend.getString(KEYS.sessionStart);
  const sessionStart =
    sessionRaw == null || sessionRaw === ''
      ? null
      : Number(sessionRaw);
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
};

export function getGameSnapshot(): GameSnapshot {
  ensurePhase3EconomyMigration();
  const stats = getStatsSnapshot();
  const companyIndex = readNumber(KEYS.companyIndex, 0);
  const co = companyAt(companyIndex);
  const owned = readOwnedUpgrades();
  const cosmetics = readOwnedCosmetics();
  const prestigeCount = readNumber(KEYS.prestigeCount, 0);
  const trayOwned = (owned['tray_corporate_dark'] ?? 0) > 0;

  return {
    ...stats,
    credits: readNumber(KEYS.credits, 0),
    companyIndex,
    companyName: co.name,
    flavorLine: co.flavorLine,
    quotaPops: quotaForCompany(companyIndex),
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
  };
}

export function getTheme(): ThemeMode {
  const t = readString(KEYS.theme);
  return t === 'dark' ? 'dark' : 'light';
}

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
  const earned = earnCreditsPerPop({
    prestigeCount,
    creditsPerPopTier: creditsTier,
  });
  const credits = readNumber(KEYS.credits, 0) + earned;
  writeNumber(KEYS.credits, credits);

  const companyIndex = readNumber(KEYS.companyIndex, 0);
  const quota = quotaForCompany(companyIndex);
  const ptc = readNumber(KEYS.popsThisContract, 0) + 1;
  writeNumber(KEYS.popsThisContract, ptc);

  if (ptc >= quota) {
    writeNumber(KEYS.contractComplete, 1);
  }

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

/** After contract complete modal — Next Company. */
export function advanceCompany(): void {
  if (readNumber(KEYS.contractComplete, 0) !== 1) {
    return;
  }
  ensurePhase3EconomyMigration();
  const bonus = contractCompletionCreditsBonus();
  if (bonus > 0) {
    writeNumber(KEYS.credits, readNumber(KEYS.credits, 0) + bonus);
  }

  const idx = readNumber(KEYS.companyIndex, 0) + 1;
  writeNumber(KEYS.companyIndex, idx);
  writeNumber(KEYS.popsThisContract, 0);
  writeNumber(KEYS.contractComplete, 0);
  const cc = readNumber(KEYS.companiesCompleted, 0) + 1;
  writeNumber(KEYS.companiesCompleted, cc);
  const lt = readNumber(KEYS.lifetimeContractsCompleted, 0) + 1;
  writeNumber(KEYS.lifetimeContractsCompleted, lt);
  runAchievementClaims(lt);
  bumpSheetReset();
  emit();
}

export type PurchaseResult = 'ok' | 'maxed' | 'unaffordable' | 'unknown';

export type CosmeticPurchaseResult =
  | 'ok'
  | 'owned'
  | 'unaffordable'
  | 'unknown';

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
  bumpSheetReset();
  emit();
}
