import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ACHIEVEMENT_MVP } from '../content/achievementsMvp';
import {
  claimableAchievements,
  newlyClaimableAchievementsSince,
} from '../economy/achievementsMvpLogic';
import { achievementBannerLight } from '../engine/haptics';
import { rootNavigationRef } from '../navigation/rootNavigationRef';
import { useZenStore } from '../storage/useZenStore';
import { RADIUS, SPACE, makeTheme } from '../theme/tokens';

const AUTO_DISMISS_MS = 4000;

type BannerPayload = { id: string; title: string; rewardFlair: number };

function focusedRootTabName(): string | undefined {
  if (!rootNavigationRef.isReady()) return undefined;
  const s = rootNavigationRef.getRootState();
  if (!s?.routes?.length) return undefined;
  const idx = typeof s.index === 'number' ? s.index : 0;
  const route = s.routes[idx];
  return typeof route?.name === 'string' ? route.name : undefined;
}

export function AchievementBannerHost(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const { game, themeMode } = useZenStore();
  const theme = makeTheme(themeMode);

  const [navEpoch, setNavEpoch] = useState(0);
  useEffect(() => {
    const unsub = rootNavigationRef.addListener('state', () => {
      setNavEpoch((n) => n + 1);
    });
    return unsub;
  }, []);

  void navEpoch;
  const focusedTab = focusedRootTabName();
  const hideForProgressTab = focusedTab === 'Progress';

  const [queue, setQueue] = useState<BannerPayload[]>([]);
  const visible = queue[0] ?? null;

  const prevEligibleRef = useRef<Set<string>>(new Set());
  const seededRef = useRef(false);
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastHapticVisibleIdRef = useRef<string | null>(null);

  const achInput = {
    lifetimeContractsCompleted: game.lifetimeContractsCompleted,
    lifetimePops: game.lifetimePops,
    visitedProgress: game.visitedProgressTab,
    visitedShop: game.visitedShopTab,
  };
  useLayoutEffect(() => {
    const claimedSet = new Set(game.claimedAchievementIds);
    const eligibleOrdered = newlyClaimableAchievementsSince(
      ACHIEVEMENT_MVP,
      prevEligibleRef.current,
      achInput,
      claimedSet,
    );

    const nextEligible = new Set(
      claimableAchievements(ACHIEVEMENT_MVP, achInput, claimedSet).map(
        (d) => d.id,
      ),
    );

    if (!seededRef.current) {
      seededRef.current = true;
      prevEligibleRef.current = nextEligible;
      return;
    }

    if (eligibleOrdered.length > 0) {
      setQueue((q) => [
        ...q,
        ...eligibleOrdered.map((d) => ({
          id: d.id,
          title: d.title,
          rewardFlair: d.rewardFlair,
        })),
      ]);
    }

    prevEligibleRef.current = nextEligible;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `achInput` fields listed; object identity changes each render
  }, [
    achInput.lifetimeContractsCompleted,
    achInput.lifetimePops,
    achInput.visitedProgress,
    achInput.visitedShop,
    game.claimedAchievementIds,
  ]);

  const dismissCurrent = useCallback(() => {
    setQueue((q) => q.slice(1));
  }, []);

  useEffect(() => {
    if (!visible || hideForProgressTab) {
      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current);
        dismissTimerRef.current = null;
      }
      return;
    }
    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    dismissTimerRef.current = setTimeout(() => {
      dismissCurrent();
      dismissTimerRef.current = null;
    }, AUTO_DISMISS_MS);
    return () => {
      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current);
        dismissTimerRef.current = null;
      }
    };
  }, [visible, hideForProgressTab, dismissCurrent]);

  const showSurface = Boolean(visible && !hideForProgressTab);
  useEffect(() => {
    const surfaceId = showSurface && visible ? visible.id : null;
    if (surfaceId && surfaceId !== lastHapticVisibleIdRef.current) {
      achievementBannerLight();
      lastHapticVisibleIdRef.current = surfaceId;
    }
    if (!surfaceId) {
      lastHapticVisibleIdRef.current = null;
    }
  }, [showSurface, visible]);

  const goProgress = useCallback(() => {
    if (rootNavigationRef.isReady()) {
      rootNavigationRef.navigate('Progress');
    }
    dismissCurrent();
  }, [dismissCurrent]);

  if (!visible) {
    return <View style={styles.host} pointerEvents="box-none" />;
  }

  return (
    <View style={styles.host} pointerEvents="box-none">
      {showSurface ? (
        <View
          style={[
            styles.bannerWrap,
            {
              paddingTop: insets.top + SPACE.sm,
              paddingHorizontal: SPACE.md,
            },
          ]}
          pointerEvents="box-none"
        >
          <View
            style={[
              styles.banner,
              {
                backgroundColor: theme.panel,
                borderColor: theme.bubbleBorder,
                shadowColor: theme.shadow,
              },
            ]}
          >
            <Ionicons
              name="trophy-outline"
              size={22}
              color={theme.flairAccent}
              style={styles.icon}
            />
            <View style={styles.textCol}>
              <Text style={[styles.title, { color: theme.text }]} numberOfLines={2}>
                {visible.title}
              </Text>
              <Text
                style={[styles.sub, { color: theme.mutedText }]}
                numberOfLines={2}
              >
                +{visible.rewardFlair} Flair — collect on Progress
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="View Progress"
              onPress={goProgress}
              style={({ pressed }) => [
                styles.cta,
                { opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <Text style={[styles.ctaLabel, { color: theme.flairAccent }]}>
                View
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Dismiss"
              onPress={dismissCurrent}
              hitSlop={12}
              style={({ pressed }) => [
                styles.closeBtn,
                { opacity: pressed ? 0.6 : 1 },
              ]}
            >
              <Ionicons name="close" size={22} color={theme.mutedText} />
            </Pressable>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 40,
    justifyContent: 'flex-start',
  },
  bannerWrap: {
    alignItems: 'stretch',
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.panel,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: SPACE.sm,
    paddingLeft: SPACE.sm,
    paddingRight: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  icon: { marginRight: 6 },
  textCol: { flex: 1, minWidth: 0 },
  title: { fontSize: 15, fontWeight: '600' },
  sub: { fontSize: 13, marginTop: 2 },
  cta: { paddingHorizontal: 8, paddingVertical: 6 },
  ctaLabel: { fontSize: 14, fontWeight: '600' },
  closeBtn: { padding: 4 },
});
