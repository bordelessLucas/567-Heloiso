import { useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { Link, router } from 'expo-router';

import { BrandLogo, Button, Container, Input, Typography } from '@/src/components';
import { useAuth } from '@/src/hooks/useAuth';
import { useAppTheme } from '@/src/hooks/useAppTheme';
import { colors, spacing } from '@/src/theme/tokens';
import { getAuthErrorMessage } from '@/src/utils/authErrors';

export function LoginScreen() {
  const { colors } = useAppTheme();
  const { signIn, resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setError(undefined);

    if (!email.trim() || !password) {
      setError('Preencha e-mail e senha.');
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password);
      router.replace('/');
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    setError(undefined);

    if (!email.trim()) {
      setError('Informe seu e-mail para recuperar a senha.');
      return;
    }

    try {
      await resetPassword(email);
      Alert.alert(
        'E-mail enviado',
        'Se existir uma conta com este e-mail, você receberá o link de recuperação.',
      );
    } catch (err) {
      setError(getAuthErrorMessage(err));
    }
  }

  return (
    <Container keyboardAware scroll contentStyle={styles.content} safeBottom>
      <View style={styles.brandBlock}>
        <BrandLogo width={232} />
        <Typography variant="body" color={colors.textMuted} style={styles.subtitle}>
          Análise e aprendizado em Fundos Imobiliários — a decisão continua com você.
        </Typography>
      </View>

      <View style={styles.form}>
        <Input
          label="E-mail"
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          placeholder="seu@email.com"
          value={email}
          onChangeText={setEmail}
          error={error && !password ? error : undefined}
        />
        <Input
          label="Senha"
          isPassword
          autoComplete="password"
          placeholder="Sua senha"
          value={password}
          onChangeText={setPassword}
          error={error}
        />

        <Pressable onPress={() => void handleForgotPassword()} style={styles.forgot}>
          <Typography variant="label" color={colors.black}>
            Esqueci minha senha
          </Typography>
        </Pressable>

        <Button label="Entrar" loading={loading} onPress={() => void handleLogin()} />

        <Link href="/(auth)/register" asChild>
          <Button label="Criar conta" variant="outline" disabled={loading} />
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
  brandBlock: {
    gap: spacing.sm,
  },
  subtitle: {
    maxWidth: 320,
  },
  form: {
    gap: spacing.md,
  },
  forgot: {
    alignSelf: 'flex-end',
    marginBottom: spacing.xs,
  },
});
