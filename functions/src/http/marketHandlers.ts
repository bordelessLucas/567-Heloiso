import type { Response } from 'express';
import type { Request } from 'firebase-functions/v2/https';

import { getRuntimeConfig } from '../config';

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

  sendJson(response, 404, { error: 'not-found' });
}
