# HG Brasil + Firebase Functions Staging Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prepare Mercado FiiS to consume HG Brasil through Firebase Functions while keeping the current mock-backed APK stable for client testing.

**Architecture:** The Expo app will read market data through a single market-data facade that can use mock data, direct client HG overlay, or Firebase Functions depending on feature flags. Firebase Functions will own HG secrets, provider requests, normalization, cache writes, and scheduled refreshes. Until the HG key and Functions deploy are available, mocks remain the source of catalog/operational data and the app must not break or show empty market screens.

**Tech Stack:** Expo SDK 57, React Native 0.86, Expo Router 57, Firebase JS SDK 12, Firestore, Firebase Functions v2, TypeScript 6, HG Brasil Finance API.

**Spec:** `docs-ia/context.md`, `docs-ia/checklist_sprints.md`, `docs-ia/arquitetura.md`

## Global Constraints

- Read the exact versioned Expo SDK 57 docs at `https://docs.expo.dev/versions/v57.0.0/` before implementation.
- Do not remove current mocks before the real API covers the same user-facing behavior.
- The APK for client testing must keep working without HG key and without deployed Functions.
- Never expose `HG_BRASIL_API_KEY` in Expo public environment variables for production builds.
- Keep market data public and shared; keep personal portfolio/planner data under user-scoped collections.
- Preserve the existing educational/non-recommendation copy and source notes.
- Prefer Functions/cache for production to avoid one external HG call per user view.
- Preserve unrelated local changes in the dirty worktree.

---

## File Structure

### Expo app market data

- Modify: `src/services/market-data/types.ts`
  - Add shared DTOs for function responses, source state, and cache metadata.
- Modify: `src/services/market-data/hgBrasil.provider.ts`
  - Keep as development-only/direct provider and mark it as unavailable without a key.
- Create: `src/services/market-data/functions.provider.ts`
  - Calls Firebase Functions HTTPS endpoints or callable functions for quotes, details, dividends, catalog, and status.
- Create: `src/services/market-data/mock.provider.ts`
  - Wraps `MOCK_FUNDS` behind the same provider interface for reliable staging fallback.
- Create: `src/services/market-data/provider.ts`
  - Chooses provider mode using environment flags: `mock`, `functions`, `direct-hg`, or `auto`.
- Modify: `src/services/market-data/index.ts`
  - Export only the facade selected by `provider.ts`.
- Modify: `src/services/funds.service.ts`
  - Consume the facade instead of importing `hgBrasilProvider` directly.

### Firebase Functions

- Create: `functions/package.json`
  - Node runtime, build scripts, deploy scripts, Firebase Functions dependencies.
- Create: `functions/tsconfig.json`
  - Strict TypeScript config for Functions source.
- Create: `functions/src/index.ts`
  - Export HTTPS endpoints and scheduled jobs.
- Create: `functions/src/config.ts`
  - Reads `HG_BRASIL_API_KEY` from Firebase secrets and validates runtime config.
- Create: `functions/src/hg/client.ts`
  - Calls HG Brasil with timeout, retry-safe errors, and no client-visible secret leakage.
- Create: `functions/src/hg/normalize.ts`
  - Converts HG responses into app DTOs.
- Create: `functions/src/cache/firestoreMarketCache.ts`
  - Reads/writes public market documents in Firestore.
- Create: `functions/src/http/marketHandlers.ts`
  - Implements endpoints consumed by the app.
- Create: `functions/src/scheduled/syncMarketData.ts`
  - Refreshes catalog/quotes/dividends centrally.

### Firebase config and docs

- Modify: `firebase.json`
  - Add Functions source and predeploy build.
- Modify: `firestore.rules`
  - Add read-only app access to public market cache collections and admin/server writes only.
- Modify: `firestore.indexes.json`
  - Add indexes required by catalog search/ranking if needed.
- Modify: `.env.example`
  - Document app flags without putting real secrets in Expo public env.
- Create: `docs-ia/api_hg_functions_staging.md`
  - Operational guide: flags, secret setup, deploy order, rollback.

---

### Task 1: Add Market Provider Modes Without Changing Runtime Behavior

**Files:**
- Modify: `src/services/market-data/types.ts`
- Create: `src/services/market-data/mock.provider.ts`
- Create: `src/services/market-data/provider.ts`
- Modify: `src/services/market-data/index.ts`
- Modify: `src/services/funds.service.ts`

**Interfaces:**
- Produces: `MarketDataMode = 'mock' | 'functions' | 'direct-hg' | 'auto'`
- Produces: `MarketDataHealth = { mode; live; reason; updatedAt }`
- Produces: `marketDataProvider: MarketDataProvider`
- Consumes: existing `MarketDataProvider`, `MOCK_FUNDS`, `hgBrasilProvider`

- [ ] **Step 1: Add provider mode and health types**

Add these types to `src/services/market-data/types.ts`:

