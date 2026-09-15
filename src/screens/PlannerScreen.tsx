import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { Button, Container, Input, ScreenHeader, Typography } from '@/src/components';
import { ModuleIcon } from '@/src/components/ModuleIcon';
import { PlannerWeekStrip, SavingsBars } from '@/src/components/PlannerProgress';
import { StreakHero } from '@/src/components/StreakHero';
import type { PlannerChallengeDays } from '@/src/domain/planner';
import { usePlanner } from '@/src/hooks/usePlanner';
import { colors, radii, spacing } from '@/src/theme/tokens';
import { formatBrl } from '@/src/utils/format';

const PRESETS: Array<{ days: PlannerChallengeDays; label: string; hint: string }> = [
  { days: 50, label: '50 dias', hint: 'Ritmo rápido para criar o hábito' },
  { days: 100, label: '100 dias', hint: 'Equilíbrio entre foco e constância' },
  { days: 200, label: '200 dias', hint: 'Construção de longo prazo' },
];

export function PlannerScreen() {
  const {
    challenge,
    checkIns,
    week,
    loading,
    busy,
    error,
    progress,
    checkedInToday,
    createChallenge,
    saveObjective,
    checkInToday,
    clearChallenge,
  } = usePlanner();
  const [dailyAmount, setDailyAmount] = useState('25');
  const [objective, setObjective] = useState('');
  const [editingObjective, setEditingObjective] = useState(false);

  useEffect(() => {
    if (challenge?.objective) {
      setObjective(challenge.objective);
    }
  }, [challenge?.objective]);

  if (loading) {
    return (
      <Container contentStyle={styles.center} safeBottom>
        <ActivityIndicator color={colors.primary} size="large" />
      </Container>
    );
  }

  if (!challenge) {
    return (
      <Container scroll keyboardAware contentStyle={styles.content} safeBottom>
        <ScreenHeader
          title="Planner de poupança"
          subtitle="Escreva seu objetivo e escolha o ritmo. O dinheiro fica onde você quiser."
          showBack
        />

        <View style={styles.infoCard}>
          <ModuleIcon name="savings" size={20} tone="yellow" />
          <View style={styles.infoText}>
            <Typography variant="bodyStrong">Comece pelo “porquê”</Typography>
            <Typography variant="caption" color={colors.textMuted}>
              Ex.: reserva de emergência, viagem, aporte mensal. Isso deixa a meta pessoal.
            </Typography>
          </View>
        </View>

        <View style={styles.card}>
          <Input
            label="Meu objetivo"
            placeholder="Ex.: juntar para investir com mais tranquilidade"
            value={objective}
            onChangeText={setObjective}
            multiline
          />
          <Input
            label="Valor sugerido por dia"
            keyboardType="decimal-pad"
            value={dailyAmount}
            onChangeText={setDailyAmount}
            placeholder="25"
          />
        </View>

        <View style={styles.presets}>
          {PRESETS.map((preset) => (
            <Pressable
              key={preset.days}
              disabled={busy}
              onPress={() =>
                void createChallenge(
                  preset.days,
                  Number(dailyAmount.replace(',', '.')) || 25,
                  objective,
                )
              }
              style={({ pressed }) => [styles.presetCard, pressed && styles.pressed]}
            >
              <ModuleIcon name="calendar" size={20} tone="yellow" />
              <View style={styles.presetText}>
                <Typography variant="h3">{preset.label}</Typography>
                <Typography variant="caption" color={colors.textMuted}>
                  {preset.hint}
                </Typography>
              </View>
              <Typography variant="label" color={colors.primaryDark}>
                Escolher
              </Typography>
            </Pressable>
          ))}
        </View>

        {error ? (
          <Typography variant="caption" color={colors.danger}>
            {error}
          </Typography>
        ) : null}
      </Container>
    );
  }

  const remaining = Math.max(0, challenge.totalDays - challenge.completedDays);

  return (
    <Container scroll keyboardAware contentStyle={styles.content} safeBottom>
      <ScreenHeader
        title={challenge.title}
        subtitle="Acompanhe o que já poupou e quanto falta — com o seu objetivo em destaque."
        showBack
      />

      <View style={styles.objectiveCard}>
        <View style={styles.objectiveHead}>
          <ModuleIcon name="planner" size={18} tone="yellow" />
          <Typography variant="label">Meu objetivo</Typography>
          <Pressable onPress={() => setEditingObjective((prev) => !prev)} hitSlop={8}>
            <Typography variant="caption" color={colors.primaryDark}>
              {editingObjective ? 'Cancelar' : 'Editar'}
            </Typography>
          </Pressable>
        </View>

        {editingObjective ? (
          <>
            <Input
              placeholder="Descreva seu objetivo"
              value={objective}
              onChangeText={setObjective}
              multiline
            />
            <Button
              label="Salvar objetivo"
              loading={busy}
              onPress={() => {
                void saveObjective(objective).then(() => setEditingObjective(false));
              }}
            />
          </>
        ) : (
          <Typography variant="bodyStrong">{challenge.objective}</Typography>
        )}
      </View>

      <StreakHero
        streak={challenge.streak}
        progress={progress}
        completedDays={challenge.completedDays}
        totalDays={challenge.totalDays}
        savedAmountLabel={formatBrl(challenge.savedAmount)}
        dailyTargetLabel={formatBrl(challenge.dailyTargetAmount)}
      />

      <View style={styles.remainingBanner}>
        <ModuleIcon name="calendar" size={18} tone="light" />
        <Typography variant="bodyStrong" color={colors.black}>
          Faltam {remaining} dias para concluir
        </Typography>
      </View>

      <View style={styles.section}>
        <Typography variant="h3">Semana</Typography>
        <PlannerWeekStrip week={week} />
      </View>

      <View style={styles.section}>
        <Typography variant="h3">Evolução dos aportes</Typography>
        <SavingsBars checkIns={checkIns} />
      </View>

      <Button
        label={checkedInToday ? 'Check-in de hoje concluído' : 'Fazer check-in de hoje'}
        loading={busy}
        disabled={checkedInToday || challenge.status === 'completed'}
        onPress={() => void checkInToday()}
      />

      {challenge.status === 'completed' ? (
        <View style={styles.infoCard}>
          <ModuleIcon name="streak" size={20} tone="yellow" />
          <View style={styles.infoText}>
            <Typography variant="bodyStrong">Desafio concluído</Typography>
            <Typography variant="caption" color={colors.textMuted}>
              Maior sequência: {challenge.longestStreak} dias · Total:{' '}
              {formatBrl(challenge.savedAmount)}
            </Typography>
          </View>
        </View>
      ) : null}

      {error ? (
        <Typography variant="caption" color={colors.danger}>
          {error}
        </Typography>
      ) : null}

      <Button
        label="Encerrar e recomeçar"
        variant="outline"
        loading={busy}
        onPress={() => void clearChallenge()}
      />
    </Container>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.md,
  },
  infoCard: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
    backgroundColor: colors.surfaceWarm,
    borderRadius: radii.lg,
    padding: spacing.md,
  },
  infoText: {
    flex: 1,
    gap: spacing.xs,
  },
  objectiveCard: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  objectiveHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  presets: {
    gap: spacing.sm,
  },
  presetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.lg,
    padding: spacing.md,
  },
  pressed: {
    opacity: 0.94,
  },
  presetText: {
    flex: 1,
    gap: 2,
  },
  section: {
    gap: spacing.sm,
  },
  remainingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.lg,
    padding: spacing.md,
  },
});
