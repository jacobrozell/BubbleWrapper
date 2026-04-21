import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AccessibilityInfo,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { AmbientLayer } from '../components/AmbientLayer';
import { ContractCompleteModal } from '../components/ContractCompleteModal';
import { ContractHeader } from '../components/ContractHeader';
import { TrayFrame } from '../components/TrayFrame';
import { ZenCanvas } from '../components/ZenCanvas';
import { initPopAudio } from '../engine/audio';
import type { RootTabParamList } from '../navigation/types';
import {
  advanceCompany,
  getGameSnapshot,
  getTheme,
  subscribeZenStore,
} from '../storage/zenStore';
import { bubbleOutlineBlueColors } from '../theme/bubbleCosmetic';
import { makeTheme } from '../theme/tokens';

export function PopScreen(): React.JSX.Element {
  const navigation =
    useNavigation<BottomTabNavigationProp<RootTabParamList>>();
  const [, bump] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => subscribeZenStore(() => bump((x) => x + 1)), []);

  useEffect(() => {
    void AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const sub = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduceMotion,
    );
    return () => sub.remove();
  }, []);

  useEffect(() => {
    void initPopAudio();
  }, []);

  const game = getGameSnapshot();
  const theme = useMemo(() => makeTheme(getTheme()), [bump]);

  const hitSlopInset = game.touchTargetTier * 4;
  const bubbleOutline = game.hasBlueBubbleOutline
    ? bubbleOutlineBlueColors(theme)
    : null;

  const onNextCompany = useCallback(() => {
    advanceCompany();
  }, []);

  const onReviewStats = useCallback(() => {
    navigation.navigate('Progress');
  }, [navigation]);

  return (
    <View style={[styles.root, { backgroundColor: theme.canvas }]}>
      <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <ContractHeader game={game} theme={theme} />
        <View style={styles.playfield}>
          <AmbientLayer theme={theme} reduceMotion={reduceMotion} />
          <View style={styles.trayPad}>
            <TrayFrame
              theme={theme}
              reduceMotion={reduceMotion}
              executiveSkin={game.traySkinId != null}
            >
              <ZenCanvas
                theme={theme}
                resetVersion={game.sheetResetVersion}
                hitSlopInset={hitSlopInset}
                popsDisabled={game.contractComplete}
                bubbleBorderUnpopped={bubbleOutline?.unpopped}
                bubbleBorderPopped={bubbleOutline?.popped}
              />
            </TrayFrame>
          </View>
        </View>
        <View style={styles.bottomHint}>
          <Text style={[styles.bottomHintText, { color: theme.mutedText }]}>
            Pull down on the grid for a new sheet · Progress & Shop in tabs
          </Text>
        </View>
      </SafeAreaView>

      <ContractCompleteModal
        visible={game.contractComplete}
        game={game}
        theme={theme}
        onNextCompany={onNextCompany}
        onReviewStats={onReviewStats}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  playfield: {
    flex: 1,
    position: 'relative',
    paddingHorizontal: 10,
    paddingBottom: 6,
  },
  trayPad: {
    flex: 1,
    paddingTop: 4,
  },
  bottomHint: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(127,127,127,0.35)',
  },
  bottomHintText: {
    fontSize: 12,
    letterSpacing: 0.2,
    textAlign: 'center',
  },
});
