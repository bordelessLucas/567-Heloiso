import { useCallback, useEffect, useState } from 'react';

import type { HistoryPeriodDays, PortfolioSortKey } from '@/src/domain/portfolio';
import { useAuth } from '@/src/hooks/useAuth';
import {
  executeTrade,
  getHoldingDetail,
  getPortfolioDashboard,
  listPortfolioTrades,
  moveHoldingOrder,
  type ExecuteTradeInput,
  type HoldingDetailView,
  type PortfolioDashboard,
} from '@/src/services/portfolio.service';
import type { PortfolioTrade } from '@/src/domain/portfolio';

export function usePortfolio(options?: {
  sort?: PortfolioSortKey;
  chartDays?: HistoryPeriodDays;
  historyDays?: HistoryPeriodDays;
}) {
  const { user, profile } = useAuth();
  const [dashboard, setDashboard] = useState<PortfolioDashboard | null>(null);
  const [trades, setTrades] = useState<PortfolioTrade[]>([]);
  const [loading, setLoading] = useState(true);
  const sort = options?.sort ?? 'default';
  const chartDays = options?.chartDays ?? 30;
  const historyDays = options?.historyDays ?? 30;

  const refresh = useCallback(async () => {
    if (!user) {
      setDashboard(null);
      setTrades([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const email = profile?.email ?? user.email;
      const [nextDashboard, nextTrades] = await Promise.all([
        getPortfolioDashboard(user.uid, email, { sort, chartDays }),
        listPortfolioTrades(user.uid, email, { days: historyDays }),
      ]);
      setDashboard(nextDashboard);
      setTrades(nextTrades);
    } finally {
      setLoading(false);
    }
  }, [user, profile?.email, sort, chartDays, historyDays]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const trade = useCallback(
    async (input: Omit<ExecuteTradeInput, 'userId' | 'email'>) => {
      if (!user) throw new Error('Faça login para operar a carteira.');
      const result = await executeTrade({
        ...input,
        userId: user.uid,
        email: profile?.email ?? user.email,
      });
      await refresh();
      return result;
    },
    [user, profile?.email, refresh],
  );

  const reorder = useCallback(
    async (ticker: string, direction: 'up' | 'down') => {
      if (!user) return;
      await moveHoldingOrder(user.uid, profile?.email ?? user.email, ticker, direction);
      await refresh();
    },
    [user, profile?.email, refresh],
  );

  return { dashboard, trades, loading, refresh, trade, reorder };
}

export function useHoldingDetail(
  ticker: string,
  options?: { chartDays?: HistoryPeriodDays; historyDays?: HistoryPeriodDays },
) {
  const { user, profile } = useAuth();
  const [detail, setDetail] = useState<HoldingDetailView | null>(null);
  const [loading, setLoading] = useState(true);
  const chartDays = options?.chartDays ?? 30;
  const historyDays = options?.historyDays ?? 90;

  const refresh = useCallback(async () => {
    if (!user || !ticker) {
      setDetail(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const next = await getHoldingDetail(user.uid, ticker, profile?.email ?? user.email, {
        chartDays,
        historyDays,
      });
      setDetail(next);
    } finally {
      setLoading(false);
    }
  }, [user, profile?.email, ticker, chartDays, historyDays]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const trade = useCallback(
    async (input: Omit<ExecuteTradeInput, 'userId' | 'email' | 'ticker'>) => {
      if (!user) throw new Error('Faça login para operar a carteira.');
      const result = await executeTrade({
        ...input,
        ticker,
        userId: user.uid,
        email: profile?.email ?? user.email,
      });
      await refresh();
      return result;
    },
    [user, profile?.email, ticker, refresh],
  );

  return { detail, loading, refresh, trade };
}
