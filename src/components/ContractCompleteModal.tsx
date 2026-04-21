import React from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import type { ContractOfferView } from '../content/offerGeneration';
import type { GameSnapshot } from '../storage/zenStore';
import type { ThemeTokens } from '../theme/tokens';

type Props = {
  visible: boolean;
  game: GameSnapshot;
  theme: ThemeTokens;
  offerViews: ContractOfferView[];
  onSelectOffer: (index: number) => void;
  onStartContract: () => void;
  onReviewStats: () => void;
};

export function ContractCompleteModal({
  visible,
  game,
  theme,
  offerViews,
  onSelectOffer,
  onStartContract,
  onReviewStats,
}: Props): React.JSX.Element {
  const selected = game.selectedOfferIndex;
  const canStart = offerViews.length >= 3;

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={[styles.scrim, { backgroundColor: theme.overlayScrim }]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
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

            <Text
              style={[styles.sectionLabel, { color: theme.mutedText }]}
              accessibilityRole="header"
            >
              Next engagement
            </Text>

            {!canStart ? (
              <Text style={[styles.waiting, { color: theme.mutedText }]}>
                Preparing offers…
              </Text>
            ) : (
              <View
                accessibilityRole="radiogroup"
                accessibilityLabel="Choose next engagement"
              >
                {offerViews.map((o, i) => {
                  const isRec = i === game.recommendedOfferIndex;
                  const isSel = i === selected;
                  const borderColor = isSel
                    ? theme.contractBarFill
                    : isRec
                      ? theme.currencyAccent
                      : theme.contractBarTrack;
                  const borderWidth = isSel ? 2 : isRec ? 2 : StyleSheet.hairlineWidth;
                  return (
                    <Pressable
                      key={`${o.companyIndex}-${i}`}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: isSel, checked: isSel }}
                      accessibilityLabel={`${o.clientName}, ${o.quotaPops} pops${isRec ? ', recommended' : ''}`}
                      onPress={() => onSelectOffer(i)}
                      style={[
                        styles.offerCard,
                        {
                          borderColor,
                          borderWidth,
                          backgroundColor: theme.highlight,
                        },
                      ]}
                    >
                      <View style={styles.offerTop}>
                        <Text
                          style={[styles.offerName, { color: theme.text }]}
                          numberOfLines={2}
                        >
                          {o.clientName}
                        </Text>
                        {isRec ? (
                          <Text
                            style={[styles.recBadge, { color: theme.currencyAccent }]}
                          >
                            Suggested
                          </Text>
                        ) : null}
                      </View>
                      <Text
                        style={[styles.offerPitch, { color: theme.mutedText }]}
                        numberOfLines={2}
                      >
                        {o.pitch}
                      </Text>
                      <Text style={[styles.offerQuota, { color: theme.text }]}>
                        {o.quotaPops} pops this contract
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Start contract"
              disabled={!canStart}
              onPress={onStartContract}
              style={[
                styles.primary,
                {
                  backgroundColor: theme.contractBarFill,
                  opacity: canStart ? 1 : 0.45,
                },
              ]}
            >
              <Text style={styles.primaryText}>Start contract</Text>
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
        </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
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
  sectionLabel: {
    marginTop: 22,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  waiting: {
    marginTop: 14,
    fontSize: 15,
    textAlign: 'center',
  },
  offerCard: {
    marginTop: 12,
    borderRadius: 14,
    padding: 14,
  },
  offerTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  offerName: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
  },
  recBadge: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  offerPitch: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 19,
  },
  offerQuota: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '600',
  },
  primary: {
    marginTop: 20,
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
