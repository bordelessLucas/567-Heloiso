import type { Response } from 'express';
import type { Request } from 'firebase-functions/v2/https';

import { getRuntimeConfig } from '../config';
import { fetchHgQuotes } from '../hg/client';
import { normalizeHgQuote, readResultsArray } from '../hg/normalize';

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
    if (!config.hgApiKey) {
      sendJson(response, 503, { error: 'hg-key-not-configured', quotes: [] });
      return;
    }

    const tickers = String(request.query.tickers ?? '')
      .split(',')
      .map((ticker) => ticker.trim().toUpperCase())
      .filter(Boolean);

    const json = await fetchHgQuotes(config.hgApiKey, tickers);
    const quotes = readResultsArray(json)
      .map((raw) => normalizeHgQuote(raw))
      .filter((quote): quote is NonNullable<typeof quote> => quote !== null);

    sendJson(response, 200, { quotes });
    return;
  }

  sendJson(response, 404, { error: 'not-found' });
}
