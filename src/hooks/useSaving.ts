import { useCallback, useEffect, useMemo, useState } from 'react';

import type { SavingEvent, SavingRule, SavingSummary } from '@/src/domain/saving';
import { useAuth } from '@/src/hooks/useAuth';
import {
  buildSavingSummary,
  deleteSavingRule,
  listSavingEvents,
  listSavingRules,
  performSaveEvent,
  setSavingRuleActive,
  upsertSavingRule,
} from '@/src/services/saving.service';

export function useSaving() {
  const { user } = useAuth();
  const [rules, setRules] = useState<SavingRule[]>([]);
  const [events, setEvents] = useState<SavingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastEvent, setLastEvent] = useState<SavingEvent | null>(null);

  const refresh = useCallback(async () => {
    if (!user) {
      setRules([]);
      setEvents([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [nextRules, nextEvents] = await Promise.all([
        listSavingRules(user.uid),
        listSavingEvents(user.uid),
      ]);
      setRules(nextRules);
      setEvents(nextEvents);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao carregar Poupar.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const summary: SavingSummary = useMemo(() => buildSavingSummary(events), [events]);

  const saveRule = useCallback(
    async (input: {
      id?: string;
      label: string;
      defaultAmount: number;
      ticker: string;
      active?: boolean;
    }) => {
      if (!user) {
        setError('Faça login para configurar o Poupar.');
        return null;
      }
      setBusy(true);
      setError(null);
      try {
        const rule = await upsertSavingRule({ userId: user.uid, ...input });
        await refresh();
        return rule;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Falha ao salvar associação.');
        return null;
      } finally {
        setBusy(false);
      }
    },
    [user, refresh],
  );

  const toggleRule = useCallback(
    async (ruleId: string, active: boolean) => {
      if (!user) return;
      setBusy(true);
      setError(null);
      try {
        await setSavingRuleActive(user.uid, ruleId, active);
        await refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Falha ao atualizar associação.');
      } finally {
        setBusy(false);
      }
    },
    [user, refresh],
  );

  const removeRule = useCallback(
    async (ruleId: string) => {
      if (!user) return;
      setBusy(true);
      setError(null);
      try {
        await deleteSavingRule(user.uid, ruleId);
        await refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Falha ao remover associação.');
      } finally {
        setBusy(false);
      }
    },
    [user, refresh],
  );

  const poupei = useCallback(
    async (ruleId: string, amount?: number) => {
      if (!user) {
        setError('Faça login para registrar um Poupei.');
        return null;
      }
      setBusy(true);
      setError(null);
      try {
        const event = await performSaveEvent({
          userId: user.uid,
          ruleId,
          amount,
        });
        setLastEvent(event);
        await refresh();
        return event;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Falha ao registrar Poupei.');
        return null;
      } finally {
        setBusy(false);
      }
    },
    [user, refresh],
  );

  return {
    rules,
    events,
    summary,
    loading,
    busy,
    error,
    lastEvent,
    clearLastEvent: () => setLastEvent(null),
    refresh,
    saveRule,
    toggleRule,
    removeRule,
    poupei,
  };
}
