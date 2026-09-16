import AsyncStorage from '@react-native-async-storage/async-storage';

import type {
  PlannerChallenge,
  PlannerChallengeDays,
  PlannerCheckIn,
  PlannerDayStatus,
  PlannerWeekDay,
} from '@/src/domain/planner';
import {
  buildDemoPlanner,
  isDemoAccount,
} from '@/src/data/mocks/demo.account';
import { todayKey } from '@/src/utils/format';

const STORAGE_KEY = '@mercadofiis/planner_v1';
const DEMO_SEEDED_KEY = '@mercadofiis/planner_demo_seeded_v1';

interface PlannerStore {
  challenge: PlannerChallenge | null;
  checkIns: PlannerCheckIn[];
}

async function readStore(): Promise<PlannerStore> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return { challenge: null, checkIns: [] };
  }

  const parsed = JSON.parse(raw) as PlannerStore;
  if (parsed.challenge && !parsed.challenge.objective) {
    parsed.challenge = {
      ...parsed.challenge,
      objective: 'Meu objetivo de poupança',
    };
  }

  parsed.checkIns = (parsed.checkIns ?? []).map(normalizeCheckIn);
  return parsed;
}

async function writeStore(store: PlannerStore): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function normalizeCheckIn(item: PlannerCheckIn): PlannerCheckIn {
  return {
    ...item,
    status: item.status ?? 'done',
  };
}

