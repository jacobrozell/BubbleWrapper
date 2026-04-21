/**
 * Run modifier definitions and numeric aggregation (Choose Next Company spec §3.3, §7).
 * Phase A: no concrete modifiers — aggregation is identity so gameplay matches pre-feature math.
 */

export type ModifierId = string;

export type RunModifierCategory =
  | 'economy'
  | 'quota'
  | 'comfort'
  | 'sensory'
  | 'challenge';

export type RunModifierDef = {
  id: ModifierId;
  label: string;
  description?: string;
  category: RunModifierCategory;
};

/** Static table; extend in Phase B/C with param shapes per id. */
export const RUN_MODIFIERS: Record<string, RunModifierDef> = {};

/**
 * Combined gameplay knobs for the active contract run.
 * When the player confirms the next engagement, ids are written to MMKV; they apply
 * until the next completion + advance (see zenStore `advanceCompanyWithSelection`).
 */
export type RunModifierAggregate = {
  quotaDelta: number;
  creditsPerPopMultiplier: number;
};

export function aggregateModifierEffects(ids: string[]): RunModifierAggregate {
  void ids;
  void RUN_MODIFIERS;
  return { quotaDelta: 0, creditsPerPopMultiplier: 1 };
}
