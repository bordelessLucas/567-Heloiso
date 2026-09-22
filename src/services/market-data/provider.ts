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

function withFallback(primary: MarketDataProvider, fallback: MarketDataProvider): MarketDataProvider {
  return {
    async getHealth() {
      try {
        if (primary.getHealth) return primary.getHealth();
      } catch {
        // Use fallback health below.
      }

      return fallback.getHealth
        ? fallback.getHealth()
        : {
            mode: 'mock',
            live: false,
            reason: 'Using fallback provider after primary health failure.',
            updatedAt: new Date().toISOString(),
          };
    },

    async getFiiQuote(ticker) {
      try {
        return (await primary.getFiiQuote(ticker)) ?? fallback.getFiiQuote(ticker);
      } catch {
        return fallback.getFiiQuote(ticker);
      }
    },

    async getFiiDetails(ticker) {
      try {
        return (await primary.getFiiDetails(ticker)) ?? fallback.getFiiDetails(ticker);
      } catch {
        return fallback.getFiiDetails(ticker);
      }
    },

    async getFiiDividends(ticker) {
      try {
        const dividends = await primary.getFiiDividends(ticker);
        return dividends.length > 0 ? dividends : fallback.getFiiDividends(ticker);
      } catch {
        return fallback.getFiiDividends(ticker);
      }
    },

    async getFiiHistory(ticker, periodDays) {
      try {
        return await primary.getFiiHistory(ticker, periodDays);
      } catch {
        return fallback.getFiiHistory(ticker, periodDays);
      }
    },

    async searchFiis(query) {
      try {
        const results = await primary.searchFiis(query);
        return results.length > 0 ? results : fallback.searchFiis(query);
      } catch {
        return fallback.searchFiis(query);
      }
    },

    async getFiiQuotes(tickers) {
      try {
        const primaryQuotes = await primary.getFiiQuotes(tickers);
        const fallbackQuotes = await fallback.getFiiQuotes(
          tickers.filter((ticker) => !primaryQuotes.has(ticker.trim().toUpperCase())),
        );
        fallbackQuotes.forEach((quote, ticker) => primaryQuotes.set(ticker, quote));
        return primaryQuotes;
      } catch {
        return fallback.getFiiQuotes(tickers);
      }
    },
  };
}

function selectProvider(mode: MarketDataMode): MarketDataProvider {
  if (mode === 'functions') return functionsMarketDataProvider;
  if (mode === 'direct-hg') return hgBrasilProvider;
  if (mode === 'auto') {
    return process.env.EXPO_PUBLIC_MARKET_FUNCTIONS_BASE_URL
      ? withFallback(functionsMarketDataProvider, mockMarketDataProvider)
      : mockMarketDataProvider;
  }
  return mockMarketDataProvider;
}

export const marketDataProvider: MarketDataProvider = selectProvider(marketDataMode);