```ts
export type MarketDataMode = 'mock' | 'functions' | 'direct-hg' | 'auto';

export interface MarketDataHealth {
  mode: MarketDataMode;
  live: boolean;
  reason: string | null;
  updatedAt: string;
}

export interface MarketDataProvider {
  getHealth?: () => Promise<MarketDataHealth>;
  getFiiQuote: (ticker: string) => Promise<MarketFiiQuote | null>;
  getFiiDetails: (ticker: string) => Promise<MarketFiiDetails | null>;
  getFiiDividends: (ticker: string) => Promise<FundDividendEvent[]>;
  getFiiHistory: (ticker: string, periodDays?: number) => Promise<unknown[]>;
  searchFiis: (query: string) => Promise<MarketFiiQuote[]>;
  getFiiQuotes: (tickers: string[]) => Promise<Map<string, MarketFiiQuote>>;
}
```

- [ ] **Step 2: Create a mock provider using current data**

Create `src/services/market-data/mock.provider.ts`:

```ts
import { MOCK_FUNDS } from '@/src/data/mocks/funds.mock';
import type { FundDividendEvent } from '@/src/domain/fund';
import type { MarketDataHealth, MarketDataProvider, MarketFiiDetails, MarketFiiQuote } from '@/src/services/market-data/types';

function normalizeTicker(ticker: string): string {
  return ticker.trim().toUpperCase().replace(/^B3:/, '');
}

function toQuote(fund: (typeof MOCK_FUNDS)[number]): MarketFiiQuote {
  return {
    ticker: fund.ticker,
    name: fund.name,
    companyName: null,
    cnpj: null,
    segmentLabel: fund.fundType,
    price: fund.sharePrice,
    changeValue: null,
    changePercent: fund.changePercent,
    open: null,
    high: null,
    low: null,
    previousClose: null,
    close: null,
    volume: fund.liquidity,
    marketCap: null,
    equity: fund.netWorth,
    quotaCount: null,
    equityPerShare: null,
    priceToBook: fund.pvp,
    dividendYield12m: fund.dividendYield,
    dividends12m: null,
    updatedAt: fund.updatedAt,
    stale: false,
    source: 'mock',
  };
}

export const mockMarketDataProvider: MarketDataProvider = {
  async getHealth(): Promise<MarketDataHealth> {
    return {
      mode: 'mock',
      live: false,
      reason: 'Using bundled mock market snapshot for staging.',
      updatedAt: new Date().toISOString(),
    };
  },

  async getFiiQuote(ticker) {
    const normalized = normalizeTicker(ticker);
    const fund = MOCK_FUNDS.find((item) => item.ticker === normalized);
    return fund ? toQuote(fund) : null;
  },

  async getFiiDetails(ticker): Promise<MarketFiiDetails | null> {
    const normalized = normalizeTicker(ticker);
    const fund = MOCK_FUNDS.find((item) => item.ticker === normalized);
    if (!fund) return null;
    return { ...toQuote(fund), dividendsHistory: fund.dividendsHistory ?? [] };
  },

  async getFiiDividends(ticker): Promise<FundDividendEvent[]> {
    const normalized = normalizeTicker(ticker);
    return MOCK_FUNDS.find((item) => item.ticker === normalized)?.dividendsHistory ?? [];
  },

  async getFiiHistory() {
    return [];
  },

  async searchFiis(query) {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [];
    return MOCK_FUNDS.filter((fund) =>
      fund.ticker.toLowerCase().includes(normalized) ||
      fund.name.toLowerCase().includes(normalized) ||
      fund.segment.toLowerCase().includes(normalized),
    ).map(toQuote);
  },

  async getFiiQuotes(tickers) {
    const output = new Map<string, MarketFiiQuote>();
    await Promise.all(tickers.map(async (ticker) => {
      const quote = await this.getFiiQuote(ticker);
      if (quote) output.set(quote.ticker, quote);
    }));
    return output;
  },
};
```

- [ ] **Step 3: Create a provider selector that defaults to mock-safe staging**

Create `src/services/market-data/provider.ts`:

```ts
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
```

- [ ] **Step 4: Export the facade**

Modify `src/services/market-data/index.ts`:

```ts
export { marketDataMode, marketDataProvider } from '@/src/services/market-data/provider';
export { hgBrasilProvider } from '@/src/services/market-data/hgBrasil.provider';
export { mockMarketDataProvider } from '@/src/services/market-data/mock.provider';
export type {
  MarketDataHealth,
  MarketDataMode,
  MarketDataProvider,
  MarketFiiDetails,
  MarketFiiQuote,
} from '@/src/services/market-data/types';
```

- [ ] **Step 5: Switch funds service to the facade**

In `src/services/funds.service.ts`, replace:

```ts
import { hgBrasilProvider, type MarketFiiQuote } from '@/src/services/market-data';
```

with:

```ts
import { marketDataProvider, type MarketFiiQuote } from '@/src/services/market-data';
```

