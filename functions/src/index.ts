import { initializeApp } from 'firebase-admin/app';
import { onRequest } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';

import { hgBrasilApiKeySecret } from './config';
import { marketApiHandler } from './http/marketHandlers';
import { syncMarketDataHandler } from './scheduled/syncMarketData';

initializeApp();

export const marketApi = onRequest(
  {
    region: 'southamerica-east1',
    cors: true,
    secrets: [hgBrasilApiKeySecret],
  },
  marketApiHandler,
);

export const syncMarketData = onSchedule(
  {
    region: 'southamerica-east1',
    schedule: 'every 30 minutes',
    secrets: [hgBrasilApiKeySecret],
  },
  syncMarketDataHandler,
);
