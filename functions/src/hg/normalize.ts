export interface NormalizedMarketQuote {
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
  source: 'hgbrasil';
}

export interface NormalizedDividendEvent {
  id: string;
  type: string;
  label: string;
  amount: number | null;
  comDate: string | null;
  paymentDate: string | null;
  status: string | null;
  source: 'hgbrasil';
}

function normalizeTicker(ticker: string): string {
  return ticker.trim().toUpperCase().replace(/^B3:/, '');
}

function readRecord(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function toNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function toStringOrNull(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value : null;
}

export function readResultsArray(json: unknown): unknown[] {
  const root = readRecord(json);
  if (Array.isArray(root.results)) return root.results;

  const results = readRecord(root.results);
  return Object.values(results).filter((item) => readRecord(item).error !== true);
}

export function normalizeHgQuote(raw: unknown, stale = false): NormalizedMarketQuote | null {
  const item = readRecord(raw);
  if (item.error === true) return null;

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
    dividendYield12m:
      toNumber(dividends.yield_12m_percent) ?? toNumber(financialDividends.yield_12m),
    dividends12m: toNumber(dividends.yield_12m_cash) ?? toNumber(financialDividends.yield_12m_sum),
    updatedAt:
      toStringOrNull(quote.updated_at) ??
      toStringOrNull(market.updated_at) ??
      toStringOrNull(item.updated_at),
    stale,
    source: 'hgbrasil',
  };
}

export function normalizeHgDividends(raw: unknown, fallbackTicker: string): NormalizedDividendEvent[] {
  const root = readRecord(raw);
  const results = Array.isArray(root.results) ? root.results : [];
  const normalizedTicker = normalizeTicker(fallbackTicker);
  const asset = results.find((item) => {
    const record = readRecord(item);
    return normalizeTicker(String(record.symbol ?? record.ticker ?? '')) === normalizedTicker;
  });
  const series = Array.isArray(readRecord(asset).series)
    ? (readRecord(asset).series as unknown[])
    : [];

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
