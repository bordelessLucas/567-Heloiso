import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams, type Href } from 'expo-router';

import { Button, ChangeBadge, Container, ScreenHeader, Typography } from '@/src/components';
import { AssetAvatar } from '@/src/components/AssetAvatar';
import { PeriodFilterChips } from '@/src/components/PeriodFilterChips';
import { SparklineChart } from '@/src/components/SparklineChart';
import { TradeHistoryList } from '@/src/components/TradeHistoryList';
import { TradeSheet } from '@/src/components/TradeSheet';
import type { HistoryPeriodDays, PortfolioTradeSide } from '@/src/domain/portfolio';
import { useHoldingDetail } from '@/src/hooks/usePortfolio';
import { colors, radii, shadows, spacing } from '@/src/theme/tokens';
import { formatBrl, formatPercent } from '@/src/utils/format';

export function HoldingDetailScreen() {
  const params = useLocalSearchParams<{ ticker: string }>();
  const ticker = String(params.ticker ?? '').toUpperCase();
  const [chartDays, setChartDays] = useState<HistoryPeriodDays>(30);
  const [historyDays, setHistoryDays] = useState<HistoryPeriodDays>(90);
  const [tradeSide, setTradeSide] = useState<PortfolioTradeSide | null>(null);
  const { detail, loading, trade } = useHoldingDetail(ticker, { chartDays, historyDays });

  if (loading && !detail) {
    return (
      <Container contentStyle={styles.center} safeBottom>
        <ActivityIndicator color={colors.primary} size="large" />
      </Container>
    );
  }

  if (!detail) {
    return (
      <Container scroll contentStyle={styles.content} safeBottom>
        <ScreenHeader
          title={ticker || 'Ativo'}
          subtitle="Posição não encontrada na sua carteira."
          showBack
        />
        <Button
          label="Voltar à carteira"
          onPress={() => router.replace('/(tabs)/portfolio' as Href)}
        />
      </Container>
    );
  }

  const { position, priceSeries, suggestions, trades } = detail;
  const positive = position.pnlAmount >= 0;
  const price = position.currentPrice ?? position.averagePrice;

  return (
    <Container scroll contentStyle={styles.content} safeBottom>
      <ScreenHeader title="Posição" showBack />

      <View style={styles.hero}>
        <View style={styles.identity}>
          <AssetAvatar ticker={position.ticker} name={position.name} size={48} />
          <Typography variant="h1" color={colors.black} numberOfLines={1}>
            {position.ticker}
          </Typography>
          <Typography variant="caption" color={colors.textMuted} numberOfLines={2}>
            {position.name}
          </Typography>
          <ChangeBadge value={position.changePercent} />
        </View>

        <View style={styles.heroMetrics}>
          <View style={styles.heroMetric}>
            <Typography variant="caption" color={colors.textMuted}>
              Cotas
            </Typography>
            <Typography variant="h2" color={colors.black}>
              {position.quantity}
            </Typography>
          </View>
          <View style={styles.heroMetric}>
            <Typography variant="caption" color={colors.textMuted}>
              Cotação
            </Typography>
            <Typography variant="h2" color={colors.black} numberOfLines={1}>
              {formatBrl(price)}
            </Typography>
          </View>
          <View style={styles.heroMetric}>
            <Typography variant="caption" color={colors.textMuted}>
              Resultado
            </Typography>
            <Typography
              variant="h2"
              color={positive ? colors.success : colors.danger}
              numberOfLines={1}
            >
              {formatPercent(position.pnlPercent)}
            </Typography>
          </View>
        </View>

        <Typography variant="caption" color={colors.textMuted} numberOfLines={1}>
          Valor {formatBrl(position.marketValue)} · médio {formatBrl(position.averagePrice)}
        </Typography>
      </View>

      <View style={styles.tradeBox}>
        <Typography variant="caption" color={colors.textMuted}>
          Operar posição
        </Typography>
        <View style={styles.actions}>
          <View style={styles.actionBtn}>
            <Button label="Comprar" onPress={() => setTradeSide('buy')} />
          </View>
          <View style={styles.actionBtn}>
            <Button
              label="Vender"
              variant="danger"
              onPress={() => setTradeSide('sell')}
              disabled={position.quantity <= 0}
            />
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Typography variant="h3">Atualização do preço</Typography>
        <PeriodFilterChips
          value={chartDays}
          onChange={setChartDays}
          edgeColor={colors.surfaceElevated}
        />
        <SparklineChart series={priceSeries} positive={positive} height={120} />
      </View>

      <View style={styles.card}>
        <Typography variant="h3">Parecidas e em alta</Typography>
        <Typography variant="caption" color={colors.textMuted}>
          Toque para abrir a análise do fundo.
        </Typography>
        {suggestions.map((item) => (
          <Pressable
            key={item.ticker}
            style={styles.suggestion}
            onPress={() => router.push(`/fund/${item.ticker}` as Href)}
          >
            <View style={styles.suggestionIdentity}>
              <AssetAvatar ticker={item.ticker} name={item.name} size={32} />
              <View style={styles.suggestionNames}>
                <Typography variant="bodyStrong" numberOfLines={1}>
                  {item.ticker}
                </Typography>
                <Typography variant="caption" color={colors.textMuted} numberOfLines={1}>
                  {item.name}
                </Typography>
              </View>
            </View>
            <View style={styles.suggestionValues}>
              <Typography variant="bodyStrong" numberOfLines={1}>
                {formatBrl(item.sharePrice)}
              </Typography>
              <ChangeBadge value={item.changePercent} />
            </View>
          </Pressable>
        ))}
        {suggestions.length === 0 ? (
          <Typography variant="body" color={colors.textMuted}>
            Sem pares em alta no momento.
          </Typography>
        ) : null}
      </View>

      <View style={styles.card}>
        <Typography variant="h3">Histórico deste ativo</Typography>
        <PeriodFilterChips
          value={historyDays}
          onChange={setHistoryDays}
          edgeColor={colors.surfaceElevated}
        />
        <TradeHistoryList trades={trades} />
      </View>

      <Pressable onPress={() => router.push(`/fund/${position.ticker}` as Href)}>
        <Typography variant="label" color={colors.primaryDark}>
          Ver análise pública do fundo →
        </Typography>
      </Pressable>

      <TradeSheet
        visible={tradeSide !== null}
        side={tradeSide ?? 'buy'}
        ticker={position.ticker}
        unitPrice={price}
        maxQuantity={position.quantity}
        onClose={() => setTradeSide(null)}
        onConfirm={async (quantity) => {
          if (!tradeSide) return;
          const result = await trade({ side: tradeSide, quantity });
          if (result.quantity === 0) {
            router.replace('/(tabs)/portfolio' as Href);
          }
        }}
      />
    </Container>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: {
    backgroundColor: colors.surfaceWarm,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.md,
    ...shadows.card,
  },
  identity: {
    alignItems: 'flex-start',
    gap: 6,
  },
  heroMetrics: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  heroMetric: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  tradeBox: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.sm,
    ...shadows.card,
  },
  actionBtn: {
    flex: 1,
  },
  card: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.sm,
    ...shadows.card,
  },
  suggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  suggestionIdentity: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 6,
    minWidth: 0,
  },
  suggestionNames: {
    gap: 1,
    width: '100%',
  },
  suggestionValues: {
    alignItems: 'flex-end',
    gap: 4,
    flexShrink: 0,
  },
});
