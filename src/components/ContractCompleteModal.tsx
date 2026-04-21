import React from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import type { GameSnapshot } from '../storage/zenStore';
import type { ThemeTokens } from '../theme/tokens';

type Props = {
  visible: boolean;
  game: GameSnapshot;
  theme: ThemeTokens;
  onNextCompany: () => void;
  onReviewStats: () => void;
};

export function ContractCompleteModal({
  visible,
  game,
  theme,
  onNextCompany,
  onReviewStats,
}: Props): React.JSX.Element {
  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={[styles.scrim, { backgroundColor: theme.overlayScrim }]}>
        <View style={[styles.card, { backgroundColor: theme.panel }]}>
          <Text style={[styles.kicker, { color: theme.mutedText }]}>
            CONTRACT COMPLETE
          </Text>
          <Text style={[styles.company, { color: theme.text }]}>
            {game.companyName}
          </Text>
          <Text style={[styles.flavor, { color: theme.mutedText }]}>
            {game.flavorLine}
          </Text>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Next company"
            onPress={onNextCompany}
            style={[
              styles.primary,
              { backgroundColor: theme.contractBarFill },
            ]}
          >
            <Text style={styles.primaryText}>Next Company →</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Review stats on Progress tab"
            onPress={onReviewStats}
            style={styles.secondaryWrap}
          >
            <Text style={[styles.secondary, { color: theme.currencyAccent }]}>
              Review stats
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    borderRadius: 20,
    padding: 22,
  },
  kicker: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    textAlign: 'center',
  },
  company: {
    marginTop: 10,
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  flavor: {
    marginTop: 10,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 21,
  },
  primary: {
    marginTop: 22,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
  },
  secondaryWrap: {
    marginTop: 14,
    paddingVertical: 10,
    alignItems: 'center',
  },
  secondary: {
    fontSize: 15,
    fontWeight: '700',
  },
});
