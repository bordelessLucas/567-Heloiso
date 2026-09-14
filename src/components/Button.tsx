import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { colors, radii, spacing, typography } from '@/src/theme/tokens';

export type ButtonVariant = 'primary' | 'secondary' | 'outline';

export interface ButtonProps extends Omit<PressableProps, 'children'> {
  label: string;
  variant?: ButtonVariant;
  loading?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Button({
  label,
  variant = 'primary',
  loading = false,
  disabled = false,
  fullWidth = true,
  style,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        fullWidth && styles.fullWidth,
        variantStyles[variant].container,
        pressed && !isDisabled && variantStyles[variant].pressed,
        isDisabled && styles.disabled,
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' ? colors.black : colors.black}
        />
      ) : (
        <Text style={[styles.label, variantStyles[variant].label]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  fullWidth: {
    width: '100%',
  },
  label: {
    fontSize: typography.fontSize.body,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.45,
  },
});

const variantStyles = {
  primary: StyleSheet.create({
    container: {
      backgroundColor: colors.primary,
    },
    pressed: {
      backgroundColor: colors.primaryDark,
    },
    label: {
      color: colors.black,
    },
  }),
  secondary: StyleSheet.create({
    container: {
      backgroundColor: colors.black,
    },
    pressed: {
      backgroundColor: '#2A2A2A',
    },
    label: {
      color: colors.surface,
    },
  }),
  outline: StyleSheet.create({
    container: {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: colors.black,
    },
    pressed: {
      backgroundColor: colors.border,
    },
    label: {
      color: colors.black,
    },
  }),
};
