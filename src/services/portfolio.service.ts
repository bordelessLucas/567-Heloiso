import type {
  HistoryPeriodDays,
  PortfolioHolding,
  PortfolioSortKey,
  PortfolioSummary,
  PortfolioTrade,
  PortfolioTradeSide,
  PricePoint,
} from '@/src/domain/portfolio';
import {
  appendTrade,
  readHoldings,
  readTrades,
  resolveFundMeta,
  writeHoldings,
} from '@/src/data/mocks/portfolio.store';
import { MOCK_FUNDS } from '@/src/data/mocks/funds.mock';
import { FUND_SEGMENT_LABELS } from '@/src/domain/fund';
import { todayKey } from '@/src/utils/format';

export interface PortfolioPositionView extends PortfolioHolding {
  name: string;
  currentPrice: number | null;
  changePercent: number | null;
  marketValue: number;
  pnlAmount: number;
  pnlPercent: number;
}

export interface PortfolioDashboard {
  summary: PortfolioSummary;
  positions: PortfolioPositionView[];
  totalMarketValue: number;
  totalPnlAmount: number;
  totalPnlPercent: number;
  equitySeries: PricePoint[];
}

export interface SimilarSuggestion {
  ticker: string;
  name: string;
  changePercent: number;
  sharePrice: number;
  segmentLabel: string;
  reason: string;
}

export interface HoldingDetailView {
  position: PortfolioPositionView;
  priceSeries: PricePoint[];
  suggestions: SimilarSuggestion[];
  trades: PortfolioTrade[];
}

function enrichHolding(holding: PortfolioHolding): PortfolioPositionView {
  const fund = resolveFundMeta(holding.ticker);
  const currentPrice = fund?.sharePrice ?? null;
  const marketValue =
    currentPrice !== null ? currentPrice * holding.quantity : holding.investedAmount;
  const pnlAmount = marketValue - holding.investedAmount;
  const pnlPercent =
    holding.investedAmount > 0 ? (pnlAmount / holding.investedAmount) * 100 : 0;

  return {
    ...holding,
    name: fund?.name ?? holding.ticker,
    currentPrice,
    changePercent: fund?.changePercent ?? null,
    marketValue,
    pnlAmount,
    pnlPercent,
  };
}

export function sortPositions(
  positions: PortfolioPositionView[],
  sortKey: PortfolioSortKey,
): PortfolioPositionView[] {
  const copy = [...positions];
  switch (sortKey) {
    case 'top_return':
      return copy.sort((a, b) => b.pnlPercent - a.pnlPercent);
    case 'bottom_return':
      return copy.sort((a, b) => a.pnlPercent - b.pnlPercent);
    case 'qty_desc':
      return copy.sort((a, b) => b.quantity - a.quantity);
    case 'qty_asc':
      return copy.sort((a, b) => a.quantity - b.quantity);
    case 'default':
    default:
      return copy.sort((a, b) => a.sortIndex - b.sortIndex);
  }
}

function hashTicker(ticker: string): number {
  return ticker.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
}

/** Série sintética de preços para gráficos (mock visual). */
export function buildPriceSeries(
  ticker: string,
  days: HistoryPeriodDays,
  endPrice: number,
): PricePoint[] {
  const points: PricePoint[] = [];
  const seed = hashTicker(ticker);
  let value = endPrice;

  for (let i = days - 1; i >= 0; i -= 1) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const wave = Math.sin((seed + i) / 4.2) * (endPrice * 0.012);
    const drift = ((days - i) / days) * (endPrice * 0.04);
    const noise = (((seed * (i + 3)) % 17) - 8) * 0.08;
    value = Math.max(0.5, endPrice - drift + wave + noise);
    points.push({ dateKey: todayKey(date), value: Number(value.toFixed(2)) });
  }

  if (points.length > 0) {
    points[points.length - 1] = {
      dateKey: todayKey(),
      value: Number(endPrice.toFixed(2)),
    };
  }

  return points;
}

