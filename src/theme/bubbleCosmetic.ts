import type { ThemeTokens } from './tokens';

/** When owned, unpopped / popped bubble outline colors (rim + inset read). */
export function bubbleOutlineBlueColors(
  theme: ThemeTokens,
): { unpopped: string; popped: string } {
  if (theme.mode === 'dark') {
    return { unpopped: '#60a5fa', popped: 'rgba(96,165,250,0.55)' };
  }
  return { unpopped: '#2563eb', popped: 'rgba(37,99,235,0.5)' };
}
