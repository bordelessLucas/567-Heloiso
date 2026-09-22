import { getFirestore, Timestamp } from 'firebase-admin/firestore';

export interface CachedMarketQuote {
  ticker: string;
  payload: unknown;
  source: 'hgbrasil';
  fetchedAt: FirebaseFirestore.Timestamp;
  staleAfter: FirebaseFirestore.Timestamp;
}

export interface CachedMarketFund {
  ticker: string;
  payload: unknown;
  source: 'hgbrasil';
  fetchedAt: FirebaseFirestore.Timestamp;
}

function normalizeTicker(ticker: string): string {
  return ticker.trim().toUpperCase().replace(/^B3:/, '');
}

export async function readQuote(ticker: string): Promise<CachedMarketQuote | null> {
  const snapshot = await getFirestore()
    .collection('marketQuotes')
    .doc(normalizeTicker(ticker))
    .get();

  return snapshot.exists ? (snapshot.data() as CachedMarketQuote) : null;
}

export function isCachedQuoteFresh(quote: CachedMarketQuote): boolean {
  return quote.staleAfter.toMillis() > Date.now();
}

export async function readFundDetails(ticker: string): Promise<CachedMarketFund | null> {
  const snapshot = await getFirestore()
    .collection('marketFunds')
    .doc(normalizeTicker(ticker))
    .get();

  return snapshot.exists ? (snapshot.data() as CachedMarketFund) : null;
}

export async function writeQuotes(
  quotes: Array<{ ticker: string; payload: unknown }>,
): Promise<void> {
  const db = getFirestore();
  const batch = db.batch();
  const fetchedAt = Timestamp.now();
  const staleAfter = Timestamp.fromMillis(Date.now() + 30 * 60 * 1000);

  quotes.forEach((quote) => {
    const ref = db.collection('marketQuotes').doc(normalizeTicker(quote.ticker));
    batch.set(ref, {
      ticker: normalizeTicker(quote.ticker),
      payload: quote.payload,
      source: 'hgbrasil',
      fetchedAt,
      staleAfter,
    });
  });

  await batch.commit();
}