function buildEquitySeries(positions: PortfolioPositionView[], days: HistoryPeriodDays): PricePoint[] {
  if (positions.length === 0) {
    return [];
  }

  const seriesByTicker = positions.map((position) => {
    const price = position.currentPrice ?? position.averagePrice;
    return {
      quantity: position.quantity,
      series: buildPriceSeries(position.ticker, days, price),
    };
  });

  const length = seriesByTicker[0]?.series.length ?? 0;
  const equity: PricePoint[] = [];

  for (let i = 0; i < length; i += 1) {
    let total = 0;
    let dateKey = todayKey();
    for (const item of seriesByTicker) {
      const point = item.series[i];
      if (!point) continue;
      dateKey = point.dateKey;
      total += point.value * item.quantity;
    }
    equity.push({ dateKey, value: Number(total.toFixed(2)) });
  }

  return equity;
}

export function filterTradesByPeriod(
  trades: PortfolioTrade[],
  days: HistoryPeriodDays,
  ticker?: string,
): PortfolioTrade[] {
  const cutoff = new Date();
  cutoff.setHours(0, 0, 0, 0);
  cutoff.setDate(cutoff.getDate() - (days - 1));

  return trades.filter((trade) => {
    if (ticker && trade.ticker !== ticker) return false;
    return new Date(trade.executedAt).getTime() >= cutoff.getTime();
  });
}

export async function listHoldings(
  userId: string,
  email?: string | null,
): Promise<PortfolioHolding[]> {
  return readHoldings(userId, email);
}

export async function getPortfolioSummary(
  userId: string,
  email?: string | null,
): Promise<PortfolioSummary> {
  const holdings = await listHoldings(userId, email);
  return {
    userId,
    holdings,
    totalInvested: holdings.reduce((acc, item) => acc + item.investedAmount, 0),
    holdingsCount: holdings.length,
  };
}

export async function getPortfolioDashboard(
  userId: string,
  email?: string | null,
  options?: { sort?: PortfolioSortKey; chartDays?: HistoryPeriodDays },
): Promise<PortfolioDashboard> {
  const summary = await getPortfolioSummary(userId, email);
  const positions = sortPositions(
    summary.holdings.map(enrichHolding),
    options?.sort ?? 'default',
  );
  const totalMarketValue = positions.reduce((acc, item) => acc + item.marketValue, 0);
  const totalPnlAmount = totalMarketValue - summary.totalInvested;
  const totalPnlPercent =
    summary.totalInvested > 0 ? (totalPnlAmount / summary.totalInvested) * 100 : 0;

  return {
    summary,
    positions,
    totalMarketValue,
    totalPnlAmount,
    totalPnlPercent,
    equitySeries: buildEquitySeries(positions, options?.chartDays ?? 30),
  };
}

export async function listPortfolioTrades(
  userId: string,
  email?: string | null,
  options?: { days?: HistoryPeriodDays; ticker?: string },
): Promise<PortfolioTrade[]> {
  const trades = readTrades(userId, email);
  return filterTradesByPeriod(trades, options?.days ?? 30, options?.ticker);
}

export function listSimilarSuggestions(ticker: string, limit = 3): SimilarSuggestion[] {
  const current = resolveFundMeta(ticker);
  if (!current) return [];

  return MOCK_FUNDS.filter((fund) => fund.ticker !== current.ticker)
    .filter((fund) => (fund.changePercent ?? 0) > 0)
    .sort((a, b) => {
      const sameSegmentBoost =
        Number(a.segment === current.segment) - Number(b.segment === current.segment);
      if (sameSegmentBoost !== 0) return -sameSegmentBoost;
      return (b.changePercent ?? 0) - (a.changePercent ?? 0);
    })
    .slice(0, limit)
    .map((fund) => ({
      ticker: fund.ticker,
      name: fund.name,
      changePercent: fund.changePercent ?? 0,
      sharePrice: fund.sharePrice ?? 0,
      segmentLabel: FUND_SEGMENT_LABELS[fund.segment],
      reason:
        fund.segment === current.segment
          ? 'Mesmo segmento e em alta no snapshot'
          : 'Em alta agora — útil para comparar com a sua posição',
    }));
}

