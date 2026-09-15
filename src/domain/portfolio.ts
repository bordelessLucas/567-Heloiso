/** Posição individual do investidor — separada dos dados públicos do FII. */

export type PortfolioTradeSide = 'buy' | 'sell';

export type PortfolioSortKey =
  | 'default'
  | 'top_return'
  | 'bottom_return'
  | 'qty_desc'
  | 'qty_asc';

/** Janelas relativas até hoje (não calendário fixo). */
export type HistoryPeriodDays = 1 | 7 | 30 | 90 | 180 | 360;

export const HISTORY_PERIOD_OPTIONS: {
  days: HistoryPeriodDays;
  label: string;
  short: string;
}[] = [
  { days: 1, label: '1 dia', short: '1d' },
  { days: 7, label: '7 dias', short: '7d' },
  { days: 30, label: '30 dias', short: '30d' },
  { days: 90, label: '90 dias', short: '90d' },
  { days: 180, label: '180 dias', short: '180d' },
  { days: 360, label: '360 dias', short: '360d' },
];

export const PORTFOLIO_SORT_OPTIONS: {
  key: PortfolioSortKey;
  label: string;
}[] = [
  { key: 'default', label: 'Padrão' },
  { key: 'top_return', label: 'Mais renderam' },
  { key: 'qty_desc', label: 'Mais cotas' },
  { key: 'qty_asc', label: 'Menos cotas' },
  { key: 'bottom_return', label: 'Mais desvalorizaram' },
];

export interface PortfolioHolding {
  id: string;
  userId: string;
  fundId: string;
  ticker: string;
  quantity: number;
  averagePrice: number;
  investedAmount: number;
  acquiredAt: string;
  /** Ordem personalizada na lista (menor = mais acima). */
  sortIndex: number;
}

export interface PortfolioTrade {
  id: string;
  userId: string;
  holdingId: string;
  ticker: string;
  side: PortfolioTradeSide;
  quantity: number;
  price: number;
  total: number;
  executedAt: string;
}

export interface PortfolioSummary {
  userId: string;
  holdings: PortfolioHolding[];
  totalInvested: number;
  holdingsCount: number;
}

export interface PricePoint {
  dateKey: string;
  value: number;
}