Then replace both `hgBrasilProvider` references with `marketDataProvider`.

- [ ] **Step 6: Verify staging remains mock-safe**

Run:

```powershell
npm.cmd run typecheck
```

Expected: PASS. With no `EXPO_PUBLIC_MARKET_DATA_MODE`, the app still uses mock-backed fund screens.

- [ ] **Step 7: Commit**

```powershell
git add src/services/market-data src/services/funds.service.ts
git commit -m "feat: add staged market data provider facade"
```

---

### Task 2: Add Functions Provider Contract in the App

**Files:**
- Create: `src/services/market-data/functions.provider.ts`
- Modify: `src/services/market-data/provider.ts`
- Modify: `src/services/market-data/index.ts`

**Interfaces:**
- Consumes: `MarketDataProvider`, Firebase app config
- Produces: `functionsMarketDataProvider: MarketDataProvider`
- Produces HTTP contract:
  - `GET /market/health`
  - `GET /market/quotes?tickers=KNCR11,HGLG11`
  - `GET /market/funds/:ticker`
  - `GET /market/funds/:ticker/dividends`
  - `GET /market/search?q=KN`

- [ ] **Step 1: Implement safe JSON fetch helper**

Create `src/services/market-data/functions.provider.ts`:

```ts
import type { FundDividendEvent } from '@/src/domain/fund';
import type { MarketDataHealth, MarketDataProvider, MarketFiiDetails, MarketFiiQuote } from '@/src/services/market-data/types';

const REQUEST_TIMEOUT_MS = 12_000;

function getFunctionsBaseUrl(): string | null {
  const value = process.env.EXPO_PUBLIC_MARKET_FUNCTIONS_BASE_URL;
  return value && value.trim().length > 0 ? value.replace(/\/$/, '') : null;
}

function normalizeTicker(ticker: string): string {
  return ticker.trim().toUpperCase().replace(/^B3:/, '');
}

async function fetchJson<T>(path: string): Promise<T> {
  const baseUrl = getFunctionsBaseUrl();
  if (!baseUrl) {
    throw new Error('Market Functions base URL is not configured.');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${baseUrl}${path}`, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`Market Functions HTTP ${response.status}`);
    }
    return response.json() as Promise<T>;
  } finally {
    clearTimeout(timeout);
  }
}
```

- [ ] **Step 2: Implement provider methods with empty fallbacks**

Append:

```ts
interface QuotesResponse {
  quotes: MarketFiiQuote[];
}

interface DividendsResponse {
  dividends: FundDividendEvent[];
}

export const functionsMarketDataProvider: MarketDataProvider = {
  async getHealth(): Promise<MarketDataHealth> {
    return fetchJson<MarketDataHealth>('/market/health');
  },

  async getFiiQuote(ticker) {
    const quotes = await this.getFiiQuotes([ticker]);
    return quotes.get(normalizeTicker(ticker)) ?? null;
  },

  async getFiiDetails(ticker): Promise<MarketFiiDetails | null> {
    return fetchJson<MarketFiiDetails | null>(`/market/funds/${encodeURIComponent(normalizeTicker(ticker))}`);
  },

  async getFiiDividends(ticker): Promise<FundDividendEvent[]> {
    const result = await fetchJson<DividendsResponse>(
      `/market/funds/${encodeURIComponent(normalizeTicker(ticker))}/dividends`,
    );
    return result.dividends;
  },

  async getFiiHistory() {
    return [];
  },

  async searchFiis(query) {
    const result = await fetchJson<QuotesResponse>(`/market/search?q=${encodeURIComponent(query.trim())}`);
    return result.quotes;
  },

  async getFiiQuotes(tickers) {
    const normalized = tickers.map(normalizeTicker).filter(Boolean);
    if (normalized.length === 0) return new Map();

    const result = await fetchJson<QuotesResponse>(
      `/market/quotes?tickers=${encodeURIComponent(normalized.join(','))}`,
    );
    return new Map(result.quotes.map((quote) => [quote.ticker, quote]));
  },
};
```

- [ ] **Step 3: Wire provider selector with auto fallback**

Update `src/services/market-data/provider.ts`:

```ts
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

