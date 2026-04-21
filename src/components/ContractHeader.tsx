import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { GameSnapshot } from '../storage/zenStore';
import type { ThemeTokens } from '../theme/tokens';

type Props = {
  game: GameSnapshot;
  theme: ThemeTokens;
};

function formatCredits(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 10_000) return `${Math.round(n / 1000)}K`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

export function ContractHeader({ game, theme }: Props): React.JSX.Element {
  const progress =
    game.quotaPops > 0
      ? Math.min(1, game.popsThisContract / game.quotaPops)
      : 0;

  return (
    <View style={styles.wrap}>
      <View style={styles.topRow}>
        <Text
          style={[styles.company, { color: theme.text }]}
          numberOfLines={1}
          accessibilityRole="header"
        >
          {game.companyName}
        </Text>
        <View
          style={[styles.wallet, { minHeight: 44, justifyContent: 'center' }]}
          accessibilityRole="text"
          accessibilityLabel={`Credits ${game.credits}`}
        >
          <Text style={[styles.creditsLabel, { color: theme.mutedText }]}>
            Credits
          </Text>
          <Text style={[styles.credits, { color: theme.currencyAccent }]}>
            {formatCredits(game.credits)}
          </Text>
        </View>
      </View>
      <View style={styles.contractRow}>
        <Text style={[styles.contractLabel, { color: theme.mutedText }]}>
          Contract
        </Text>
        <View
          style={[
            styles.barTrack,
            { backgroundColor: theme.contractBarTrack },
          ]}
          accessibilityRole="progressbar"
          accessibilityValue={{
            min: 0,
            max: game.quotaPops,
            now: game.popsThisContract,
          }}
        >
          <View
            style={[
              styles.barFill,
              {
                width: `${progress * 100}%`,
                backgroundColor: theme.contractBarFill,
              },
            ]}
          />
        </View>
        <Text style={[styles.contractNums, { color: theme.text }]}>
          {game.popsThisContract} / {game.quotaPops}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  company: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
  },
  wallet: {
    alignItems: 'flex-end',
  },
  creditsLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  credits: {
    fontSize: 17,
    fontWeight: '700',
  },
  contractRow: {
    marginTop: 10,
    gap: 6,
  },
  contractLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  barTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  contractNums: {
    fontSize: 13,
    fontWeight: '600',
  },
});
