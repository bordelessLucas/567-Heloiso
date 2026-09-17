import { LayoutAnimation, Platform, Pressable, StyleSheet, UIManager } from 'react-native';
import { useMemo } from 'react';

import { FadeEdgeScroll } from '@/src/components/FadeEdgeScroll';
import { Typography } from '@/src/components/Typography';
import { colors, radii, spacing, type AppColors } from '@/src/theme/tokens';
import { useAppTheme } from '@/src/hooks/useAppTheme';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface SegmentChipsProps {
  segments: ReadonlyArray<{ id: string; label: string }>;
  selected: string;
  onSelect: (id: string) => void;
  edgeColor?: string;
}

export function SegmentChips({
  segments,
  selected,
  onSelect,
  edgeColor,
}: SegmentChipsProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <FadeEdgeScroll
      edgeColor={edgeColor ?? colors.background}
      softLeadingFade
      preferTrailingFade
      contentContainerStyle={styles.row}
    >
      {segments.map((segment, index) => {
        const active = segment.id === selected;
        return (
          <Pressable
            key={segment.id}
            onPress={() => {
              LayoutAnimation.configureNext({
                duration: 280,
                update: { type: LayoutAnimation.Types.easeInEaseOut },
              });
              onSelect(segment.id);
            }}
            style={[
              styles.chip,
              active && styles.chipActive,
              index === 0 && styles.chipLeading,
              index === segments.length - 1 && styles.chipTrailing,
            ]}
          >
            <Typography variant="label" color={active ? colors.surface : colors.black}>
              {segment.label}
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
    backgroundColor: colors.black,
  },
  chipLeading: {},
  chipTrailing: {
    opacity: 0.92,
  },
}); }
