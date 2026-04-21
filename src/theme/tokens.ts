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
  };
}
