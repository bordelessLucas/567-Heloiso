import { functionsMarketDataProvider } from '@/src/services/market-data/functions.provider';
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

function selectProvider(mode: MarketDataMode): MarketDataProvider {
  if (mode === 'functions') return functionsMarketDataProvider;
  if (mode === 'direct-hg') return hgBrasilProvider;
  if (mode === 'auto') {
    return process.env.EXPO_PUBLIC_MARKET_FUNCTIONS_BASE_URL
      ? functionsMarketDataProvider
      : mockMarketDataProvider;
  }
  return mockMarketDataProvider;
}

export const marketDataProvider: MarketDataProvider = selectProvider(marketDataMode);
