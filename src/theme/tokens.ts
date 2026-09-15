/**
 * Design tokens — Mercado FiiS
 * Fonte: docs-ia/design_system.md
 *
 * Tipografia: Inter (mesma família usada publicamente pelo ecossistema OpenAI /
 * produtos AI modernos — OpenAI Sans proprietária não é distribuída para apps).
 */
export const colors = {
  primary: '#F0B429',
  primaryDark: '#C49214',
  black: '#0D0D0D',
  background: '#EFEDE8',
  surface: '#FBFBF9',
  text: '#0D0D0D',
  textMuted: '#6B7280',
  border: '#E8E6E0',
  borderSubtle: '#F0EEE9',
  surfaceElevated: '#FFFFFF',
  surfaceMuted: '#F5F3EE',
  surfaceWarm: '#F7F1E3',
  danger: '#B42318',
  success: '#067647',
  warning: '#B54708',
  neutral: '#79716B',
} as const;

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

/** Sombra discreta para cards/módulos (iOS + Android). */
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
