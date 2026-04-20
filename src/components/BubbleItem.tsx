import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, type StyleProp, type ViewStyle } from 'react-native';
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
};

function BubbleItemImpl({ id, theme, size, resetVersion, onPop }: Props) {
  const [popped, setPopped] = useState(false);
  const beganRef = useRef(false);
  const scale = useSharedValue(1);

  useEffect(() => {
    setPopped(false);
    beganRef.current = false;
    scale.value = 1;
  }, [resetVersion, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const pressIn = useCallback(() => {
    if (popped) return;
    beganRef.current = true;
    popPressIn();
    void playPop();
    scale.value = withSpring(PRESS_IN_SCALE, SPRING_CONFIG);
  }, [popped, scale]);

  const pressOut = useCallback(() => {
    if (!beganRef.current) {
      scale.value = withSpring(1, SPRING_CONFIG);
      return;
    }
    beganRef.current = false;
    if (popped) {
      scale.value = withSpring(1, SPRING_CONFIG);
      return;
    }
    setPopped(true);
    popComplete();
    scale.value = withSpring(1, SPRING_CONFIG);
    onPop(id);
  }, [id, onPop, popped, scale]);

  const surface: StyleProp<ViewStyle> = {
    width: size,
    height: size,
    borderRadius: size * 0.36,
    backgroundColor: theme.bubble,
    borderWidth: popped ? 2 : 1,
    borderColor: popped ? theme.highlight : theme.bubbleBorder,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: popped ? 2 : 6 },
    shadowOpacity: popped ? 0.14 : 0.32,
    shadowRadius: popped ? 5 : 11,
  };

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel="Bubble"
      onPressIn={pressIn}
      onPressOut={pressOut}
      style={[
        animatedStyle,
        { width: size, height: size, alignItems: 'center', justifyContent: 'center' },
      ]}
    >
      <Animated.View style={surface} />
    </AnimatedPressable>
  );
}

export const BubbleItem = React.memo(BubbleItemImpl);
