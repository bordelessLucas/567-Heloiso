import { StyleSheet, View } from 'react-native';
import { useMemo } from 'react';

import { Typography } from '@/src/components/Typography';
import type { PlannerCheckIn, PlannerWeekDay } from '@/src/domain/planner';
import { colors, radii, shadows, spacing, type AppColors } from '@/src/theme/tokens';
import { useAppTheme } from '@/src/hooks/useAppTheme';
import { formatBrl } from '@/src/utils/format';

const CHART_HEIGHT = 96;
const MAX_BARS = 14;

export function PlannerWeekStrip({ week }: { week: PlannerWeekDay[] }) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
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
              day.missed && styles.dotMissed,
              day.isToday && styles.dotToday,
            ]}
          />
        </View>
      ))}
    </View>
  );
}

function formatHistoryDate(dateKey: string): string {
  const date = new Date(`${dateKey}T12:00:00`);
  if (Number.isNaN(date.getTime())) return dateKey;
  return date.toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  });
}

function dayLabel(dateKey: string): string {
  const date = new Date(`${dateKey}T12:00:00`);
  if (Number.isNaN(date.getTime())) return '·';
  return String(date.getDate()).padStart(2, '0');
}

/** Barras diárias (aporte × sem aporte) + histórico. */
export function SavingsEvolution({ checkIns }: { checkIns: PlannerCheckIn[] }) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const recent = checkIns.slice(-MAX_BARS);
  const history = [...checkIns].reverse();
  const doneAmount = checkIns
    .filter((item) => item.status === 'done')
    .reduce((sum, item) => sum + item.amount, 0);
  const doneCount = checkIns.filter((item) => item.status === 'done').length;
  const missedCount = checkIns.filter((item) => item.status === 'missed').length;
  const maxAmount = Math.max(
    ...recent.map((item) => (item.status === 'done' ? item.amount : 0)),
    1,
  );

  if (checkIns.length === 0) {
    return (
      <View style={styles.emptyCard}>
        <Typography variant="bodyStrong">Ainda sem dias registrados</Typography>
        <Typography variant="caption" color={colors.textMuted}>
          Após o primeiro check-in (ou um dia passado sem aporte), o gráfico e o
          histórico aparecem aqui.
        </Typography>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.chartCard}>
        <View style={styles.chartHead}>
          <View style={styles.chartHeadText}>
            <Typography variant="caption" color={colors.textMuted}>
              Total poupado no desafio
            </Typography>
            <Typography variant="h2" color={colors.black}>
              {formatBrl(doneAmount)}
            </Typography>
          </View>
          <Typography variant="caption" color={colors.textMuted}>
            {doneCount} aporte{doneCount === 1 ? '' : 's'}
            {missedCount > 0 ? ` · ${missedCount} sem` : ''}
          </Typography>
        </View>

        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendSwatch, styles.barDone]} />
            <Typography variant="caption" color={colors.textMuted}>
              Aporte
            </Typography>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendSwatch, styles.barMissed]} />
            <Typography variant="caption" color={colors.textMuted}>
              Sem aporte
            </Typography>
          </View>
        </View>

        <View style={styles.barsRow}>
          {recent.map((item) => {
            const missed = item.status === 'missed';
            const ratio = missed ? 0 : item.amount / maxAmount;
            const height = missed
              ? 6
              : Math.max(12, Math.round(ratio * CHART_HEIGHT));

            return (
              <View key={item.id} style={styles.barCol}>
                <View style={[styles.barTrack, { height: CHART_HEIGHT }]}>
                  <View
                    style={[
                      styles.bar,
                      missed ? styles.barMissed : styles.barDone,
                      { height },
                    ]}
                  />
                </View>
                <Typography
                  variant="caption"
                  color={missed ? colors.danger : colors.textMuted}
                >
                  {dayLabel(item.dateKey)}
                </Typography>
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.historyCard}>
        <Typography variant="label" color={colors.black}>
          Histórico de aportes
        </Typography>
        <View style={styles.historyList}>
          {history.map((item) => {
            const missed = item.status === 'missed';
            return (
              <View key={item.id} style={styles.historyRow}>
                <View style={styles.historyLeft}>
                  <View
                    style={[
                      styles.statusDot,
                      missed ? styles.statusMissed : styles.statusDone,
                    ]}
                  />
                  <View style={styles.historyText}>
                    <Typography variant="bodyStrong">
                      {formatHistoryDate(item.dateKey)}
                    </Typography>
                    <Typography variant="caption" color={colors.textMuted}>
                      Dia {item.dayNumber} ·{' '}
                      {missed ? 'Sem aporte' : 'Check-in concluído'}
                    </Typography>
                  </View>
                </View>
                <Typography
                  variant="bodyStrong"
                  color={missed ? colors.textMuted : colors.black}
                >
                  {missed ? '—' : formatBrl(item.amount)}
                </Typography>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

/** @deprecated Use SavingsEvolution */
export function SavingsBars({ checkIns }: { checkIns: PlannerCheckIn[] }) {
  return <SavingsEvolution checkIns={checkIns} />;
}

function createStyles(colors: AppColors) { return StyleSheet.create({
  week: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.md,
    padding: spacing.md,
    ...shadows.card,
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
  dotMissed: {
    backgroundColor: colors.danger,
    opacity: 0.55,
  },
  dotToday: {
    borderWidth: 2,
    borderColor: colors.black,
  },
  wrap: {
    gap: spacing.sm,
  },
  emptyCard: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.xs,
    ...shadows.card,
  },
  chartCard: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.md,
    ...shadows.card,
  },
  chartHead: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  chartHeadText: {
    flex: 1,
    gap: 2,
  },
  legend: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendSwatch: {
    width: 10,
    height: 10,
    borderRadius: 3,
  },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  barTrack: {
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: '72%',
    maxWidth: 18,
    borderRadius: radii.sm,
  },
  barDone: {
    backgroundColor: colors.primary,
  },
  barMissed: {
    backgroundColor: colors.danger,
    opacity: 0.45,
  },
  historyCard: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.sm,
    ...shadows.card,
  },
  historyList: {
    gap: spacing.sm,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusDone: {
    backgroundColor: colors.primary,
  },
  statusMissed: {
    backgroundColor: colors.danger,
    opacity: 0.7,
  },
  historyText: {
    flex: 1,
    gap: 2,
  },
}); }
