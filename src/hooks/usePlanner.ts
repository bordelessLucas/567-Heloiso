import { useCallback, useEffect, useState } from 'react';

import type {
  PlannerChallenge,
  PlannerChallengeDays,
  PlannerCheckIn,
  PlannerWeekDay,
} from '@/src/domain/planner';
import { useAuth } from '@/src/hooks/useAuth';
import {
  getActiveChallenge,
  getWeekStrip,
  listCheckIns,
  performCheckIn,
  resetPlanner,
  startChallenge,
  ensureDemoPlannerSeed,
  updateChallengeObjective,
} from '@/src/services/planner.service';

export function usePlanner() {
  const { user, profile } = useAuth();
  const [challenge, setChallenge] = useState<PlannerChallenge | null>(null);
  const [checkIns, setCheckIns] = useState<PlannerCheckIn[]>([]);
  const [week, setWeek] = useState<PlannerWeekDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (user) {
        await ensureDemoPlannerSeed(user.uid, profile?.email ?? user.email);
      }

      const active = await getActiveChallenge();
      setChallenge(active);
      if (!active) {
        setCheckIns([]);
        setWeek(await getWeekStrip([]));
        return;
      }
      const items = await listCheckIns(active.id);
      setCheckIns(items);
      setWeek(await getWeekStrip(items));
    } finally {
      setLoading(false);
    }
  }, [user, profile?.email]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const createChallenge = useCallback(
    async (
      totalDays: PlannerChallengeDays,
      dailyTargetAmount: number,
      objective: string,
    ) => {
      if (!user) {
        setError('Faça login para iniciar um desafio.');
        return;
      }
      setBusy(true);
      setError(null);
      try {
        const created = await startChallenge({
          userId: user.uid,
          totalDays,
          dailyTargetAmount,
          objective,
        });
        setChallenge(created);
        setCheckIns([]);
        setWeek(await getWeekStrip([]));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Falha ao criar desafio.');
      } finally {
        setBusy(false);
      }
    },
    [user],
  );

  const saveObjective = useCallback(async (objective: string) => {
    setBusy(true);
    setError(null);
    try {
      const updated = await updateChallengeObjective(objective);
      setChallenge(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao salvar objetivo.');
    } finally {
      setBusy(false);
    }
  }, []);

  const checkInToday = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const result = await performCheckIn({});
      setChallenge(result.challenge);
      const items = await listCheckIns(result.challenge.id);
      setCheckIns(items);
      setWeek(await getWeekStrip(items));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha no check-in.');
    } finally {
      setBusy(false);
    }
  }, []);

  const clearChallenge = useCallback(async () => {
    setBusy(true);
    try {
      await resetPlanner();
      await refresh();
    } finally {
      setBusy(false);
    }
  }, [refresh]);

  const progress =
    challenge && challenge.totalDays > 0
      ? challenge.completedDays / challenge.totalDays
      : 0;

  const checkedInToday =
    challenge?.lastCheckInDate !== null &&
    challenge?.lastCheckInDate === week.find((day) => day.isToday)?.dateKey;

  return {
    challenge,
    checkIns,
    week,
    loading,
    busy,
    error,
    progress,
    checkedInToday: Boolean(checkedInToday),
    createChallenge,
    saveObjective,
    checkInToday,
    clearChallenge,
    refresh,
  };
}