export async function getHoldingDetail(
  userId: string,
  ticker: string,
  email?: string | null,
  options?: { chartDays?: HistoryPeriodDays; historyDays?: HistoryPeriodDays },
): Promise<HoldingDetailView | null> {
  const holdings = readHoldings(userId, email);
  const holding = holdings.find((item) => item.ticker.toUpperCase() === ticker.toUpperCase());
  if (!holding) return null;

  const position = enrichHolding(holding);
  const price = position.currentPrice ?? position.averagePrice;
  const chartDays = options?.chartDays ?? 30;

  return {
    position,
    priceSeries: buildPriceSeries(position.ticker, chartDays, price),
    suggestions: listSimilarSuggestions(position.ticker),
    trades: filterTradesByPeriod(
      readTrades(userId, email),
      options?.historyDays ?? 90,
      position.ticker,
    ),
  };
}

export interface ExecuteTradeInput {
  userId: string;
  email?: string | null;
  ticker: string;
  side: PortfolioTradeSide;
  quantity: number;
  price?: number;
}

export async function executeTrade(input: ExecuteTradeInput): Promise<PortfolioPositionView> {
  const qty = Math.floor(input.quantity);
  if (!Number.isFinite(qty) || qty <= 0) {
    throw new Error('Informe uma quantidade válida de cotas.');
  }

  const fund = resolveFundMeta(input.ticker);
  if (!fund || fund.sharePrice == null) {
    throw new Error('Cotação indisponível para este ativo.');
  }

  const price = input.price ?? fund.sharePrice;
  const holdings = readHoldings(input.userId, input.email);
  const index = holdings.findIndex(
    (item) => item.ticker.toUpperCase() === input.ticker.toUpperCase(),
  );

  let holding = index >= 0 ? holdings[index] : null;

  if (input.side === 'sell') {
    if (!holding) {
      throw new Error('Você não possui esta posição para vender.');
    }
    if (qty > holding.quantity) {
      throw new Error('Quantidade maior do que as cotas disponíveis.');
    }

    const remainingQty = holding.quantity - qty;
    if (remainingQty === 0) {
      holdings.splice(index, 1);
      holding = {
        ...holding,
        quantity: 0,
        investedAmount: 0,
      };
    } else {
      const investedAmount = holding.averagePrice * remainingQty;
      holding = {
        ...holding,
        quantity: remainingQty,
        investedAmount,
      };
      holdings[index] = holding;
    }
  } else {
    if (!holding) {
      holding = {
        id: `holding_${input.ticker.toLowerCase()}_${Date.now()}`,
        userId: input.userId,
        fundId: fund.id,
        ticker: fund.ticker,
        quantity: qty,
        averagePrice: price,
        investedAmount: qty * price,
        acquiredAt: todayKey(),
        sortIndex: holdings.length,
      };
      holdings.push(holding);
    } else {
      const investedAmount = holding.investedAmount + qty * price;
      const quantity = holding.quantity + qty;
      holding = {
        ...holding,
        quantity,
        investedAmount,
        averagePrice: investedAmount / quantity,
      };
      holdings[index] = holding;
    }
  }

  writeHoldings(input.userId, holdings);

  const trade: PortfolioTrade = {
    id: `trade_${Date.now()}`,
    userId: input.userId,
    holdingId: holding.id,
    ticker: fund.ticker,
    side: input.side,
    quantity: qty,
    price,
    total: qty * price,
    executedAt: new Date().toISOString(),
  };
  appendTrade(input.userId, trade);

  if (holding.quantity === 0) {
    return enrichHolding({ ...holding, quantity: 0, investedAmount: 0 });
  }

  return enrichHolding(holding);
}

export async function moveHoldingOrder(
  userId: string,
  email: string | null | undefined,
  ticker: string,
  direction: 'up' | 'down',
): Promise<void> {
  const holdings = readHoldings(userId, email).sort((a, b) => a.sortIndex - b.sortIndex);
  const index = holdings.findIndex((item) => item.ticker === ticker);
  if (index < 0) return;

  const target = direction === 'up' ? index - 1 : index + 1;
  if (target < 0 || target >= holdings.length) return;

  const current = holdings[index];
  const swap = holdings[target];
  if (!current || !swap) return;

  holdings[index] = { ...current, sortIndex: swap.sortIndex };
  holdings[target] = { ...swap, sortIndex: current.sortIndex };
  writeHoldings(userId, holdings);
}
