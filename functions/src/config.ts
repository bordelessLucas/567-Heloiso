import { defineSecret } from 'firebase-functions/params';

export const hgBrasilApiKeySecret = defineSecret('HG_BRASIL_API_KEY');

export function getRuntimeConfig() {
  const hgApiKey = process.env.HG_BRASIL_API_KEY?.trim() || null;
  return {
    hgApiKey,
    hasHgApiKey: Boolean(hgApiKey),
  };
}
