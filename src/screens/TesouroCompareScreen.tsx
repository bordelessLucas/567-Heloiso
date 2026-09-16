import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams, type Href } from 'expo-router';

import {
  Container,
  FundListItem,
  ScreenHeader,
  Typography,
} from '@/src/components';
import { FadeEdgeScroll } from '@/src/components/FadeEdgeScroll';
import type { FundSummary } from '@/src/domain/fund';
import type { TesouroComparisonView } from '@/src/domain/fundsTools';
import { listFunds, getTesouroComparison } from '@/src/services/funds.service';
import { colors, radii, shadows, spacing } from '@/src/theme/tokens';
import { formatPercent } from '@/src/utils/format';

export function TesouroCompareScreen() {
  const params = useLocalSearchParams<{ ticker?: string }>();
  const initialTicker =
    typeof params.ticker === 'string' ? params.ticker.toUpperCase() : 'HGLG11';

  const [funds, setFunds] = useState<FundSummary[]>([]);
  const [selectedTicker, setSelectedTicker] = useState(initialTicker);
  const [comparison, setComparison] = useState<TesouroComparisonView | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingCompare, setLoadingCompare] = useState(false);

  useEffect(() => {
    void listFunds().then((next) => {
      setFunds(next);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (typeof params.ticker === 'string' && params.ticker.length > 0) {
      setSelectedTicker(params.ticker.toUpperCase());
    }
  }, [params.ticker]);

  useEffect(() => {
    let active = true;
    setLoadingCompare(true);
    void getTesouroComparison(selectedTicker).then((result) => {
      if (!active) return;
      setComparison(result?.comparison ?? null);
      setLoadingCompare(false);
    });
    return () => {
      active = false;
    };
  }, [selectedTicker]);

  const maxBar = useMemo(() => {
    const dy = comparison?.fundDy12m ?? 0;
    const tesouro = comparison?.tesouroRate ?? 0;
    return Math.max(dy, tesouro, 1);
  }, [comparison]);

  return (
    <Container scroll contentStyle={styles.content} safeBottom>
      <ScreenHeader
        title="FII × Tesouro IPCA+"
        subtitle="Compare o DY do fundo com a taxa real do Tesouro — só para estudo, sem ordem de investimento."
        showBack
      />

      <View style={styles.card}>
        <Typography variant="label" color={colors.black}>
          Escolha o FII
        </Typography>
        {loading ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <FadeEdgeScroll
            edgeColor={colors.surfaceElevated}
            contentContainerStyle={styles.tickerRow}
          >
            {funds.map((fund) => {
              const active = fund.ticker === selectedTicker;
              return (
                <Pressable
                  key={fund.id}
                  onPress={() => setSelectedTicker(fund.ticker)}
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <Typography
                    variant="label"
                    color={active ? colors.black : colors.textMuted}
                  >
                    {fund.ticker}
                  </Typography>
                </Pressable>
              );
            })}
          </FadeEdgeScroll>
        )}
      </View>

      <View style={styles.card}>
        {loadingCompare || !comparison ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <>
            <Typography variant="caption" color={colors.textMuted}>
              {comparison.ticker} · {comparison.name}
            </Typography>
            <Typography variant="h2" color={colors.black}>
              Comparação ilustrativa
            </Typography>

            <BarRow
              label="Tesouro IPCA+"
              valueLabel={formatPercent(comparison.tesouroRate)}
              ratio={comparison.tesouroRate / maxBar}
              tone={colors.black}
            />
            <BarRow
              label="DY 12m do FII"
              valueLabel={formatPercent(comparison.fundDy12m)}
              ratio={(comparison.fundDy12m ?? 0) / maxBar}
              tone={colors.primaryDark}
            />

            <View style={styles.premiumBox}>
              <Typography variant="caption" color={colors.textMuted}>
                Prêmio aparente
              </Typography>
              <Typography
                variant="h2"
                color={
                  (comparison.premiumPercent ?? 0) >= 0 ? colors.success : colors.danger
                }
              >
                {comparison.premiumPercent == null
                  ? '—'
                  : `${(comparison.premiumPercent ?? 0) >= 0 ? '+' : ''}${formatPercent(comparison.premiumPercent)}`}
              </Typography>
            </View>

            <Typography variant="body" color={colors.textMuted}>
              {comparison.reading}
            </Typography>
            <Typography variant="caption" color={colors.textMuted}>
              {comparison.note}
            </Typography>
          </>
        )}
      </View>

      <View style={styles.actions}>
        <Pressable
          style={styles.secondaryBtn}
          onPress={() => router.push(`/fund/${selectedTicker}` as Href)}
        >
          <Typography variant="label" color={colors.black}>
            Ver perfil do FII →
          </Typography>
        </Pressable>
        <Pressable
          style={styles.primaryBtn}
          onPress={() => router.push('/(tabs)/portfolio' as Href)}
        >
          <Typography variant="label" color={colors.black}>
            Ir à carteira pessoal
          </Typography>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Typography variant="h3">Outros FIIs do snapshot</Typography>
        <Typography variant="caption" color={colors.textMuted}>
          Toque para trocar a comparação.
        </Typography>
        <View style={styles.list}>
          {funds.map((fund) => (
            <FundListItem
              key={fund.id}
              fund={fund}
              onPress={() => setSelectedTicker(fund.ticker)}
            />
          ))}
        </View>
      </View>
    </Container>
  );
}

function BarRow({
  label,
  valueLabel,
  ratio,
  tone,
}: {
  label: string;
  valueLabel: string;
  ratio: number;
  tone: string;
}) {
  const width = `${Math.max(8, Math.min(100, ratio * 100))}%`;
  return (
    <View style={styles.barBlock}>
      <View style={styles.barHead}>
        <Typography variant="caption" color={colors.textMuted}>
          {label}
        </Typography>
        <Typography variant="bodyStrong">{valueLabel}</Typography>
      </View>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: width as `${number}%`, backgroundColor: tone }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  card: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.md,
    ...shadows.card,
  },
  tickerRow: {
    gap: spacing.sm,
    paddingVertical: 2,
    paddingRight: spacing.md,
  },
  chip: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  chipActive: {
    backgroundColor: colors.primary,
  },
  premiumBox: {
    backgroundColor: colors.surfaceWarm,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: 4,
  },
  barBlock: {
    gap: spacing.xs,
  },
  barHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  barTrack: {
    height: 10,
    borderRadius: radii.full,
    backgroundColor: colors.borderSubtle,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: radii.full,
  },
  actions: {
    gap: spacing.sm,
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  secondaryBtn: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.md,
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.card,
  },
  section: {
    gap: spacing.sm,
  },
  list: {
    gap: spacing.sm,
  },
});
