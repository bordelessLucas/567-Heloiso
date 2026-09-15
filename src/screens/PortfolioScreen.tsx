import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { router, type Href } from 'expo-router';

import {
  Container,
  ScreenHeader,
  Typography,
} from '@/src/components';
import { AllocationRing } from '@/src/components/AllocationRing';
import { HoldingPositionCard } from '@/src/components/HoldingPositionCard';
import { PeriodFilterChips } from '@/src/components/PeriodFilterChips';
import { PortfolioSortChips } from '@/src/components/PortfolioSortChips';
import { SparklineChart } from '@/src/components/SparklineChart';
import { TradeHistoryList } from '@/src/components/TradeHistoryList';
import type { HistoryPeriodDays, PortfolioSortKey } from '@/src/domain/portfolio';
import { usePortfolio } from '@/src/hooks/usePortfolio';
import { colors, radii, shadows, spacing } from '@/src/theme/tokens';
import { formatBrl, formatPercent } from '@/src/utils/format';

export function PortfolioScreen() {
  const [sort, setSort] = useState<PortfolioSortKey>('default');
  const [chartDays, setChartDays] = useState<HistoryPeriodDays>(30);
  const [historyDays, setHistoryDays] = useState<HistoryPeriodDays>(30);
  const { dashboard, trades, loading, reorder } = usePortfolio({
    sort,
    chartDays,
    historyDays,
  });

  if (loading && !dashboard) {
    return (
      <Container contentStyle={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
      </Container>
    );
  }

  if (!dashboard || dashboard.summary.holdingsCount === 0) {
    return (
      <Container scroll contentStyle={styles.content}>
        <ScreenHeader
          title="Carteira"
          subtitle="Analise suas cotas, registre compras e vendas e acompanhe o histórico."
        />
        <View style={styles.empty}>
          <Typography variant="h3">Carteira vazia</Typography>
          <Typography variant="body" color={colors.textMuted}>
            Entre com lorenzo@gmail.com para ver a carteira demo, ou explore fundos e
            adicione a primeira posição pela análise.
          </Typography>
          <Pressable
            style={styles.cta}
            onPress={() => router.push('/(tabs)/funds' as Href)}
          >
            <Typography variant="label" color={colors.black}>
              Explorar fundos →
            </Typography>
          </Pressable>
        </View>
      </Container>
    );
  }

  const positive = dashboard.totalPnlAmount >= 0;

  return (
    <Container scroll contentStyle={styles.content}>
      <ScreenHeader
        title="Carteira"
        subtitle="Toque em um ativo para analisar, comprar ou vender cotas."
      />

      <AllocationRing positions={dashboard.positions} variant="compact" />

      <View style={styles.summary}>
        <Typography variant="caption" color={colors.textMuted}>
          Valor de mercado
        </Typography>
        <Typography variant="h1" color={colors.black}>
          {formatBrl(dashboard.totalMarketValue)}
        </Typography>
        <Typography variant="body" color={positive ? colors.success : colors.danger}>
          {positive ? '+' : ''}
          {formatBrl(dashboard.totalPnlAmount)} ({formatPercent(dashboard.totalPnlPercent)})
        </Typography>
        <Typography variant="caption" color={colors.textMuted}>
          Investido {formatBrl(dashboard.summary.totalInvested)} ·{' '}
          {dashboard.summary.holdingsCount} posições
        </Typography>

        <View style={styles.chartBlock}>
          <View style={styles.chartHeader}>
            <Typography variant="label" color={colors.black}>
              Evolução da carteira
            </Typography>
          </View>
          <PeriodFilterChips
            value={chartDays}
            onChange={setChartDays}
            edgeColor={colors.surfaceWarm}
          />
          <SparklineChart
            series={dashboard.equitySeries}
            positive={positive}
            height={108}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Typography variant="h3">Suas ações</Typography>
        <Typography variant="caption" color={colors.textMuted}>
          Toque no ativo para ver detalhes, comprar ou vender.
        </Typography>
        <PortfolioSortChips value={sort} onChange={setSort} />
        <View style={styles.list}>
          {dashboard.positions.map((position) => (
            <HoldingPositionCard
              key={position.id}
              position={position}
              showReorder={sort === 'default'}
              onPress={() => router.push(`/holding/${position.ticker}` as Href)}
              onMoveUp={() => void reorder(position.ticker, 'up')}
              onMoveDown={() => void reorder(position.ticker, 'down')}
            />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Typography variant="h3">Histórico de compra e venda</Typography>
        <Typography variant="caption" color={colors.textMuted}>
          Janela relativa até hoje (1 a 360 dias).
        </Typography>
        <PeriodFilterChips value={historyDays} onChange={setHistoryDays} />
        <TradeHistoryList trades={trades} />
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.sm,
    ...shadows.card,
  },
  cta: {
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  summary: {
    backgroundColor: colors.surfaceWarm,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.xs,
    ...shadows.card,
  },
  chartBlock: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  section: {
    gap: spacing.sm,
  },
  list: {
    gap: spacing.sm,
  },
});
