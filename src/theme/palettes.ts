export type ThemePreference = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

/** Paleta clara aprovada — mantida sem alteração visual. */
export const lightColors = {
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
  surfaceFeature: '#EDE0C4',
  danger: '#B42318',
  success: '#067647',
  warning: '#B54708',
  neutral: '#79716B',
} as const;

export type AppColors = { [Key in keyof typeof lightColors]: string };

export const darkColors: AppColors = {
  primary: '#F0B429',
  primaryDark: '#E0A51F',
  black: '#F7F5F0',
  background: '#0D0D0D',
  surface: '#151515',
  text: '#F7F5F0',
  textMuted: '#A9A59E',
  border: '#34322F',
  borderSubtle: '#292724',
  surfaceElevated: '#1D1D1D',
  surfaceMuted: '#242321',
  surfaceWarm: '#292318',
  surfaceFeature: '#342B1A',
  danger: '#F97066',
  success: '#47CD89',
  warning: '#FDB022',
  neutral: '#A9A29D',
};
