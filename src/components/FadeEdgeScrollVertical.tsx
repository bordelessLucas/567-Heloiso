import { useEffect, useState, type ReactNode } from 'react';
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

interface FadeEdgeScrollVerticalProps {
  children: ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
  edgeColor?: string;
  edgeHeight?: number;
  preferBottomFade?: boolean;
}

/** Scroll vertical com fade suave nas bordas — mesmo padrão do fade horizontal. */
export function FadeEdgeScrollVertical({
  children,
  contentContainerStyle,
  style,
  edgeColor = colors.surfaceWarm,
  edgeHeight = 28,
  preferBottomFade = true,
}: FadeEdgeScrollVerticalProps) {
  const [layoutHeight, setLayoutHeight] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const topOpacity = useSharedValue(0);
  const bottomOpacity = useSharedValue(preferBottomFade ? 0.55 : 0);

  const overflow = contentHeight > layoutHeight + 2;
  const maxOffset = Math.max(0, contentHeight - layoutHeight);

  const wantTop = overflow && offsetY > 2;
  const wantBottom = overflow && (preferBottomFade || offsetY < maxOffset - 2);

  useEffect(() => {
    topOpacity.value = withTiming(wantTop ? 0.78 : 0, { duration: 280 });
  }, [wantTop, topOpacity]);

  useEffect(() => {
    let target = 0;
    if (wantBottom) {
      target = offsetY <= 2 ? 0.62 : 0.88;
    }
    bottomOpacity.value = withTiming(target, { duration: 280 });
  }, [wantBottom, offsetY, bottomOpacity]);

  const topStyle = useAnimatedStyle(() => ({ opacity: topOpacity.value }));
  const bottomStyle = useAnimatedStyle(() => ({ opacity: bottomOpacity.value }));

  const onLayout = (event: LayoutChangeEvent) => {
    setLayoutHeight(event.nativeEvent.layout.height);
  };

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setOffsetY(event.nativeEvent.contentOffset.y);
  };

  return (
    <View style={[styles.wrap, style]} onLayout={onLayout}>
      <ScrollView
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        decelerationRate="normal"
        bounces
        onContentSizeChange={(_w, height) => setContentHeight(height)}
        contentContainerStyle={contentContainerStyle}
      >
        {children}
      </ScrollView>

      <Animated.View
        pointerEvents="none"
        style={[styles.edge, styles.top, { height: edgeHeight }, topStyle]}
      >
        <LinearGradient
          colors={[edgeColor, 'transparent']}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      <Animated.View
        pointerEvents="none"
        style={[styles.edge, styles.bottom, { height: edgeHeight }, bottomStyle]}
      >
        <LinearGradient
          colors={['transparent', edgeColor]}
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
    left: 0,
    right: 0,
    zIndex: 2,
  },
  top: {
    top: 0,
  },
  bottom: {
    bottom: 0,
  },
});
