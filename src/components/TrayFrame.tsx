import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import type { ThemeTokens } from '../theme/tokens';

type Props = {
  theme: ThemeTokens;
  reduceMotion: boolean;
  /** Cosmetic: executive rim from Shop */
  executiveSkin: boolean;
  children: React.ReactNode;
};

/**
 * Raised tray around the bubble grid. Optional subtle breathe (scale ≤ 1.01).
 * P4: contract-complete blocking is handled on bubbles, not here.
 */
export function TrayFrame({
  theme,
  reduceMotion,
  executiveSkin,
  children,
}: Props): React.JSX.Element {
  const breathe = useSharedValue(1);

  useEffect(() => {
    cancelAnimation(breathe);
    if (reduceMotion) {
      breathe.value = 1;
      return;
    }
    breathe.value = 1;
    breathe.value = withRepeat(
      withTiming(1.008, {
        duration: 10_000,
        easing: Easing.inOut(Easing.sin),
      }),
      -1,
      true,
    );
    return () => {
      cancelAnimation(breathe);
    };
  }, [breathe, reduceMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: breathe.value }],
  }));

  const borderColor = executiveSkin
    ? theme.mode === 'dark'
      ? 'rgba(255,255,255,0.22)'
      : '#2a3140'
    : theme.playfieldFrameBorder;

  return (
    <Animated.View
      style={[
        styles.tray,
        animatedStyle,
        {
          backgroundColor: theme.playfieldFrame,
          borderColor,
          shadowColor: theme.shadow,
        },
      ]}
    >
      <View
        style={[styles.insetRim, { borderColor: theme.playfieldInset }]}
        pointerEvents="none"
      />
      <View style={styles.inner}>{children}</View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  tray: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1,
    padding: 8,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 6,
    overflow: 'hidden',
  },
  insetRim: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 17,
    borderWidth: 3,
    margin: 2,
    opacity: 0.45,
  },
  inner: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
});
