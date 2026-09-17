import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams, type Href } from 'expo-router';

import { Container, ScreenHeader, Typography } from '@/src/components';
import { ChangeBadge } from '@/src/components/ChangeBadge';
import { FUND_SEGMENT_LABELS } from '@/src/domain/fund';
import { useFundDetail } from '@/src/hooks/useFundDetail';
import { colors, radii, shadows, spacing, type AppColors } from '@/src/theme/tokens';
import { useAppTheme } from '@/src/hooks/useAppTheme';
import {
  formatBrl,
  formatCompactBrl,
  formatPercent,
  formatRatio,
} from '@/src/utils/format';

const TABS = [
  { id: 'overview', label: 'Visão geral' },
  { id: 'indicators', label: 'Indicadores' },
  { id: 'portfolio', label: 'Carteira' },
  { id: 'guided', label: 'Leitura' },
  { id: 'docs', label: 'Docs' },
] as const;

type TabId = (typeof TABS)[number]['id'];

export function FundDetailScreen() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const params = useLocalSearchParams<{ ticker: string }>();
  const ticker = typeof params.ticker === 'string' ? params.ticker : '';
  const { fund, loading } = useFundDetail(ticker);
  const [tab, setTab] = useState<TabId>('overview');

  if (loading) {
    return (
      <Container contentStyle={styles.center} safeBottom>
        <ActivityIndicator color={colors.primary} size="large" />
      </Container>
    );
  }

  if (!fund) {
    return (
      <Container contentStyle={styles.content} safeBottom>
        <ScreenHeader title="Fundo não encontrado" showBack />
      </Container>
    );
  }

  return (
    <Container scroll contentStyle={styles.content} safeBottom>
      <ScreenHeader
        title={fund.ticker}
        subtitle={`${fund.name} · ${FUND_SEGMENT_LABELS[fund.segment]}`}
        showBack
      />

      <View style={styles.priceCard}>
        <Typography variant="display">{formatBrl(fund.sharePrice)}</Typography>
        <ChangeBadge value={fund.changePercent} />
        <Typography variant="caption" color={colors.textMuted}>
          Snapshot mock — não atualiza em tempo real no MVP
        </Typography>
      </View>

      <View style={styles.tabs}>
        {TABS.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => setTab(item.id)}
            style={[styles.tab, tab === item.id && styles.tabActive]}
          >
            <Typography
              variant="caption"
              color={tab === item.id ? colors.black : colors.textMuted}
            >
              {item.label}
            </Typography>
          </Pressable>
        ))}
      </View>

      {tab === 'overview' ? (
        <View style={styles.block}>
          <Typography variant="body">{fund.description}</Typography>
          <View style={styles.grid}>
            <Metric label="DY" value={formatPercent(fund.dividendYield)} />
            <Metric label="P/VP" value={formatRatio(fund.pvp)} />
            <Metric label="PL" value={formatCompactBrl(fund.netWorth)} />
            <Metric label="Liquidez" value={formatCompactBrl(fund.liquidity)} />
          </View>
          <View style={styles.card}>
            <Typography variant="h3">FII × Tesouro IPCA+</Typography>
            <Typography variant="body" color={colors.textMuted}>
              Tesouro: {formatPercent(fund.tesouroIpcaComparison.tesouroRate)} · DY 12m:{' '}
              {formatPercent(fund.tesouroIpcaComparison.fundDy12m)} · Prêmio aparente:{' '}
              {formatPercent(fund.tesouroIpcaComparison.premiumPercent)}
            </Typography>
            <Typography variant="caption" color={colors.textMuted}>
              {fund.tesouroIpcaComparison.note}
            </Typography>
            <Pressable
              onPress={() =>
                router.push(`/tools/tesouro-ipca?ticker=${fund.ticker}` as Href)
              }
            >
              <Typography variant="label" color={colors.primaryDark}>
                Abrir comparação completa →
              </Typography>
            </Pressable>
          </View>
        </View>
      ) : null}

      {tab === 'indicators' ? (
        <View style={styles.block}>
          {fund.indicators.map((indicator) => (
            <View key={indicator.key} style={styles.card}>
              <Typography variant="bodyStrong">
                {indicator.label}:{' '}
                {indicator.unit === 'percent'
                  ? formatPercent(indicator.value)
                  : indicator.unit === 'currency'
                    ? formatCompactBrl(indicator.value)
                    : formatRatio(indicator.value)}
              </Typography>
              <Typography variant="caption" color={colors.textMuted}>
                {indicator.explanation}
              </Typography>
              <Typography variant="caption">{indicator.interpretation}</Typography>
              <Typography variant="caption" color={colors.warning}>
                Cuidado: {indicator.caution}
              </Typography>
            </View>
          ))}
        </View>
      ) : null}

      {tab === 'portfolio' ? (
        <View style={styles.block}>
          {fund.allocations.map((item) => (
            <View key={item.label} style={styles.allocRow}>
              <View style={styles.allocMeta}>
                <Typography variant="bodyStrong">{item.label}</Typography>
                {item.region ? (
                  <Typography variant="caption" color={colors.textMuted}>
                    {item.region}
                  </Typography>
                ) : null}
              </View>
              <Typography variant="bodyStrong">{formatPercent(item.sharePercent, 0)}</Typography>
            </View>
          ))}
        </View>
      ) : null}

      {tab === 'guided' ? (
        <View style={styles.block}>
          {fund.guidedReading.map((point) => (
            <View
              key={point.id}
              style={[
                styles.card,
                point.tone === 'positive' && styles.tonePositive,
                point.tone === 'attention' && styles.toneAttention,
              ]}
            >
              <Typography variant="label">
                {point.tone === 'positive'
                  ? 'Positivo'
                  : point.tone === 'attention'
                    ? 'Atenção'
                    : 'Neutro'}
              </Typography>
              <Typography variant="bodyStrong">{point.title}</Typography>
              <Typography variant="caption" color={colors.textMuted}>
                {point.detail}
              </Typography>
            </View>
          ))}
          <Typography variant="caption" color={colors.textMuted}>
            A leitura guia a interpretação — nunca recomenda comprar ou vender.
          </Typography>
        </View>
      ) : null}

      {tab === 'docs' ? (
        <View style={styles.block}>
          {fund.documents.length === 0 ? (
            <Typography variant="body" color={colors.textMuted}>
              Sem documentos no snapshot mock deste fundo.
            </Typography>
          ) : (
            fund.documents.map((doc) => (
              <View key={doc.id} style={styles.card}>
                <Typography variant="bodyStrong">{doc.title}</Typography>
                <Typography variant="caption" color={colors.textMuted}>
                  {doc.type} · {doc.publishedAt}
                </Typography>
              </View>
            ))
          )}
        </View>
      ) : null}
    </Container>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={styles.metric}>
      <Typography variant="caption" color={colors.textMuted}>
        {label}
      </Typography>
      <Typography variant="bodyStrong">{value}</Typography>
    </View>
  );
}

function createStyles(colors: AppColors) { return StyleSheet.create({
  content: {
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priceCard: {
    gap: spacing.sm,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.lg,
    padding: spacing.lg,
    ...shadows.card,
  },
  tabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tab: {
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surfaceElevated,
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  block: {
    gap: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  metric: {
    width: '47%',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: 4,
    ...shadows.card,
  },
  card: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: spacing.xs,
    ...shadows.card,
  },
  allocRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.md,
    padding: spacing.md,
    ...shadows.card,
  },
  allocMeta: {
    flex: 1,
    gap: 2,
  },
  tonePositive: {
    borderColor: colors.success,
  },
  toneAttention: {
    borderColor: colors.warning,
  },
}); }
