import { StyleSheet, Text, View } from 'react-native';
import { useMemo } from 'react';

import { colors, radii, spacing, typography, type AppColors } from '@/src/theme/tokens';
import { useAppTheme } from '@/src/hooks/useAppTheme';
import { formatPercent } from '@/src/utils/format';

interface ChangeBadgeProps {
  value: number | null;
}

export function ChangeBadge({ value }: ChangeBadgeProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  if (value === null) {
    return (
      <View style={[styles.badge, styles.neutral]}>
        <Text style={styles.neutralText}>—</Text>
      </View>
    );
  }

  const positive = value >= 0;

  return (
    <View style={[styles.badge, positive ? styles.up : styles.down]}>
      <Text style={[styles.text, positive ? styles.upText : styles.downText]}>
        {formatPercent(Math.abs(value), 2)} {positive ? '▴' : '▾'}
      </Text>
    </View>
  );
}

function createStyles(colors: AppColors) { return StyleSheet.create({
  badge: {
    borderRadius: radii.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  up: {
    backgroundColor: '#E8F5EF',
  },
  down: {
    backgroundColor: '#FCEBEB',
  },
  neutral: {
    backgroundColor: colors.border,
  },
  text: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
  },
  upText: {
    color: colors.success,
  },
  downText: {
    color: colors.danger,
  },
  neutralText: {
    fontFamily: typography.fontFamily.regular,
    color: colors.textMuted,
    fontSize: typography.fontSize.xs,
  },
}); }
