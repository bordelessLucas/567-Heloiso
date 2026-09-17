import { StyleSheet, View } from 'react-native';
import { useMemo } from 'react';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';

import { colors, radii, spacing, type AppColors } from '@/src/theme/tokens';
import { useAppTheme } from '@/src/hooks/useAppTheme';

export type ModuleIconName =
  | 'funds'
  | 'portfolio'
  | 'learn'
  | 'planner'
  | 'rankings'
  | 'profile'
  | 'news'
  | 'streak'
  | 'savings'
  | 'calendar';

const ICON_MAP: Record<
  ModuleIconName,
  NonNullable<SymbolViewProps['name']>
> = {
  funds: { ios: 'chart.bar.fill', android: 'bar_chart', web: 'bar_chart' },
  portfolio: { ios: 'briefcase.fill', android: 'work', web: 'work' },
  learn: { ios: 'book.fill', android: 'menu_book', web: 'menu_book' },
  planner: { ios: 'flame.fill', android: 'local_fire_department', web: 'local_fire_department' },
  rankings: { ios: 'trophy.fill', android: 'emoji_events', web: 'emoji_events' },
  profile: { ios: 'person.fill', android: 'person', web: 'person' },
  news: { ios: 'newspaper.fill', android: 'article', web: 'article' },
  streak: { ios: 'flame.fill', android: 'local_fire_department', web: 'local_fire_department' },
  savings: { ios: 'dollarsign.circle.fill', android: 'payments', web: 'payments' },
  calendar: { ios: 'calendar', android: 'calendar_today', web: 'calendar_today' },
};

interface ModuleIconProps {
  name: ModuleIconName;
  size?: number;
  tone?: 'yellow' | 'light' | 'dark';
}

export function ModuleIcon({ name, size = 22, tone = 'yellow' }: ModuleIconProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const palette =
    tone === 'yellow'
      ? { bg: colors.primary, icon: colors.black }
      : tone === 'light'
        ? { bg: '#FFF8E6', icon: colors.primaryDark }
        : { bg: colors.black, icon: colors.primary };

  return (
    <View style={[styles.wrap, { backgroundColor: palette.bg, width: size + 18, height: size + 18 }]}>
      <SymbolView name={ICON_MAP[name]} size={size} tintColor={palette.icon} />
    </View>
  );
}

function createStyles(colors: AppColors) { return StyleSheet.create({
  wrap: {
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
}); }
