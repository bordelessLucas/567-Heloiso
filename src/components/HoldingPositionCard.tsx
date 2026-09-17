import { Pressable, StyleSheet, View } from 'react-native';
import { useMemo } from 'react';

import { AssetAvatar } from '@/src/components/AssetAvatar';
import { ChangeBadge } from '@/src/components/ChangeBadge';
import { Typography } from '@/src/components/Typography';
import type { PortfolioPositionView } from '@/src/services/portfolio.service';
import { colors, radii, shadows, spacing, type AppColors } from '@/src/theme/tokens';
import { useAppTheme } from '@/src/hooks/useAppTheme';
import { formatBrl, formatPercent } from '@/src/utils/format';

interface HoldingPositionCardProps {
  position: PortfolioPositionView;
  onPress: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  showReorder?: boolean;
}

export function HoldingPositionCard({
  position,
  onPress,
  onMoveUp,
  onMoveDown,
  showReorder = false,
}: HoldingPositionCardProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const positive = position.pnlAmount >= 0;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.main}>
        <View style={styles.identity}>
          <AssetAvatar
            ticker={position.ticker}
            name={position.name}
            size={40}
          />
          <Typography variant="bodyStrong" color={colors.black} numberOfLines={1}>
            {position.ticker}
          </Typography>
          <Typography variant="caption" color={colors.textMuted} numberOfLines={1}>
            {position.name}
          </Typography>
          <Typography variant="caption" color={colors.textMuted} numberOfLines={1}>
            {position.quantity} cotas
          </Typography>
        </View>

        <View style={styles.values}>
          <Typography variant="bodyStrong" numberOfLines={1}>
            {formatBrl(position.marketValue)}
          </Typography>
          <ChangeBadge value={position.changePercent} />
          <Typography
            variant="caption"
            color={positive ? colors.success : colors.danger}
            numberOfLines={1}
          >
            {formatPercent(position.pnlPercent)}
          </Typography>
        </View>
      </View>

      {showReorder ? (
        <View style={styles.reorder}>
          <Pressable onPress={onMoveUp} hitSlop={10}>
            <Typography variant="caption" color={colors.primaryDark}>
              ↑
            </Typography>
          </Pressable>
          <Pressable onPress={onMoveDown} hitSlop={10}>
            <Typography variant="caption" color={colors.primaryDark}>
              ↓
            </Typography>
          </Pressable>
        </View>
      ) : null}
    </Pressable>
  );
}

function createStyles(colors: AppColors) { return StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.md,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
    ...shadows.card,
  },
  pressed: {
    opacity: 0.92,
  },
  main: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  identity: {
    flex: 1,
    alignItems: 'flex-start',
    gap: 4,
    minWidth: 0,
  },
  values: {
    alignItems: 'flex-end',
    gap: 3,
    flexShrink: 0,
  },
  reorder: {
    flexDirection: 'row',
    gap: spacing.md,
    alignSelf: 'flex-end',
  },
}); }
