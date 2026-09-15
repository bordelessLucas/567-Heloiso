export type RankingMetric =
  | 'dividend_yield'
  | 'liquidity'
  | 'net_worth'
  | 'pvp'
  | 'popular';

export interface RankingEntry {
  position: number;
  fundId: string;
  ticker: string;
  name: string;
  segment: string;
  metric: RankingMetric;
  value: number | null;
  formattedValue: string;
}

export interface RankingBoard {
  id: string;
  title: string;
  metric: RankingMetric;
  entries: RankingEntry[];
}
