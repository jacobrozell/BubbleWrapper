import React, { useCallback, useLayoutEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import {
  BUBBLE_TINT_PRESET_HEXES,
  COSMETICS,
  type CosmeticDef,
} from '../content/cosmetics';
import { UPGRADES, type UpgradeDef } from '../content/upgrades';
import { nextTierPrice } from '../economy/formulas';
import { selectionTick } from '../engine/haptics';
import {
  purchaseCosmetic,
  purchaseUpgrade,
  recordShopTabOpened,
  setBubbleTintHex,
  type CosmeticPurchaseResult,
  type GameSnapshot,
  type PurchaseResult,
} from '../storage/zenStore';
import { useZenStore } from '../storage/useZenStore';
import { makeTheme } from '../theme/tokens';

const ROW_H = 72;

export function ShopScreen(): React.JSX.Element {
  const [toast, setToast] = useState<string | null>(null);

  const { game, themeMode } = useZenStore();
  const theme = makeTheme(themeMode);

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

  const onBuyCosmetic = useCallback(
    (id: string) => {
      selectionTick();
      const res: CosmeticPurchaseResult = purchaseCosmetic(id);
      if (res === 'unaffordable') showToast('Need more Flair');
      else if (res === 'owned') showToast('Already owned');
      else if (res === 'ok') showToast('Purchased');
    },
    [showToast],
  );

  useLayoutEffect(() => {
    recordShopTabOpened();
  }, []);

  return (
    <View style={[styles.root, { backgroundColor: theme.canvas }]}>
      <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
        <Text style={[styles.title, { color: theme.text }]}>Shop</Text>
        <View style={styles.walletRow}>
          <View accessibilityLabel={`Credits ${game.credits}`}>
            <Text style={[styles.walletLabel, { color: theme.mutedText }]}>
              Credits
            </Text>
            <Text style={[styles.walletValue, { color: theme.currencyAccent }]}>
              {game.credits.toLocaleString()}
            </Text>
          </View>
          <View accessibilityLabel={`Flair ${game.flair}`}>
            <Text style={[styles.walletLabel, { color: theme.mutedText }]}>
              Flair
            </Text>
            <Text style={[styles.walletValue, { color: theme.flairAccent }]}>
              {game.flair.toLocaleString()}
            </Text>
          </View>
        </View>

        <Text style={[styles.sectionLabel, { color: theme.mutedText }]}>
          Upgrades (Credits)
        </Text>
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

        <Text style={[styles.sectionLabel, { color: theme.mutedText }]}>
          Cosmetics (Flair)
        </Text>
        <View style={styles.list}>
          {COSMETICS.map((def) => (
            <CosmeticBlock
              key={def.id}
              def={def}
              game={game}
              theme={theme}
              onBuy={onBuyCosmetic}
            />
          ))}
        </View>
        </ScrollView>

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
  game: GameSnapshot;
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

function CosmeticBlock({
  def,
  game,
  theme,
  onBuy,
}: {
  def: CosmeticDef;
  game: GameSnapshot;
  theme: ReturnType<typeof makeTheme>;
  onBuy: (id: string) => void;
}): React.JSX.Element {
  const owned = (game.ownedCosmetics[def.id] ?? 0) > 0;
  const canAfford = !owned && game.flair >= def.priceFlair;
  const titleColor = owned ? theme.shopOwned : theme.text;
  const priceColor = owned
    ? theme.shopOwned
    : canAfford
      ? theme.flairAccent
      : theme.shopUnaffordable;
  const a11y = `${def.title}, ${owned ? 'owned' : `${def.priceFlair} flair`}`;
  const showTintPicker = def.cosmeticKind === 'tint' && owned;
  const selectedHex = game.bubbleTintHex.trim().toLowerCase();

  return (
    <View
      style={[
        styles.cosmeticCard,
        {
          backgroundColor: theme.panel,
          borderColor: theme.bubbleBorder,
          paddingBottom: showTintPicker ? 12 : 0,
        },
      ]}
      accessibilityLabel={a11y}
    >
      <View
        style={[
          styles.row,
          {
            minHeight: ROW_H,
            height: showTintPicker ? undefined : ROW_H,
            borderWidth: 0,
            paddingHorizontal: 0,
          },
        ]}
      >
        <View style={{ flex: 1, paddingRight: 10 }}>
          <Text
            style={[styles.rowTitle, { color: titleColor }]}
            numberOfLines={1}
          >
            {def.title}
            {owned ? ' · Owned' : ''}
          </Text>
          {!owned ? (
            <Text style={[styles.rowSub, { color: theme.mutedText }]}>
              {def.description}
            </Text>
          ) : def.cosmeticKind === 'tint' ? (
            <Text style={[styles.rowSub, { color: theme.mutedText }]}>
              Tap a swatch for unpopped bubble fill, or use default tray color.
            </Text>
          ) : null}
        </View>
        {!owned ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Buy ${def.title} for ${def.priceFlair} flair`}
            onPress={() => onBuy(def.id)}
            disabled={!canAfford}
            style={[
              styles.buy,
              {
                borderColor: canAfford ? theme.flairAccent : theme.bubbleBorder,
                opacity: canAfford ? 1 : 0.55,
              },
            ]}
          >
            <Text style={{ color: priceColor, fontWeight: '800' }}>
              {def.priceFlair.toLocaleString()}
            </Text>
            <Text style={{ color: priceColor, fontWeight: '800' }}>Buy</Text>
          </Pressable>
        ) : (
          <Text style={{ color: theme.shopOwned, fontWeight: '800' }}>Owned</Text>
        )}
      </View>
      {showTintPicker ? (
        <View style={styles.tintSwatches}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Default bubble color from theme"
            onPress={() => {
              selectionTick();
              setBubbleTintHex('');
            }}
            style={[
              styles.tintDefault,
              {
                borderColor:
                  selectedHex === '' ? theme.flairAccent : theme.bubbleBorder,
                backgroundColor: theme.bubble,
              },
            ]}
          >
            <Text style={[styles.tintDefaultText, { color: theme.mutedText }]}>
              Default
            </Text>
          </Pressable>
          {BUBBLE_TINT_PRESET_HEXES.map((hex) => {
            const on = selectedHex === hex.toLowerCase();
            return (
              <Pressable
                key={hex}
                accessibilityRole="button"
                accessibilityLabel={`Bubble tint ${hex}`}
                onPress={() => {
                  selectionTick();
                  setBubbleTintHex(hex);
                }}
                style={[
                  styles.tintSwatch,
                  {
                    backgroundColor: hex,
                    borderColor: on ? theme.flairAccent : 'rgba(127,127,127,0.35)',
                  },
                ]}
              />
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1, paddingHorizontal: 16, paddingTop: 8 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 28 },
  title: { fontSize: 22, fontWeight: '800', marginBottom: 10 },
  walletRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 16,
    gap: 12,
  },
  walletLabel: { fontSize: 11, marginBottom: 2 },
  walletValue: { fontSize: 18, fontWeight: '800' },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 8,
    marginTop: 4,
  },
  list: { gap: 10 },
  cosmeticCard: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingTop: 4,
  },
  tintSwatches: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingTop: 4,
    paddingLeft: 2,
  },
  tintSwatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
  },
  tintDefault: {
    paddingHorizontal: 10,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    justifyContent: 'center',
  },
  tintDefaultText: { fontSize: 11, fontWeight: '700' },
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
