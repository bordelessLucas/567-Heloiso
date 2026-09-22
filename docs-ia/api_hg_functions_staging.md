# HG Brasil + Firebase Functions Staging

## Current staging behavior

- APK default: `EXPO_PUBLIC_MARKET_DATA_MODE=mock`.
- Mocks stay bundled until HG/API coverage fully replaces each user-facing field.
- No HG secret is stored in Expo public environment variables.
- The app can be built for client testing without HG key and without deployed Functions.

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

## Scheduled sync

The `syncMarketData` job is safe before the HG key exists. It writes an unavailable status only.
After the key exists, extend the job to fetch the approved ticker universe and write quote snapshots.
