import { LayoutAnimation, Platform, Pressable, StyleSheet, UIManager } from 'react-native';
import { useMemo } from 'react';

import { FadeEdgeScroll } from '@/src/components/FadeEdgeScroll';
import { Typography } from '@/src/components/Typography';
import {
  PORTFOLIO_SORT_OPTIONS,
  type PortfolioSortKey,
} from '@/src/domain/portfolio';
import { colors, radii, spacing, type AppColors } from '@/src/theme/tokens';
import { useAppTheme } from '@/src/hooks/useAppTheme';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface PortfolioSortChipsProps {
  value: PortfolioSortKey;
  onChange: (key: PortfolioSortKey) => void;
  edgeColor?: string;
}

export function PortfolioSortChips({
  value,
  onChange,
  edgeColor,
}: PortfolioSortChipsProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <FadeEdgeScroll
      edgeColor={edgeColor ?? colors.background}
      softLeadingFade
      preferTrailingFade
      contentContainerStyle={styles.row}
    >
      {PORTFOLIO_SORT_OPTIONS.map((option) => {
        const active = option.key === value;
        const isLeading = option.key === 'default';
        const isTrailing = option.key === 'bottom_return';
        return (
          <Pressable
            key={option.key}
            onPress={() => {
              LayoutAnimation.configureNext({
                duration: 280,
                update: { type: LayoutAnimation.Types.easeInEaseOut },
                create: {
                  type: LayoutAnimation.Types.easeInEaseOut,
                  property: LayoutAnimation.Properties.opacity,
                },
              });
              onChange(option.key);
            }}
            style={[
              styles.chip,
              active && styles.chipActive,
              isLeading && styles.chipLeading,
              isTrailing && styles.chipTrailing,
            ]}
          >
            <Typography
              variant="label"
              color={active ? colors.black : colors.textMuted}
            >
              {option.label}
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
  chipLeading: {
    // Padrão — primeiro a receber a transição à esquerda
  },
  chipTrailing: {
    // Mais desvalorizaram — já nasce sob o fade da borda direita
    opacity: 0.92,
  },
}); }
