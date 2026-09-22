import type { Response } from 'express';
import type { Request } from 'firebase-functions/v2/https';

import { isCachedQuoteFresh, readQuote, writeQuotes } from '../cache/firestoreMarketCache';
import { getRuntimeConfig } from '../config';
import { fetchHgQuotes } from '../hg/client';
import { NormalizedMarketQuote, normalizeHgQuote, readResultsArray } from '../hg/normalize';

function sendJson(response: Response, status: number, body: unknown): void {
  response.set('Access-Control-Allow-Origin', '*');
  response.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.status(status).json(body);
}

export async function marketApiHandler(request: Request, response: Response): Promise<void> {
  if (request.method === 'OPTIONS') {
    sendJson(response, 204, {});
    return;
  }

  if (request.method !== 'GET') {
    sendJson(response, 405, { error: 'method-not-allowed' });
    return;
  }

  const path = request.path.replace(/\/$/, '');

  if (path === '/market/health') {
    const config = getRuntimeConfig();
    sendJson(response, 200, {
      mode: 'functions',
      live: config.hasHgApiKey,
      reason: config.hasHgApiKey ? null : 'HG_BRASIL_API_KEY is not configured.',
      updatedAt: new Date().toISOString(),
    });
    return;
  }

  if (path === '/market/quotes') {
    const config = getRuntimeConfig();
    const tickers = String(request.query.tickers ?? '')
      .split(',')
      .map((ticker) => ticker.trim().toUpperCase().replace(/^B3:/, ''))
      .filter(Boolean);

    const cachedQuotes = await Promise.all(tickers.map((ticker) => readQuote(ticker)));
    const output = new Map<string, NormalizedMarketQuote>();
    const staleFallbacks = new Map<string, NormalizedMarketQuote>();
    const missing: string[] = [];

    tickers.forEach((ticker, index) => {
      const cached = cachedQuotes[index];
      if (!cached) {
        missing.push(ticker);
        return;
      }

      const payload = cached.payload as NormalizedMarketQuote;
      if (isCachedQuoteFresh(cached)) {
        output.set(ticker, { ...payload, stale: false });
        return;
      }

      staleFallbacks.set(ticker, { ...payload, stale: true });
      missing.push(ticker);
    });

    if (!config.hgApiKey) {
      staleFallbacks.forEach((quote, ticker) => output.set(ticker, quote));
      const quotes = tickers.flatMap((ticker) => {
        const quote = output.get(ticker);
        return quote ? [quote] : [];
      });

      if (quotes.length > 0) {
        sendJson(response, 200, { quotes });
        return;
      }

      sendJson(response, 503, { error: 'hg-key-not-configured', quotes: [] });
      return;
    }

    try {
      if (missing.length > 0) {
        const json = await fetchHgQuotes(config.hgApiKey, missing);
        const freshQuotes = readResultsArray(json)
          .map((raw) => normalizeHgQuote(raw))
          .filter((quote): quote is NormalizedMarketQuote => quote !== null);

        await writeQuotes(freshQuotes.map((quote) => ({ ticker: quote.ticker, payload: quote })));
        freshQuotes.forEach((quote) => output.set(quote.ticker, quote));
      }
    } catch {
      staleFallbacks.forEach((quote, ticker) => {
        if (!output.has(ticker)) output.set(ticker, quote);
      });
    }

    sendJson(response, 200, {
      quotes: tickers.flatMap((ticker) => {
        const quote = output.get(ticker);
        return quote ? [quote] : [];
      }),
    });
    return;
  }

  sendJson(response, 404, { error: 'not-found' });
}
