import { StyleSheet, View } from 'react-native';
import { useMemo } from 'react';

import { Typography } from '@/src/components/Typography';
import type { PortfolioTrade } from '@/src/domain/portfolio';
import { colors, radii, shadows, spacing, type AppColors } from '@/src/theme/tokens';
import { useAppTheme } from '@/src/hooks/useAppTheme';
import { formatBrl } from '@/src/utils/format';

interface TradeHistoryListProps {
  trades: PortfolioTrade[];
  emptyLabel?: string;
}

function formatWhen(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function TradeHistoryList({
  trades,
  emptyLabel = 'Nenhuma movimentação neste período.',
}: TradeHistoryListProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  if (trades.length === 0) {
    return (
      <View style={styles.empty}>
        <Typography variant="body" color={colors.textMuted}>
          {emptyLabel}
        </Typography>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {trades.map((trade) => {
        const isBuy = trade.side === 'buy';
        return (
          <View key={trade.id} style={styles.row}>
            <View style={[styles.sidePill, isBuy ? styles.buyPill : styles.sellPill]}>
              <Typography
                variant="caption"
                color={isBuy ? colors.success : colors.danger}
              >
                {isBuy ? 'Compra' : 'Venda'}
              </Typography>
            </View>
            <View style={styles.meta}>
              <Typography variant="bodyStrong" color={colors.black}>
                {trade.ticker}
              </Typography>
              <Typography variant="caption" color={colors.textMuted}>
                {trade.quantity} cotas · {formatBrl(trade.price)}
              </Typography>
              <Typography variant="caption" color={colors.textMuted}>
                {formatWhen(trade.executedAt)}
              </Typography>
            </View>
            <Typography
              variant="bodyStrong"
              color={isBuy ? colors.black : colors.success}
            >
              {isBuy ? '-' : '+'}
              {formatBrl(trade.total)}
            </Typography>
          </View>
        );
      })}
    </View>
  );
}

function createStyles(colors: AppColors) { return StyleSheet.create({
  list: {
    gap: spacing.sm,
  },
  empty: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.md,
    padding: spacing.md,
    ...shadows.card,
  },
  sidePill: {
    borderRadius: radii.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  buyPill: {
    backgroundColor: '#E8F5EF',
  },
  sellPill: {
    backgroundColor: '#FCEBEB',
  },
  meta: {
    flex: 1,
    gap: 2,
  },
}); }
