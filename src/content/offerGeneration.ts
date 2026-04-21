import { companyAt } from './companies';

/** Serializable slice stored in MMKV while contract complete (Phase A: company pick only). */
export type ContractOffer = {
  companyIndex: number;
  modifierIds: string[];
};

export type ContractOfferView = ContractOffer & {
  clientName: string;
  pitch: string;
  quotaPops: number;
};

/** Deterministic 32-bit mix for offline offer shuffles. */
export function mixOfferSeed(
  lifetimeContractsCompleted: number,
  prestigeCount: number,
  companyIndexAtComplete: number,
): number {
  const a = Math.max(0, Math.floor(lifetimeContractsCompleted));
  const b = Math.max(0, Math.floor(prestigeCount));
  const c = Math.max(0, Math.floor(companyIndexAtComplete));
  let x = (a * 73856093) ^ (b * 19349663) ^ (c * 83492791);
  x = Math.imul(x ^ (x >>> 16), 2246822507);
  x = Math.imul(x ^ (x >>> 13), 3266489909);
  return (x ^ (x >>> 16)) >>> 0;
}

/** Fisher–Yates shuffle of [1,2,3] using `seed` as LCG stream (deterministic). */
export function quotaOffsetsPermutation(seed: number): [number, number, number] {
  const arr: [number, number, number] = [1, 2, 3];
  let s = seed >>> 0;
  for (let i = 2; i > 0; i--) {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    const j = s % (i + 1);
    const tmp = arr[i]!;
    arr[i] = arr[j]!;
    arr[j] = tmp;
  }
  return arr;
}

/**
 * Three distinct next contracts: `companyIndexAtComplete + 1/+2/+3` in a deterministic
 * order so early-game slots are not always the same three clients.
 */
export function buildContractOffers(input: {
  companyIndexAtComplete: number;
  lifetimeContractsCompleted: number;
  prestigeCount: number;
}): ContractOffer[] {
  const cur = Math.max(0, Math.floor(input.companyIndexAtComplete));
  const seed = mixOfferSeed(
    input.lifetimeContractsCompleted,
    input.prestigeCount,
    cur,
  );
  const perm = quotaOffsetsPermutation(seed);
  return perm.map((delta) => ({
    companyIndex: cur + delta,
    modifierIds: [],
  }));
}

/** Recommended = lowest `companyIndex` (gentlest quota among the three). */
export function recommendedOfferIndex(offers: ContractOffer[]): number {
  if (offers.length === 0) return 0;
  let best = 0;
  let bestIdx = offers[0]!.companyIndex;
  for (let i = 1; i < offers.length; i++) {
    const ci = offers[i]!.companyIndex;
    if (ci < bestIdx) {
      bestIdx = ci;
      best = i;
    }
  }
  return best;
}

export function enrichOffersForDisplay(
  offers: ContractOffer[],
  quotaForCompany: (companyIndex: number) => number,
): ContractOfferView[] {
  return offers.map((o) => {
    const co = companyAt(o.companyIndex);
    return {
      ...o,
      clientName: co.name,
      pitch: co.flavorLine,
      quotaPops: quotaForCompany(o.companyIndex),
    };
  });
}
