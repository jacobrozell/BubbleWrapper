import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { UPGRADES, type UpgradeDef } from '../content/upgrades';
import { nextTierPrice } from '../economy/formulas';
import { selectionTick } from '../engine/haptics';
import {
  getGameSnapshot,
  getTheme,
  purchaseUpgrade,
  subscribeZenStore,
  type PurchaseResult,
} from '../storage/zenStore';
import { makeTheme } from '../theme/tokens';

const ROW_H = 72;

export function ShopScreen(): React.JSX.Element {
  const [, bump] = useState(0);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => subscribeZenStore(() => bump((x) => x + 1)), []);

  const game = getGameSnapshot();
  const theme = useMemo(() => makeTheme(getTheme()), [bump]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 1600);
  }, []);

  const onBuy = useCallback(
    (id: string) => {
      selectionTick();
      const res: PurchaseResult = purchaseUpgrade(id);
      if (res === 'unaffordable') showToast('Need more Credits');
      else if (res === 'maxed') showToast('Already at MAX');
      else if (res === 'ok') showToast('Purchased');
    },
    [showToast],
  );

  return (
    <View style={[styles.root, { backgroundColor: theme.canvas }]}>
      <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: theme.text }]}>Shop</Text>
          <View accessibilityLabel={`Credits ${game.credits}`}>
            <Text style={[styles.creditsLabel, { color: theme.mutedText }]}>
              Credits
            </Text>
            <Text style={[styles.credits, { color: theme.currencyAccent }]}>
              {game.credits.toLocaleString()}
            </Text>
          </View>
        </View>

        <View style={styles.list}>
          {UPGRADES.map((def) => (
            <ShopRow
              key={def.id}
              def={def}
              game={game}
              theme={theme}
              onBuy={onBuy}
            />
          ))}
        </View>

        {toast ? (
          <View
            style={[styles.toast, { backgroundColor: theme.panel }]}
            pointerEvents="none"
          >
            <Text style={{ color: theme.text, fontWeight: '700' }}>{toast}</Text>
          </View>
        ) : null}
      </SafeAreaView>
    </View>
  );
}

function ShopRow({
  def,
  game,
  theme,
  onBuy,
}: {
  def: UpgradeDef;
  game: ReturnType<typeof getGameSnapshot>;
  theme: ReturnType<typeof makeTheme>;
  onBuy: (id: string) => void;
}): React.JSX.Element {
  const owned = game.ownedUpgrades[def.id] ?? 0;
  const price = nextTierPrice(def, owned);
  const maxed = price == null;
  const canAfford = !maxed && game.credits >= price;

  const labelSuffix = maxed ? ' · MAX' : '';
  const a11y = `${def.title}, ${maxed ? 'owned max' : `${price} credits`}`;

  const titleColor = maxed ? theme.shopOwned : theme.text;
  const priceColor = maxed
    ? theme.shopOwned
    : canAfford
      ? theme.shopAffordable
      : theme.shopUnaffordable;

  return (
    <View
      style={[
        styles.row,
        { height: ROW_H, backgroundColor: theme.panel, borderColor: theme.bubbleBorder },
      ]}
      accessibilityLabel={a11y}
    >
      <View style={{ flex: 1, paddingRight: 10 }}>
        <Text
          style={[styles.rowTitle, { color: titleColor }]}
          numberOfLines={1}
        >
          {def.title}
          {labelSuffix}
        </Text>
        {!maxed ? (
          <Text style={[styles.rowSub, { color: theme.mutedText }]}>
            {def.tiers[owned]?.effectLabel}
          </Text>
        ) : null}
      </View>
      {!maxed ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Buy ${def.title} for ${price} credits`}
          onPress={() => onBuy(def.id)}
          disabled={!canAfford}
          style={[
            styles.buy,
            {
              borderColor: canAfford ? theme.shopAffordable : theme.bubbleBorder,
              opacity: canAfford ? 1 : 0.55,
            },
          ]}
        >
          <Text style={{ color: priceColor, fontWeight: '800' }}>
            {price.toLocaleString()}
          </Text>
          <Text style={{ color: priceColor, fontWeight: '800' }}>Buy</Text>
        </Pressable>
      ) : (
        <Text style={{ color: theme.shopOwned, fontWeight: '800' }}>Owned</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1, paddingHorizontal: 16, paddingTop: 8 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 14,
  },
  title: { fontSize: 22, fontWeight: '800' },
  creditsLabel: { fontSize: 11, textAlign: 'right', color: '#888' },
  credits: { fontSize: 18, fontWeight: '800', textAlign: 'right' },
  list: { gap: 10 },
  row: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowTitle: { fontSize: 16, fontWeight: '800' },
  rowSub: { fontSize: 12, marginTop: 2 },
  buy: {
    minWidth: 88,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  toast: {
    position: 'absolute',
    bottom: 28,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
});
