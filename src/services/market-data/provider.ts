import { hgBrasilProvider } from '@/src/services/market-data/hgBrasil.provider';
import { mockMarketDataProvider } from '@/src/services/market-data/mock.provider';
import type { MarketDataMode, MarketDataProvider } from '@/src/services/market-data/types';

function readMarketDataMode(): MarketDataMode {
  const mode = process.env.EXPO_PUBLIC_MARKET_DATA_MODE;
  if (mode === 'functions' || mode === 'direct-hg' || mode === 'auto' || mode === 'mock') {
    return mode;
  }
  return 'mock';
}

export const marketDataMode = readMarketDataMode();

export const marketDataProvider: MarketDataProvider =
  marketDataMode === 'direct-hg' ? hgBrasilProvider : mockMarketDataProvider;
