import { Pressable, StyleSheet, View } from 'react-native';
import { useEffect, useMemo, useState } from 'react';
import { router } from 'expo-router';

import { Button, Container, Input, ScreenHeader, Typography } from '@/src/components';
import { isDemoAccount } from '@/src/data/mocks/demo.account';
import type { InvestmentHorizon, InvestorGoal, InvestorProfileType } from '@/src/domain/user';
import { useAuth } from '@/src/hooks/useAuth';
import { useAppTheme } from '@/src/hooks/useAppTheme';
import { radii, spacing, type AppColors, type ThemePreference } from '@/src/theme/tokens';

const THEME_OPTIONS: Array<{ value: ThemePreference; label: string; description: string }> = [
  { value: 'light', label: 'Claro', description: 'Fundo claro' },
  { value: 'dark', label: 'Escuro', description: 'Fundo escuro' },
  { value: 'system', label: 'Sistema', description: 'Segue o aparelho' },
];

const INVESTOR_PROFILE_OPTIONS: Array<{
  value: InvestorProfileType;
  label: string;
  description: string;
}> = [
  {
    value: 'conservative',
    label: 'Conservador',
    description: 'Prefere estabilidade, previsibilidade e leituras de risco mais cautelosas.',
  },
  {
    value: 'moderate',
    label: 'Moderado',
    description: 'Equilibra renda, diversificacao e oscilacoes dentro de limites confortaveis.',
  },
  {
    value: 'aggressive',
    label: 'Arrojado',
    description: 'Tolera mais volatilidade e analisa oportunidades com maior variacao de preco.',
  },
];

const INVESTOR_PROFILE_LABELS: Record<InvestorProfileType, string> = {
  conservative: 'Conservador',
  moderate: 'Moderado',
  aggressive: 'Arrojado',
};

const INVESTOR_GOAL_OPTIONS: Array<{ value: InvestorGoal; label: string }> = [
  { value: 'retirement', label: 'Aposentadoria' },
  { value: 'wealth', label: 'Construção de patrimônio' },
  { value: 'property', label: 'Compra de imóvel' },
  { value: 'income', label: 'Renda passiva' },
  { value: 'growth', label: 'Crescimento' },
  { value: 'preservation', label: 'Preservação' },
  { value: 'learning', label: 'Aprender' },
  { value: 'other', label: 'Outro' },
];

const HORIZON_OPTIONS: Array<{ value: InvestmentHorizon; label: string }> = [
  { value: 'y2', label: '2 anos' },
  { value: 'y5', label: '5 anos' },
  { value: 'y10', label: '10 anos' },
  { value: 'y15', label: '15 anos' },
  { value: 'y20', label: '20 anos' },
  { value: 'y25', label: '25 anos' },
  { value: 'more', label: 'Mais / Outro' },
];

interface ProfileScreenProps {
  showBack?: boolean;
}

