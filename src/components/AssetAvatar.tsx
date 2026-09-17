import { Image, StyleSheet, View } from 'react-native';
import { useMemo } from 'react';

import { Typography } from '@/src/components/Typography';
import { getFundLogoSource } from '@/src/data/fundLogos';
import { colors, type AppColors } from '@/src/theme/tokens';
import { useAppTheme } from '@/src/hooks/useAppTheme';

const AVATAR_PALETTE = [
  '#F0B429',
  '#E8C46A',
  '#D4A017',
  '#F5D78E',
  '#C49214',
  '#E6B84A',
] as const;

function toneForTicker(ticker: string): string {
  const hash = ticker.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length] ?? colors.primary;
}

function initialsFrom(ticker: string, name?: string): string {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0]?.[0] ?? ''}${parts[1]?.[0] ?? ''}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
  return ticker.replace(/\d/g, '').slice(0, 2).toUpperCase() || ticker.slice(0, 2);
}

interface AssetAvatarProps {
  ticker: string;
  name?: string;
  size?: number;
}

export function AssetAvatar({ ticker, name, size = 40 }: AssetAvatarProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const source = getFundLogoSource(ticker);
  const radius = Math.max(8, size * 0.22);
  const initials = initialsFrom(ticker, name);

  if (source) {
    return (
      <View
        style={[
          styles.frame,
          {
            width: size,
            height: size,
            borderRadius: radius,
          },
        ]}
      >
        <Image
          source={source}
          style={{ width: size, height: size, borderRadius: radius }}
          resizeMode="cover"
          accessibilityLabel={`Logo ${ticker}`}
        />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: radius,
          backgroundColor: toneForTicker(ticker),
        },
      ]}
    >
      <Typography
        variant="label"
        color={colors.black}
        style={{ fontSize: Math.max(10, size * 0.32) }}
      >
        {initials}
      </Typography>
    </View>
  );
}

function createStyles(colors: AppColors) { return StyleSheet.create({
  frame: {
    overflow: 'hidden',
    backgroundColor: colors.surfaceMuted,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
}); }
