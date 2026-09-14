import {
  Text as RNText,
  StyleSheet,
  type StyleProp,
  type TextProps as RNTextProps,
  type TextStyle,
} from 'react-native';

import { colors, typography } from '@/src/theme/tokens';

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
  color = colors.text,
  style,
  children,
  ...rest
}: TypographyProps) {
  return (
    <RNText style={[styles.base, variantStyles[variant], { color }, style]} {...rest}>
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
    fontSize: typography.fontSize.display,
    fontWeight: '700',
    lineHeight: typography.fontSize.display * typography.lineHeight.tight,
  },
  h1: {
    fontSize: typography.fontSize.h1,
    fontWeight: '700',
    lineHeight: typography.fontSize.h1 * typography.lineHeight.tight,
  },
  h2: {
    fontSize: typography.fontSize.xl,
    fontWeight: '600',
    lineHeight: typography.fontSize.xl * typography.lineHeight.tight,
  },
  h3: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    lineHeight: typography.fontSize.lg * typography.lineHeight.normal,
  },
  body: {
    fontSize: typography.fontSize.body,
    fontWeight: '400',
    lineHeight: typography.fontSize.body * typography.lineHeight.normal,
  },
  bodyStrong: {
    fontSize: typography.fontSize.body,
    fontWeight: '600',
    lineHeight: typography.fontSize.body * typography.lineHeight.normal,
  },
  caption: {
    fontSize: typography.fontSize.sm,
    fontWeight: '400',
    lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
  },
  label: {
    fontSize: typography.fontSize.md,
    fontWeight: '500',
    lineHeight: typography.fontSize.md * typography.lineHeight.normal,
  },
});