export const marketDataMode = readMarketDataMode();
export const marketDataProvider = selectProvider(marketDataMode);
```

- [ ] **Step 4: Export functions provider**

Add to `src/services/market-data/index.ts`:

```ts
export { functionsMarketDataProvider } from '@/src/services/market-data/functions.provider';
```

- [ ] **Step 5: Verify current APK path still works without Functions URL**

Run:

```powershell
npm.cmd run typecheck
```

Expected: PASS. Default mode still resolves to `mock`.

- [ ] **Step 6: Commit**

```powershell
git add src/services/market-data
git commit -m "feat: add firebase functions market provider"
```

---

### Task 3: Scaffold Firebase Functions Without Requiring HG Key Yet

**Files:**
- Modify: `firebase.json`
- Create: `functions/package.json`
- Create: `functions/tsconfig.json`
- Create: `functions/src/index.ts`
- Create: `functions/src/config.ts`
- Create: `functions/src/http/marketHandlers.ts`

**Interfaces:**
- Produces: HTTPS Function `marketApi`
- Produces: `GET /market/health`
- Produces: `getRuntimeConfig(): { hgApiKey: string | null; hasHgApiKey: boolean }`

- [ ] **Step 1: Add Functions config to Firebase**

Modify `firebase.json`:

```json
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "functions": [
    {
      "source": "functions",
      "codebase": "market",
      "predeploy": [
        "npm --prefix \"$RESOURCE_DIR\" run build"
      ]
    }
  ]
}
```

- [ ] **Step 2: Create Functions package**

Create `functions/package.json`:

```json
{
  "name": "mercado-fiis-functions",
  "private": true,
  "main": "lib/index.js",
  "engines": {
    "node": "22"
  },
  "scripts": {
    "build": "tsc",
    "serve": "npm run build && firebase emulators:start --only functions,firestore",
    "deploy": "firebase deploy --only functions:marketApi",
    "lint": "tsc --noEmit"
  },
  "dependencies": {
    "firebase-admin": "^13.0.0",
    "firebase-functions": "^6.0.0"
  },
  "devDependencies": {
    "typescript": "~6.0.3"
  }
}
```

- [ ] **Step 3: Create Functions TypeScript config**

Create `functions/tsconfig.json`:

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "target": "es2022",
    "lib": ["es2022"],
    "outDir": "lib",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src"]
}
```

- [ ] **Step 4: Create runtime config with nullable HG key**

Create `functions/src/config.ts`:

```ts
import { defineSecret } from 'firebase-functions/params';

export const hgBrasilApiKeySecret = defineSecret('HG_BRASIL_API_KEY');

export function getRuntimeConfig() {
  const hgApiKey = process.env.HG_BRASIL_API_KEY?.trim() || null;
  return {
    hgApiKey,
    hasHgApiKey: Boolean(hgApiKey),
  };
}
```

- [ ] **Step 5: Create a health-only HTTP handler**

Create `functions/src/http/marketHandlers.ts`:

```ts
import type { Request, Response } from 'firebase-functions/v2/https';
import { getRuntimeConfig } from '../config';

function sendJson(response: Response, status: number, body: unknown): void {
  response.set('Access-Control-Allow-Origin', '*');
  response.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.status(status).json(body);
}

export async function marketApiHandler(request: Request, response: Response): Promise<void> {
  if (request.method === 'OPTIONS') {
    sendJson(response, 204, {});
    return;
  }

  if (request.method !== 'GET') {
    sendJson(response, 405, { error: 'method-not-allowed' });
    return;
  }

  const path = request.path.replace(/\/$/, '');

  if (path === '/market/health') {
    const config = getRuntimeConfig();
    sendJson(response, 200, {
      mode: 'functions',
      live: config.hasHgApiKey,
      reason: config.hasHgApiKey ? null : 'HG_BRASIL_API_KEY is not configured.',
      updatedAt: new Date().toISOString(),
    });
    return;
  }

  sendJson(response, 404, { error: 'not-found' });
}
```

- [ ] **Step 6: Export the Function**

Create `functions/src/index.ts`:

```ts
import { initializeApp } from 'firebase-admin/app';
import { onRequest } from 'firebase-functions/v2/https';
import { hgBrasilApiKeySecret } from './config';
import { marketApiHandler } from './http/marketHandlers';

initializeApp();

export const marketApi = onRequest(
  {
    region: 'southamerica-east1',
    cors: true,
    secrets: [hgBrasilApiKeySecret],
  },
  marketApiHandler,
);
```

- [ ] **Step 7: Verify Functions compile**

Run:

```powershell
npm.cmd install --prefix functions
npm.cmd --prefix functions run build
npm.cmd run typecheck
```

Expected: both TypeScript builds PASS. If network install fails in the sandbox, rerun with approval.

- [ ] **Step 8: Commit**

```powershell
git add firebase.json functions
git commit -m "feat: scaffold market firebase functions"
```

---

### Task 4: Define Firestore Market Cache Shape and Rules

**Files:**
- Modify: `firestore.rules`
- Create: `functions/src/cache/firestoreMarketCache.ts`
- Modify: `docs-ia/api_hg_functions_staging.md`

**Interfaces:**
- Produces public cache collections:
  - `marketMeta/status`
  - `marketFunds/{ticker}`
  - `marketQuotes/{ticker}`
  - `marketDividends/{ticker}/events/{eventId}`
- Produces: `readQuote(ticker)`, `writeQuotes(quotes)`, `readFundDetails(ticker)`

- [ ] **Step 1: Add public read/server write rules**

Modify `firestore.rules` inside `/databases/{database}/documents`:

