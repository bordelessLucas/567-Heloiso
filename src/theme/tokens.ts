import { lightColors } from '@/src/theme/palettes';

/**
 * Design tokens — Mercado FiiS
 * Fonte: docs-ia/design_system.md
 */

/** @deprecated Em componentes renderizados, use useAppTheme().colors. */
export const colors = lightColors;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const typography = {
  fontFamily: {
    regular: 'Inter_400Regular',
    medium: 'Inter_500Medium',
    semiBold: 'Inter_600SemiBold',
    bold: 'Inter_700Bold',
  },
  fontSize: {
    xs: 12,
    sm: 13,
    md: 14,
    body: 16,
    lg: 18,
    xl: 20,
    h1: 24,
    display: 32,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  full: 999,
} as const;

/** Sombra discreta para cards e módulos. */
export const shadows = {
  card: {
    shadowColor: '#0D0D0D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 14,
    elevation: 3,
  },
} as const;

export type ColorToken = keyof typeof colors;
export type SpacingToken = keyof typeof spacing;
export type { AppColors, ResolvedTheme, ThemePreference } from '@/src/theme/palettes';
