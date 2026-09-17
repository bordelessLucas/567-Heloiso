import { useCallback, useState, type ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
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
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { spacing } from '@/src/theme/tokens';
import { useAppTheme } from '@/src/hooks/useAppTheme';

export interface ContainerProps {
  children: ReactNode;
  scroll?: boolean;
  keyboardAware?: boolean;
  /** Inclui safe area inferior (use em telas fora das tabs). */
  safeBottom?: boolean;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
}

export function Container({
  children,
  scroll = false,
  keyboardAware = false,
  safeBottom = false,
  style,
  contentStyle,
}: ContainerProps) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const topFade = useSharedValue(0);
  const [pulling, setPulling] = useState(false);

  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const y = event.nativeEvent.contentOffset.y;
      if (y < 0) {
        const strength = Math.min(1, Math.abs(y) / 72);
        topFade.value = 0.4 + strength * 0.6;
        setPulling(true);
      } else if (y > 8) {
        topFade.value = Math.min(0.8, 0.22 + y / 140);
        setPulling(false);
      } else {
        topFade.value = withTiming(0, { duration: 160 });
        setPulling(false);
      }
    },
    [topFade],
  );

  const fadeStyle = useAnimatedStyle(() => ({
    opacity: topFade.value,
  }));

  const edges = safeBottom
    ? (['top', 'left', 'right', 'bottom'] as const)
    : (['top', 'left', 'right'] as const);

  const body = scroll ? (
    <View style={styles.flex}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          !safeBottom && { paddingBottom: spacing.lg },
          contentStyle,
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        decelerationRate="normal"
        scrollEventThrottle={16}
        onScroll={onScroll}
        bounces
        overScrollMode="always"
      >
        {children}
      </ScrollView>

      <Animated.View
        pointerEvents="none"
        style={[
          styles.topFade,
          { height: Math.max(insets.top + 28, 48) },
          fadeStyle,
        ]}
      >
        <LinearGradient
          colors={[colors.background, 'transparent']}
          locations={[0.35, 1]}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {pulling ? (
        <View
          pointerEvents="none"
          style={[styles.topMask, { height: insets.top, backgroundColor: colors.background }]}
        />
      ) : null}
    </View>
  ) : (
    <View style={[styles.content, contentStyle]}>{children}</View>
  );

  const maybeKeyboard = keyboardAware ? (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.flex}
    >
      {body}
    </KeyboardAvoidingView>
  ) : (
    body
  );

  return (
    <SafeAreaView
      edges={[...edges]}
      style={[styles.safe, { backgroundColor: colors.background }, style]}
    >
      {maybeKeyboard}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    overflow: 'hidden',
  },
  flex: {
    flex: 1,
    position: 'relative',
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  topFade: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 4,
  },
  topMask: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 5,
  },
});
