import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { router, type Href } from 'expo-router';

import { Container, ScreenHeader, Typography } from '@/src/components';
import { FadeEdgeScroll } from '@/src/components/FadeEdgeScroll';
import { FundListItem } from '@/src/components/FundListItem';
import { RankingCards } from '@/src/components/RankingCards';
import type { FundSegment, FundSummary } from '@/src/domain/fund';
import { FUND_SEGMENT_LABELS } from '@/src/domain/fund';
import { RANKING_METRIC_OPTIONS } from '@/src/domain/fundsTools';
import type { RankingBoard, RankingMetric } from '@/src/domain/ranking';
import {
  listFundsByRankingMetric,
  listRankingBoards,
} from '@/src/services/funds.service';
import { colors, radii, shadows, spacing } from '@/src/theme/tokens';
import { formatCompactBrl, formatPercent, formatRatio } from '@/src/utils/format';

export function RankingsScreen() {
  const [boards, setBoards] = useState<RankingBoard[]>([]);
  const [funds, setFunds] = useState<FundSummary[]>([]);
  const [metric, setMetric] = useState<RankingMetric>('dividend_yield');
  const [segment, setSegment] = useState<FundSegment | 'all'>('all');
  const [loading, setLoading] = useState(true);

  const metricMeta = useMemo(
    () => RANKING_METRIC_OPTIONS.find((item) => item.id === metric) ?? RANKING_METRIC_OPTIONS[0],
    [metric],
  );

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [nextBoards, nextFunds] = await Promise.all([
        listRankingBoards(),
        listFundsByRankingMetric(metric, { segment }),
      ]);
      setBoards(nextBoards);
      setFunds(nextFunds);
    } finally {
      setLoading(false);
    }
  }, [metric, segment]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const segments = useMemo(
    () =>
      [
        { id: 'all' as const, label: 'Todos' },
        { id: 'logistics' as const, label: FUND_SEGMENT_LABELS.logistics },
        { id: 'paper' as const, label: FUND_SEGMENT_LABELS.paper },
        { id: 'shopping' as const, label: FUND_SEGMENT_LABELS.shopping },
        { id: 'hybrid' as const, label: FUND_SEGMENT_LABELS.hybrid },
      ] as const,
    [],
  );

  return (
    <Container scroll contentStyle={styles.content} safeBottom>
      <ScreenHeader
        title="Rankings de FIIs"
        subtitle="Classifique o snapshot por indicador. Os números ajudam a estudar — não a decidir sozinho."
        showBack
      />

      <View style={styles.filters}>
        <Typography variant="label" color={colors.black}>
          Indicador
        </Typography>
        <FadeEdgeScroll edgeColor={colors.background} contentContainerStyle={styles.chips}>
          {RANKING_METRIC_OPTIONS.map((option) => {
            const active = option.id === metric;
            return (
              <Pressable
                key={option.id}
                onPress={() => setMetric(option.id)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Typography variant="label" color={active ? colors.black : colors.textMuted}>
                  {option.short}
                </Typography>
              </Pressable>
            );
          })}
        </FadeEdgeScroll>

        <Typography variant="label" color={colors.black}>
          Segmento
        </Typography>
        <FadeEdgeScroll edgeColor={colors.background} contentContainerStyle={styles.chips}>
          {segments.map((option) => {
            const active = option.id === segment;
            return (
              <Pressable
                key={option.id}
                onPress={() => setSegment(option.id)}
                style={[styles.chip, active && styles.chipDark]}
              >
                <Typography
                  variant="label"
                  color={active ? colors.surfaceElevated : colors.black}
                >
                  {option.label}
                </Typography>
              </Pressable>
            );
          })}
        </FadeEdgeScroll>

        <View style={styles.tipCard}>
          <Typography variant="caption" color={colors.textMuted}>
            {metricMeta?.tip}
          </Typography>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} />
      ) : (
        <>
          <View style={styles.section}>
            <Typography variant="h3">
              {metricMeta?.label}
              {segment !== 'all' ? ` · ${FUND_SEGMENT_LABELS[segment]}` : ''}
            </Typography>
            <View style={styles.list}>
              {funds.map((fund, index) => (
                <View key={fund.id} style={styles.rankRow}>
                  <Typography variant="label" color={colors.primaryDark}>
                    #{index + 1}
                  </Typography>
                  <View style={styles.rankItem}>
                    <FundListItem
                      fund={fund}
                      onPress={() => router.push(`/fund/${fund.ticker}` as Href)}
                    />
                  </View>
                  <Typography variant="caption" color={colors.textMuted}>
                    {metricValueLabel(metric, fund)}
                  </Typography>
                </View>
              ))}
              {funds.length === 0 ? (
                <Typography variant="body" color={colors.textMuted}>
                  Nenhum fundo neste filtro no snapshot.
                </Typography>
              ) : null}
            </View>
          </View>

          <View style={styles.section}>
            <Typography variant="h3">Quadros rápidos</Typography>
            <RankingCards boards={boards} />
          </View>
        </>
      )}
    </Container>
  );
}

function metricValueLabel(metric: RankingMetric, fund: FundSummary): string {
  if (metric === 'dividend_yield') return formatPercent(fund.dividendYield);
  if (metric === 'liquidity') return formatCompactBrl(fund.liquidity);
  if (metric === 'net_worth') return formatCompactBrl(fund.netWorth);
  if (metric === 'pvp') return formatRatio(fund.pvp);
  return '—';
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  filters: {
    gap: spacing.sm,
  },
  chips: {
    gap: spacing.sm,
    paddingVertical: 2,
    paddingRight: spacing.md,
  },
  chip: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...shadows.card,
  },
  chipActive: {
    backgroundColor: colors.primary,
  },
  chipDark: {
    backgroundColor: colors.black,
  },
  tipCard: {
    backgroundColor: colors.surfaceWarm,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  section: {
    gap: spacing.md,
  },
  list: {
    gap: spacing.sm,
  },
  rankRow: {
    gap: spacing.xs,
  },
  rankItem: {
    width: '100%',
  },
});
