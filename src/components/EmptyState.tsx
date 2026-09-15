import { StyleSheet, View } from 'react-native';

import { Typography } from '@/src/components/Typography';
import { colors, radii, spacing } from '@/src/theme/tokens';

interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <View style={styles.box}>
      <Typography variant="bodyStrong">{title}</Typography>
      <Typography variant="caption" color={colors.textMuted}>
        {description}
      </Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.md,
    padding: spacing.lg,
    gap: spacing.sm,
  },
});