export function ProfileScreen({ showBack = false }: ProfileScreenProps) {
  const { profile, sensitiveProfile, user, signOut, updateProfile, updateSensitiveProfile } = useAuth();
  const { colors, preference, setPreference } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const email = profile?.email || user?.email || '';
  const demo = isDemoAccount(email);
  const [displayName, setDisplayName] = useState(profile?.displayName || user?.displayName || '');
  const [investorProfile, setInvestorProfile] = useState<InvestorProfileType | null>(
    profile?.investorProfile ?? null,
  );
  const [nameError, setNameError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [saveMessage, setSaveMessage] = useState('');
  const [savingAccount, setSavingAccount] = useState(false);
  const [savingInvestorProfile, setSavingInvestorProfile] = useState(false);
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [declaredNetWorth, setDeclaredNetWorth] = useState('');
  const [investmentGoal, setInvestmentGoal] = useState<InvestorGoal | null>(null);
  const [investmentHorizon, setInvestmentHorizon] = useState<InvestmentHorizon | null>(null);
  const [lgpdConsent, setLgpdConsent] = useState(false);
  const [financialError, setFinancialError] = useState('');
  const [savingFinancialProfile, setSavingFinancialProfile] = useState(false);

  useEffect(() => {
    setDisplayName(profile?.displayName || user?.displayName || '');
    setInvestorProfile(profile?.investorProfile ?? null);
  }, [profile?.displayName, profile?.investorProfile, user?.displayName]);

  useEffect(() => {
    setMonthlyIncome(formatNumberInput(sensitiveProfile?.monthlyIncome ?? null));
    setDeclaredNetWorth(formatNumberInput(sensitiveProfile?.declaredNetWorth ?? null));
    setInvestmentGoal(sensitiveProfile?.investmentGoal ?? null);
    setInvestmentHorizon(sensitiveProfile?.investmentHorizon ?? null);
    setLgpdConsent(sensitiveProfile?.lgpdConsent ?? false);
  }, [sensitiveProfile]);

  async function handleSaveAccount() {
    const nextName = displayName.trim();

    if (nextName.length < 2) {
      setNameError('Informe pelo menos 2 caracteres.');
      return;
    }

    setNameError('');
    setSaveError('');
    setSaveMessage('');
    setSavingAccount(true);

    try {
      await updateProfile({ displayName: nextName });
      setSaveMessage('Cadastro basico atualizado.');
    } catch {
      setSaveError('Nao foi possivel atualizar seu cadastro agora.');
    } finally {
      setSavingAccount(false);
    }
  }

  async function handleSelectInvestorProfile(nextProfile: InvestorProfileType) {
    setInvestorProfile(nextProfile);
    setSaveError('');
    setSaveMessage('');
    setSavingInvestorProfile(true);

    try {
      await updateProfile({ investorProfile: nextProfile });
      setSaveMessage(`Perfil ${INVESTOR_PROFILE_LABELS[nextProfile].toLowerCase()} salvo.`);
    } catch {
      setSaveError('Nao foi possivel salvar o perfil do investidor agora.');
      setInvestorProfile(profile?.investorProfile ?? null);
    } finally {
      setSavingInvestorProfile(false);
    }
  }

  async function handleSaveFinancialProfile() {
    const parsedMonthlyIncome = parseMoneyInput(monthlyIncome);
    const parsedNetWorth = parseMoneyInput(declaredNetWorth);

    if (monthlyIncome.trim() && parsedMonthlyIncome === null) {
      setFinancialError('Revise a renda mensal informada.');
      return;
    }

    if (declaredNetWorth.trim() && parsedNetWorth === null) {
      setFinancialError('Revise o patrimonio informado.');
      return;
    }

    if (!lgpdConsent) {
      setFinancialError('Marque o consentimento para salvar estes dados opcionais.');
      return;
    }

    setFinancialError('');
    setSaveError('');
    setSaveMessage('');
    setSavingFinancialProfile(true);

    try {
      await updateSensitiveProfile({
        monthlyIncome: parsedMonthlyIncome,
        declaredNetWorth: parsedNetWorth,
        investmentGoal,
        investmentHorizon,
        lgpdConsent,
      });
      setSaveMessage('Dados opcionais salvos para melhorar sua analise de perfil.');
    } catch {
      setSaveError('Nao foi possivel salvar os dados opcionais agora.');
    } finally {
      setSavingFinancialProfile(false);
    }
  }

  async function handleSignOut() {
    await signOut();
    router.replace('/(auth)/login');
  }

  return (
    <Container scroll contentStyle={styles.content}>
      <ScreenHeader
        title="Perfil"
        subtitle="Cadastro basico. Dados financeiros sensiveis ficam separados."
        showBack={showBack}
      />

      {demo ? (
        <View style={[styles.demoBanner, { backgroundColor: colors.surfaceWarm }]}>
          <Typography variant="label" color={colors.black}>
            Conta demo ativa
          </Typography>
          <Typography variant="caption" color={colors.textMuted}>
            Carteira, streak do Planner e sugestoes educacionais ja vem preenchidas para
            testar o MVP.
          </Typography>
        </View>
      ) : null}

      <View style={[styles.card, { backgroundColor: colors.surfaceElevated }]}>
        <View style={styles.cardHeading}>
          <Typography variant="bodyStrong">Conta</Typography>
          <Typography variant="caption" color={colors.textMuted}>
            Dados essenciais usados para identificar sua conta no app.
          </Typography>
        </View>

        <Input
          autoCapitalize="words"
          error={nameError}
          label="Nome"
          onChangeText={setDisplayName}
          placeholder="Seu nome"
          value={displayName}
        />

        <View style={styles.readonlyField}>
          <Typography variant="caption" color={colors.textMuted}>
            E-mail
          </Typography>
          <Typography variant="bodyStrong">{email || '-'}</Typography>
        </View>

        <Button
          disabled={savingAccount}
          label="Salvar cadastro"
          loading={savingAccount}
          onPress={() => void handleSaveAccount()}
          variant="primary"
        />
      </View>

      <View style={[styles.card, { backgroundColor: colors.surfaceElevated }]}>
        <View style={styles.cardHeading}>
          <Typography variant="bodyStrong">Dados opcionais para analise</Typography>
          <Typography variant="caption" color={colors.textMuted}>
            Renda, patrimonio, objetivo e horizonte ajudam o app a contextualizar seu perfil.
            O preenchimento e opcional e estes dados ficam separados da conta basica.
          </Typography>
        </View>

        <Input
          keyboardType="numeric"
          label="Renda mensal aproximada"
          onChangeText={setMonthlyIncome}
          placeholder="Ex.: 8500"
          value={monthlyIncome}
        />

        <Input
          keyboardType="numeric"
          label="Patrimonio declarado aproximado"
          onChangeText={setDeclaredNetWorth}
          placeholder="Ex.: 120000"
          value={declaredNetWorth}
        />

        <View style={styles.choiceGroup}>
          <Typography variant="label">Objetivo principal</Typography>
          <View style={styles.chipRow}>
            {INVESTOR_GOAL_OPTIONS.map((option) => {
              const selected = investmentGoal === option.value;
              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  key={option.value}
                  onPress={() => setInvestmentGoal(selected ? null : option.value)}
                  style={[
                    styles.choiceChip,
                    { backgroundColor: colors.surfaceMuted, borderColor: colors.borderSubtle },
                    selected && { backgroundColor: colors.surfaceWarm, borderColor: colors.primary },
                  ]}
                >
                  <Typography variant="caption" color={selected ? colors.black : colors.textMuted}>
                    {option.label}
                  </Typography>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.choiceGroup}>
          <Typography variant="label">Horizonte</Typography>
          <View style={styles.chipRow}>
            {HORIZON_OPTIONS.map((option) => {
              const selected = investmentHorizon === option.value;
              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  key={option.value}
                  onPress={() => setInvestmentHorizon(selected ? null : option.value)}
                  style={[
                    styles.choiceChip,
                    { backgroundColor: colors.surfaceMuted, borderColor: colors.borderSubtle },
                    selected && { backgroundColor: colors.surfaceWarm, borderColor: colors.primary },
                  ]}
                >
                  <Typography variant="caption" color={selected ? colors.black : colors.textMuted}>
                    {option.label}
                  </Typography>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: lgpdConsent }}
          onPress={() => setLgpdConsent((current) => !current)}
          style={styles.consentRow}
        >
          <View
            style={[
              styles.checkbox,
              { borderColor: lgpdConsent ? colors.primaryDark : colors.border },
              lgpdConsent && { backgroundColor: colors.primary },
            ]}
          />
          <Typography variant="caption" color={colors.textMuted} style={styles.consentText}>
            Autorizo o tratamento destes dados opcionais para analise do meu perfil de investidor,
            com acesso restrito e finalidade informada, conforme principios da LGPD.
          </Typography>
        </Pressable>

        {financialError ? (
          <Typography variant="caption" color={colors.danger}>
            {financialError}
          </Typography>
        ) : null}

        <Button
          disabled={savingFinancialProfile}
          label="Salvar dados opcionais"
          loading={savingFinancialProfile}
          onPress={() => void handleSaveFinancialProfile()}
          variant="secondary"
        />
      </View>

      <View style={[styles.card, { backgroundColor: colors.surfaceElevated }]}>
        <View style={styles.cardHeading}>
          <Typography variant="bodyStrong">Perfil do investidor</Typography>
          <Typography variant="caption" color={colors.textMuted}>
            Classificacao educacional para adaptar textos e alertas, sem recomendar compra ou venda.
          </Typography>
        </View>

        <View style={styles.profileOptions}>
          {INVESTOR_PROFILE_OPTIONS.map((option) => {
            const selected = investorProfile === option.value;
            return (
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ checked: selected, disabled: savingInvestorProfile }}
                disabled={savingInvestorProfile}
                key={option.value}
                onPress={() => void handleSelectInvestorProfile(option.value)}
                style={[
                  styles.profileOption,
                  { backgroundColor: colors.surfaceMuted, borderColor: colors.borderSubtle },
                  selected && { backgroundColor: colors.surfaceWarm, borderColor: colors.primary },
                ]}
              >
                <View style={styles.profileOptionHeader}>
                  <Typography variant="label" color={selected ? colors.black : colors.text}>
                    {option.label}
                  </Typography>
                  <View
                    style={[
                      styles.radioDot,
                      { borderColor: selected ? colors.primaryDark : colors.border },
                      selected && { backgroundColor: colors.primary },
                    ]}
                  />
                </View>
                <Typography variant="caption" color={colors.textMuted}>
                  {option.description}
                </Typography>
              </Pressable>
            );
          })}
        </View>

        <Typography variant="caption" color={colors.textMuted}>
          {investorProfile
            ? `Classificacao atual: ${INVESTOR_PROFILE_LABELS[investorProfile]}.`
            : 'Classificacao ainda nao definida.'}
        </Typography>
      </View>

      {saveMessage ? (
        <Typography variant="caption" color={colors.success}>
          {saveMessage}
        </Typography>
      ) : null}

      {saveError ? (
        <Typography variant="caption" color={colors.danger}>
          {saveError}
        </Typography>
      ) : null}

      <View style={[styles.themeCard, { backgroundColor: colors.surfaceElevated }]}>
        <View style={styles.themeHeading}>
          <Typography variant="bodyStrong">Aparencia</Typography>
          <Typography variant="caption" color={colors.textMuted}>
            O conteudo e as cores de destaque permanecem os mesmos.
          </Typography>
        </View>
        <View style={[styles.themeControl, { backgroundColor: colors.surfaceMuted }]}>
          {THEME_OPTIONS.map((option) => {
            const selected = preference === option.value;
            return (
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
                key={option.value}
                onPress={() => void setPreference(option.value)}
                style={[
                  styles.themeOption,
                  selected && { backgroundColor: colors.surfaceElevated, borderColor: colors.primary },
                ]}
              >
                <Typography variant="label" color={selected ? colors.text : colors.textMuted}>
                  {option.label}
                </Typography>
                <Typography variant="caption" color={colors.textMuted} style={styles.themeDescription}>
                  {option.description}
                </Typography>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Button
        label="Abrir Planner"
        variant="primary"
        onPress={() => router.push('/planner')}
      />

      {profile?.role === 'admin' || profile?.role === 'admin_readonly' ? (
        <Button
          label="Painel admin · usuários"
          variant="outline"
          onPress={() => router.push('/admin/users')}
        />
      ) : null}

      <Button label="Sair da conta" variant="outline" onPress={() => void handleSignOut()} />
    </Container>
  );
}

function createStyles(colors: AppColors) { return StyleSheet.create({
  content: {
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  demoBanner: {
    borderRadius: radii.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  card: {
    borderRadius: radii.md,
    padding: spacing.md,
    gap: spacing.md,
  },
  cardHeading: {
    gap: spacing.xs,
  },
  readonlyField: {
    gap: spacing.xs,
  },
  profileOptions: {
    gap: spacing.sm,
  },
  profileOption: {
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
    gap: spacing.xs,
  },
  profileOptionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  radioDot: {
    width: 18,
    height: 18,
    borderRadius: radii.full,
    borderWidth: 2,
  },
  choiceGroup: {
    gap: spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  choiceChip: {
    borderRadius: radii.full,
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: 36,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  consentRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: radii.sm,
    borderWidth: 2,
    marginTop: 1,
  },
  consentText: {
    flex: 1,
  },
  themeCard: { borderRadius: radii.md, padding: spacing.md, gap: spacing.md },
  themeHeading: { gap: spacing.xs },
  themeControl: { flexDirection: 'row', borderRadius: radii.md, padding: 4, gap: 4 },
  themeOption: { flex: 1, minHeight: 58, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'transparent', borderRadius: radii.sm, paddingHorizontal: 4 },
  themeDescription: { fontSize: 10 },
}); }

function parseMoneyInput(value: string): number | null {
  const normalized = value.trim().replace(/\./g, '').replace(',', '.');

  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function formatNumberInput(value: number | null): string {
  return typeof value === 'number' ? String(value) : '';
}
