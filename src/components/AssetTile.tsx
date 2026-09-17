import { Pressable, StyleSheet, View } from 'react-native';
import { useMemo } from 'react';

import { AssetAvatar } from '@/src/components/AssetAvatar';
import { ChangeBadge } from '@/src/components/ChangeBadge';
import { Typography } from '@/src/components/Typography';
import { colors, radii, shadows, spacing, type AppColors } from '@/src/theme/tokens';
import { useAppTheme } from '@/src/hooks/useAppTheme';

interface AssetTileProps {
  ticker: string;
  name: string;
  priceLabel: string;
  changePercent: number | null;
  metaLabel?: string;
  onPress: () => void;
}

/** Card compacto: foto → ticker/nome → preço (toque abre detalhe). */
export function AssetTile({
  ticker,
  name,
  priceLabel,
  changePercent,
  metaLabel,
  onPress,
}: AssetTileProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
    >
      <AssetAvatar ticker={ticker} size={36} />
      <Typography variant="bodyStrong" numberOfLines={1}>
        {ticker}
      </Typography>
      <Typography variant="caption" color={colors.textMuted} numberOfLines={1}>
        {name}
      </Typography>
      {metaLabel ? (
        <Typography variant="caption" color={colors.textMuted} numberOfLines={1}>
          {metaLabel}
        </Typography>
      ) : null}
      <View style={styles.footer}>
        <Typography variant="label" numberOfLines={1}>
          {priceLabel}
        </Typography>
        <ChangeBadge value={changePercent} />
      </View>
    </Pressable>
  );
}

function createStyles(colors: AppColors) { return StyleSheet.create({
  tile: {
    flex: 1,
    minWidth: '46%',
    maxWidth: '48%',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.md,
    padding: spacing.sm,
    gap: 4,
    ...shadows.card,
  },
  pressed: {
    opacity: 0.92,
  },
  footer: {
    marginTop: 4,
    gap: 4,
    alignItems: 'flex-start',
  },
}); }
