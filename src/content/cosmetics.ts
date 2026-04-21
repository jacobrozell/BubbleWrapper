/**
 * Cosmetics are purchased with **Flair** (achievement currency), not Credits.
 * IDs are stable for persistence across app versions.
 */
export type CosmeticDef = {
  id: string;
  title: string;
  description: string;
  priceFlair: number;
  /** `tint` rows show a color picker in Shop after purchase. */
  cosmeticKind?: 'outline' | 'tint';
};

export const COSMETIC_IDS = {
  bubbleTint: 'bubble_tint',
  bubbleOutlineBlue: 'bubble_outline_blue',
} as const;

/** Preset unpopped bubble fills (#RRGGBB). Picked in Shop after unlocking tint. */
export const BUBBLE_TINT_PRESET_HEXES: readonly string[] = [
  '#ffffff',
  '#e8f4fc',
  '#fde68a',
  '#bbf7d0',
  '#fecaca',
  '#ddd6fe',
  '#7dd3fc',
  '#34d399',
  '#fb7185',
  '#a78bfa',
  '#38bdf8',
  '#f472b6',
  '#1b2230',
  '#0f172a',
];

export const COSMETICS: CosmeticDef[] = [
  {
    id: COSMETIC_IDS.bubbleTint,
    title: 'Bubble tint',
    description: 'Choose a fill color for unpopped bubbles.',
    priceFlair: 25,
    cosmeticKind: 'tint',
  },
  {
    id: COSMETIC_IDS.bubbleOutlineBlue,
    title: 'Blue bubble outline',
    description: 'Unpopped bubbles use a blue rim instead of the default.',
    priceFlair: 25,
    cosmeticKind: 'outline',
  },
];

export function findCosmetic(id: string): CosmeticDef | undefined {
  return COSMETICS.find((c) => c.id === id);
}
