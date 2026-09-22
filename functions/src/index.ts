import { initializeApp } from 'firebase-admin/app';
import { onRequest } from 'firebase-functions/v2/https';

import { hgBrasilApiKeySecret } from './config';
import { marketApiHandler } from './http/marketHandlers';

initializeApp();

export const marketApi = onRequest(
  {
    region: 'southamerica-east1',
    cors: true,
    secrets: [hgBrasilApiKeySecret],
  },
  marketApiHandler,
);
