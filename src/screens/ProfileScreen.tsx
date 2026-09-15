import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

import { Button, Container, ScreenHeader, Typography } from '@/src/components';
import { isDemoAccount } from '@/src/data/mocks/demo.account';
import { useAuth } from '@/src/hooks/useAuth';
import { colors, radii, spacing } from '@/src/theme/tokens';

interface ProfileScreenProps {
  showBack?: boolean;
}

export function ProfileScreen({ showBack = false }: ProfileScreenProps) {
  const { profile, user, signOut } = useAuth();
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
        <View style={styles.demoBanner}>
          <Typography variant="label" color={colors.black}>
            Conta demo ativa
          </Typography>
          <Typography variant="caption" color={colors.textMuted}>
            Carteira, streak do Planner e sugestões educacionais já vêm preenchidas para
            testar o MVP.
          </Typography>
        </View>
      ) : null}

      <View style={styles.card}>
        <Typography variant="caption" color={colors.textMuted}>
          Nome
        </Typography>
        <Typography variant="bodyStrong">
          {profile?.displayName || user?.displayName || '—'}
        </Typography>
      </View>

      <View style={styles.card}>
        <Typography variant="caption" color={colors.textMuted}>
          E-mail
        </Typography>
        <Typography variant="bodyStrong">{email || '—'}</Typography>
      </View>

      <View style={styles.card}>
        <Typography variant="caption" color={colors.textMuted}>
          Perfil de investidor
        </Typography>
        <Typography variant="body">
          {demo
            ? 'Moderado (mock educacional) — questionário real virá depois.'
            : 'Ainda não classificado — sem forçar dados sensíveis.'}
        </Typography>
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

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  demoBanner: {
    backgroundColor: colors.surfaceWarm,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  card: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
});
