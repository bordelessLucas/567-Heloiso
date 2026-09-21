import AsyncStorage from '@react-native-async-storage/async-storage';

import type { SavingEvent, SavingRule, SavingSummary } from '@/src/domain/saving';
import { getFundByTicker } from '@/src/services/funds.service';

const STORAGE_PREFIX = '@mercadofiis/poupar_v1_';

interface SavingStore {
  rules: SavingRule[];
  events: SavingEvent[];
}

function storageKey(userId: string): string {
  return `${STORAGE_PREFIX}${userId}`;
}

async function readStore(userId: string): Promise<SavingStore> {
  const raw = await AsyncStorage.getItem(storageKey(userId));
  if (!raw) {
    return { rules: [], events: [] };
  }
  const parsed = JSON.parse(raw) as SavingStore;
  return {
    rules: Array.isArray(parsed.rules) ? parsed.rules : [],
    events: Array.isArray(parsed.events) ? parsed.events : [],
  };
}

async function writeStore(userId: string, store: SavingStore): Promise<void> {
  await AsyncStorage.setItem(storageKey(userId), JSON.stringify(store));
}

export function buildSavingSummary(events: SavingEvent[]): SavingSummary {
  const byTickerMap = new Map<
    string,
    { ticker: string; amount: number; equivalentShares: number; eventsCount: number }
  >();

  let totalSaved = 0;
  let totalEquivalentShares = 0;

  events.forEach((event) => {
    totalSaved += event.amount;
    totalEquivalentShares += event.equivalentShares;
    const current = byTickerMap.get(event.ticker) ?? {
      ticker: event.ticker,
      amount: 0,
      equivalentShares: 0,
      eventsCount: 0,
    };
    current.amount += event.amount;
    current.equivalentShares += event.equivalentShares;
    current.eventsCount += 1;
    byTickerMap.set(event.ticker, current);
  });

  return {
    totalSaved,
    totalEquivalentShares,
    eventsCount: events.length,
    byTicker: [...byTickerMap.values()].sort((a, b) => b.amount - a.amount),
  };
}

export async function listSavingRules(userId: string): Promise<SavingRule[]> {
  const store = await readStore(userId);
  return [...store.rules].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function listSavingEvents(userId: string): Promise<SavingEvent[]> {
  const store = await readStore(userId);
  return [...store.events].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function upsertSavingRule(input: {
  userId: string;
  id?: string;
  label: string;
  defaultAmount: number;
  ticker: string;
  active?: boolean;
}): Promise<SavingRule> {
  const label = input.label.trim();
  const ticker = input.ticker.trim().toUpperCase();
  const amount = Number(input.defaultAmount);

  if (!label) {
    throw new Error('Informe o nome do gasto (ex.: Café).');
  }
  if (!ticker) {
    throw new Error('Escolha um FII para associar ao gasto.');
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('Informe um valor válido maior que zero.');
  }

  const fund = await getFundByTicker(ticker);
  if (!fund) {
    throw new Error('FII não encontrado no catálogo.');
  }

  const store = await readStore(input.userId);
  const now = new Date().toISOString();
  const existing = input.id
    ? store.rules.find((rule) => rule.id === input.id)
    : undefined;

  const rule: SavingRule = {
    id: existing?.id ?? `rule_${Date.now()}`,
    userId: input.userId,
    label,
    defaultAmount: Number(amount.toFixed(2)),
    ticker,
    active: input.active ?? existing?.active ?? true,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  const rules = existing
    ? store.rules.map((item) => (item.id === rule.id ? rule : item))
    : [...store.rules, rule];

  await writeStore(input.userId, { ...store, rules });
  return rule;
}

export async function setSavingRuleActive(
  userId: string,
  ruleId: string,
  active: boolean,
): Promise<SavingRule> {
  const store = await readStore(userId);
  const existing = store.rules.find((rule) => rule.id === ruleId);
  if (!existing) {
    throw new Error('Associação não encontrada.');
  }

  const rule: SavingRule = {
    ...existing,
    active,
    updatedAt: new Date().toISOString(),
  };

  await writeStore(userId, {
    ...store,
    rules: store.rules.map((item) => (item.id === rule.id ? rule : item)),
  });
  return rule;
}

export async function deleteSavingRule(userId: string, ruleId: string): Promise<void> {
  const store = await readStore(userId);
  await writeStore(userId, {
    rules: store.rules.filter((rule) => rule.id !== ruleId),
    events: store.events,
  });
}

/**
 * Registra um “Poupei”: valor → cotação atual → cotas equivalentes.
 * Não executa compra real.
 */
export async function performSaveEvent(input: {
  userId: string;
  ruleId: string;
  amount?: number;
}): Promise<SavingEvent> {
  const store = await readStore(input.userId);
  const rule = store.rules.find((item) => item.id === input.ruleId && item.active);
  if (!rule) {
    throw new Error('Associação inativa ou não encontrada.');
  }

  const amount = Number(input.amount ?? rule.defaultAmount);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('Informe um valor válido para poupar.');
  }

  const fund = await getFundByTicker(rule.ticker);
  const quote = fund?.sharePrice ?? null;
  if (quote === null || quote <= 0) {
    throw new Error('Cotação indisponível para este FII no momento.');
  }

  const equivalentShares = Number((amount / quote).toFixed(4));
  const event: SavingEvent = {
    id: `event_${Date.now()}`,
    userId: input.userId,
    ruleId: rule.id,
    label: rule.label,
    amount: Number(amount.toFixed(2)),
    ticker: rule.ticker,
    quote,
    equivalentShares,
    createdAt: new Date().toISOString(),
  };

  await writeStore(input.userId, {
    rules: store.rules,
    events: [...store.events, event],
  });

  return event;
}
