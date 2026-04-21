import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Pressable,
  Platform,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { playPop } from '../engine/audio';
import { popComplete, popPressIn } from '../engine/haptics';
import { PRESS_IN_SCALE, SPRING_CONFIG } from '../engine/physics';
import type { ThemeTokens } from '../theme/tokens';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = {
  id: number;
  theme: ThemeTokens;
  size: number;
  resetVersion: number;
  onPop: (id: number) => void;
  /** P4: when contract is complete, block pops until Next Company. */
  popsDisabled?: boolean;
  /** Extra hit slop from Shop touch-target upgrades (points per side). */
  hitSlopInset?: number;
  /** When set, overrides `theme.bubbleBorder` / highlight for rim read. */
  bubbleBorderUnpopped?: string;
  bubbleBorderPopped?: string;
  /** When set, overrides `theme.bubble` for fill. */
  bubbleFillUnpopped?: string;
  bubbleFillPopped?: string;
};

function BubbleItemImpl({
  id,
  theme,
  size,
  resetVersion,
  onPop,
  popsDisabled = false,
  hitSlopInset = 0,
  bubbleBorderUnpopped,
  bubbleBorderPopped,
  bubbleFillUnpopped,
  bubbleFillPopped,
}: Props) {
  const [popped, setPopped] = useState(false);
  const scale = useSharedValue(1);

  useEffect(() => {
    setPopped(false);
    scale.value = 1;
  }, [resetVersion, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const pressIn = useCallback(() => {
    if (popped || popsDisabled) return;
    popPressIn();
    void playPop();
    scale.value = withSpring(PRESS_IN_SCALE, SPRING_CONFIG);
  }, [popped, popsDisabled, scale]);

  const pressOut = useCallback(() => {
    scale.value = withSpring(1, SPRING_CONFIG);
  }, [scale]);

  const press = useCallback(() => {
    if (popped || popsDisabled) return;
    setPopped(true);
    popComplete();
    onPop(id);
  }, [id, onPop, popped, popsDisabled]);

  const hitSlop =
    hitSlopInset > 0
      ? {
          top: hitSlopInset,
          bottom: hitSlopInset,
          left: hitSlopInset,
          right: hitSlopInset,
        }
      : undefined;

  const borderUnpopped = bubbleBorderUnpopped ?? theme.bubbleBorder;
  const borderPopped = bubbleBorderPopped ?? theme.highlight;

  const fillUnpopped = bubbleFillUnpopped ?? theme.bubble;
  const fillPopped = bubbleFillPopped ?? theme.bubble;

  const pressableStyle: StyleProp<ViewStyle> = useMemo(
    () => ({
      width: size,
      height: size,
      alignItems: 'center',
      justifyContent: 'center',
    }),
    [size],
  );

  const surface: StyleProp<ViewStyle> = {
    width: size,
    height: size,
    borderRadius: size * 0.36,
    backgroundColor: popped ? fillPopped : fillUnpopped,
    borderWidth: popped ? 2 : 1,
    borderColor: popped ? borderPopped : borderUnpopped,
    ...(Platform.OS === 'ios'
      ? {
          shadowColor: theme.shadow,
          shadowOffset: { width: 0, height: popped ? 2 : 6 },
          shadowOpacity: popped ? 0.14 : 0.32,
          shadowRadius: popped ? 5 : 11,
        }
      : {
          elevation: popped ? 2 : 6,
        }),
  };

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel="Bubble"
      hitSlop={hitSlop}
      onPress={press}
      onPressIn={pressIn}
      onPressOut={pressOut}
      style={[animatedStyle, pressableStyle]}
    >
      <Animated.View style={surface} />
    </AnimatedPressable>
  );
}

export const BubbleItem = React.memo(BubbleItemImpl);
