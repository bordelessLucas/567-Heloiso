import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import type { ScheduledEvent } from 'firebase-functions/v2/scheduler';

import { getRuntimeConfig } from '../config';

export async function syncMarketDataHandler(_event: ScheduledEvent): Promise<void> {
  const config = getRuntimeConfig();
  const db = getFirestore();

  await db.collection('marketMeta').doc('status').set(
    {
      provider: 'hgbrasil',
      live: config.hasHgApiKey,
      reason: config.hasHgApiKey ? null : 'HG_BRASIL_API_KEY is not configured.',
      lastAttemptAt: Timestamp.now(),
      lastSuccessAt: config.hasHgApiKey ? Timestamp.now() : null,
    },
    { merge: true },
  );
}
