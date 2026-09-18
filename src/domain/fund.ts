/** Domínio público de FIIs (dados de mercado — não confundir com carteira do usuário). */

export type FundSegment =
  | 'logistics'
  | 'corporate'
  | 'shopping'
  | 'urban_income'
  | 'paper'
  | 'brick'
  | 'hybrid'
  | 'other';

export const FUND_SEGMENT_LABELS: Record<FundSegment, string> = {
  logistics: 'Logística',
  corporate: 'Lajes',
  shopping: 'Shopping',
  urban_income: 'Renda urbana',
  paper: 'Papel',
  brick: 'Tijolo',
  hybrid: 'Híbrido',
  other: 'Outros',
};

export interface FundSummary {
  id: string;
  ticker: string;
  name: string;
  companyName?: string | null;
  cnpj?: string | null;
  segment: FundSegment;
  sharePrice: number | null;
  changeValue?: number | null;
  changePercent: number | null;
  open?: number | null;
  high?: number | null;
  low?: number | null;
  previousClose?: number | null;
  marketClose?: number | null;
  marketCap?: number | null;
  dividendYield: number | null;
  dividends12m?: number | null;
  pvp: number | null;
  netWorth: number | null;
  quotaCount?: number | null;
  equityPerShare?: number | null;
  liquidity: number | null;
  vacancy: number | null;
  popular: boolean;
  updatedAt: string | null;
  dataSource?: 'mock' | 'hgbrasil' | 'mixed';
  stale?: boolean;
  sourceNote?: string | null;
}

export interface FundIndicator {
  key: 'pvp' | 'dividend_yield' | 'vacancy' | 'net_worth' | 'liquidity';
  label: string;
  value: number | null;
  unit: 'ratio' | 'percent' | 'currency' | 'absolute';
  explanation: string;
  interpretation: string;
  caution: string;
}

export interface FundAssetAllocation {
  label: string;
  sharePercent: number;
  region: string | null;
}

export interface FundDocument {
  id: string;
  type: 'report' | 'material_fact' | 'notice' | 'distribution';
  title: string;
  publishedAt: string;
  url: string | null;
}

export interface FundDividendEvent {
  id: string;
  type: string;
  label: string;
  amount: number | null;
  comDate: string | null;
  paymentDate: string | null;
  status: string | null;
  source: 'hgbrasil' | 'mock';
}

export type GuidedReadingTone = 'positive' | 'attention' | 'neutral';

export interface GuidedReadingPoint {
  id: string;
  tone: GuidedReadingTone;
  title: string;
  detail: string;
}

export interface FundProfile extends FundSummary {
  fundType: string | null;
  propertyCount: number | null;
  assetCount: number | null;
  description: string;
  indicators: FundIndicator[];
  allocations: FundAssetAllocation[];
  documents: FundDocument[];
  dividendsHistory?: FundDividendEvent[];
  guidedReading: GuidedReadingPoint[];
  tesouroIpcaComparison: {
    tesouroRate: number;
    fundDy12m: number | null;
    premiumPercent: number | null;
    note: string;
  };
}
