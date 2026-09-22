import type { FundDividendEvent } from '@/src/domain/fund';

export interface MarketFiiQuote {
  ticker: string;
  name: string | null;
  companyName: string | null;
  cnpj: string | null;
  segmentLabel: string | null;
  price: number | null;
  changeValue: number | null;
  changePercent: number | null;
  open: number | null;
  high: number | null;
  low: number | null;
  previousClose: number | null;
  close: number | null;
  volume: number | null;
  marketCap: number | null;
  equity: number | null;
  quotaCount: number | null;
  equityPerShare: number | null;
  priceToBook: number | null;
  dividendYield12m: number | null;
  dividends12m: number | null;
  updatedAt: string | null;
  stale: boolean;
  source: 'hgbrasil' | 'mock';
}

export interface MarketFiiDetails extends MarketFiiQuote {
  dividendsHistory: FundDividendEvent[];
}

export type MarketDataMode = 'mock' | 'functions' | 'direct-hg' | 'auto';

export interface MarketDataHealth {
  mode: MarketDataMode;
  live: boolean;
  reason: string | null;
  updatedAt: string;
}

export interface MarketDataProvider {
  getHealth?: () => Promise<MarketDataHealth>;
  getFiiQuote: (ticker: string) => Promise<MarketFiiQuote | null>;
  getFiiDetails: (ticker: string) => Promise<MarketFiiDetails | null>;
  getFiiDividends: (ticker: string) => Promise<FundDividendEvent[]>;
  getFiiHistory: (ticker: string, periodDays?: number) => Promise<unknown[]>;
  searchFiis: (query: string) => Promise<MarketFiiQuote[]>;
  getFiiQuotes: (tickers: string[]) => Promise<Map<string, MarketFiiQuote>>;
}
