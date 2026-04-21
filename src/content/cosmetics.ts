/**
 * Cosmetics are purchased with **Flair** (achievement currency), not Credits.
 * IDs are stable for persistence across app versions.
 */
export type CosmeticDef = {
  id: string;
  title: string;
  description: string;
  priceFlair: number;
};

export const COSMETIC_IDS = {
  bubbleOutlineBlue: 'bubble_outline_blue',
} as const;

export const COSMETICS: CosmeticDef[] = [
  {
    id: COSMETIC_IDS.bubbleOutlineBlue,
    title: 'Blue bubble outline',
    description: 'Unpopped bubbles use a blue rim instead of the default.',
    priceFlair: 25,
  },
];

export function findCosmetic(id: string): CosmeticDef | undefined {
  return COSMETICS.find((c) => c.id === id);
}
