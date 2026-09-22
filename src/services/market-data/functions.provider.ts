import type { FundDividendEvent } from '@/src/domain/fund';
import type {
  MarketDataHealth,
  MarketDataProvider,
  MarketFiiDetails,
  MarketFiiQuote,
} from '@/src/services/market-data/types';

const REQUEST_TIMEOUT_MS = 12_000;

function getFunctionsBaseUrl(): string | null {
  const value = process.env.EXPO_PUBLIC_MARKET_FUNCTIONS_BASE_URL;
  return value && value.trim().length > 0 ? value.trim().replace(/\/$/, '') : null;
}

function normalizeTicker(ticker: string): string {
  return ticker.trim().toUpperCase().replace(/^B3:/, '');
}

async function fetchJson<T>(path: string): Promise<T> {
  const baseUrl = getFunctionsBaseUrl();
  if (!baseUrl) {
    throw new Error('Market Functions base URL is not configured.');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${baseUrl}${path}`, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`Market Functions HTTP ${response.status}`);
    }
    return response.json() as Promise<T>;
  } finally {
    clearTimeout(timeout);
  }
}

interface QuotesResponse {
  quotes: MarketFiiQuote[];
}

interface DividendsResponse {
  dividends: FundDividendEvent[];
}

export const functionsMarketDataProvider: MarketDataProvider = {
  async getHealth(): Promise<MarketDataHealth> {
    return fetchJson<MarketDataHealth>('/market/health');
  },

  async getFiiQuote(ticker) {
    const quotes = await this.getFiiQuotes([ticker]);
    return quotes.get(normalizeTicker(ticker)) ?? null;
  },

  async getFiiDetails(ticker): Promise<MarketFiiDetails | null> {
    return fetchJson<MarketFiiDetails | null>(
      `/market/funds/${encodeURIComponent(normalizeTicker(ticker))}`,
    );
  },

  async getFiiDividends(ticker): Promise<FundDividendEvent[]> {
    const result = await fetchJson<DividendsResponse>(
      `/market/funds/${encodeURIComponent(normalizeTicker(ticker))}/dividends`,
    );
    return result.dividends;
  },

  async getFiiHistory() {
    return [];
  },

  async searchFiis(query) {
    const result = await fetchJson<QuotesResponse>(
      `/market/search?q=${encodeURIComponent(query.trim())}`,
    );
    return result.quotes;
  },

  async getFiiQuotes(tickers) {
    const normalized = tickers.map(normalizeTicker).filter(Boolean);
    if (normalized.length === 0) return new Map();

    const result = await fetchJson<QuotesResponse>(
      `/market/quotes?tickers=${encodeURIComponent(normalized.join(','))}`,
    );
    return new Map(result.quotes.map((quote) => [quote.ticker, quote]));
  },
};
