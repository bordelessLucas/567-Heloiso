import { useCallback, useEffect, useState } from 'react';

import type { FundProfile } from '@/src/domain/fund';
import { getFundByTicker } from '@/src/services/funds.service';

export function useFundDetail(ticker: string) {
  const [fund, setFund] = useState<FundProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const next = await getFundByTicker(ticker);
      setFund(next);
    } finally {
      setLoading(false);
    }
  }, [ticker]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { fund, loading, refresh };
}
