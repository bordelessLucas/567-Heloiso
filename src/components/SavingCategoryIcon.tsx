import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';

import { useAppTheme } from '@/src/hooks/useAppTheme';
import { radii, type AppColors } from '@/src/theme/tokens';

type SymbolName = NonNullable<SymbolViewProps['name']>;

const ICON_CAFE: SymbolName = { ios: 'sun.max.fill', android: 'wb_sunny', web: 'wb_sunny' };
const ICON_LANCHE: SymbolName = { ios: 'leaf.fill', android: 'eco', web: 'eco' };
const ICON_ALMOCO: SymbolName = { ios: 'clock.fill', android: 'schedule', web: 'schedule' };
const ICON_REFRI: SymbolName = { ios: 'drop.fill', android: 'water_drop', web: 'water_drop' };
const ICON_OUTRO: SymbolName = { ios: 'square.dashed', android: 'crop_square', web: 'crop_square' };
const FALLBACK_ICON: SymbolName = {
  ios: 'circle.grid.cross.fill',
  android: 'apps',
  web: 'apps',
};

/** Ícones abstratos — limpos e didáticos, sem foto literal do gasto. */
const PRESET_ICONS: Record<string, SymbolName> = {
  café: ICON_CAFE,
  cafe: ICON_CAFE,
  lanche: ICON_LANCHE,
  almoço: ICON_ALMOCO,
  almoco: ICON_ALMOCO,
  refrigerante: ICON_REFRI,
  outro: ICON_OUTRO,
};

const KEYWORD_ICONS: Array<{ match: RegExp; icon: SymbolName }> = [
  { match: /caf[eé]|coffee|espresso/i, icon: ICON_CAFE },
  { match: /lanche|snack|padaria/i, icon: ICON_LANCHE },
  { match: /almo[cç]o|jantar|refei/i, icon: ICON_ALMOCO },
  { match: /refri|suco|bebida|drink/i, icon: ICON_REFRI },
  { match: /uber|transporte|passagem|metro|ônibus|onibus/i, icon: { ios: 'tram.fill', android: 'tram', web: 'tram' } },
  { match: /cinema|streaming|jogo|game/i, icon: { ios: 'play.circle.fill', android: 'play_circle', web: 'play_circle' } },
  { match: /delivery|ifood|rappi/i, icon: { ios: 'shippingbox.fill', android: 'inventory_2', web: 'inventory_2' } },
];

export function resolveSavingIcon(label: string): SymbolName {
  const normalized = label.trim().toLowerCase();
  if (!normalized) return ICON_OUTRO;
  const preset = PRESET_ICONS[normalized];
  if (preset) return preset;
  for (const entry of KEYWORD_ICONS) {
    if (entry.match.test(normalized)) return entry.icon;
  }
  return FALLBACK_ICON;
}

interface SavingCategoryIconProps {
  label: string;
  size?: number;
  tone?: 'warm' | 'feature' | 'muted';
}

export function SavingCategoryIcon({
  label,
  size = 20,
  tone = 'warm',
}: SavingCategoryIconProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const icon = resolveSavingIcon(label);

  const palette =
    tone === 'feature'
      ? { bg: colors.surfaceFeature, icon: colors.primaryDark }
      : tone === 'muted'
        ? { bg: colors.surfaceMuted, icon: colors.textMuted }
        : { bg: colors.surfaceWarm, icon: colors.primaryDark };

  return (
    <View
      style={[
        styles.wrap,
        {
          backgroundColor: palette.bg,
          width: size + 20,
          height: size + 20,
        },
      ]}
    >
      <SymbolView name={icon} size={size} tintColor={palette.icon} />
    </View>
  );
}

function createStyles(_colors: AppColors) {
  return StyleSheet.create({
    wrap: {
      borderRadius: radii.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}
