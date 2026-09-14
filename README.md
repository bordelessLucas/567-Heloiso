# Heloiso

Aplicativo mobile (Android e iOS) para investidores, construído com **Expo + Expo Router + TypeScript**, integrado ao **Firebase**. Estruturado para **EAS Build** (Development Builds / Prebuild).

## Stack

- Expo SDK 57 + Expo Router
- React Native + TypeScript (strict)
- Firebase (Auth, Firestore, Storage) via camada `src/services/`
- EAS Build (`eas.json`)

## Arquitetura

```
app/                 # Telas (Expo Router) — apresentação
components/          # UI pura
src/
  domain/            # Tipos e interfaces de domínio
  hooks/             # Lógica de negócio (custom hooks)
  services/          # Firebase e integrações (nunca chamados direto na UI)
  theme/             # Tokens do design system
docs-ia/             # Design system e docs de produto
```

## Setup local

1. Copie `.env.example` para `.env` e preencha as variáveis `EXPO_PUBLIC_FIREBASE_*`.
2. Instale dependências: `npm install`
3. Suba o Metro: `npx expo start`
4. Para Development Build (recomendado): `npx eas build --profile development --platform android|ios`

## Variáveis de ambiente

Prefixo obrigatório no mobile: `EXPO_PUBLIC_`.

- `EXPO_PUBLIC_FIREBASE_API_KEY`
- `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
- `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `EXPO_PUBLIC_FIREBASE_APP_ID`
- `EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID`

## Scripts

| Comando | Descrição |
| --- | --- |
| `npm start` | Expo Dev Server |
| `npm run android` | Abre no Android |
| `npm run ios` | Abre no iOS |
| `npm run web` | Preview web (admin futuro / smoke test) |
