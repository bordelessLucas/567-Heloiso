import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { Button, Container, Input, ScreenHeader, Typography } from '@/src/components';
import { FadeEdgeScroll } from '@/src/components/FadeEdgeScroll';
import { ModuleIcon } from '@/src/components/ModuleIcon';
import { SavingCategoryIcon } from '@/src/components/SavingCategoryIcon';
import { SAVING_PRESET_LABELS } from '@/src/domain/saving';
import { useFundsCatalog } from '@/src/hooks/useFundsCatalog';
import { useAppTheme } from '@/src/hooks/useAppTheme';
import { useSaving } from '@/src/hooks/useSaving';
import { radii, shadows, spacing, type AppColors } from '@/src/theme/tokens';
import { formatBrl } from '@/src/utils/format';

function formatEventDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function parseAmount(value: string): number {
  return Number(value.replace(/\s/g, '').replace(',', '.'));
}

function isPresetLabel(value: string): boolean {
  return (SAVING_PRESET_LABELS as readonly string[]).includes(value);
}

export function PouparScreen() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { funds, loading: fundsLoading } = useFundsCatalog();
  const {
    rules,
    events,
    summary,
    loading,
    busy,
    error,
    lastEvent,
    clearLastEvent,
    saveRule,
    toggleRule,
    removeRule,
    poupei,
  } = useSaving();

  const [showForm, setShowForm] = useState(false);
  const [label, setLabel] = useState('Café');
  const [amountText, setAmountText] = useState('12');
  const [ticker, setTicker] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [poupeiAmountByRule, setPoupeiAmountByRule] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const activeRules = useMemo(() => rules.filter((rule) => rule.active), [rules]);
  const inactiveRules = useMemo(() => rules.filter((rule) => !rule.active), [rules]);
  const hasAssociations = rules.length > 0;

  const maxSharePrice = useMemo(() => {
    const amount = parseAmount(amountText);
    return Number.isFinite(amount) && amount > 0 ? amount : null;
  }, [amountText]);

  /** Só cotas com preço ≤ valor tipicamente gasto, ordenadas do mais barato ao mais alto. */
  const fundsByPrice = useMemo(() => {
    if (maxSharePrice == null) return [];
    return [...funds]
      .filter((fund) => fund.sharePrice != null && fund.sharePrice <= maxSharePrice)
      .sort((a, b) => (a.sharePrice ?? 0) - (b.sharePrice ?? 0));
  }, [funds, maxSharePrice]);

  const canSubmitRule = useMemo(() => {
    const amount = parseAmount(amountText);
    return label.trim().length > 0 && ticker.length > 0 && Number.isFinite(amount) && amount > 0;
  }, [label, ticker, amountText]);

  useEffect(() => {
    if (fundsByPrice.length === 0) {
      if (ticker) setTicker('');
      return;
    }
    const stillValid = fundsByPrice.some((fund) => fund.ticker === ticker);
    if (!stillValid) {
      setTicker(fundsByPrice[0]?.ticker ?? '');
    }
  }, [fundsByPrice, ticker]);

  useEffect(() => {
    setPoupeiAmountByRule((prev) => {
      const next = { ...prev };
      rules.forEach((rule) => {
        if (next[rule.id] === undefined) {
          next[rule.id] = String(rule.defaultAmount).replace('.', ',');
        }
      });
      Object.keys(next).forEach((id) => {
        if (!rules.some((rule) => rule.id === id)) {
          delete next[id];
        }
      });
      return next;
    });
  }, [rules]);

  function resetForm() {
    setEditingId(null);
    setShowForm(false);
    setLabel('Café');
    setAmountText('12');
    setFormError(null);
    if (fundsByPrice[0]?.ticker) {
      setTicker(fundsByPrice[0].ticker);
    }
  }

  function openCreateForm() {
    setEditingId(null);
    setLabel('Café');
    setAmountText('12');
    setFormError(null);
    if (fundsByPrice[0]?.ticker) {
      setTicker(fundsByPrice[0].ticker);
    }
    setShowForm(true);
  }

  function startEdit(ruleId: string) {
    const rule = rules.find((item) => item.id === ruleId);
    if (!rule) return;
    setEditingId(rule.id);
    setLabel(rule.label);
    setAmountText(String(rule.defaultAmount).replace('.', ','));
    setTicker(rule.ticker);
    setFormError(null);
    setShowForm(true);
  }

  async function handleSaveRule() {
    const amount = parseAmount(amountText);
    if (!label.trim()) {
      setFormError('Informe o nome do gasto.');
      return;
    }
    if (!ticker) {
      setFormError('Escolha um FII para associar.');
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      setFormError('Informe um valor válido maior que zero.');
      return;
    }

    setFormError(null);
    const rule = await saveRule({
      id: editingId ?? undefined,
      label: label.trim(),
      defaultAmount: amount,
      ticker,
    });
    if (rule) {
      resetForm();
    }
  }

  if (loading) {
    return (
      <Container contentStyle={styles.center} safeBottom>
        <ActivityIndicator color={colors.primary} size="large" />
      </Container>
    );
  }

  return (
    <Container scroll keyboardAware contentStyle={styles.content} safeBottom>
      <ScreenHeader
        title="Poupar em vez de gastar"
        subtitle="Associe um gasto evitado a um FII e veja quantas cotas aquele valor representa — só para estudo, sem compra real."
        showBack
      />

      <View style={styles.notice}>
        <ModuleIcon name="savings" size={18} tone="yellow" />
        <Typography variant="caption" color={colors.textMuted} style={styles.noticeText}>
          O botão “Poupei” registra equivalência educativa com a cotação do momento. Não envia
          ordem à corretora.
        </Typography>
      </View>

      <View style={styles.summaryCard}>
        <Typography variant="caption" color={colors.textMuted}>
          Total poupado (percepção)
        </Typography>
        <Typography variant="h1" color={colors.text}>
          {formatBrl(summary.totalSaved)}
        </Typography>
        <Typography variant="body" color={colors.textMuted}>
          ≈ {summary.totalEquivalentShares.toFixed(2).replace('.', ',')} cotas equivalentes ·{' '}
          {summary.eventsCount} registro{summary.eventsCount === 1 ? '' : 's'}
        </Typography>
        {summary.byTicker.length > 0 ? (
          <View style={styles.tickerTotals}>
            {summary.byTicker.map((item) => (
              <View key={item.ticker} style={styles.tickerChip}>
                <Typography variant="label" color={colors.text}>
                  {item.ticker}
                </Typography>
                <Typography variant="caption" color={colors.textMuted}>
                  {formatBrl(item.amount)} · {item.equivalentShares.toFixed(2).replace('.', ',')}{' '}
                  cotas
                </Typography>
              </View>
            ))}
          </View>
        ) : null}
      </View>

      {lastEvent ? (
        <View style={styles.resultCard}>
          <View style={styles.resultHead}>
            <SavingCategoryIcon label={lastEvent.label} size={18} tone="feature" />
            <Typography variant="bodyStrong" color={colors.text}>
              Último Poupei
            </Typography>
          </View>
          <Typography variant="body" color={colors.textMuted}>
            {lastEvent.label}: {formatBrl(lastEvent.amount)} ÷ {formatBrl(lastEvent.quote)} (
            {lastEvent.ticker}) ≈ {lastEvent.equivalentShares.toFixed(2).replace('.', ',')} cotas
          </Typography>
          <Pressable onPress={clearLastEvent} hitSlop={8}>
            <Typography variant="caption" color={colors.primaryDark}>
              Fechar
            </Typography>
          </Pressable>
        </View>
      ) : null}

      {!showForm ? (
        <View style={styles.section}>
          {!hasAssociations ? (
            <View style={styles.emptyHero}>
              <SavingCategoryIcon label="Café" size={28} tone="feature" />
              <Typography variant="h3" color={colors.text}>
                Nenhuma associação ainda
              </Typography>
              <Typography variant="body" color={colors.textMuted} style={styles.emptyHeroText}>
                Crie a primeira ligação entre um gasto do dia a dia e um FII para começar a
                registrar o Poupei.
              </Typography>
              <Button label="Criar uma nova associação" onPress={openCreateForm} />
            </View>
          ) : (
            <Button
              label="Criar uma nova associação"
              variant="secondary"
              onPress={openCreateForm}
            />
          )}
        </View>
      ) : (
        <View style={styles.section}>
          <Typography variant="h3" color={colors.text}>
            {editingId ? 'Editar associação' : 'Nova associação gasto → FII'}
          </Typography>
          <Typography variant="caption" color={colors.textMuted}>
            Você escolhe o gasto e o ativo. Nada fica fixo pelo app.
          </Typography>

          {editingId ? (
            <View style={styles.editingBanner}>
              <Typography variant="caption" color={colors.textMuted}>
                Editando associação existente. Salve ou cancele para voltar.
              </Typography>
            </View>
          ) : null}

          <FadeEdgeScroll edgeColor={colors.background} contentContainerStyle={styles.presets}>
            {SAVING_PRESET_LABELS.map((preset) => {
              const active =
                preset === 'Outro' ? !isPresetLabel(label) || label.length === 0 : label === preset;
              return (
                <Pressable
                  key={preset}
                  onPress={() => setLabel(preset === 'Outro' ? '' : preset)}
                  style={[styles.presetChip, active && styles.presetChipActive]}
                >
                  <SavingCategoryIcon
                    label={preset === 'Outro' ? 'Outro' : preset}
                    size={14}
                    tone={active ? 'feature' : 'muted'}
                  />
                  <Typography variant="label" color={colors.text}>
                    {preset}
                  </Typography>
                </Pressable>
              );
            })}
          </FadeEdgeScroll>

          <View style={styles.formCard}>
            <View style={styles.formIconPreview}>
              <SavingCategoryIcon label={label || 'Outro'} size={24} tone="feature" />
              <Typography variant="caption" color={colors.textMuted}>
                Ícone da associação (abstrato, só para organização)
              </Typography>
            </View>

            <Input
              label="Nome do gasto"
              placeholder="Ex.: Café"
              value={label}
              onChangeText={setLabel}
            />
            <Input
              label="Valor tipicamente gasto"
              keyboardType="decimal-pad"
              value={amountText}
              onChangeText={setAmountText}
              placeholder="12"
            />

            <Typography variant="label" color={colors.text}>
              FII associado
            </Typography>
            <Typography variant="caption" color={colors.textMuted}>
              {maxSharePrice != null
                ? `Só cotas de até ${formatBrl(maxSharePrice)} (valor tipicamente gasto).`
                : 'Informe o valor tipicamente gasto para filtrar as cotas.'}
            </Typography>
            {fundsLoading ? (
              <ActivityIndicator color={colors.primary} />
            ) : maxSharePrice == null ? (
              <Typography variant="caption" color={colors.textMuted}>
                Digite um valor válido acima para ver FIIs compatíveis.
              </Typography>
            ) : fundsByPrice.length === 0 ? (
              <Typography variant="caption" color={colors.textMuted}>
                Nenhuma cota no catálogo custa até {formatBrl(maxSharePrice)}. Ajuste o valor ou
                escolha outro gasto.
              </Typography>
            ) : (
              <FadeEdgeScroll
                edgeColor={colors.surfaceElevated}
                contentContainerStyle={styles.tickerRow}
              >
                {fundsByPrice.map((fund) => {
                  const active = fund.ticker === ticker;
                  return (
                    <Pressable
                      key={fund.id}
                      onPress={() => setTicker(fund.ticker)}
                      style={[styles.tickerChipSelect, active && styles.tickerChipSelectActive]}
                    >
                      <Typography variant="label" color={colors.text}>
                        {fund.ticker}
                      </Typography>
                      <Typography variant="caption" color={colors.textMuted}>
                        {fund.sharePrice != null ? formatBrl(fund.sharePrice) : '—'}
                      </Typography>
                    </Pressable>
                  );
                })}
              </FadeEdgeScroll>
            )}

            {formError ? (
              <Typography variant="caption" color={colors.danger}>
                {formError}
              </Typography>
            ) : null}

            <Button
              label={editingId ? 'Salvar alterações' : 'Criar associação'}
              loading={busy}
              disabled={!canSubmitRule || busy}
              onPress={() => void handleSaveRule()}
            />
            <Pressable onPress={resetForm} hitSlop={8}>
              <Typography variant="caption" color={colors.primaryDark}>
                {editingId ? 'Cancelar edição' : 'Cancelar'}
              </Typography>
            </Pressable>
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Typography variant="h3" color={colors.text}>
          Minhas associações
        </Typography>
        {activeRules.length === 0 && !showForm ? (
          <View style={styles.emptyCard}>
            <Typography variant="body" color={colors.textMuted}>
              Depois de criar a associação, o botão Poupei aparece aqui.
            </Typography>
          </View>
        ) : activeRules.length === 0 ? (
          <View style={styles.emptyCard}>
            <Typography variant="body" color={colors.textMuted}>
              Preencha o formulário acima para criar a primeira associação.
            </Typography>
          </View>
        ) : (
          activeRules.map((rule) => {
            const amountRaw =
              poupeiAmountByRule[rule.id] ?? String(rule.defaultAmount).replace('.', ',');
            const poupeiAmount = parseAmount(amountRaw);
            const canPoupei = Number.isFinite(poupeiAmount) && poupeiAmount > 0;

            return (
              <View key={rule.id} style={styles.ruleCard}>
                <View style={styles.ruleHead}>
                  <SavingCategoryIcon label={rule.label} size={18} tone="feature" />
                  <View style={styles.ruleText}>
                    <Typography variant="bodyStrong" color={colors.text}>
                      {rule.label}
                    </Typography>
                    <Typography variant="caption" color={colors.textMuted}>
                      → {rule.ticker} · padrão {formatBrl(rule.defaultAmount)}
                    </Typography>
                  </View>
                </View>

                <Input
                  label="Valor deste Poupei"
                  keyboardType="decimal-pad"
                  value={amountRaw}
                  onChangeText={(text) =>
                    setPoupeiAmountByRule((prev) => ({ ...prev, [rule.id]: text }))
                  }
                />

                <Button
                  label="Poupei"
                  loading={busy}
                  disabled={!canPoupei || busy}
                  onPress={() => void poupei(rule.id, poupeiAmount)}
                />

                <View style={styles.ruleActions}>
                  <Pressable onPress={() => startEdit(rule.id)} hitSlop={8}>
                    <Typography variant="caption" color={colors.primaryDark}>
                      Editar
                    </Typography>
                  </Pressable>
                  <Pressable onPress={() => void toggleRule(rule.id, false)} hitSlop={8}>
                    <Typography variant="caption" color={colors.textMuted}>
                      Pausar
                    </Typography>
                  </Pressable>
                  <Pressable onPress={() => void removeRule(rule.id)} hitSlop={8}>
                    <Typography variant="caption" color={colors.danger}>
                      Remover
                    </Typography>
                  </Pressable>
                </View>
              </View>
            );
          })
        )}

        {inactiveRules.length > 0 ? (
          <View style={styles.inactiveBlock}>
            <Typography variant="label" color={colors.text}>
              Pausadas
            </Typography>
            {inactiveRules.map((rule) => (
              <Pressable
                key={rule.id}
                style={styles.inactiveRow}
                onPress={() => void toggleRule(rule.id, true)}
              >
                <View style={styles.inactiveLeft}>
                  <SavingCategoryIcon label={rule.label} size={14} tone="muted" />
                  <Typography variant="body" color={colors.text}>
                    {rule.label} → {rule.ticker}
                  </Typography>
                </View>
                <Typography variant="caption" color={colors.primaryDark}>
                  Reativar
                </Typography>
              </Pressable>
            ))}
          </View>
        ) : null}
      </View>

      <View style={styles.section}>
        <Typography variant="h3" color={colors.text}>
          Histórico
        </Typography>
        {events.length === 0 ? (
          <View style={styles.emptyCard}>
            <Typography variant="body" color={colors.textMuted}>
              Seus Poupei aparecem aqui com cotação e cotas equivalentes.
            </Typography>
          </View>
        ) : (
          events.map((event) => (
            <View key={event.id} style={styles.historyRow}>
              <SavingCategoryIcon label={event.label} size={16} tone="muted" />
              <View style={styles.historyText}>
                <Typography variant="bodyStrong" color={colors.text}>
                  {event.label}
                </Typography>
                <Typography variant="caption" color={colors.textMuted}>
                  {formatEventDate(event.createdAt)} · {event.ticker} @ {formatBrl(event.quote)}
                </Typography>
              </View>
              <View style={styles.historyValues}>
                <Typography variant="bodyStrong" color={colors.text}>
                  {formatBrl(event.amount)}
                </Typography>
                <Typography variant="caption" color={colors.primaryDark}>
                  ≈ {event.equivalentShares.toFixed(2).replace('.', ',')} cotas
                </Typography>
              </View>
            </View>
          ))
        )}
      </View>

      {error ? (
        <Typography variant="caption" color={colors.danger}>
          {error}
        </Typography>
      ) : null}
    </Container>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    content: {
      gap: spacing.lg,
      paddingBottom: spacing.xxl,
    },
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    notice: {
      flexDirection: 'row',
      gap: spacing.sm,
      alignItems: 'flex-start',
      backgroundColor: colors.surfaceWarm,
      borderRadius: radii.lg,
      padding: spacing.md,
      ...shadows.card,
    },
    noticeText: {
      flex: 1,
    },
    summaryCard: {
      backgroundColor: colors.surfaceFeature,
      borderRadius: radii.lg,
      padding: spacing.lg,
      gap: spacing.xs,
      ...shadows.card,
    },
    tickerTotals: {
      marginTop: spacing.sm,
      gap: spacing.xs,
    },
    tickerChip: {
      backgroundColor: colors.surfaceElevated,
      borderRadius: radii.md,
      padding: spacing.sm,
      gap: 2,
    },
    resultCard: {
      backgroundColor: colors.surfaceElevated,
      borderRadius: radii.lg,
      padding: spacing.md,
      gap: spacing.xs,
      ...shadows.card,
    },
    resultHead: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    section: {
      gap: spacing.sm,
    },
    emptyHero: {
      backgroundColor: colors.surfaceElevated,
      borderRadius: radii.lg,
      padding: spacing.lg,
      gap: spacing.sm,
      alignItems: 'flex-start',
      ...shadows.card,
    },
    emptyHeroText: {
      marginBottom: spacing.xs,
    },
    editingBanner: {
      backgroundColor: colors.surfaceMuted,
      borderRadius: radii.md,
      padding: spacing.sm,
    },
    presets: {
      flexDirection: 'row',
      gap: spacing.sm,
      paddingVertical: spacing.xs,
      alignItems: 'center',
    },
    presetChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      backgroundColor: colors.surfaceElevated,
      borderRadius: radii.full,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      ...shadows.card,
    },
    presetChipActive: {
      backgroundColor: colors.primary,
    },
    formCard: {
      backgroundColor: colors.surfaceElevated,
      borderRadius: radii.lg,
      padding: spacing.md,
      gap: spacing.md,
      ...shadows.card,
    },
    formIconPreview: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    tickerRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      paddingVertical: spacing.xs,
    },
    tickerChipSelect: {
      backgroundColor: colors.surfaceWarm,
      borderRadius: radii.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      gap: 2,
      minWidth: 96,
    },
    tickerChipSelectActive: {
      backgroundColor: colors.primary,
    },
    emptyCard: {
      backgroundColor: colors.surfaceElevated,
      borderRadius: radii.lg,
      padding: spacing.md,
      ...shadows.card,
    },
    ruleCard: {
      backgroundColor: colors.surfaceWarm,
      borderRadius: radii.lg,
      padding: spacing.md,
      gap: spacing.sm,
      ...shadows.card,
    },
    ruleHead: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    ruleText: {
      flex: 1,
      gap: 2,
    },
    ruleActions: {
      flexDirection: 'row',
      gap: spacing.md,
    },
    inactiveBlock: {
      gap: spacing.xs,
      marginTop: spacing.sm,
    },
    inactiveRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.surfaceElevated,
      borderRadius: radii.md,
      padding: spacing.md,
      gap: spacing.sm,
    },
    inactiveLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      flex: 1,
    },
    historyRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.sm,
      backgroundColor: colors.surfaceElevated,
      borderRadius: radii.md,
      padding: spacing.md,
      ...shadows.card,
    },
    historyText: {
      flex: 1,
      gap: 2,
    },
    historyValues: {
      alignItems: 'flex-end',
      gap: 2,
    },
  });
}
