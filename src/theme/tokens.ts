/**
 * Design tokens — Mercado FiiS
 * Fonte: docs-ia/design_system.md
 */
export const colors = {
  primary: '#F0B429',
  primaryDark: '#C49214',
  black: '#0D0D0D',
  background: '#F7F7F5',
  surface: '#FFFFFF',
  text: '#0D0D0D',
  textMuted: '#6B7280',
  border: '#E5E5E0',
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
    regular: 'System',
    medium: 'System',
    bold: 'System',
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

export type ColorToken = keyof typeof colors;
export type SpacingToken = keyof typeof spacing;
