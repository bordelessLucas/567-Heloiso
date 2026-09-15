import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Link, router } from 'expo-router';

import { Button, Container, Input, Typography } from '@/src/components';
import { useAuth } from '@/src/hooks/useAuth';
import { colors, spacing } from '@/src/theme/tokens';
import { getAuthErrorMessage } from '@/src/utils/authErrors';

export function RegisterScreen() {
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    setError(undefined);

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setError('Preencha todos os campos.');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    setLoading(true);
    try {
      await signUp(name, email, password);
      router.replace('/(tabs)');
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container keyboardAware scroll contentStyle={styles.content} safeBottom>
      <View style={styles.header}>
        <Typography variant="h1">Criar conta</Typography>
        <Typography variant="body" color={colors.textMuted}>
          Cadastro básico: nome, e-mail e senha. Dados financeiros ficam separados e
          opcionais.
        </Typography>
      </View>

      <View style={styles.form}>
        <Input
          label="Nome"
          autoComplete="name"
          placeholder="Seu nome"
          value={name}
          onChangeText={setName}
        />
        <Input
          label="E-mail"
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          placeholder="seu@email.com"
          value={email}
          onChangeText={setEmail}
        />
        <Input
          label="Senha"
          isPassword
          autoComplete="new-password"
          placeholder="Mínimo 6 caracteres"
          value={password}
          onChangeText={setPassword}
        />
        <Input
          label="Confirmar senha"
          isPassword
          autoComplete="new-password"
          placeholder="Repita a senha"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          error={error}
        />

        <Button
          label="Criar conta"
          loading={loading}
          onPress={() => void handleRegister()}
        />

        <Link href="/(auth)/login" asChild>
          <Button label="Já tenho conta" variant="outline" disabled={loading} />
        </Link>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  content: {
    justifyContent: 'center',
    gap: spacing.xl,
  },
  header: {
    gap: spacing.sm,
  },
  form: {
    gap: spacing.md,
  },
});
