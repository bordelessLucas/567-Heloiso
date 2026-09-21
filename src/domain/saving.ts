/** Poupar em vez de gastar — equivalência educativa em cotas (não é compra real). */

export interface SavingRule {
  id: string;
  userId: string;
  label: string;
  defaultAmount: number;
  ticker: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SavingEvent {
  id: string;
  userId: string;
  ruleId: string;
  label: string;
  amount: number;
  ticker: string;
  quote: number;
  equivalentShares: number;
  createdAt: string;
}

export interface SavingSummary {
  totalSaved: number;
  totalEquivalentShares: number;
  eventsCount: number;
  byTicker: Array<{
    ticker: string;
    amount: number;
    equivalentShares: number;
    eventsCount: number;
  }>;
}

export const SAVING_PRESET_LABELS = [
  'Café',
  'Lanche',
  'Almoço',
  'Refrigerante',
  'Outro',
] as const;

export type SavingPresetLabel = (typeof SAVING_PRESET_LABELS)[number];
