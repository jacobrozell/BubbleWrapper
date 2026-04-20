import type { LayoutChangeEvent } from 'react-native';

/** Height of the bottom interaction band (dp). */
export const BOTTOM_ZONE_HEIGHT = 112;

export function onBottomZoneLayout(
  e: LayoutChangeEvent,
  setHeight: (h: number) => void,
): void {
  setHeight(e.nativeEvent.layout.height);
}
