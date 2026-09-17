import { StyleSheet, View } from 'react-native';

import { Typography } from '@/src/components/Typography';
import { radii, spacing } from '@/src/theme/tokens';
import { useAppTheme } from '@/src/hooks/useAppTheme';

interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.box, { backgroundColor: colors.surfaceElevated }]}>
      <Typography variant="bodyStrong">{title}</Typography>
      <Typography variant="caption" color={colors.textMuted}>
        {description}
      </Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderRadius: radii.md,
    padding: spacing.lg,
    gap: spacing.sm,
  },
});
