import { MOCK_FUNDS } from '@/src/data/mocks/funds.mock';
import type { FundDividendEvent } from '@/src/domain/fund';
import type {
  MarketDataHealth,
  MarketDataProvider,
  MarketFiiDetails,
  MarketFiiQuote,
} from '@/src/services/market-data/types';

function normalizeTicker(ticker: string): string {
  return ticker.trim().toUpperCase().replace(/^B3:/, '');
}

function toQuote(fund: (typeof MOCK_FUNDS)[number]): MarketFiiQuote {
  return {
    ticker: fund.ticker,
    name: fund.name,
    companyName: null,
    cnpj: null,
    segmentLabel: fund.fundType,
    price: fund.sharePrice,
    changeValue: null,
    changePercent: fund.changePercent,
    open: null,
    high: null,
    low: null,
    previousClose: null,
    close: null,
    volume: fund.liquidity,
    marketCap: null,
    equity: fund.netWorth,
    quotaCount: null,
    equityPerShare: null,
    priceToBook: fund.pvp,
    dividendYield12m: fund.dividendYield,
    dividends12m: null,
    updatedAt: fund.updatedAt,
    stale: false,
    source: 'mock',
  };
}

export const mockMarketDataProvider: MarketDataProvider = {
  async getHealth(): Promise<MarketDataHealth> {
    return {
      mode: 'mock',
      live: false,
      reason: 'Using bundled mock market snapshot for staging.',
      updatedAt: new Date().toISOString(),
    };
  },

  async getFiiQuote(ticker) {
    const normalized = normalizeTicker(ticker);
    const fund = MOCK_FUNDS.find((item) => item.ticker === normalized);
    return fund ? toQuote(fund) : null;
  },

  async getFiiDetails(ticker): Promise<MarketFiiDetails | null> {
    const normalized = normalizeTicker(ticker);
    const fund = MOCK_FUNDS.find((item) => item.ticker === normalized);
    if (!fund) return null;
    return { ...toQuote(fund), dividendsHistory: fund.dividendsHistory ?? [] };
  },

  async getFiiDividends(ticker): Promise<FundDividendEvent[]> {
    const normalized = normalizeTicker(ticker);
    return MOCK_FUNDS.find((item) => item.ticker === normalized)?.dividendsHistory ?? [];
  },

  async getFiiHistory() {
    return [];
  },

  async searchFiis(query) {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [];

    return MOCK_FUNDS.filter(
      (fund) =>
        fund.ticker.toLowerCase().includes(normalized) ||
        fund.name.toLowerCase().includes(normalized) ||
        fund.segment.toLowerCase().includes(normalized),
    ).map(toQuote);
  },

  async getFiiQuotes(tickers) {
    const output = new Map<string, MarketFiiQuote>();

    await Promise.all(
      tickers.map(async (ticker) => {
        const quote = await this.getFiiQuote(ticker);
        if (quote) output.set(quote.ticker, quote);
      }),
    );

    return output;
  },
};
