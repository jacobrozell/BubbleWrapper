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

const HEX6 = /^#[0-9a-fA-F]{6}$/;

function parseHex6(hex: string): { r: number; g: number; b: number } | null {
  const t = hex.trim();
  if (!HEX6.test(t)) return null;
  const n = parseInt(t.slice(1), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

/** Unpopped fill uses the chosen hex; popped uses a translucent variant for depth. */
export function bubbleTintFills(
  hex: string,
): { unpopped: string; popped: string } | null {
  const rgb = parseHex6(hex);
  if (!rgb) return null;
  const { r, g, b } = rgb;
  return {
    unpopped: `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`,
    popped: `rgba(${r},${g},${b},0.78)`,
  };
}
