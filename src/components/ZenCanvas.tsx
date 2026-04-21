import { FlashList } from '@shopify/flash-list';
import React, { useCallback, useMemo, useState } from 'react';
import {
  RefreshControl,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';

import { commitPop, refreshSheetOnly } from '../storage/zenStore';
import { SPACE } from '../theme/tokens';
import type { ThemeTokens } from '../theme/tokens';

import { BubbleItem } from './BubbleItem';

const GAP = 10;
const BASE_BUBBLE = 58;

type Props = {
  theme: ThemeTokens;
  resetVersion: number;
  hitSlopInset?: number;
  popsDisabled?: boolean;
  bubbleBorderUnpopped?: string;
  bubbleBorderPopped?: string;
  bubbleFillUnpopped?: string;
  bubbleFillPopped?: string;
};

export function ZenCanvas({
  theme,
  resetVersion,
  hitSlopInset = 0,
  popsDisabled = false,
  bubbleBorderUnpopped,
  bubbleBorderPopped,
  bubbleFillUnpopped,
  bubbleFillPopped,
}: Props) {
  const { width, height } = useWindowDimensions();

  const { cols, bubbleSize, data, cellWidth, estimatedItemSize } = useMemo(() => {
    const pad = SPACE.md * 2;
    const cols = Math.max(
      4,
      Math.floor((width - pad + GAP) / (BASE_BUBBLE + GAP)),
    );
    const innerWidth = width - pad;
    const cellWidth = innerWidth / cols;
    const bubbleSize = Math.min(BASE_BUBBLE, cellWidth - GAP);
    const rowHeight = bubbleSize + GAP;
    const visibleRows = Math.ceil(height / rowHeight);
    // Keep a little extra content for momentum + pull-to-refresh,
    // but avoid the confusing "endless" scroll.
    const targetRows = Math.max(visibleRows + 2, 10);
    const bubbleCount = cols * targetRows;
    const data = Array.from({ length: bubbleCount }, (_, i) => i);
    return { cols, bubbleSize, data, cellWidth, estimatedItemSize: rowHeight };
  }, [height, width]);

  const [refreshing, setRefreshing] = useState(false);

  const onPop = useCallback(() => {
    commitPop();
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    refreshSheetOnly();
    requestAnimationFrame(() => setRefreshing(false));
  }, []);

  const cellStyle = useMemo(
    () => [styles.cell, { width: cellWidth }] as const,
    [cellWidth],
  );

  const contentContainerStyle = useMemo(
    () => ({
      paddingHorizontal: SPACE.md,
      paddingTop: 12,
      paddingBottom: SPACE.md,
    }),
    [],
  );

  const renderItem = useCallback(
    ({ item }: { item: number }) => (
      <View style={cellStyle}>
        <BubbleItem
          id={item}
          theme={theme}
          size={bubbleSize}
          resetVersion={resetVersion}
          onPop={onPop}
          popsDisabled={popsDisabled}
          hitSlopInset={hitSlopInset}
          bubbleBorderUnpopped={bubbleBorderUnpopped}
          bubbleBorderPopped={bubbleBorderPopped}
          bubbleFillUnpopped={bubbleFillUnpopped}
          bubbleFillPopped={bubbleFillPopped}
        />
      </View>
    ),
    [
      bubbleBorderPopped,
      bubbleBorderUnpopped,
      bubbleFillPopped,
      bubbleFillUnpopped,
      bubbleSize,
      cellStyle,
      hitSlopInset,
      onPop,
      popsDisabled,
      resetVersion,
      theme,
    ],
  );

  return (
    <FlashList
      data={data}
      numColumns={cols}
      key={cols}
      keyExtractor={(i) => String(i)}
      renderItem={renderItem}
      estimatedItemSize={estimatedItemSize}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={theme.text}
          colors={[theme.mode === 'dark' ? '#eef1f6' : '#1b2230']}
          progressBackgroundColor={
            theme.mode === 'dark' ? theme.panel : theme.bubble
          }
        />
      }
      contentContainerStyle={contentContainerStyle}
    />
  );
}

const styles = StyleSheet.create({
  cell: {
    paddingVertical: GAP / 2,
    alignItems: 'center',
  },
});
