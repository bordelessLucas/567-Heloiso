import type { PortfolioHolding, PortfolioTrade } from '@/src/domain/portfolio';
import {
  buildDemoHoldings,
  DEMO_PORTFOLIO_SEED,
  isDemoAccount,
} from '@/src/data/mocks/demo.account';
import { MOCK_FUNDS } from '@/src/data/mocks/funds.mock';

interface UserPortfolioState {
  holdings: PortfolioHolding[];
  trades: PortfolioTrade[];
  seeded: boolean;
  seedVersion: number;
}

const stores = new Map<string, UserPortfolioState>();

function emptyState(): UserPortfolioState {
  return { holdings: [], trades: [], seeded: false, seedVersion: 0 };
}

function getState(userId: string): UserPortfolioState {
  let state = stores.get(userId);
  if (!state) {
    state = emptyState();
    stores.set(userId, state);
  }
  return state;
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

export function ensurePortfolioSeed(userId: string, email?: string | null): UserPortfolioState {
  const state = getState(userId);
  const needsDemoRefresh =
    isDemoAccount(email) &&
    (!state.seeded || state.seedVersion !== DEMO_PORTFOLIO_SEED);

  if (state.seeded && !needsDemoRefresh) {
    return state;
  }

  if (isDemoAccount(email)) {
    const holdings = buildDemoHoldings(userId).map((holding, index) => ({
      ...holding,
      sortIndex: index,
    }));
    state.holdings = holdings;
    state.trades = buildDemoTrades(userId, holdings);
    state.seedVersion = DEMO_PORTFOLIO_SEED;
  } else if (!state.seeded) {
    state.holdings = [];
    state.trades = [];
    state.seedVersion = 0;
  }

  state.seeded = true;
  return state;
}

export function readHoldings(userId: string, email?: string | null): PortfolioHolding[] {
  return ensurePortfolioSeed(userId, email).holdings.map((item) => ({ ...item }));
}

export function readTrades(userId: string, email?: string | null): PortfolioTrade[] {
  return ensurePortfolioSeed(userId, email)
    .trades.map((item) => ({ ...item }))
    .sort((a, b) => (a.executedAt < b.executedAt ? 1 : -1));
}

export function writeHoldings(userId: string, holdings: PortfolioHolding[]): void {
  const state = getState(userId);
  state.holdings = holdings;
  state.seeded = true;
}

export function appendTrade(userId: string, trade: PortfolioTrade): void {
  const state = getState(userId);
  state.trades = [trade, ...state.trades];
  state.seeded = true;
}

export function resolveFundMeta(ticker: string) {
  const fund = MOCK_FUNDS.find((item) => item.ticker.toUpperCase() === ticker.toUpperCase());
  return fund ?? null;
}