```js
    match /marketMeta/{docId} {
      allow read: if isSignedIn();
      allow write: if false;
    }

    match /marketFunds/{ticker} {
      allow read: if isSignedIn();
      allow write: if false;
    }

    match /marketQuotes/{ticker} {
      allow read: if isSignedIn();
      allow write: if false;
    }

    match /marketDividends/{ticker}/events/{eventId} {
      allow read: if isSignedIn();
      allow write: if false;
    }
```

Firebase Admin in Functions bypasses client rules, so app users can read cache but cannot write fake market data.

- [ ] **Step 2: Create cache helper**

Create `functions/src/cache/firestoreMarketCache.ts`:

```ts
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

export interface CachedMarketQuote {
  ticker: string;
  payload: unknown;
  source: 'hgbrasil';
  fetchedAt: FirebaseFirestore.Timestamp;
  staleAfter: FirebaseFirestore.Timestamp;
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

export async function writeQuotes(quotes: Array<{ ticker: string; payload: unknown }>): Promise<void> {
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
```

- [ ] **Step 3: Document cache contract**

Create `docs-ia/api_hg_functions_staging.md` with:

```md
# HG Brasil + Firebase Functions Staging

## Current staging behavior

- APK default: `EXPO_PUBLIC_MARKET_DATA_MODE=mock`.
- Mocks stay bundled until HG/API coverage fully replaces each user-facing field.
- No HG secret is stored in Expo public environment variables.

## Future activation

1. Create Firebase secret:
   `firebase functions:secrets:set HG_BRASIL_API_KEY`
2. Deploy Functions:
   `firebase deploy --only functions:marketApi`
3. Set app env:
   `EXPO_PUBLIC_MARKET_DATA_MODE=functions`
   `EXPO_PUBLIC_MARKET_FUNCTIONS_BASE_URL=https://southamerica-east1-<project-id>.cloudfunctions.net/marketApi`
4. Build APK again.

## Firestore public cache

- `marketMeta/status`: sync health.
- `marketFunds/{ticker}`: normalized fund profile from provider/API.
- `marketQuotes/{ticker}`: latest quote snapshot.
- `marketDividends/{ticker}/events/{eventId}`: dividend events.

Clients may read these collections when signed in. Only Firebase Admin writes them.
```

- [ ] **Step 4: Verify rules compile**

Run:

```powershell
firebase emulators:exec --only firestore "echo rules-ok"
```

Expected: Firestore emulator starts without rules syntax errors. If Firebase CLI is unavailable, record that verification is pending and run `npm.cmd run typecheck`.

- [ ] **Step 5: Commit**

```powershell
git add firestore.rules functions/src/cache/firestoreMarketCache.ts docs-ia/api_hg_functions_staging.md
git commit -m "feat: add market cache rules and docs"
```

---

### Task 5: Implement HG Client and Normalization in Functions

**Files:**
- Create: `functions/src/hg/client.ts`
- Create: `functions/src/hg/normalize.ts`
- Modify: `functions/src/http/marketHandlers.ts`

**Interfaces:**
- Produces: `fetchHgQuotes(tickers): Promise<unknown[]>`
- Produces: `fetchHgDividends(ticker): Promise<unknown>`
- Produces: `normalizeHgQuote(raw): MarketFiiQuote | null`
- Produces: `normalizeHgDividends(raw, ticker): FundDividendEvent[]`

- [ ] **Step 1: Create HG client**

Create `functions/src/hg/client.ts`:

```ts
const HG_BASE_URL = 'https://api.hgbrasil.com';
const QUOTES_ENDPOINT = '/v2/finance/quotes';
const DIVIDENDS_ENDPOINT = '/v2/finance/dividends';
const REQUEST_TIMEOUT_MS = 12_000;

function toHgTicker(ticker: string): string {
  return `B3:${ticker.trim().toUpperCase().replace(/^B3:/, '')}`;
}

async function fetchHgJson(path: string, key: string, params: Record<string, string>): Promise<unknown> {
  const url = new URL(path, HG_BASE_URL);
  Object.entries(params).forEach(([name, value]) => url.searchParams.set(name, value));
  url.searchParams.set('key', key);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url.toString(), { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`HG Brasil HTTP ${response.status}`);
    }
    return response.json();
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchHgQuotes(apiKey: string, tickers: string[]): Promise<unknown> {
  const unique = Array.from(new Set(tickers.map((ticker) => ticker.trim().toUpperCase()).filter(Boolean)));
  return fetchHgJson(QUOTES_ENDPOINT, apiKey, {
    tickers: unique.map(toHgTicker).join(','),
  });
}

