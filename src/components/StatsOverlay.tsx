import React, { useEffect, useMemo } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { SPRING_CONFIG } from '../engine/physics';
import type { ThemeTokens } from '../theme/tokens';

export type StatsSnapshot = {
  lifetimePops: number;
  sessionStart: number | null;
  bestStreak: number;
  currentStreak: number;
  lastStreakDate: string | null;
};

type Props = {
  open: boolean;
  onClose: () => void;
  theme: ThemeTokens;
  stats: StatsSnapshot;
  onToggleTheme: () => void;
};

export function StatsOverlay({
  open,
  onClose,
  theme,
  stats,
  onToggleTheme,
}: Props) {
  const drawerHeight = useMemo(() => {
    const { height } = Dimensions.get('window');
    return Math.min(430, Math.round(height * 0.46));
  }, []);

  const translateY = useSharedValue(drawerHeight);

  useEffect(() => {
    translateY.value = withSpring(open ? 0 : drawerHeight, SPRING_CONFIG);
  }, [drawerHeight, open, translateY]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const pan = useMemo(
    () =>
      Gesture.Pan().onEnd((e) => {
        if (e.translationY > 56 || e.velocityY > 900) {
          runOnJS(onClose)();
        }
      }),
    [onClose],
  );

  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      <Pressable
        pointerEvents={open ? 'auto' : 'none'}
        accessibilityRole="button"
        accessibilityLabel="Close stats"
        onPress={onClose}
        style={[styles.scrim, { backgroundColor: theme.overlayScrim }]}
      />

      <GestureDetector gesture={pan}>
        <Animated.View
          pointerEvents={open ? 'auto' : 'none'}
          style={[
            styles.sheet,
            { height: drawerHeight, backgroundColor: theme.panel },
            sheetStyle,
          ]}
        >
          <View style={styles.handle} />
          <Text style={[styles.title, { color: theme.text }]}>Stats</Text>
          <Text style={[styles.line, { color: theme.mutedText }]}>
            Lifetime pops: {stats.lifetimePops}
          </Text>
          <Text style={[styles.line, { color: theme.mutedText }]}>
            Current streak: {stats.currentStreak} days
          </Text>
          <Text style={[styles.line, { color: theme.mutedText }]}>
            Best streak: {stats.bestStreak} days
          </Text>
          <Text style={[styles.line, { color: theme.mutedText }]}>
            Session start:{' '}
            {stats.sessionStart
              ? new Date(stats.sessionStart).toLocaleString()
              : '—'}
          </Text>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Toggle theme"
            onPress={onToggleTheme}
            style={[
              styles.button,
              { borderColor: theme.bubbleBorder, backgroundColor: theme.bubble },
            ]}
          >
            <Text style={[styles.buttonText, { color: theme.text }]}>
              Theme: {theme.mode === 'dark' ? 'Dark' : 'Light'} (tap to toggle)
            </Text>
          </Pressable>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  scrim: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 18,
  },
  handle: {
    alignSelf: 'center',
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(127,127,127,0.35)',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10,
  },
  line: {
    fontSize: 14,
    marginBottom: 6,
  },
  button: {
    marginTop: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
