import { StyleSheet, View } from 'react-native';
import { useMemo } from 'react';

import { ModuleIcon } from '@/src/components/ModuleIcon';
import { Typography } from '@/src/components/Typography';
import { colors, radii, shadows, spacing, type AppColors } from '@/src/theme/tokens';
import { useAppTheme } from '@/src/hooks/useAppTheme';

interface StreakHeroProps {
  streak: number;
  progress: number;
  completedDays: number;
  totalDays: number;
  savedAmountLabel: string;
  dailyTargetLabel: string;
}

export function StreakHero({
  streak,
  progress,
  completedDays,
  totalDays,
  savedAmountLabel,
  dailyTargetLabel,
}: StreakHeroProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const clamped = Math.max(0, Math.min(1, progress));
  const remainingDays = Math.max(0, totalDays - completedDays);

  return (
    <View style={styles.wrap}>
      <View style={styles.topRow}>
        <View style={styles.ringOuter}>
          <View style={[styles.ringFill, { height: `${Math.max(0.08, clamped) * 100}%` }]} />
          <View style={styles.ringInner}>
            <ModuleIcon name="streak" size={16} tone="light" />
            <Typography variant="h1" color={colors.black}>
              {streak}
            </Typography>
            <Typography variant="caption" color={colors.textMuted}>
              sequência
            </Typography>
          </View>
        </View>

        <View style={styles.countdown}>
          <Typography variant="caption" color={colors.textMuted}>
            Dias restantes
          </Typography>
          <Typography variant="display" color={colors.black}>
            {remainingDays}
          </Typography>
          <Typography variant="body" color={colors.textMuted}>
            de {totalDays} no desafio
          </Typography>
          <Typography variant="caption" color={colors.primaryDark}>
            {Math.round(clamped * 100)}% da meta
          </Typography>
        </View>
      </View>

      <View style={styles.savedBlock}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${clamped * 100}%` }]} />
        </View>

        <View style={styles.metrics}>
          <View style={styles.metricCard}>
            <ModuleIcon name="savings" size={18} tone="yellow" />
            <View style={styles.metricText}>
              <Typography variant="caption" color={colors.textMuted}>
                Já poupado
              </Typography>
              <Typography variant="h3" color={colors.black}>
                {savedAmountLabel}
              </Typography>
            </View>
          </View>
          <View style={styles.metricCard}>
            <ModuleIcon name="calendar" size={18} tone="light" />
            <View style={styles.metricText}>
              <Typography variant="caption" color={colors.textMuted}>
                Meta diária
              </Typography>
              <Typography variant="h3" color={colors.black}>
                {dailyTargetLabel}
              </Typography>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

function createStyles(colors: AppColors) { return StyleSheet.create({
  wrap: {
    gap: spacing.md,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.lg,
    padding: spacing.lg,
    ...shadows.card,
  },
  topRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    alignItems: 'center',
  },
  ringOuter: {
    width: 118,
    height: 118,
    borderRadius: 59,
    backgroundColor: colors.surfaceWarm,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  ringFill: {
    width: '100%',
    backgroundColor: colors.primary,
  },
  ringInner: {
    ...StyleSheet.absoluteFill,
    margin: 10,
    borderRadius: 49,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  countdown: {
    flex: 1,
    gap: spacing.xs,
  },
  savedBlock: {
    gap: spacing.sm,
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
  metrics: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  metricCard: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
    backgroundColor: colors.surfaceWarm,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  metricText: {
    flex: 1,
    gap: 2,
  },
}); }
