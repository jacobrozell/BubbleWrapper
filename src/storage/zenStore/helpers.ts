import { ACHIEVEMENT_MVP } from '../../content/achievementsMvp';
import type { ContractOffer } from '../../content/offerGeneration';
import {
  claimableAchievements,
  totalRewardFlair,
} from '../../economy/achievementsMvpLogic';

import { emit } from './subscription';
import { KEYS } from './keys';
import {
  readNumber,
  readString,
  writeNumber,
  writeString,
} from './io';

export function readOwnedUpgrades(): Record<string, number> {
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

export function writeOwnedUpgrades(map: Record<string, number>): void {
  writeString(KEYS.ownedUpgradesJson, JSON.stringify(map));
}

export function readOwnedCosmetics(): Record<string, number> {
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

export function writeOwnedCosmetics(map: Record<string, number>): void {
  writeString(KEYS.ownedCosmeticsJson, JSON.stringify(map));
}

export function readClaimedAchievementsSet(): Set<string> {
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

export function writeClaimedAchievementsSet(set: Set<string>): void {
  writeString(
    KEYS.claimedAchievementsJson,
    JSON.stringify([...set].sort()),
  );
}

export function parseContractOffersJson(
  raw: string | undefined,
): ContractOffer[] | null {
  if (raw == null || raw === '') return null;
  try {
    const o = JSON.parse(raw) as unknown;
    if (!Array.isArray(o)) return null;
    const out: ContractOffer[] = [];
    for (const row of o) {
      if (typeof row !== 'object' || row == null) return null;
      const r = row as Record<string, unknown>;
      const ci = r.companyIndex;
      const mids = r.modifierIds;
      if (typeof ci !== 'number' || !Number.isFinite(ci)) return null;
      if (!Array.isArray(mids) || !mids.every((x) => typeof x === 'string')) {
        return null;
      }
      out.push({
        companyIndex: Math.floor(ci),
        modifierIds: mids as string[],
      });
    }
    return out.length === 3 ? out : null;
  } catch {
    return null;
  }
}

export function readPendingContractOffers(): ContractOffer[] {
  return parseContractOffersJson(readString(KEYS.pendingOffersJson)) ?? [];
}

export function readActiveModifierIds(): string[] {
  const raw = readString(KEYS.activeModifierIdsJson);
  if (!raw) return [];
  try {
    const o = JSON.parse(raw) as unknown;
    if (!Array.isArray(o)) return [];
    return o.filter((x): x is string => typeof x === 'string');
  } catch {
    return [];
  }
}

/** Grants Flair for any MVP achievements whose threshold is met and not yet claimed. */
export function runAchievementClaims(lifetimeContracts: number): boolean {
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
export function ensurePhase3EconomyMigration(): void {
  if (readNumber(KEYS.phase3EconomyMigrated, 0) === 1) {
    return;
  }
  const cc = readNumber(KEYS.companiesCompleted, 0);
  writeNumber(KEYS.lifetimeContractsCompleted, cc);
  runAchievementClaims(cc);
  writeNumber(KEYS.phase3EconomyMigrated, 1);
  emit();
}

export function bumpSheetReset(): void {
  const v = readNumber(KEYS.sheetResetVersion, 0) + 1;
  writeNumber(KEYS.sheetResetVersion, v);
}
