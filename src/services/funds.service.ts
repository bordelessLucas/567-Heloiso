import type { FundProfile, FundSegment, FundSummary } from '@/src/domain/fund';
import type { RankingBoard, RankingMetric } from '@/src/domain/ranking';
import { MOCK_FUNDS, toFundSummary } from '@/src/data/mocks/funds.mock';
import { formatCompactBrl, formatPercent, formatRatio } from '@/src/utils/format';

function formatMetric(metric: RankingMetric, value: number | null): string {
  if (value === null) return '—';
  if (metric === 'dividend_yield' || metric === 'pvp') {
    return metric === 'pvp' ? formatRatio(value) : formatPercent(value);
  }
  return formatCompactBrl(value);
}

export async function listFunds(query?: string, segment?: FundSegment | 'all'): Promise<FundSummary[]> {
  const normalized = query?.trim().toLowerCase() ?? '';

  return MOCK_FUNDS.filter((fund) => {
    const matchesSegment =
      !segment ||
      segment === 'all' ||
      fund.segment === segment ||
      (segment === 'brick' &&
        (fund.segment === 'logistics' ||
          fund.segment === 'shopping' ||
          fund.segment === 'corporate' ||
          fund.segment === 'urban_income' ||
          fund.segment === 'brick'));
    const matchesQuery =
      normalized.length === 0 ||
      fund.ticker.toLowerCase().includes(normalized) ||
      fund.name.toLowerCase().includes(normalized) ||
      fund.segment.toLowerCase().includes(normalized);

    return matchesSegment && matchesQuery;
  }).map(toFundSummary);
}

export async function listPopularFunds(): Promise<FundSummary[]> {
  return MOCK_FUNDS.filter((fund) => fund.popular).map(toFundSummary);
}

export async function getFundByTicker(ticker: string): Promise<FundProfile | null> {
  const found = MOCK_FUNDS.find(
    (fund) => fund.ticker.toLowerCase() === ticker.trim().toLowerCase(),
  );
  return found ?? null;
}

export async function listRankingBoards(): Promise<RankingBoard[]> {
  const boards: Array<{ id: string; title: string; metric: RankingMetric }> = [
    { id: 'dy', title: 'Maiores Dividend Yield', metric: 'dividend_yield' },
    { id: 'liq', title: 'Maiores Liquidez', metric: 'liquidity' },
    { id: 'pl', title: 'Maior Patrimônio', metric: 'net_worth' },
  ];

  return boards.map((board) => {
    const sorted = [...MOCK_FUNDS].sort((a, b) => {
      const pick = (fund: FundProfile): number => {
        if (board.metric === 'dividend_yield') return fund.dividendYield ?? 0;
        if (board.metric === 'liquidity') return fund.liquidity ?? 0;
        if (board.metric === 'net_worth') return fund.netWorth ?? 0;
        if (board.metric === 'pvp') return fund.pvp ?? 0;
        return fund.popular ? 1 : 0;
      };
      return pick(b) - pick(a);
    });

    return {
      ...board,
      entries: sorted.slice(0, 5).map((fund, index) => {
        const raw =
          board.metric === 'dividend_yield'
            ? fund.dividendYield
            : board.metric === 'liquidity'
              ? fund.liquidity
              : board.metric === 'net_worth'
                ? fund.netWorth
                : fund.pvp;

        return {
          position: index + 1,
          fundId: fund.id,
          ticker: fund.ticker,
          name: fund.name,
          segment: fund.segment,
          metric: board.metric,
          value: raw,
          formattedValue: formatMetric(board.metric, raw),
        };
      }),
    };
  });
}
