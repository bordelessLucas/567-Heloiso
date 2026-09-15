import { StyleSheet, View } from 'react-native';

import { Typography } from '@/src/components/Typography';
import type { PlannerCheckIn, PlannerWeekDay } from '@/src/domain/planner';
import { colors, radii, spacing } from '@/src/theme/tokens';

interface PlannerProgressProps {
  week: PlannerWeekDay[];
  checkIns: PlannerCheckIn[];
}

export function PlannerWeekStrip({ week }: { week: PlannerWeekDay[] }) {
  return (
    <View style={styles.week}>
      {week.map((day) => (
        <View key={day.dateKey} style={styles.day}>
          <Typography variant="caption" color={colors.textMuted}>
            {day.label}
          </Typography>
          <View
            style={[
              styles.dot,
              day.checked && styles.dotChecked,
              day.isToday && styles.dotToday,
            ]}
          />
        </View>
      ))}
    </View>
  );
}

export function SavingsBars({ checkIns }: { checkIns: PlannerCheckIn[] }) {
  const recent = checkIns.slice(-10);
  const max = Math.max(...recent.map((item) => item.amount), 1);

  if (recent.length === 0) {
    return (
      <View style={styles.emptyChart}>
        <Typography variant="caption" color={colors.textMuted}>
          Seu gráfico de aportes aparece após o primeiro check-in.
        </Typography>
      </View>
    );
  }

  return (
    <View style={styles.chart}>
      {recent.map((item) => (
        <View key={item.id} style={styles.barWrap}>
          <View style={[styles.bar, { height: Math.max(8, (item.amount / max) * 72) }]} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  week: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  day: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  dot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.borderSubtle,
  },
  dotChecked: {
    backgroundColor: colors.primary,
  },
  dotToday: {
    borderWidth: 2,
    borderColor: colors.black,
  },
  chart: {
    height: 96,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  barWrap: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    borderRadius: radii.sm,
    backgroundColor: colors.primary,
  },
  emptyChart: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.md,
    padding: spacing.md,
  },
});
