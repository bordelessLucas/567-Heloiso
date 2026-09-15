import { Pressable, StyleSheet, View } from 'react-native';

import { AssetAvatar } from '@/src/components/AssetAvatar';
import { ChangeBadge } from '@/src/components/ChangeBadge';
import { Typography } from '@/src/components/Typography';
import type { FundSummary } from '@/src/domain/fund';
import { colors, radii, shadows, spacing } from '@/src/theme/tokens';
import { formatBrl } from '@/src/utils/format';

interface FundListItemProps {
  fund: FundSummary;
  onPress: () => void;
}

export function FundListItem({ fund, onPress }: FundListItemProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.identity}>
        <AssetAvatar ticker={fund.ticker} name={fund.name} size={40} />
        <Typography variant="bodyStrong" numberOfLines={1}>
          {fund.ticker}
        </Typography>
        <Typography variant="caption" color={colors.textMuted} numberOfLines={1}>
          {fund.name}
        </Typography>
      </View>

      <View style={styles.values}>
        <Typography variant="bodyStrong" numberOfLines={1}>
          {formatBrl(fund.sharePrice)}
        </Typography>
        <ChangeBadge value={fund.changePercent} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.md,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    ...shadows.card,
  },
  pressed: {
    opacity: 0.92,
  },
  identity: {
    flex: 1,
    alignItems: 'flex-start',
    gap: 4,
    minWidth: 0,
  },
  values: {
    alignItems: 'flex-end',
    gap: 4,
    flexShrink: 0,
  },
});
