import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  writeBatch,
} from 'firebase/firestore';

import type { PortfolioHolding, PortfolioTrade } from '@/src/domain/portfolio';
import {
  buildDemoHoldings,
  DEMO_PORTFOLIO_SEED,
  isDemoAccount,
} from '@/src/data/mocks/demo.account';
import { MOCK_FUNDS } from '@/src/data/mocks/funds.mock';
import { db } from '@/src/services/firebase';

interface UserPortfolioState {
  holdings: PortfolioHolding[];
  trades: PortfolioTrade[];
  seeded: boolean;
  seedVersion: number;
}

const STORAGE_PREFIX = '@mercadofiis/portfolio_v2_';
const memory = new Map<string, UserPortfolioState>();

function emptyState(): UserPortfolioState {
  return { holdings: [], trades: [], seeded: false, seedVersion: 0 };
}

function storageKey(userId: string): string {
  return `${STORAGE_PREFIX}${userId}`;
}

async function readLocal(userId: string): Promise<UserPortfolioState | null> {
  const raw = await AsyncStorage.getItem(storageKey(userId));
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as UserPortfolioState;
    return {
      holdings: Array.isArray(parsed.holdings) ? parsed.holdings : [],
      trades: Array.isArray(parsed.trades) ? parsed.trades : [],
      seeded: Boolean(parsed.seeded),
      seedVersion: typeof parsed.seedVersion === 'number' ? parsed.seedVersion : 0,
    };
  } catch {
    return null;
  }
}

async function writeLocal(userId: string, state: UserPortfolioState): Promise<void> {
  memory.set(userId, state);
  await AsyncStorage.setItem(storageKey(userId), JSON.stringify(state));
}

async function readFirestore(userId: string): Promise<UserPortfolioState | null> {
  try {
    const metaSnap = await getDoc(doc(db, 'portfolios', userId, 'meta', 'state'));
    if (!metaSnap.exists()) return null;
    const meta = metaSnap.data() as { seeded?: boolean; seedVersion?: number };
    const [holdingsSnap, tradesSnap] = await Promise.all([
      getDocs(collection(db, 'portfolios', userId, 'holdings')),
      getDocs(collection(db, 'portfolios', userId, 'trades')),
    ]);
    return {
      holdings: holdingsSnap.docs.map((item) => item.data() as PortfolioHolding),
      trades: tradesSnap.docs.map((item) => item.data() as PortfolioTrade),
      seeded: meta.seeded === true,
      seedVersion: typeof meta.seedVersion === 'number' ? meta.seedVersion : 0,
    };
  } catch {
    return null;
  }
}

async function writeFirestore(userId: string, state: UserPortfolioState): Promise<void> {
  try {
    const batch = writeBatch(db);
    batch.set(doc(db, 'portfolios', userId, 'meta', 'state'), {
      seeded: state.seeded,
      seedVersion: state.seedVersion,
      updatedAt: new Date().toISOString(),
    });
    state.holdings.forEach((holding) => {
      batch.set(doc(db, 'portfolios', userId, 'holdings', holding.id), holding);
    });
    state.trades.forEach((trade) => {
      batch.set(doc(db, 'portfolios', userId, 'trades', trade.id), trade);
    });
    await batch.commit();
  } catch {
    // Persistência local continua válida se Firestore falhar (rules/rede).
  }
}

function daysAgoIso(days: number, hour = 14): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
}

