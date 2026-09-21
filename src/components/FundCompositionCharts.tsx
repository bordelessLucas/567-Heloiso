import { StyleSheet, View } from 'react-native';

import { Typography } from '@/src/components/Typography';
import type { FundAssetAllocation } from '@/src/domain/fund';
import { colors, radii, spacing } from '@/src/theme/tokens';
import { formatPercent } from '@/src/utils/format';

const BAR_COLORS = ['#F0B429', '#1A1A1A', '#C49214', '#0F7A4A', '#8A857C', '#B54708'];

interface FundCompositionChartsProps {
  allocations: FundAssetAllocation[];
}

function groupByRegion(allocations: FundAssetAllocation[]) {
  const map = new Map<string, number>();
  allocations.forEach((item) => {
    const key = item.region?.trim() || 'Não informado';
    map.set(key, (map.get(key) ?? 0) + item.sharePercent);
  });
  return [...map.entries()]
    .map(([label, sharePercent]) => ({ label, sharePercent }))
    .sort((a, b) => b.sharePercent - a.sharePercent);
}

export function FundCompositionCharts({ allocations }: FundCompositionChartsProps) {
  if (allocations.length === 0) {
    return (
      <Typography variant="body" color={colors.textMuted}>
        Sem composição no snapshot deste fundo.
      </Typography>
    );
  }

  const byAsset = [...allocations].sort((a, b) => b.sharePercent - a.sharePercent);
  const byRegion = groupByRegion(allocations);
  const maxAsset = Math.max(...byAsset.map((item) => item.sharePercent), 1);
  const maxRegion = Math.max(...byRegion.map((item) => item.sharePercent), 1);

  return (
    <View style={styles.wrap}>
      <View style={styles.card}>
        <Typography variant="label">Por ativo / imóvel</Typography>
        <View style={styles.bars}>
          {byAsset.map((item, index) => (
            <View key={`${item.label}-${index}`} style={styles.row}>
              <View style={styles.meta}>
                <Typography variant="bodyStrong" numberOfLines={1}>
                  {item.label}
                </Typography>
                {item.region ? (
                  <Typography variant="caption" color={colors.textMuted}>
                    {item.region}
                  </Typography>
                ) : null}
              </View>
              <Typography variant="caption">{formatPercent(item.sharePercent, 0)}</Typography>
              <View style={styles.track}>
                <View
                  style={[
                    styles.fill,
                    {
                      width: `${Math.max(6, (item.sharePercent / maxAsset) * 100)}%`,
                      backgroundColor: BAR_COLORS[index % BAR_COLORS.length],
                    },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.card}>
        <Typography variant="label">Por geografia</Typography>
        <View style={styles.bars}>
          {byRegion.map((item, index) => (
            <View key={item.label} style={styles.row}>
              <View style={styles.meta}>
                <Typography variant="bodyStrong">{item.label}</Typography>
              </View>
              <Typography variant="caption">{formatPercent(item.sharePercent, 0)}</Typography>
              <View style={styles.track}>
                <View
                  style={[
                    styles.fill,
                    {
                      width: `${Math.max(6, (item.sharePercent / maxRegion) * 100)}%`,
                      backgroundColor: BAR_COLORS[index % BAR_COLORS.length],
                    },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  card: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  bars: {
    gap: spacing.sm,
  },
  row: {
    gap: spacing.xs,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  track: {
    height: 8,
    borderRadius: radii.full,
    backgroundColor: colors.borderSubtle,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radii.full,
  },
});
