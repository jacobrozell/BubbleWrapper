import { FlashList } from '@shopify/flash-list';
import React, { useCallback, useMemo, useState } from 'react';
import { RefreshControl, View, useWindowDimensions } from 'react-native';

import { commitPop, refreshSheetOnly } from '../storage/zenStore';
import { SPACE } from '../theme/tokens';
import type { ThemeTokens } from '../theme/tokens';

import { BubbleItem } from './BubbleItem';

const GAP = 10;
const BASE_BUBBLE = 58;
const BUBBLE_COUNT = 480;

type Props = {
  theme: ThemeTokens;
  resetVersion: number;
  hitSlopInset?: number;
  popsDisabled?: boolean;
  bubbleBorderUnpopped?: string;
  bubbleBorderPopped?: string;
};

export function ZenCanvas({
  theme,
  resetVersion,
  hitSlopInset = 0,
  popsDisabled = false,
  bubbleBorderUnpopped,
  bubbleBorderPopped,
}: Props) {
  const { width } = useWindowDimensions();

  const { cols, bubbleSize, data, cellWidth } = useMemo(() => {
    const pad = SPACE.md * 2;
    const cols = Math.max(
      4,
      Math.floor((width - pad + GAP) / (BASE_BUBBLE + GAP)),
    );
    const innerWidth = width - pad;
    const cellWidth = innerWidth / cols;
    const bubbleSize = Math.min(BASE_BUBBLE, cellWidth - GAP);
    const data = Array.from({ length: BUBBLE_COUNT }, (_, i) => i);
    return { cols, bubbleSize, data, cellWidth };
  }, [width]);

  const [refreshing, setRefreshing] = useState(false);

  const onPop = useCallback(() => {
    commitPop();
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    refreshSheetOnly();
    requestAnimationFrame(() => setRefreshing(false));
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: number }) => (
      <View
        style={{
          width: cellWidth,
          paddingVertical: GAP / 2,
          alignItems: 'center',
        }}
      >
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
        />
      </View>
    ),
    [
      bubbleBorderPopped,
      bubbleBorderUnpopped,
      bubbleSize,
      cellWidth,
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
      contentContainerStyle={{
        paddingHorizontal: SPACE.md,
        paddingTop: 12,
        paddingBottom: SPACE.md,
      }}
    />
  );
}
