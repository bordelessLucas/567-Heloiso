import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Link } from 'expo-router';

import { Button, Container, Input, Typography } from '@/src/components';
import { colors, spacing } from '@/src/theme/tokens';

export function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {};
  const handleForgotPassword = () => {};

  return (
    <Container keyboardAware scroll contentStyle={styles.content}>
      <View style={styles.brandBlock}>
        <Typography variant="display" color={colors.black}>
          Mercado FiiS
        </Typography>
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
        />
        <Input
          label="Senha"
          isPassword
          autoComplete="password"
          placeholder="Sua senha"
          value={password}
          onChangeText={setPassword}
        />

        <Pressable onPress={handleForgotPassword} style={styles.forgot}>
          <Typography variant="label" color={colors.black}>
            Esqueci minha senha
          </Typography>
        </Pressable>

        <Button label="Entrar" onPress={handleLogin} />

        <Link href="/(auth)/register" asChild>
          <Button label="Criar conta" variant="outline" />
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
