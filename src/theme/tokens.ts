import type { ThemeMode } from '../storage/zenStore';

export const SPACE = {
  md: 16,
  sm: 10,
} as const;

export const RADIUS = {
  bubble: 18,
  panel: 22,
} as const;

export type ThemeTokens = {
  mode: ThemeMode;
  canvas: string;
  bubble: string;
  bubbleBorder: string;
  text: string;
  mutedText: string;
  overlayScrim: string;
  panel: string;
  shadow: string;
  highlight: string;
  /** Raised tray fill */
  playfieldFrame: string;
  playfieldFrameBorder: string;
  playfieldInset: string;
  ambientGradientStart: string;
  ambientGradientEnd: string;
  currencyAccent: string;
  contractBarFill: string;
  contractBarTrack: string;
  shopAffordable: string;
  shopUnaffordable: string;
  shopOwned: string;
  /** Achievement / cosmetic currency accent (Flair). */
  flairAccent: string;
};

export function makeTheme(mode: ThemeMode): ThemeTokens {
  if (mode === 'dark') {
    return {
      mode,
      canvas: '#1c1f24',
      bubble: '#23272e',
      bubbleBorder: '#14161a',
      text: '#eef1f6',
      mutedText: '#a7b0bf',
      overlayScrim: 'rgba(0,0,0,0.45)',
      panel: '#262b33',
      shadow: 'rgba(0,0,0,0.55)',
      highlight: 'rgba(255,255,255,0.10)',
      playfieldFrame: '#22262c',
      playfieldFrameBorder: 'rgba(255,255,255,0.08)',
      playfieldInset: 'rgba(0,0,0,0.35)',
      ambientGradientStart: '#1a1e26',
      ambientGradientEnd: '#232a35',
      currencyAccent: '#8fd4f0',
      contractBarFill: 'rgba(143,212,240,0.85)',
      contractBarTrack: 'rgba(255,255,255,0.12)',
      shopAffordable: '#8fd4f0',
      shopUnaffordable: '#6a7384',
      shopOwned: '#9aa7b8',
      flairAccent: '#c4b5fd',
    };
  }
  return {
    mode,
    canvas: '#dce4ee',
    bubble: '#ffffff',
    bubbleBorder: 'rgba(22,32,48,0.14)',
    text: '#1b2230',
    mutedText: 'rgba(27,34,48,0.62)',
    overlayScrim: 'rgba(20,24,30,0.25)',
    panel: '#eef2f7',
    shadow: 'rgba(20,24,30,0.22)',
    highlight: 'rgba(42,157,143,0.55)',
    playfieldFrame: '#e2e9f2',
    playfieldFrameBorder: 'rgba(22,32,48,0.12)',
    playfieldInset: 'rgba(20,24,30,0.06)',
    ambientGradientStart: '#d4dce8',
    ambientGradientEnd: '#e8eef6',
    currencyAccent: '#1f6f78',
    contractBarFill: 'rgba(31,111,120,0.9)',
    contractBarTrack: 'rgba(27,34,48,0.12)',
    shopAffordable: '#1f6f78',
    shopUnaffordable: 'rgba(27,34,48,0.38)',
    shopOwned: 'rgba(27,34,48,0.45)',
    flairAccent: '#6d28d9',
  };
}
