import React, { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  runOnUI,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import type { AchievementMvpDef } from '../content/achievementsMvp';
import { ACHIEVEMENT_MVP } from '../content/achievementsMvp';
import {
  achievementMet,
  achievementProgressParts,
} from '../economy/achievementsMvpLogic';
import {
  ACHIEVEMENT_CLAIM_SPRING_IN,
  ACHIEVEMENT_CLAIM_SPRING_OUT,
} from '../engine/physics';
import { popComplete, selectionTick } from '../engine/haptics';
import {
  claimMvpAchievement,
  confirmPrestige,
  getGameSnapshot,
  getTheme,
  recordProgressTabOpened,
  setHasSeenPrestigeExplainer,
  setHapticsEnabled,
  setSoundEnabled,
  setTheme,
} from '../storage/zenStore';
import { useZenStore } from '../storage/useZenStore';
import { makeTheme } from '../theme/tokens';

const AchievementMvpRow = React.memo(function AchievementMvpRow({
  def,
  theme,
  claimed,
  claimable,
  metaLine,
}: {
  def: AchievementMvpDef;
  theme: ReturnType<typeof makeTheme>;
  claimed: boolean;
  claimable: boolean;
  metaLine: string;
}): React.JSX.Element {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const onPress = () => {
    if (claimed) {
      selectionTick();
      return;
    }
    if (!claimable) {
      selectionTick();
      return;
    }
    selectionTick();
    // Claim on the JS thread here — do not depend on Reanimated's withSpring
    // completion + runOnJS; on some Android builds that callback never fires,
    // leaving a shared lock stuck so every tap only plays selectionTick().
    const r = claimMvpAchievement(def.id);
    if (r === 'ok') {
      popComplete();
      // Kick off the animation on the UI thread so it doesn't get delayed by
      // JS work (store updates, re-renders) on slower Android devices.
      runOnUI(() => {
        'worklet';
        scale.value = withSequence(
          withSpring(1.07, ACHIEVEMENT_CLAIM_SPRING_OUT),
          withSpring(1, ACHIEVEMENT_CLAIM_SPRING_IN),
        );
      })();
    } else {
      selectionTick();
    }
  };

  const metaColor = claimed || claimable ? theme.flairAccent : theme.mutedText;
  const borderColor = claimable
    ? theme.flairAccent
    : claimed
      ? theme.mode === 'dark'
        ? 'rgba(196,181,253,0.45)'
        : 'rgba(107,76,200,0.38)'
      : theme.bubbleBorder;
  const fill =
    claimed
      ? theme.mode === 'dark'
        ? 'rgba(196,181,253,0.12)'
        : 'rgba(107,76,200,0.10)'
      : claimable
        ? theme.mode === 'dark'
          ? 'rgba(196,181,253,0.07)'
          : 'rgba(107,76,200,0.06)'
        : 'transparent';

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityHint={
        claimable
          ? 'Adds Flair to your balance with a short animation'
          : undefined
      }
      accessibilityLabel={
        claimed
          ? `${def.title}, completed`
          : claimable
            ? `${def.title}, ${def.rewardFlair} Flair ready to collect`
            : `${def.title}, in progress`
      }
    >
      <Animated.View
        style={[
          animStyle,
          styles.achShell,
          {
            borderColor,
            borderWidth: claimable ? 2 : 1,
            backgroundColor: fill,
          },
        ]}
      >
        <View style={styles.achTitleRow}>
          <Text style={[styles.achTitle, { color: theme.text, flex: 1 }]}>
            {def.title}
          </Text>
          {claimed ? (
            <Text
              accessible={false}
              style={[styles.achCheck, { color: theme.flairAccent }]}
            >
              ✓
            </Text>
          ) : null}
        </View>
        <Text style={[styles.achSub, { color: theme.mutedText }]}>
          {def.description}
        </Text>
        <Text style={[styles.achMeta, { color: metaColor }]}>{metaLine}</Text>
      </Animated.View>
    </Pressable>
  );
});

function PrefRow({
  label,
  value,
  onPress,
  theme,
}: {
  label: string;
  value: string;
  onPress: () => void;
  theme: ReturnType<typeof makeTheme>;
}): React.JSX.Element {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={styles.prefRow}
    >
      <Text style={{ color: theme.text, fontWeight: '700' }}>{label}</Text>
      <Text style={{ color: theme.currencyAccent, fontWeight: '700' }}>
        {value}
      </Text>
    </Pressable>
  );
}

