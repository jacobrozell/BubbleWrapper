import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

import type { ThemeTokens } from '../theme/tokens';

type Props = {
  theme: ThemeTokens;
  reduceMotion: boolean;
};

/** Slow cross-fade between ambient gradient endpoints (~90s loop). */
export function AmbientLayer({
  theme,
  reduceMotion,
}: Props): React.JSX.Element {
  const t = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reduceMotion) {
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(t, {
          toValue: 1,
          duration: 90_000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(t, {
          toValue: 0,
          duration: 90_000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => {
      loop.stop();
    };
  }, [reduceMotion, t]);

  if (reduceMotion) {
    return (
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: theme.ambientGradientStart },
          ]}
        />
      </View>
    );
  }

  const topOpacity = t.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.35],
  });
  const bottomOpacity = t.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 1],
  });

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: theme.ambientGradientStart, opacity: topOpacity },
        ]}
      />
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: theme.ambientGradientEnd,
            opacity: bottomOpacity,
          },
        ]}
      />
    </View>
  );
}
