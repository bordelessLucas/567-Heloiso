import type { FundDividendEvent } from '@/src/domain/fund';
import type { MarketDataProvider, MarketFiiDetails, MarketFiiQuote } from '@/src/services/market-data/types';

const HG_BASE_URL = 'https://api.hgbrasil.com';
const QUOTES_ENDPOINT = '/v2/finance/quotes';
const DIVIDENDS_ENDPOINT = '/v2/finance/dividends';
const LEGACY_QUOTES_ENDPOINT = '/finance/stock_price';
const CACHE_TTL_MS = 30 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 12_000;

interface CacheEntry<T> {
  data: T;
  fetchedAt: number;
}

const quoteCache = new Map<string, CacheEntry<MarketFiiQuote>>();
const dividendCache = new Map<string, CacheEntry<FundDividendEvent[]>>();

function getHgBrasilApiKey(): string | null {
  const env = typeof process !== 'undefined' ? process.env : undefined;
  return env?.HG_BRASIL_API_KEY || env?.EXPO_PUBLIC_HG_BRASIL_API_KEY || null;
}

function normalizeTicker(ticker: string): string {
  return ticker.trim().toUpperCase().replace(/^B3:/, '');
}

function toHgTicker(ticker: string): string {
  return `B3:${normalizeTicker(ticker)}`;
}

function isFresh(entry: CacheEntry<unknown>): boolean {
  return Date.now() - entry.fetchedAt < CACHE_TTL_MS;
}

function toNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function toStringOrNull(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value : null;
}

function readRecord(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

async function fetchJson(path: string, params: Record<string, string>): Promise<unknown> {
  const key = getHgBrasilApiKey();
  if (!key) {
    throw new Error('HG Brasil API key is not configured.');
  }

  const url = new URL(path, HG_BASE_URL);
  Object.entries(params).forEach(([name, value]) => {
    url.searchParams.set(name, value);
  });
  url.searchParams.set('key', key);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url.toString(), { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`HG Brasil HTTP ${response.status}`);
    }
    return response.json();
  } finally {
    clearTimeout(timeout);
  }
}

function readResultsArray(json: unknown): unknown[] {
  const root = readRecord(json);
  if (Array.isArray(root.results)) {
    return root.results;
  }

  const results = readRecord(root.results);
  return Object.values(results).filter((item) => {
    const record = readRecord(item);
    return record.error !== true;
  });
}

function normalizeQuote(raw: unknown, stale = false): MarketFiiQuote | null {
  const item = readRecord(raw);
  const error = item.error === true;
  if (error) return null;

  const symbol = toStringOrNull(item.symbol);
  const ticker = symbol ?? toStringOrNull(item.ticker)?.replace(/^B3:/, '') ?? null;
  if (!ticker) return null;

  const quote = readRecord(item.quote);
  const market = readRecord(item.market);
  const dividends = readRecord(item.dividends);
  const financials = readRecord(item.financials);
  const classification = readRecord(item.classification);
  const financialDividends = readRecord(financials.dividends);

  return {
    ticker: normalizeTicker(ticker),
    name: toStringOrNull(item.name),
    companyName: toStringOrNull(item.full_name) ?? toStringOrNull(item.company_name),
    cnpj: toStringOrNull(item.tax_id) ?? toStringOrNull(item.document),
    segmentLabel:
      toStringOrNull(classification.segment) ??
      toStringOrNull(classification.subsector) ??
      toStringOrNull(classification.sector) ??
      toStringOrNull(item.sector) ??
      toStringOrNull(item.description),
    price: toNumber(quote.value) ?? toNumber(item.price),
    changeValue: toNumber(quote.change_value) ?? toNumber(item.change_price),
    changePercent: toNumber(quote.change_percent) ?? toNumber(item.change_percent),
    open: toNumber(market.open),
    high: toNumber(market.high),
    low: toNumber(market.low),
    previousClose: toNumber(market.previous_value),
    close: toNumber(market.close),
    volume: toNumber(market.volume) ?? toNumber(item.volume),
    marketCap: toNumber(quote.market_cap) ?? toNumber(item.market_cap),
    equity: toNumber(financials.equity),
    quotaCount: toNumber(item.shares_outstanding) ?? toNumber(financials.quota_count),
    equityPerShare: toNumber(financials.equity_per_share),
    priceToBook: toNumber(financials.price_to_book_ratio),
    dividendYield12m: toNumber(dividends.yield_12m_percent) ?? toNumber(financialDividends.yield_12m),
    dividends12m: toNumber(dividends.yield_12m_cash) ?? toNumber(financialDividends.yield_12m_sum),
    updatedAt:
      toStringOrNull(quote.updated_at) ??
      toStringOrNull(market.updated_at) ??
      toStringOrNull(item.updated_at),
    stale,
    source: 'hgbrasil',
  };
}