export function ProgressScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const [prestigeOpen, setPrestigeOpen] = useState(false);

  const { game, themeMode } = useZenStore();
  const theme = useMemo(() => makeTheme(themeMode), [themeMode]);

  useLayoutEffect(() => {
    recordProgressTabOpened();
  }, []);

  const achInput = {
    lifetimeContractsCompleted: game.lifetimeContractsCompleted,
    lifetimePops: game.lifetimePops,
    visitedProgress: game.visitedProgressTab,
    visitedShop: game.visitedShopTab,
  };

  const formatAchMeta = (a: AchievementMvpDef): string => {
    const claimed = game.claimedAchievementIds.includes(a.id);
    if (claimed) {
      return `Complete · +${a.rewardFlair} Flair`;
    }
    if (achievementMet(a, achInput)) {
      return `Ready — tap to collect +${a.rewardFlair} Flair`;
    }
    const p = achievementProgressParts(a, achInput);
    if (!p) return '';
    if (p.unit === 'visit') {
      return `${p.current} / ${p.target} tab visit`;
    }
    return `${p.current} / ${p.target} ${p.unit}`;
  };

  const openPrestige = useCallback(() => {
    const snap = getGameSnapshot();
    if (!snap.hasSeenPrestigeExplainer) {
      setHasSeenPrestigeExplainer(true);
    }
    setPrestigeOpen(true);
  }, []);

  const closePrestige = useCallback(() => setPrestigeOpen(false), []);

  const pctNext = Math.round(game.prestigeNextDelta * 100);

  return (
    <View style={[styles.root, { backgroundColor: theme.canvas }]}>
      <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{ paddingBottom: 24 + insets.bottom }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
        <Text style={[styles.title, { color: theme.text }]}>Progress</Text>

        <View style={[styles.card, { backgroundColor: theme.panel }]}>
          <Text style={[styles.line, { color: theme.mutedText }]}>
            Lifetime pops:{' '}
            <Text style={{ color: theme.text }}>{game.lifetimePops}</Text>
          </Text>
          <Text style={[styles.line, { color: theme.mutedText }]}>
            Current streak:{' '}
            <Text style={{ color: theme.text }}>
              {game.currentStreak} days
            </Text>
          </Text>
          <Text style={[styles.line, { color: theme.mutedText }]}>
            Best streak:{' '}
            <Text style={{ color: theme.text }}>{game.bestStreak} days</Text>
          </Text>
          <Text style={[styles.line, { color: theme.mutedText }]}>
            Companies served:{' '}
            <Text style={{ color: theme.text }}>{game.companiesCompleted}</Text>
          </Text>
          <Text style={[styles.line, { color: theme.mutedText }]}>
            Lifetime contracts:{' '}
            <Text style={{ color: theme.text }}>
              {game.lifetimeContractsCompleted}
            </Text>
          </Text>
          <Text style={[styles.line, { color: theme.mutedText }]}>
            Flair:{' '}
            <Text style={{ color: theme.flairAccent, fontWeight: '700' }}>
              {game.flair}
            </Text>
          </Text>
        </View>

        <Text style={[styles.section, { color: theme.mutedText }]}>
          Achievements
        </Text>
        <View style={[styles.card, { backgroundColor: theme.panel, gap: 14 }]}>
          {ACHIEVEMENT_MVP.map((a) => {
            const done = game.claimedAchievementIds.includes(a.id);
            const claimable = !done && achievementMet(a, achInput);
            return (
              <AchievementMvpRow
                key={a.id}
                def={a}
                theme={theme}
                claimed={done}
                claimable={claimable}
                metaLine={formatAchMeta(a)}
              />
            );
          })}
        </View>

        <Text style={[styles.section, { color: theme.mutedText }]}>Career</Text>
        <View style={[styles.prestigeCard, { borderColor: theme.bubbleBorder }]}>
          <Text style={[styles.prestigeTitle, { color: theme.text }]}>
            Prestige
          </Text>
          <Text style={[styles.prestigeSub, { color: theme.mutedText }]}>
            Next bonus: +{pctNext}% effective Credits (lifetime multiplier)
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open prestige confirmation"
            onPress={openPrestige}
            style={[
              styles.prestigeCta,
              { borderColor: theme.bubbleBorder, backgroundColor: theme.bubble },
            ]}
          >
            <Text style={[styles.prestigeCtaText, { color: theme.text }]}>
              Career reset…
            </Text>
          </Pressable>
        </View>

        <Text style={[styles.section, { color: theme.mutedText }]}>
          Preferences
        </Text>
        <View style={[styles.card, { backgroundColor: theme.panel }]}>
          <PrefRow
            label="Theme"
            value={theme.mode === 'dark' ? 'Dark' : 'Light'}
            onPress={() => {
              selectionTick();
              setTheme(getTheme() === 'dark' ? 'light' : 'dark');
            }}
            theme={theme}
          />
          <PrefRow
            label="Haptics"
            value={game.hapticsEnabled ? 'On' : 'Off'}
            onPress={() => {
              selectionTick();
              setHapticsEnabled(!game.hapticsEnabled);
            }}
            theme={theme}
          />
          <PrefRow
            label="Sound"
            value={game.soundEnabled ? 'On' : 'Off'}
            onPress={() => {
              selectionTick();
              setSoundEnabled(!game.soundEnabled);
            }}
            theme={theme}
          />
        </View>
        </ScrollView>
      </SafeAreaView>

      <Modal visible={prestigeOpen} transparent animationType="fade">
        <View style={[styles.scrim, { backgroundColor: theme.overlayScrim }]}>
          <View style={[styles.modalCard, { backgroundColor: theme.panel }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Reset career?
            </Text>
            <Text style={[styles.modalBody, { color: theme.mutedText }]}>
              Resets Credits, Credit-priced Shop upgrades, and contract progress
              (company index). Keeps lifetime pops, daily streaks, Flair,
              cosmetics, and achievement progress. Applies a permanent Credit
              multiplier: currently ×{game.prestigeMultiplier.toFixed(2)}, then +
              {pctNext}% after reset.
            </Text>
            <View style={styles.modalActions}>
              <Pressable
                accessibilityRole="button"
                onPress={closePrestige}
                style={[
                  styles.modalBtn,
                  { borderColor: theme.bubbleBorder },
                ]}
              >
                <Text style={{ color: theme.text, fontWeight: '700' }}>
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  confirmPrestige();
                  closePrestige();
                }}
                style={[
                  styles.modalBtnPrimary,
                  { backgroundColor: theme.contractBarFill },
                ]}
              >
                <Text style={styles.modalBtnPrimaryText}>Confirm prestige</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1, paddingHorizontal: 16, paddingTop: 8 },
  scroll: { flex: 1 },
  title: { fontSize: 22, fontWeight: '800', marginBottom: 12 },
  section: {
    marginTop: 18,
    marginBottom: 8,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  card: {
    borderRadius: 16,
    padding: 14,
    gap: 8,
  },
  line: { fontSize: 15 },
  prestigeCard: {
    minHeight: 120,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 8,
  },
  prestigeTitle: { fontSize: 17, fontWeight: '800' },
  prestigeSub: { fontSize: 14, lineHeight: 20 },
  prestigeCta: {
    marginTop: 4,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  prestigeCtaText: { fontSize: 15, fontWeight: '800' },
  prefRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(127,127,127,0.25)',
  },
  scrim: { flex: 1, justifyContent: 'center', padding: 20 },
  modalCard: { borderRadius: 18, padding: 18 },
  modalTitle: { fontSize: 20, fontWeight: '800', marginBottom: 10 },
  modalBody: { fontSize: 15, lineHeight: 22 },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  modalBtn: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalBtnPrimary: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalBtnPrimaryText: { color: '#fff', fontWeight: '800' },
  achShell: { borderRadius: 12, padding: 12, gap: 4 },
  achTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  achTitle: { fontSize: 15, fontWeight: '800' },
  achCheck: { fontSize: 16, fontWeight: '800' },
  achSub: { fontSize: 13, lineHeight: 18 },
  achMeta: { fontSize: 12, fontWeight: '700', marginTop: 2 },
});
