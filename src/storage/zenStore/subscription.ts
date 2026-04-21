import { ALL_KEYS } from './keys';
import { backend } from './backend';

const listeners = new Set<() => void>();

/** Bumped on every `emit()` so React can subscribe via `useSyncExternalStore`. */
let storeGeneration = 0;

export function getZenStoreGeneration(): number {
  return storeGeneration;
}

export function emit(): void {
  storeGeneration += 1;
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
