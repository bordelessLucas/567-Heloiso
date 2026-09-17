import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useMemo } from 'react';
import { router, type Href } from 'expo-router';

import { Typography } from '@/src/components/Typography';
import type { RankingBoard } from '@/src/domain/ranking';
import { colors, radii, shadows, spacing, type AppColors } from '@/src/theme/tokens';
import { useAppTheme } from '@/src/hooks/useAppTheme';

interface RankingCardsProps {
  boards: RankingBoard[];
}

export function RankingCards({ boards }: RankingCardsProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {boards.map((board) => (
        <View key={board.id} style={styles.card}>
          <View style={styles.header}>
            <Typography variant="label">{board.title}</Typography>
          </View>
          {board.entries.map((entry) => (
            <Pressable
              key={`${board.id}-${entry.ticker}`}
              style={styles.item}
              onPress={() => router.push(`/fund/${entry.ticker}` as Href)}
            >
              <Typography
                variant="caption"
                color={
                  entry.position === 1
                    ? colors.primaryDark
                    : entry.position === 2
                      ? colors.neutral
                      : entry.position === 3
                        ? colors.warning
                        : colors.textMuted
                }
              >
                #{entry.position}
              </Typography>
              <View style={styles.meta}>
                <Typography variant="bodyStrong">{entry.ticker}</Typography>
                <Typography variant="caption" color={colors.textMuted} numberOfLines={1}>
                  {entry.name}
                </Typography>
              </View>
              <Typography variant="caption">{entry.formattedValue}</Typography>
            </Pressable>
          ))}
          <Pressable onPress={() => router.push('/rankings' as Href)} style={styles.footer}>
            <Typography variant="label">Ver rankings</Typography>
          </Pressable>
        </View>
      ))}
    </ScrollView>
  );
}

function createStyles(colors: AppColors) { return StyleSheet.create({
  row: {
    gap: spacing.md,
    paddingRight: spacing.lg,
  },
  card: {
    width: 280,
    backgroundColor: colors.surfaceWarm,
    borderRadius: radii.lg,
    overflow: 'hidden',
    ...shadows.card,
  },
  header: {
    backgroundColor: colors.surfaceFeature,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderSubtle,
  },
  meta: {
    flex: 1,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderSubtle,
  },
}); }
