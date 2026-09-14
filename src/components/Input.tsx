import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { colors, radii, spacing, typography } from '@/src/theme/tokens';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  leftIcon?: string;
  isPassword?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
}

export function Input({
  label,
  error,
  leftIcon,
  isPassword = false,
  containerStyle,
  editable = true,
  ...rest
}: InputProps) {
  const [secure, setSecure] = useState(isPassword);
  const hasError = Boolean(error);

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <View
        style={[
          styles.field,
          hasError && styles.fieldError,
          !editable && styles.fieldDisabled,
        ]}
      >
        {leftIcon ? <Text style={styles.icon}>{leftIcon}</Text> : null}

        <TextInput
          {...rest}
          editable={editable}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={secure}
          style={styles.input}
        />

        {isPassword ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={secure ? 'Mostrar senha' : 'Ocultar senha'}
            hitSlop={8}
            onPress={() => setSecure((prev) => !prev)}
          >
            <Text style={styles.toggle}>{secure ? 'Mostrar' : 'Ocultar'}</Text>
          </Pressable>
        ) : null}
      </View>

      {hasError ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    gap: spacing.xs,
  },
  label: {
    fontSize: typography.fontSize.md,
    fontWeight: '500',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  field: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  fieldError: {
    borderColor: colors.danger,
  },
  fieldDisabled: {
    opacity: 0.6,
  },
  icon: {
    fontSize: typography.fontSize.body,
    color: colors.textMuted,
  },
  input: {
    flex: 1,
    fontSize: typography.fontSize.body,
    color: colors.text,
    paddingVertical: spacing.sm,
  },
  toggle: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: colors.black,
  },
  error: {
    fontSize: typography.fontSize.sm,
    color: colors.danger,
  },
});
