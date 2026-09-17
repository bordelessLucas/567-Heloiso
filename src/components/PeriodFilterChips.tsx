import { LayoutAnimation, Platform, Pressable, StyleSheet, UIManager } from 'react-native';
import { useMemo } from 'react';

import { FadeEdgeScroll } from '@/src/components/FadeEdgeScroll';
import { Typography } from '@/src/components/Typography';
import {
  HISTORY_PERIOD_OPTIONS,
  type HistoryPeriodDays,
} from '@/src/domain/portfolio';
import { colors, radii, spacing, type AppColors } from '@/src/theme/tokens';
import { useAppTheme } from '@/src/hooks/useAppTheme';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface PeriodFilterChipsProps {
  value: HistoryPeriodDays;
  onChange: (days: HistoryPeriodDays) => void;
  edgeColor?: string;
}

export function PeriodFilterChips({
  value,
  onChange,
  edgeColor,
}: PeriodFilterChipsProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <FadeEdgeScroll
      edgeColor={edgeColor ?? colors.background}
      softLeadingFade
      preferTrailingFade
      contentContainerStyle={styles.row}
    >
      {HISTORY_PERIOD_OPTIONS.map((option) => {
        const active = option.days === value;
        return (
          <Pressable
            key={option.days}
            onPress={() => {
              LayoutAnimation.configureNext({
                duration: 280,
                update: { type: LayoutAnimation.Types.easeInEaseOut },
              });
              onChange(option.days);
            }}
            style={[styles.chip, active && styles.chipActive]}
          >
            <Typography
              variant="label"
              color={active ? colors.black : colors.textMuted}
            >
              {option.short}
            </Typography>
          </Pressable>
        );
      })}
    </FadeEdgeScroll>
  );
}

function createStyles(colors: AppColors) { return StyleSheet.create({
  row: {
    gap: spacing.sm,
    paddingLeft: spacing.xs,
    paddingRight: spacing.lg,
    paddingVertical: 2,
  },
  chip: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  chipActive: {
    backgroundColor: colors.primary,
  },
}); }
