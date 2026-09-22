const HG_BASE_URL = 'https://api.hgbrasil.com';
const QUOTES_ENDPOINT = '/v2/finance/quotes';
const DIVIDENDS_ENDPOINT = '/v2/finance/dividends';
const REQUEST_TIMEOUT_MS = 12_000;

function toHgTicker(ticker: string): string {
  return `B3:${ticker.trim().toUpperCase().replace(/^B3:/, '')}`;
}

async function fetchHgJson(
  path: string,
  key: string,
  params: Record<string, string>,
): Promise<unknown> {
  const url = new URL(path, HG_BASE_URL);
  Object.entries(params).forEach(([name, value]) => url.searchParams.set(name, value));
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

export async function fetchHgQuotes(apiKey: string, tickers: string[]): Promise<unknown> {
  const unique = Array.from(
    new Set(tickers.map((ticker) => ticker.trim().toUpperCase()).filter(Boolean)),
  );

  return fetchHgJson(QUOTES_ENDPOINT, apiKey, {
    tickers: unique.map(toHgTicker).join(','),
  });
}

export async function fetchHgDividends(apiKey: string, ticker: string): Promise<unknown> {
  return fetchHgJson(DIVIDENDS_ENDPOINT, apiKey, {
    tickers: toHgTicker(ticker),
  });
}
