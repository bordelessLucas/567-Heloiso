import {
  Text as RNText,
  StyleSheet,
  type StyleProp,
  type TextProps as RNTextProps,
  type TextStyle,
} from 'react-native';

import { typography } from '@/src/theme/tokens';
import { useAppTheme } from '@/src/hooks/useAppTheme';

export type TypographyVariant =
  | 'display'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'body'
  | 'bodyStrong'
  | 'caption'
  | 'label';

export interface TypographyProps extends RNTextProps {
  variant?: TypographyVariant;
  color?: string;
  style?: StyleProp<TextStyle>;
}

export function Typography({
  variant = 'body',
  color,
  style,
  children,
  ...rest
}: TypographyProps) {
  const { colors: themeColors } = useAppTheme();

  return (
    <RNText
      style={[styles.base, variantStyles[variant], { color: color ?? themeColors.text }, style]}
      {...rest}
    >
      {children}
    </RNText>
  );
}

const styles = StyleSheet.create({
  base: {
    fontFamily: typography.fontFamily.regular,
  },
});

const variantStyles = StyleSheet.create({
  display: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.display,
    fontWeight: '700',
    lineHeight: typography.fontSize.display * typography.lineHeight.tight,
  },
  h1: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.h1,
    fontWeight: '700',
    lineHeight: typography.fontSize.h1 * typography.lineHeight.tight,
  },
  h2: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.xl,
    fontWeight: '600',
    lineHeight: typography.fontSize.xl * typography.lineHeight.tight,
  },
  h3: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    lineHeight: typography.fontSize.lg * typography.lineHeight.normal,
  },
  body: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.body,
    fontWeight: '400',
    lineHeight: typography.fontSize.body * typography.lineHeight.normal,
  },
  bodyStrong: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.body,
    fontWeight: '600',
    lineHeight: typography.fontSize.body * typography.lineHeight.normal,
  },
  caption: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.sm,
    fontWeight: '400',
    lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
  },
  label: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.md,
    fontWeight: '500',
    lineHeight: typography.fontSize.md * typography.lineHeight.normal,
  },
});
