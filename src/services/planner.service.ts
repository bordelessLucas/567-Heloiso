import AsyncStorage from '@react-native-async-storage/async-storage';

import type {
  PlannerChallenge,
  PlannerChallengeDays,
  PlannerCheckIn,
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

  return parsed;
}

async function writeStore(store: PlannerStore): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function dayDiff(fromKey: string, toKey: string): number {
  const from = new Date(`${fromKey}T12:00:00`);
  const to = new Date(`${toKey}T12:00:00`);
  return Math.round((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
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
  const store = await readStore();
  return store.challenge;
}

export async function listCheckIns(challengeId: string): Promise<PlannerCheckIn[]> {
  const store = await readStore();
  return store.checkIns.filter((item) => item.challengeId === challengeId);
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
  const store = await readStore();
  if (!store.challenge || store.challenge.status !== 'active') {
    throw new Error('Nenhum desafio ativo.');
  }

  const dateKey = todayKey();
  if (store.challenge.lastCheckInDate === dateKey) {
    throw new Error('Check-in de hoje já registrado.');
  }

  const amount = input.amount ?? store.challenge.dailyTargetAmount;
  const nextDay = store.challenge.completedDays + 1;

  let streak = 1;
  if (store.challenge.lastCheckInDate) {
    const gap = dayDiff(store.challenge.lastCheckInDate, dateKey);
    streak = gap === 1 ? store.challenge.streak + 1 : 1;
  }

  const checkIn: PlannerCheckIn = {
    id: `checkin_${Date.now()}`,
    challengeId: store.challenge.id,
    dayNumber: nextDay,
    amount,
    dateKey,
    checkedAt: new Date().toISOString(),
    note: input.note ?? null,
  };

  const challenge: PlannerChallenge = {
    ...store.challenge,
    completedDays: nextDay,
    savedAmount: store.challenge.savedAmount + amount,
    streak,
    longestStreak: Math.max(store.challenge.longestStreak, streak),
    lastCheckInDate: dateKey,
    status: nextDay >= store.challenge.totalDays ? 'completed' : 'active',
  };

  await writeStore({
    challenge,
    checkIns: [...store.checkIns, checkIn],
  });

  return { challenge, checkIn };
}

export async function getWeekStrip(checkIns: PlannerCheckIn[]): Promise<PlannerWeekDay[]> {
  const checked = new Set(checkIns.map((item) => item.dateKey));
  const today = new Date();
  const days: PlannerWeekDay[] = [];
  const labels = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

  for (let offset = -6; offset <= 0; offset += 1) {
    const date = new Date(today);
    date.setDate(today.getDate() + offset);
    const dateKey = todayKey(date);
    days.push({
      dateKey,
      label: labels[date.getDay()] ?? '•',
      checked: checked.has(dateKey),
      isToday: offset === 0,
    });
  }

  return days;
}

export async function resetPlanner(): Promise<void> {
  await writeStore({ challenge: null, checkIns: [] });
  await AsyncStorage.removeItem(DEMO_SEEDED_KEY);
}
