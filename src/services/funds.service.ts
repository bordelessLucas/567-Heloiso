import type { FundProfile, FundSegment, FundSummary } from '@/src/domain/fund';
import type { RankingBoard, RankingMetric } from '@/src/domain/ranking';
import { toTesouroComparisonView } from '@/src/domain/fundsTools';
import { MOCK_FUNDS, toFundSummary } from '@/src/data/mocks/funds.mock';
import { hgBrasilProvider, type MarketFiiQuote } from '@/src/services/market-data';
import { formatCompactBrl, formatPercent, formatRatio } from '@/src/utils/format';

function formatMetric(metric: RankingMetric, value: number | null): string {
  if (value === null) return '—';
  if (metric === 'dividend_yield' || metric === 'pvp') {
    return metric === 'pvp' ? formatRatio(value) : formatPercent(value);
  }
  return formatCompactBrl(value);
}

function mergeSummaryWithQuote(summary: FundSummary, quote?: MarketFiiQuote | null): FundSummary {
  if (!quote) return { ...summary, dataSource: 'mock', sourceNote: 'Dados de mercado em mock.' };

  return {
    ...summary,
    name: quote.name ?? summary.name,
    companyName: quote.companyName,
    cnpj: quote.cnpj,
    sharePrice: quote.price ?? summary.sharePrice,
    changeValue: quote.changeValue,
    changePercent: quote.changePercent ?? summary.changePercent,
    open: quote.open,
    high: quote.high,
    low: quote.low,
    previousClose: quote.previousClose,
    marketClose: quote.close,
    marketCap: quote.marketCap,
    dividendYield: quote.dividendYield12m ?? summary.dividendYield,
    dividends12m: quote.dividends12m,
    pvp: quote.priceToBook ?? summary.pvp,
    netWorth: quote.equity ?? summary.netWorth,
    quotaCount: quote.quotaCount,
    equityPerShare: quote.equityPerShare,
    liquidity: quote.volume ?? summary.liquidity,
    updatedAt: quote.updatedAt ?? summary.updatedAt,
    dataSource: 'mixed',
    stale: quote.stale,
    sourceNote: quote.stale
      ? 'Dados HG Brasil em cache; podem estar desatualizados.'
      : 'Cotacao e indicadores de mercado via HG Brasil. Dados operacionais podem vir do snapshot mock.',
  };
}

function refreshIndicators(profile: FundProfile): FundProfile {
  return {
    ...profile,
    indicators: profile.indicators.map((indicator) => {
      if (indicator.key === 'pvp') return { ...indicator, value: profile.pvp };
      if (indicator.key === 'dividend_yield') return { ...indicator, value: profile.dividendYield };
      if (indicator.key === 'net_worth') return { ...indicator, value: profile.netWorth };
      if (indicator.key === 'liquidity') return { ...indicator, value: profile.liquidity };
      return indicator;
    }),
    tesouroIpcaComparison: {
      ...profile.tesouroIpcaComparison,
      fundDy12m: profile.dividendYield,
      premiumPercent:
        profile.dividendYield !== null
          ? Number((profile.dividendYield - profile.tesouroIpcaComparison.tesouroRate).toFixed(2))
          : null,
    },
  };
}

function mergeProfileWithQuote(profile: FundProfile, quote?: MarketFiiQuote | null): FundProfile {
  const summary = mergeSummaryWithQuote(toFundSummary(profile), quote);
  return refreshIndicators({
    ...profile,
    ...summary,
  });
}

async function enrichSummariesWithMarketData(summaries: FundSummary[]): Promise<FundSummary[]> {
  const quotes = await hgBrasilProvider.getFiiQuotes(summaries.map((fund) => fund.ticker));
  return summaries.map((summary) => mergeSummaryWithQuote(summary, quotes.get(summary.ticker)));
}

export async function listFunds(query?: string, segment?: FundSegment | 'all'): Promise<FundSummary[]> {
  const normalized = query?.trim().toLowerCase() ?? '';

  const filtered = MOCK_FUNDS.filter((fund) => {
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

  return enrichSummariesWithMarketData(filtered);
}

export async function listPopularFunds(): Promise<FundSummary[]> {
  return enrichSummariesWithMarketData(MOCK_FUNDS.filter((fund) => fund.popular).map(toFundSummary));
}

export async function getFundByTicker(ticker: string): Promise<FundProfile | null> {
  const found = MOCK_FUNDS.find(
    (fund) => fund.ticker.toLowerCase() === ticker.trim().toLowerCase(),
  );
  if (!found) return null;

  const details = await hgBrasilProvider.getFiiDetails(found.ticker);
  const merged = mergeProfileWithQuote(found, details);
  return {
    ...merged,
    dividendsHistory: details?.dividendsHistory ?? found.dividendsHistory ?? [],
  };
}

export async function listRankingBoards(): Promise<RankingBoard[]> {
  const boards: Array<{ id: string; title: string; metric: RankingMetric }> = [
    { id: 'dy', title: 'Maiores Dividend Yield', metric: 'dividend_yield' },
    { id: 'liq', title: 'Maiores Liquidez', metric: 'liquidity' },
    { id: 'pl', title: 'Maior Patrimônio', metric: 'net_worth' },
    { id: 'pvp', title: 'Menor P/VP', metric: 'pvp' },
  ];
  const enriched = await enrichSummariesWithMarketData(MOCK_FUNDS.map(toFundSummary));

  return boards.map((board) => {
    const sorted = [...enriched].sort((a, b) => {
      const pick = (fund: FundSummary): number => {
        if (board.metric === 'dividend_yield') return fund.dividendYield ?? 0;
        if (board.metric === 'liquidity') return fund.liquidity ?? 0;
        if (board.metric === 'net_worth') return fund.netWorth ?? 0;
        if (board.metric === 'pvp') return fund.pvp ?? Number.POSITIVE_INFINITY;
        return fund.popular ? 1 : 0;
      };
      if (board.metric === 'pvp') {
        return pick(a) - pick(b);
      }
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

export async function listFundsByRankingMetric(
  metric: RankingMetric,
  options?: { segment?: FundSegment | 'all'; limit?: number },
): Promise<FundSummary[]> {
  const segment = options?.segment ?? 'all';
  const filtered = await listFunds(undefined, segment);
  const sorted = [...filtered].sort((a, b) => {
    const pick = (fund: FundSummary): number => {
      if (metric === 'dividend_yield') return fund.dividendYield ?? -1;
      if (metric === 'liquidity') return fund.liquidity ?? -1;
      if (metric === 'net_worth') return fund.netWorth ?? -1;
      if (metric === 'pvp') return fund.pvp ?? Number.POSITIVE_INFINITY;
      return fund.popular ? 1 : 0;
    };
    if (metric === 'pvp') return pick(a) - pick(b);
    return pick(b) - pick(a);
  });

  const limit = options?.limit ?? sorted.length;
  return sorted.slice(0, limit);
}

export async function getTesouroComparison(ticker: string) {
  const fund = await getFundByTicker(ticker);
  if (!fund) return null;
  return { fund, comparison: toTesouroComparisonView(fund) };
}
