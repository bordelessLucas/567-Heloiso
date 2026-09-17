import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { colors } from '@/src/theme/tokens';
import { useAppTheme } from '@/src/hooks/useAppTheme';

interface FadeEdgeScrollProps {
  children: ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
  edgeColor?: string;
  edgeWidth?: number;
  /** Mantém fade à direita desde o início (útil para o último chip já “em transição”). */
  preferTrailingFade?: boolean;
  /** Fade à esquerda entra primeiro / de forma mais suave (chip Padrão). */
  softLeadingFade?: boolean;
}

export function FadeEdgeScroll({
  children,
  contentContainerStyle,
  edgeColor,
  edgeWidth = 36,
  preferTrailingFade = false,
  softLeadingFade = false,
}: FadeEdgeScrollProps) {
  const { colors } = useAppTheme();
  const resolvedEdgeColor = edgeColor ?? colors.background;
  const [layoutWidth, setLayoutWidth] = useState(0);
  const [contentWidth, setContentWidth] = useState(0);
  const [offsetX, setOffsetX] = useState(0);
  const leftOpacity = useSharedValue(0);
  const rightOpacity = useSharedValue(preferTrailingFade ? 0.55 : 0);

  const overflow = contentWidth > layoutWidth + 2;
  const maxOffset = Math.max(0, contentWidth - layoutWidth);

  const { wantLeft, wantRight } = useMemo(() => {
    if (!overflow) {
      return { wantLeft: false, wantRight: preferTrailingFade };
    }
    return {
      wantLeft: offsetX > 2,
      wantRight: preferTrailingFade || offsetX < maxOffset - 2,
    };
  }, [overflow, offsetX, maxOffset, preferTrailingFade]);

  useEffect(() => {
    const leftTarget = wantLeft ? (softLeadingFade ? 0.72 : 0.9) : 0;
    leftOpacity.value = withTiming(leftTarget, {
      duration: softLeadingFade ? 420 : 260,
    });
  }, [wantLeft, softLeadingFade, leftOpacity]);

  useEffect(() => {
    let rightTarget = 0;
    if (wantRight) {
      if (preferTrailingFade && offsetX <= 2) {
        rightTarget = 0.62;
      } else {
        const progress = maxOffset > 0 ? Math.min(1, offsetX / Math.max(24, maxOffset * 0.2)) : 1;
        rightTarget = 0.55 + progress * 0.35;
      }
    }
    rightOpacity.value = withTiming(rightTarget, { duration: 320 });
  }, [wantRight, preferTrailingFade, offsetX, maxOffset, rightOpacity]);

  const leftStyle = useAnimatedStyle(() => ({
    opacity: leftOpacity.value,
  }));
  const rightStyle = useAnimatedStyle(() => ({
    opacity: rightOpacity.value,
  }));

  const onLayout = (event: LayoutChangeEvent) => {
    setLayoutWidth(event.nativeEvent.layout.width);
  };

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setOffsetX(event.nativeEvent.contentOffset.x);
  };

  return (
    <View style={styles.wrap} onLayout={onLayout}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        decelerationRate="normal"
        onContentSizeChange={(width) => setContentWidth(width)}
        contentContainerStyle={contentContainerStyle}
      >
        {children}
      </ScrollView>

      <Animated.View
        pointerEvents="none"
        style={[styles.edge, styles.left, { width: edgeWidth }, leftStyle]}
      >
        <LinearGradient
          colors={[resolvedEdgeColor, 'transparent']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      <Animated.View
        pointerEvents="none"
        style={[styles.edge, styles.right, { width: edgeWidth }, rightStyle]}
      >
        <LinearGradient
          colors={['transparent', resolvedEdgeColor]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'relative',
    overflow: 'hidden',
  },
  edge: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    zIndex: 2,
  },
  left: {
    left: 0,
  },
  right: {
    right: 0,
  },
});
