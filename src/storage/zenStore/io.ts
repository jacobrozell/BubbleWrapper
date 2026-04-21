import { backend } from './backend';

export function readNumber(key: string, fallback = 0): number {
  const raw = backend.getString(key);
  if (raw == null || raw === '') return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

export function readString(key: string): string | undefined {
  return backend.getString(key);
}

export function writeNumber(key: string, value: number): void {
  backend.set(key, value);
}

export function writeString(key: string, value: string): void {
  backend.set(key, value);
}
