import { Pressable, StyleSheet, View } from 'react-native';
import { useMemo } from 'react';
import { router, type Href } from 'expo-router';

import { ModuleIcon } from '@/src/components/ModuleIcon';
import { Typography } from '@/src/components/Typography';
import type { PlannerChallenge } from '@/src/domain/planner';
import { colors, radii, shadows, spacing, type AppColors } from '@/src/theme/tokens';
import { useAppTheme } from '@/src/hooks/useAppTheme';
import { formatBrl } from '@/src/utils/format';

interface HomeStreakCardProps {
  challenge: PlannerChallenge | null;
}

export function HomeStreakCard({ challenge }: HomeStreakCardProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const remaining = challenge
    ? Math.max(0, challenge.totalDays - challenge.completedDays)
    : null;
  const progress = challenge
    ? Math.min(1, challenge.completedDays / challenge.totalDays)
    : 0;

  return (
    <Pressable
      onPress={() => router.push('/planner' as Href)}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.header}>
        <ModuleIcon name="planner" size={20} tone="yellow" />
        <Typography variant="label" color={colors.black}>
          Seu Planner
        </Typography>
      </View>

      {challenge ? (
        <>
          <Typography variant="body" color={colors.textMuted} numberOfLines={2}>
            Objetivo: {challenge.objective}
          </Typography>

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Typography variant="caption" color={colors.textMuted}>
                Sequência
              </Typography>
              <Typography variant="h2" color={colors.black}>
                {challenge.streak} dias
              </Typography>
            </View>
            <View style={styles.stat}>
              <Typography variant="caption" color={colors.textMuted}>
                Faltam
              </Typography>
              <Typography variant="h2" color={colors.primaryDark}>
                {remaining} dias
              </Typography>
            </View>
          </View>

          <View style={styles.savedBlock}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
            </View>
            <View style={styles.savedBox}>
              <ModuleIcon name="savings" size={16} tone="light" />
              <View style={styles.savedText}>
                <Typography variant="caption" color={colors.textMuted}>
                  Já poupado
                </Typography>
                <Typography variant="h3" color={colors.black}>
                  {formatBrl(challenge.savedAmount)}
                </Typography>
              </View>
            </View>
          </View>

          <Typography variant="caption" color={colors.textMuted}>
            Toque para continuar o check-in
          </Typography>
        </>
      ) : (
        <>
          <Typography variant="h3" color={colors.black}>
            Defina um objetivo e comece
          </Typography>
          <Typography variant="caption" color={colors.textMuted}>
            Um check-in por dia, visual e simples.
          </Typography>
        </>
      )}
    </Pressable>
  );
}

function createStyles(colors: AppColors) { return StyleSheet.create({
  card: {
    gap: spacing.sm,
    backgroundColor: colors.surfaceFeature,
    borderRadius: radii.lg,
    padding: spacing.md,
    ...shadows.card,
  },
  pressed: {
    opacity: 0.94,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  stat: {
    flex: 1,
    gap: 2,
  },
  savedBlock: {
    gap: spacing.sm,
  },
  savedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.md,
    padding: spacing.sm,
  },
  savedText: {
    flex: 1,
    gap: 2,
  },
  progressTrack: {
    height: 8,
    borderRadius: radii.full,
    backgroundColor: colors.borderSubtle,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
}); }
