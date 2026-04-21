import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { StatsOverlay } from '../components/StatsOverlay';
import { ZenCanvas } from '../components/ZenCanvas';
import { initPopAudio } from '../engine/audio';
import { BOTTOM_ZONE_HEIGHT } from '../gestures/gestureZones';
import {
  getStatsSnapshot,
  getTheme,
  setTheme,
  subscribeZenStore,
} from '../storage/zenStore';
import { makeTheme } from '../theme/tokens';

export function ZenScreen() {
  const [, bump] = useState(0);
  const themeMode = getTheme();
  const theme = useMemo(() => makeTheme(themeMode), [themeMode]);

  const [statsOpen, setStatsOpen] = useState(false);
  const [resetVersion, setResetVersion] = useState(0);
  const statsOpenRef = useRef(false);
  statsOpenRef.current = statsOpen;

  useEffect(() => subscribeZenStore(() => bump((x) => x + 1)), []);

  useEffect(() => {
    void initPopAudio();
  }, []);

  const openStats = useCallback(() => setStatsOpen(true), []);
  const closeStats = useCallback(() => setStatsOpen(false), []);
  const resetSheet = useCallback(() => setResetVersion((v) => v + 1), []);

  const handleSwipeDown = useCallback(() => {
    if (statsOpenRef.current) closeStats();
    else resetSheet();
  }, [closeStats, resetSheet]);

  const bottomPan = useMemo(
    () =>
      Gesture.Pan().onEnd((e) => {
        const up = e.translationY < -48 || e.velocityY < -900;
        const down = e.translationY > 48 || e.velocityY > 900;
        if (up) runOnJS(openStats)();
        if (down) runOnJS(handleSwipeDown)();
      }),
    [handleSwipeDown, openStats],
  );

  const stats = getStatsSnapshot();

  const toggleTheme = useCallback(() => {
    setTheme(getTheme() === 'dark' ? 'light' : 'dark');
  }, []);

  return (
    <View style={[styles.root, { backgroundColor: theme.canvas }]}>
      <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={styles.canvasWrap}>
          <ZenCanvas
            theme={theme}
            resetVersion={resetVersion}
            onPullToReset={resetSheet}
          />
        </View>

        <GestureDetector gesture={bottomPan}>
          <View style={[styles.bottomZone, { height: BOTTOM_ZONE_HEIGHT }]}>
            <Text style={[styles.bottomHint, { color: theme.mutedText }]}>
              Pull down on the grid to reset · swipe up here for stats
            </Text>
          </View>
        </GestureDetector>
      </SafeAreaView>

      <StatsOverlay
        open={statsOpen}
        onClose={closeStats}
        theme={theme}
        stats={stats}
        onToggleTheme={toggleTheme}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  canvasWrap: { flex: 1 },
  bottomZone: {
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(127,127,127,0.35)',
  },
  bottomHint: {
    fontSize: 12,
    letterSpacing: 0.2,
  },
});