export async function fetchHgDividends(apiKey: string, ticker: string): Promise<unknown> {
  return fetchHgJson(DIVIDENDS_ENDPOINT, apiKey, {
    tickers: toHgTicker(ticker),
  });
}
```

- [ ] **Step 2: Move normalization logic server-side**

Create `functions/src/hg/normalize.ts` by porting the app-side logic from `src/services/market-data/hgBrasil.provider.ts`:

```ts
export interface NormalizedMarketQuote {
  ticker: string;
  name: string | null;
  companyName: string | null;
  cnpj: string | null;
  segmentLabel: string | null;
  price: number | null;
  changeValue: number | null;
  changePercent: number | null;
  open: number | null;
  high: number | null;
  low: number | null;
  previousClose: number | null;
  close: number | null;
  volume: number | null;
  marketCap: number | null;
  equity: number | null;
  quotaCount: number | null;
  equityPerShare: number | null;
  priceToBook: number | null;
  dividendYield12m: number | null;
  dividends12m: number | null;
  updatedAt: string | null;
  stale: boolean;
  source: 'hgbrasil';
}

function normalizeTicker(ticker: string): string {
  return ticker.trim().toUpperCase().replace(/^B3:/, '');
}

function readRecord(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function toNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function toStringOrNull(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value : null;
}

export function readResultsArray(json: unknown): unknown[] {
  const root = readRecord(json);
  if (Array.isArray(root.results)) return root.results;
  const results = readRecord(root.results);
  return Object.values(results).filter((item) => readRecord(item).error !== true);
}

export function normalizeHgQuote(raw: unknown, stale = false): NormalizedMarketQuote | null {
  const item = readRecord(raw);
  if (item.error === true) return null;

  const symbol = toStringOrNull(item.symbol);
  const ticker = symbol ?? toStringOrNull(item.ticker)?.replace(/^B3:/, '') ?? null;
  if (!ticker) return null;

  const quote = readRecord(item.quote);
  const market = readRecord(item.market);
  const dividends = readRecord(item.dividends);
  const financials = readRecord(item.financials);
  const classification = readRecord(item.classification);
  const financialDividends = readRecord(financials.dividends);

  return {
    ticker: normalizeTicker(ticker),
    name: toStringOrNull(item.name),
    companyName: toStringOrNull(item.full_name) ?? toStringOrNull(item.company_name),
    cnpj: toStringOrNull(item.tax_id) ?? toStringOrNull(item.document),
    segmentLabel:
      toStringOrNull(classification.segment) ??
      toStringOrNull(classification.subsector) ??
      toStringOrNull(classification.sector) ??
      toStringOrNull(item.sector) ??
      toStringOrNull(item.description),
    price: toNumber(quote.value) ?? toNumber(item.price),
    changeValue: toNumber(quote.change_value) ?? toNumber(item.change_price),
    changePercent: toNumber(quote.change_percent) ?? toNumber(item.change_percent),
    open: toNumber(market.open),
    high: toNumber(market.high),
    low: toNumber(market.low),
    previousClose: toNumber(market.previous_value),
    close: toNumber(market.close),
    volume: toNumber(market.volume) ?? toNumber(item.volume),
    marketCap: toNumber(quote.market_cap) ?? toNumber(item.market_cap),
    equity: toNumber(financials.equity),
    quotaCount: toNumber(item.shares_outstanding) ?? toNumber(financials.quota_count),
    equityPerShare: toNumber(financials.equity_per_share),
    priceToBook: toNumber(financials.price_to_book_ratio),
    dividendYield12m: toNumber(dividends.yield_12m_percent) ?? toNumber(financialDividends.yield_12m),
    dividends12m: toNumber(dividends.yield_12m_cash) ?? toNumber(financialDividends.yield_12m_sum),
    updatedAt: toStringOrNull(quote.updated_at) ?? toStringOrNull(market.updated_at) ?? toStringOrNull(item.updated_at),
    stale,
    source: 'hgbrasil',
  };
}
```

- [ ] **Step 3: Add quote endpoint with unavailable response when key is absent**

Modify `functions/src/http/marketHandlers.ts` so `/market/quotes` returns `503` when there is no key:

```ts
import { fetchHgQuotes } from '../hg/client';
import { normalizeHgQuote, readResultsArray } from '../hg/normalize';

// inside marketApiHandler, before 404:
if (path === '/market/quotes') {
  const config = getRuntimeConfig();
  if (!config.hgApiKey) {
    sendJson(response, 503, { error: 'hg-key-not-configured', quotes: [] });
    return;
  }

  const tickers = String(request.query.tickers ?? '')
    .split(',')
    .map((ticker) => ticker.trim().toUpperCase())
    .filter(Boolean);

  const json = await fetchHgQuotes(config.hgApiKey, tickers);
  const quotes = readResultsArray(json)
    .map((raw) => normalizeHgQuote(raw))
    .filter((quote): quote is NonNullable<typeof quote> => quote !== null);

  sendJson(response, 200, { quotes });
  return;
}
```

- [ ] **Step 4: Verify build**

Run:

```powershell
npm.cmd --prefix functions run build
npm.cmd run typecheck
```

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add functions/src
git commit -m "feat: add hg brasil functions client"
```

---

### Task 6: Add Cache-First Endpoints and Mock Fallback Policy

**Files:**
- Modify: `functions/src/http/marketHandlers.ts`
- Modify: `functions/src/cache/firestoreMarketCache.ts`
- Modify: `src/services/market-data/functions.provider.ts`
- Modify: `src/services/market-data/provider.ts`

**Interfaces:**
- Produces cache-first behavior:
  - fresh Firestore cache wins;
  - stale cache returns with `stale: true` if HG fails;
  - app `auto` mode falls back to mock when Functions request fails.

- [ ] **Step 1: Expand cache helper to identify freshness**

Add to `functions/src/cache/firestoreMarketCache.ts`:

```ts
export function isCachedQuoteFresh(quote: CachedMarketQuote): boolean {
  return quote.staleAfter.toMillis() > Date.now();
}
```

- [ ] **Step 2: Wrap Functions provider with mock fallback in auto mode**

Modify `src/services/market-data/provider.ts`:

```ts
function withFallback(primary: MarketDataProvider, fallback: MarketDataProvider): MarketDataProvider {
  return {
    async getHealth() {
      try {
        return primary.getHealth ? primary.getHealth() : fallback.getHealth?.() ?? {
          mode: 'auto',
          live: false,
          reason: 'Primary provider has no health endpoint.',
          updatedAt: new Date().toISOString(),
        };
      } catch {
        return fallback.getHealth?.() ?? {
          mode: 'mock',
          live: false,
          reason: 'Using fallback provider after primary health failure.',
          updatedAt: new Date().toISOString(),
        };
      }
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
```

Then make `auto` return `withFallback(functionsMarketDataProvider, mockMarketDataProvider)`.

- [ ] **Step 3: Verify offline-safe APK behavior**

Run:

```powershell
npm.cmd run typecheck
```

Expected: PASS. With `EXPO_PUBLIC_MARKET_DATA_MODE=auto` and no Functions URL, the app still returns mock data.

- [ ] **Step 4: Commit**

```powershell
git add src/services/market-data functions/src
git commit -m "feat: add cache-first market fallback policy"
```

---

### Task 7: Add Scheduled Sync Skeleton for Future HG Activation

**Files:**
- Create: `functions/src/scheduled/syncMarketData.ts`
- Modify: `functions/src/index.ts`
- Modify: `docs-ia/api_hg_functions_staging.md`

**Interfaces:**
- Produces scheduled Function `syncMarketData`
- Consumes `HG_BRASIL_API_KEY`
- Writes `marketMeta/status`

- [ ] **Step 1: Create scheduled sync that is safe without key**

Create `functions/src/scheduled/syncMarketData.ts`:

```ts
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import type { ScheduledEvent } from 'firebase-functions/v2/scheduler';
import { getRuntimeConfig } from '../config';

export async function syncMarketDataHandler(_event: ScheduledEvent): Promise<void> {
  const config = getRuntimeConfig();
  const db = getFirestore();

  await db.collection('marketMeta').doc('status').set(
    {
      provider: 'hgbrasil',
      live: config.hasHgApiKey,
      reason: config.hasHgApiKey ? null : 'HG_BRASIL_API_KEY is not configured.',
      lastAttemptAt: Timestamp.now(),
      lastSuccessAt: config.hasHgApiKey ? Timestamp.now() : null,
    },
    { merge: true },
  );
}
```

- [ ] **Step 2: Export scheduled job**

Modify `functions/src/index.ts`:

```ts
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { syncMarketDataHandler } from './scheduled/syncMarketData';

export const syncMarketData = onSchedule(
  {
    region: 'southamerica-east1',
    schedule: 'every 30 minutes',
    secrets: [hgBrasilApiKeySecret],
  },
  syncMarketDataHandler,
);
```

- [ ] **Step 3: Document activation**

Append to `docs-ia/api_hg_functions_staging.md`:

```md
## Scheduled sync

The `syncMarketData` job is safe before the HG key exists. It writes an unavailable status only.
After the key exists, extend the job to fetch the approved ticker universe and write quote snapshots.
```

- [ ] **Step 4: Verify build**

Run:

```powershell
npm.cmd --prefix functions run build
```

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add functions/src docs-ia/api_hg_functions_staging.md
git commit -m "feat: add market sync schedule skeleton"
```

---

### Task 8: Add Environment Documentation for Today's APK and Future Staging

**Files:**
- Create or Modify: `.env.example`
- Modify: `docs-ia/api_hg_functions_staging.md`
- Modify: `README.md`

**Interfaces:**
- Produces clear local/staging flags:
  - `EXPO_PUBLIC_MARKET_DATA_MODE=mock`
  - `EXPO_PUBLIC_MARKET_DATA_MODE=auto`
  - `EXPO_PUBLIC_MARKET_DATA_MODE=functions`
  - `EXPO_PUBLIC_MARKET_FUNCTIONS_BASE_URL=...`

- [ ] **Step 1: Add app env example**

Create or update `.env.example`:

```env
# Firebase client config
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=

# Market data modes:
# mock      -> stable APK demo, no external market dependency
# auto      -> use Functions when URL is present, fallback to mocks
# functions -> require Firebase Functions market API
# direct-hg -> development only; do not use in production APKs
EXPO_PUBLIC_MARKET_DATA_MODE=mock
EXPO_PUBLIC_MARKET_FUNCTIONS_BASE_URL=
```

- [ ] **Step 2: Add APK guidance**

Append to `docs-ia/api_hg_functions_staging.md`:

```md
## APK for client testing today

Use:

```env
EXPO_PUBLIC_MARKET_DATA_MODE=mock
EXPO_PUBLIC_MARKET_FUNCTIONS_BASE_URL=
```

This keeps current screens reliable. Do not remove mock funds for this build.
```

- [ ] **Step 3: Add README note**

Add a short section to `README.md`:

```md
## Market Data Staging

The app defaults to mock market data so preview APKs can be tested without paid API keys.
Production market data should be enabled through Firebase Functions, not by exposing the HG Brasil key in Expo public env.
See `docs-ia/api_hg_functions_staging.md`.
```

- [ ] **Step 4: Verify**

Run:

```powershell
npm.cmd run typecheck
git diff --check
```

Expected: both PASS.

- [ ] **Step 5: Commit**

```powershell
git add .env.example docs-ia/api_hg_functions_staging.md README.md
git commit -m "docs: document market data staging setup"
```

---

### Task 9: Future Activation Once HG Key Is Available

**Files:**
- Modify: `functions/src/scheduled/syncMarketData.ts`
- Modify: `functions/src/http/marketHandlers.ts`
- Modify: `src/services/market-data/provider.ts` only if behavior needs refinement.

**Interfaces:**
- Consumes Firebase secret `HG_BRASIL_API_KEY`
- Consumes deployed Function URL
- Produces production/staging app mode `functions` or `auto`

- [ ] **Step 1: Set HG secret**

Run:

```powershell
firebase functions:secrets:set HG_BRASIL_API_KEY
```

Expected: Firebase CLI prompts for the key. Paste the HG Brasil key from the client/provider account.

- [ ] **Step 2: Deploy Functions**

Run:

```powershell
firebase deploy --only functions:marketApi,functions:syncMarketData
```

Expected: deploy succeeds and outputs the `marketApi` URL.

- [ ] **Step 3: Smoke test health**

Run:

```powershell
curl.exe --silent --fail https://southamerica-east1-<project-id>.cloudfunctions.net/marketApi/market/health
```

Expected JSON:

```json
{
  "mode": "functions",
  "live": true,
  "reason": null
}
```

- [ ] **Step 4: Smoke test quotes**

Run:

```powershell
curl.exe --silent --fail "https://southamerica-east1-<project-id>.cloudfunctions.net/marketApi/market/quotes?tickers=KNCR11,HGLG11"
```

Expected: `quotes` contains at least one normalized object with `ticker`, `price`, `updatedAt`, and `source: "hgbrasil"`.

- [ ] **Step 5: Build a staging APK using Functions**

Set:

```env
EXPO_PUBLIC_MARKET_DATA_MODE=auto
EXPO_PUBLIC_MARKET_FUNCTIONS_BASE_URL=https://southamerica-east1-<project-id>.cloudfunctions.net/marketApi
```

Run:

```powershell
npm.cmd run typecheck
npm.cmd run build:preview
```

Expected: typecheck passes and EAS preview build starts.

- [ ] **Step 6: Keep mocks until field parity is confirmed**

Before removing any mock field, compare these app surfaces against HG/Functions data:

- Fund list: ticker, name, segment, price, DY, P/VP, liquidity.
- Fund detail: indicators, guided reading, docs, allocation, dividends.
- Rankings: DY, liquidity, PL, P/VP.
- Tesouro comparison: fund DY.
- Poupar: quote used for equivalent shares.

Only remove or demote mock data for fields where HG/Functions provides equivalent or better coverage.

- [ ] **Step 7: Commit activation changes**

```powershell
git add functions src docs-ia README.md
git commit -m "feat: activate hg market data through functions"
```

---

## Self-Review

**Spec coverage:** This plan preserves today’s APK behavior, prepares HG + Functions, keeps secrets server-side, documents staging flags, and keeps mocks until API field parity exists. It covers the client’s confirmed concern about API limits by moving production access to central Functions/cache.

**Placeholder scan:** No task depends on undefined “TBD” behavior. The only future activation steps depend on the real HG key and deployed Functions URL, both intentionally external.

**Type consistency:** App provider types remain based on the existing `MarketDataProvider`, `MarketFiiQuote`, and `MarketFiiDetails`. New providers all implement that same interface.