function buildDemoTrades(userId: string, holdings: PortfolioHolding[]): PortfolioTrade[] {
  const byTicker = Object.fromEntries(holdings.map((h) => [h.ticker, h]));
  const kncr = byTicker.KNCR11;
  const hglg = byTicker.HGLG11;
  const mxrf = byTicker.MXRF11;
  const rows: Omit<PortfolioTrade, 'id'>[] = [];

  if (hglg) {
    rows.push(
      {
        userId,
        holdingId: hglg.id,
        ticker: 'HGLG11',
        side: 'buy',
        quantity: 80,
        price: 150.2,
        total: 80 * 150.2,
        executedAt: daysAgoIso(210),
      },
      {
        userId,
        holdingId: hglg.id,
        ticker: 'HGLG11',
        side: 'buy',
        quantity: 40,
        price: 156.8,
        total: 40 * 156.8,
        executedAt: daysAgoIso(42),
      },
      {
        userId,
        holdingId: hglg.id,
        ticker: 'HGLG11',
        side: 'sell',
        quantity: 10,
        price: 157.1,
        total: 10 * 157.1,
        executedAt: daysAgoIso(12),
      },
    );
  }

  if (kncr) {
    rows.push(
      {
        userId,
        holdingId: kncr.id,
        ticker: 'KNCR11',
        side: 'buy',
        quantity: 80,
        price: 103.1,
        total: 80 * 103.1,
        executedAt: daysAgoIso(136),
      },
      {
        userId,
        holdingId: kncr.id,
        ticker: 'KNCR11',
        side: 'sell',
        quantity: 15,
        price: 106.4,
        total: 15 * 106.4,
        executedAt: daysAgoIso(5),
      },
      {
        userId,
        holdingId: kncr.id,
        ticker: 'KNCR11',
        side: 'buy',
        quantity: 15,
        price: 105.2,
        total: 15 * 105.2,
        executedAt: daysAgoIso(1),
      },
    );
  }

  if (mxrf) {
    rows.push(
      {
        userId,
        holdingId: mxrf.id,
        ticker: 'MXRF11',
        side: 'buy',
        quantity: 500,
        price: 9.6,
        total: 500 * 9.6,
        executedAt: daysAgoIso(88),
      },
      {
        userId,
        holdingId: mxrf.id,
        ticker: 'MXRF11',
        side: 'buy',
        quantity: 400,
        price: 9.94,
        total: 400 * 9.94,
        executedAt: daysAgoIso(21),
      },
      {
        userId,
        holdingId: mxrf.id,
        ticker: 'MXRF11',
        side: 'sell',
        quantity: 50,
        price: 9.88,
        total: 50 * 9.88,
        executedAt: daysAgoIso(3),
      },
    );
  }

  return rows
    .sort((a, b) => (a.executedAt < b.executedAt ? 1 : -1))
    .map((row, index) => ({
      ...row,
      id: `demo-trade-${index + 1}`,
    }));
}

async function persist(userId: string, state: UserPortfolioState): Promise<void> {
  await writeLocal(userId, state);
  void writeFirestore(userId, state);
}

export async function ensurePortfolioSeed(
  userId: string,
  email?: string | null,
): Promise<UserPortfolioState> {
  const cached = memory.get(userId);
  if (cached?.seeded) {
    const needsDemoRefresh =
      isDemoAccount(email) && cached.seedVersion !== DEMO_PORTFOLIO_SEED;
    if (!needsDemoRefresh) {
      return cached;
    }
  }

  const remote = await readFirestore(userId);
  const local = remote ?? (await readLocal(userId));
  let state = local ?? emptyState();

  const needsDemoRefresh =
    isDemoAccount(email) &&
    (!state.seeded || state.seedVersion !== DEMO_PORTFOLIO_SEED);

  if (needsDemoRefresh) {
    const holdings = buildDemoHoldings(userId).map((holding, index) => ({
      ...holding,
      sortIndex: index,
    }));
    state = {
      holdings,
      trades: buildDemoTrades(userId, holdings),
      seeded: true,
      seedVersion: DEMO_PORTFOLIO_SEED,
    };
    await persist(userId, state);
    return state;
  }

  if (!state.seeded) {
    state = { holdings: [], trades: [], seeded: true, seedVersion: 0 };
    await persist(userId, state);
    return state;
  }

  memory.set(userId, state);
  return state;
}

export async function readHoldings(
  userId: string,
  email?: string | null,
): Promise<PortfolioHolding[]> {
  const state = await ensurePortfolioSeed(userId, email);
  return state.holdings.map((item) => ({ ...item }));
}

export async function readTrades(
  userId: string,
  email?: string | null,
): Promise<PortfolioTrade[]> {
  const state = await ensurePortfolioSeed(userId, email);
  return state.trades
    .map((item) => ({ ...item }))
    .sort((a, b) => (a.executedAt < b.executedAt ? 1 : -1));
}

export async function writeHoldings(
  userId: string,
  holdings: PortfolioHolding[],
): Promise<void> {
  const state = memory.get(userId) ?? emptyState();
  state.holdings = holdings;
  state.seeded = true;
  await persist(userId, state);
}

export async function appendTrade(userId: string, trade: PortfolioTrade): Promise<void> {
  const state = memory.get(userId) ?? emptyState();
  state.trades = [trade, ...state.trades];
  state.seeded = true;
  await persist(userId, state);
}

export function resolveFundMeta(ticker: string) {
  const fund = MOCK_FUNDS.find((item) => item.ticker.toUpperCase() === ticker.toUpperCase());
  return fund ?? null;
}
