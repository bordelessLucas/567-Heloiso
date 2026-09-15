import { useCallback, useEffect, useMemo, useState } from 'react';

import type { FundSegment, FundSummary } from '@/src/domain/fund';
import type { RankingBoard } from '@/src/domain/ranking';
import {
  listFunds,
  listPopularFunds,
  listRankingBoards,
} from '@/src/services/funds.service';

export function useFundsCatalog() {
  const [query, setQuery] = useState('');
  const [segment, setSegment] = useState<FundSegment | 'all'>('all');
  const [funds, setFunds] = useState<FundSummary[]>([]);
  const [popular, setPopular] = useState<FundSummary[]>([]);
  const [boards, setBoards] = useState<RankingBoard[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [nextFunds, nextPopular, nextBoards] = await Promise.all([
        listFunds(query, segment),
        listPopularFunds(),
        listRankingBoards(),
      ]);
      setFunds(nextFunds);
      setPopular(nextPopular);
      setBoards(nextBoards);
    } finally {
      setLoading(false);
    }
  }, [query, segment]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const segments = useMemo(
    () =>
      [
        { id: 'all' as const, label: 'Todos' },
        { id: 'brick' as const, label: 'Tijolo' },
        { id: 'paper' as const, label: 'Papel' },
        { id: 'logistics' as const, label: 'Logística' },
        { id: 'shopping' as const, label: 'Shopping' },
        { id: 'hybrid' as const, label: 'Híbrido' },
      ] as const,
    [],
  );

  return {
    query,
    setQuery,
    segment,
    setSegment,
    segments,
    funds,
    popular,
    boards,
    loading,
    refresh,
  };
}
