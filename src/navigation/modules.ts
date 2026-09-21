/**
 * Mapa de módulos do app investidor.
 * Fonte de verdade de navegação alinhada ao escopo.
 */

export type AppModuleId =
  | 'home'
  | 'funds'
  | 'portfolio'
  | 'learn'
  | 'planner'
  | 'poupar'
  | 'rankings'
  | 'news'
  | 'profile';

export interface AppModule {
  id: AppModuleId;
  title: string;
  description: string;
  href: string;
  inTabs: boolean;
  homeShortcut: boolean;
  previewHint: string;
}

export const APP_MODULES: AppModule[] = [
  {
    id: 'home',
    title: 'Início',
    description: 'Proposta da plataforma e atalhos',
    href: '/(tabs)',
    inTabs: true,
    homeShortcut: false,
    previewHint: '',
  },
  {
    id: 'funds',
    title: 'Fundos',
    description: 'Buscar e analisar FIIs',
    href: '/(tabs)/funds',
    inTabs: true,
    homeShortcut: true,
    previewHint: 'Mais buscados e indicadores',
  },
  {
    id: 'portfolio',
    title: 'Carteira',
    description: 'Sua posição em FIIs',
    href: '/(tabs)/portfolio',
    inTabs: true,
    homeShortcut: true,
    previewHint: 'Posição e alocação',
  },
  {
    id: 'learn',
    title: 'Aprender',
    description: 'Trilhas do zero ao avançado',
    href: '/(tabs)/learn',
    inTabs: true,
    homeShortcut: true,
    previewHint: 'Explicações simples',
  },
  {
    id: 'planner',
    title: 'Planner',
    description: 'Metas e check-ins diários de poupança',
    href: '/planner',
    inTabs: false,
    homeShortcut: false,
    previewHint: 'Sequência e meta diária',
  },
  {
    id: 'poupar',
    title: 'Poupar',
    description: 'Gasto evitado → cotas equivalentes (educativo)',
    href: '/tools/poupar',
    inTabs: false,
    homeShortcut: true,
    previewHint: 'Associação gasto → FII',
  },
  {
    id: 'rankings',
    title: 'Rankings',
    description: 'Classificações por indicadores',
    href: '/rankings',
    inTabs: false,
    homeShortcut: true,
    previewHint: 'DY, liquidez e PL',
  },
  {
    id: 'profile',
    title: 'Perfil',
    description: 'Conta e perfil do investidor',
    href: '/(tabs)/profile',
    inTabs: true,
    homeShortcut: false,
    previewHint: 'Sua conta',
  },
  {
    id: 'news',
    title: 'Notícias',
    description: 'Mercado imobiliário e FIIs',
    href: '/news',
    inTabs: false,
    homeShortcut: false,
    previewHint: '',
  },
];

export const TAB_MODULES = APP_MODULES.filter((module) => module.inTabs && module.id !== 'home');
export const HOME_SHORTCUTS = APP_MODULES.filter((module) => module.homeShortcut);
