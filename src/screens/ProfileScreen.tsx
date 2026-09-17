import { Pressable, StyleSheet, View } from 'react-native';
import { useMemo } from 'react';
import { router } from 'expo-router';

import { Button, Container, ScreenHeader, Typography } from '@/src/components';
import { isDemoAccount } from '@/src/data/mocks/demo.account';
import { useAuth } from '@/src/hooks/useAuth';
import { useAppTheme } from '@/src/hooks/useAppTheme';
import { radii, spacing, type AppColors, type ThemePreference } from '@/src/theme/tokens';

const THEME_OPTIONS: Array<{ value: ThemePreference; label: string; description: string }> = [
  { value: 'light', label: 'Claro', description: 'Fundo claro' },
  { value: 'dark', label: 'Escuro', description: 'Fundo escuro' },
  { value: 'system', label: 'Sistema', description: 'Segue o aparelho' },
];

interface ProfileScreenProps {
  showBack?: boolean;
}

export function ProfileScreen({ showBack = false }: ProfileScreenProps) {
  const { profile, user, signOut } = useAuth();
  const { colors, preference, setPreference } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const email = profile?.email || user?.email || '';
  const demo = isDemoAccount(email);

  async function handleSignOut() {
    await signOut();
    router.replace('/(auth)/login');
  }

  return (
    <Container scroll contentStyle={styles.content}>
      <ScreenHeader
        title="Perfil"
        subtitle="Cadastro básico. Dados financeiros sensíveis ficam separados."
        showBack={showBack}
      />

      {demo ? (
        <View style={[styles.demoBanner, { backgroundColor: colors.surfaceWarm }]}>
          <Typography variant="label" color={colors.black}>
            Conta demo ativa
          </Typography>
          <Typography variant="caption" color={colors.textMuted}>
            Carteira, streak do Planner e sugestões educacionais já vêm preenchidas para
            testar o MVP.
          </Typography>
        </View>
      ) : null}

      <View style={[styles.card, { backgroundColor: colors.surfaceElevated }]}>
        <Typography variant="caption" color={colors.textMuted}>
          Nome
        </Typography>
        <Typography variant="bodyStrong">
          {profile?.displayName || user?.displayName || '—'}
        </Typography>
      </View>

      <View style={[styles.card, { backgroundColor: colors.surfaceElevated }]}>
        <Typography variant="caption" color={colors.textMuted}>
          E-mail
        </Typography>
        <Typography variant="bodyStrong">{email || '—'}</Typography>
      </View>

      <View style={[styles.card, { backgroundColor: colors.surfaceElevated }]}>
        <Typography variant="caption" color={colors.textMuted}>
          Perfil de investidor
        </Typography>
        <Typography variant="body">
          {demo
            ? 'Moderado (mock educacional) — questionário real virá depois.'
            : 'Ainda não classificado — sem forçar dados sensíveis.'}
        </Typography>
      </View>

      <View style={[styles.themeCard, { backgroundColor: colors.surfaceElevated }]}>
        <View style={styles.themeHeading}>
          <Typography variant="bodyStrong">Aparência</Typography>
          <Typography variant="caption" color={colors.textMuted}>
            O conteúdo e as cores de destaque permanecem os mesmos.
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
    gap: spacing.xs,
  },
  themeCard: { borderRadius: radii.md, padding: spacing.md, gap: spacing.md },
  themeHeading: { gap: spacing.xs },
  themeControl: { flexDirection: 'row', borderRadius: radii.md, padding: 4, gap: 4 },
  themeOption: { flex: 1, minHeight: 58, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'transparent', borderRadius: radii.sm, paddingHorizontal: 4 },
  themeDescription: { fontSize: 10 },
}); }