function normalizeDividends(raw: unknown, fallbackTicker: string): FundDividendEvent[] {
  const root = readRecord(raw);
  const results = Array.isArray(root.results) ? root.results : [];
  const normalizedTicker = normalizeTicker(fallbackTicker);
  const asset = results.find((item) => {
    const record = readRecord(item);
    return normalizeTicker(String(record.symbol ?? record.ticker ?? '')) === normalizedTicker;
  });
  const series = Array.isArray(readRecord(asset).series) ? readRecord(asset).series as unknown[] : [];

  return series.map((event, index) => {
    const item = readRecord(event);
    const type = toStringOrNull(item.type) ?? 'income';
    const comDate = toStringOrNull(item.com_date);
    const paymentDate = toStringOrNull(item.payment_date);
    return {
      id: `hg-${normalizedTicker}-${comDate ?? paymentDate ?? index}`,
      type,
      label: type === 'income' ? 'Rendimento' : type,
      amount: toNumber(item.amount),
      comDate,
      paymentDate,
      status: toStringOrNull(item.status),
      source: 'hgbrasil',
    };
  });
}

async function fetchQuotes(tickers: string[]): Promise<Map<string, MarketFiiQuote>> {
  const uniqueTickers = Array.from(new Set(tickers.map(normalizeTicker))).filter(Boolean);
  const output = new Map<string, MarketFiiQuote>();
  const missing: string[] = [];

  uniqueTickers.forEach((ticker) => {
    const cached = quoteCache.get(ticker);
    if (cached && isFresh(cached)) {
      output.set(ticker, cached.data);
      return;
    }
    missing.push(ticker);
  });

  if (missing.length === 0) {
    return output;
  }

  try {
    const json = await fetchJson(QUOTES_ENDPOINT, {
      tickers: missing.map(toHgTicker).join(','),
    });
    let results = readResultsArray(json);

    if (results.length === 0) {
      const legacyJson = await fetchJson(LEGACY_QUOTES_ENDPOINT, {
        symbol: missing.join(','),
      });
      results = readResultsArray(legacyJson);
    }

    results.forEach((raw) => {
      const normalized = normalizeQuote(raw);
      if (!normalized) return;
      quoteCache.set(normalized.ticker, { data: normalized, fetchedAt: Date.now() });
      output.set(normalized.ticker, normalized);
    });
  } catch {
    missing.forEach((ticker) => {
      const cached = quoteCache.get(ticker);
      if (cached) {
        output.set(ticker, { ...cached.data, stale: true });
      }
    });
  }

  return output;
}

export const hgBrasilProvider: MarketDataProvider = {
  async getFiiQuote(ticker) {
    const quotes = await fetchQuotes([ticker]);
    return quotes.get(normalizeTicker(ticker)) ?? null;
  },

  async getFiiDetails(ticker): Promise<MarketFiiDetails | null> {
    const quote = await this.getFiiQuote(ticker);
    if (!quote) return null;

    const dividendsHistory = await this.getFiiDividends(ticker);
    return { ...quote, dividendsHistory };
  },

  async getFiiDividends(ticker) {
    const normalizedTicker = normalizeTicker(ticker);
    const cached = dividendCache.get(normalizedTicker);
    if (cached && isFresh(cached)) {
      return cached.data;
    }

    try {
      const json = await fetchJson(DIVIDENDS_ENDPOINT, {
        tickers: toHgTicker(normalizedTicker),
      });
      const dividends = normalizeDividends(json, normalizedTicker);
      dividendCache.set(normalizedTicker, { data: dividends, fetchedAt: Date.now() });
      return dividends;
    } catch {
      return cached?.data ?? [];
    }
  },

  async getFiiHistory() {
    return [];
  },

  async searchFiis(query) {
    const normalized = query.trim().toUpperCase();
    if (!normalized) return [];
    const quote = await this.getFiiQuote(normalized);
    return quote ? [quote] : [];
  },

  getFiiQuotes: fetchQuotes,
};