function dayDiff(fromKey: string, toKey: string): number {
  const from = new Date(`${fromKey}T12:00:00`);
  const to = new Date(`${toKey}T12:00:00`);
  return Math.round((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
}

function eachDateKey(fromKey: string, toKey: string): string[] {
  const keys: string[] = [];
  if (dayDiff(fromKey, toKey) < 0) return keys;

  const cursor = new Date(`${fromKey}T12:00:00`);
  const end = new Date(`${toKey}T12:00:00`);
  while (cursor.getTime() <= end.getTime()) {
    keys.push(todayKey(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return keys;
}

function recomputeChallenge(
  challenge: PlannerChallenge,
  entries: PlannerCheckIn[],
): PlannerChallenge {
  const done = entries.filter((item) => item.status === 'done');
  const savedAmount = done.reduce((sum, item) => sum + item.amount, 0);
  const completedDays = entries.length;

  let streak = 0;
  for (let i = entries.length - 1; i >= 0; i -= 1) {
    if (entries[i]?.status === 'done') {
      streak += 1;
    } else {
      break;
    }
  }

  const lastDone = [...done].reverse()[0] ?? null;

  return {
    ...challenge,
    completedDays,
    savedAmount,
    streak,
    longestStreak: Math.max(challenge.longestStreak, streak),
    lastCheckInDate: lastDone?.dateKey ?? null,
    status: completedDays >= challenge.totalDays ? 'completed' : challenge.status === 'paused' ? 'paused' : 'active',
  };
}

/**
 * Marca automaticamente dias passados sem check-in como `missed`.
 * A meta avança (sem pendência de ontem); o usuário só vê que não houve aporte.
 */
export async function reconcileMissedDays(): Promise<{
  challenge: PlannerChallenge | null;
  checkIns: PlannerCheckIn[];
}> {
  const store = await readStore();
  if (!store.challenge || store.challenge.status !== 'active') {
    return {
      challenge: store.challenge,
      checkIns: store.challenge
        ? store.checkIns.filter((item) => item.challengeId === store.challenge!.id)
        : [],
    };
  }

  const challenge = store.challenge;
  const existing = store.checkIns
    .filter((item) => item.challengeId === challenge.id)
    .map(normalizeCheckIn);
  const byDate = new Map(existing.map((item) => [item.dateKey, item]));

  const startKey = todayKey(new Date(challenge.startedAt));
  const today = todayKey();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = todayKey(yesterday);

  const pastKeys = eachDateKey(startKey, yesterdayKey);
  const rebuilt: PlannerCheckIn[] = [];

  pastKeys.forEach((dateKey, index) => {
    const found = byDate.get(dateKey);
    if (found?.status === 'done') {
      rebuilt.push({
        ...found,
        dayNumber: index + 1,
        status: 'done',
      });
      return;
    }

    rebuilt.push({
      id: found?.id ?? `missed_${challenge.id}_${dateKey}`,
      challengeId: challenge.id,
      dayNumber: index + 1,
      amount: 0,
      dateKey,
      checkedAt: found?.checkedAt ?? `${dateKey}T23:59:59.000Z`,
      note: found?.note ?? null,
      status: 'missed',
    });
  });

  const todayEntry = byDate.get(today);
  if (todayEntry?.status === 'done') {
    rebuilt.push({
      ...todayEntry,
      dayNumber: rebuilt.length + 1,
      status: 'done',
    });
  }

  const nextChallenge = recomputeChallenge(challenge, rebuilt);
  const unchanged =
    rebuilt.length === existing.length &&
    rebuilt.every((item, index) => {
      const prev = existing[index];
      return (
        prev &&
        prev.id === item.id &&
        prev.status === item.status &&
        prev.dayNumber === item.dayNumber &&
        prev.amount === item.amount
      );
    }) &&
    nextChallenge.completedDays === challenge.completedDays &&
    nextChallenge.savedAmount === challenge.savedAmount &&
    nextChallenge.streak === challenge.streak &&
    nextChallenge.status === challenge.status;

  if (!unchanged) {
    await writeStore({ challenge: nextChallenge, checkIns: rebuilt });
  }

  return { challenge: nextChallenge, checkIns: rebuilt };
}

/** Garante streak demo na conta lorenzo@gmail.com quando não há desafio ativo. */
export async function ensureDemoPlannerSeed(
  userId: string,
  email: string | null | undefined,
): Promise<void> {
  if (!isDemoAccount(email)) {
    return;
  }

  const store = await readStore();
  if (store.challenge) {
    return;
  }

  const demo = buildDemoPlanner(userId);
  await writeStore(demo);
  await AsyncStorage.setItem(DEMO_SEEDED_KEY, '1');
}

export async function getActiveChallenge(): Promise<PlannerChallenge | null> {
  const reconciled = await reconcileMissedDays();
  return reconciled.challenge;
}

export async function listCheckIns(challengeId: string): Promise<PlannerCheckIn[]> {
  const reconciled = await reconcileMissedDays();
  return reconciled.checkIns.filter((item) => item.challengeId === challengeId);
}

export async function startChallenge(input: {
  userId: string;
  totalDays: PlannerChallengeDays;
  dailyTargetAmount: number;
  objective: string;
}): Promise<PlannerChallenge> {
  const objective = input.objective.trim();
  if (!objective) {
    throw new Error('Escreva o objetivo do seu desafio.');
  }

  const challenge: PlannerChallenge = {
    id: `challenge_${Date.now()}`,
    userId: input.userId,
    title: `Desafio ${input.totalDays} dias`,
    objective,
    totalDays: input.totalDays,
    dailyTargetAmount: input.dailyTargetAmount,
    startedAt: new Date().toISOString(),
    completedDays: 0,
    savedAmount: 0,
    streak: 0,
    longestStreak: 0,
    status: 'active',
    lastCheckInDate: null,
  };

  await writeStore({ challenge, checkIns: [] });
  return challenge;
}

export async function updateChallengeObjective(objective: string): Promise<PlannerChallenge> {
  const store = await readStore();
  if (!store.challenge) {
    throw new Error('Nenhum desafio ativo.');
  }

  const nextObjective = objective.trim();
  if (!nextObjective) {
    throw new Error('O objetivo não pode ficar vazio.');
  }

  const challenge: PlannerChallenge = {
    ...store.challenge,
    objective: nextObjective,
  };

  await writeStore({ ...store, challenge });
  return challenge;
}

export async function performCheckIn(input: {
  amount?: number;
  note?: string;
}): Promise<{ challenge: PlannerChallenge; checkIn: PlannerCheckIn }> {
  await reconcileMissedDays();
  const store = await readStore();
  if (!store.challenge || store.challenge.status !== 'active') {
    throw new Error('Nenhum desafio ativo.');
  }

  const dateKey = todayKey();
  const alreadyToday = store.checkIns.some(
    (item) =>
      item.challengeId === store.challenge!.id &&
      item.dateKey === dateKey &&
      item.status === 'done',
  );
  if (alreadyToday) {
    throw new Error('Check-in de hoje já registrado.');
  }

  const amount = input.amount ?? store.challenge.dailyTargetAmount;
  const nextDay = store.challenge.completedDays + 1;

  const checkIn: PlannerCheckIn = {
    id: `checkin_${Date.now()}`,
    challengeId: store.challenge.id,
    dayNumber: nextDay,
    amount,
    dateKey,
    checkedAt: new Date().toISOString(),
    note: input.note ?? null,
    status: 'done',
  };

  const entries = [
    ...store.checkIns.filter((item) => item.challengeId === store.challenge!.id),
    checkIn,
  ];
  const challenge = recomputeChallenge(store.challenge, entries);

  await writeStore({
    challenge,
    checkIns: entries,
  });

  return { challenge, checkIn };
}

export async function getWeekStrip(checkIns: PlannerCheckIn[]): Promise<PlannerWeekDay[]> {
  const byDate = new Map(
    checkIns.map((item) => [item.dateKey, item.status as PlannerDayStatus]),
  );
  const today = new Date();
  const days: PlannerWeekDay[] = [];
  const labels = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

  for (let offset = -6; offset <= 0; offset += 1) {
    const date = new Date(today);
    date.setDate(today.getDate() + offset);
    const dateKey = todayKey(date);
    const status = byDate.get(dateKey);
    days.push({
      dateKey,
      label: labels[date.getDay()] ?? '•',
      checked: status === 'done',
      missed: status === 'missed',
      isToday: offset === 0,
    });
  }

  return days;
}

export async function resetPlanner(): Promise<void> {
  await writeStore({ challenge: null, checkIns: [] });
  await AsyncStorage.setItem(DEMO_SEEDED_KEY, '');
  await AsyncStorage.removeItem(DEMO_SEEDED_KEY);
}
