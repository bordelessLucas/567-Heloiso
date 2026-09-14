import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Link } from 'expo-router';

import { Button, Container, Input, Typography } from '@/src/components';
import { colors, spacing } from '@/src/theme/tokens';

export function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = () => {};

  return (
    <Container keyboardAware scroll contentStyle={styles.content}>
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
        />

        <Button label="Criar conta" onPress={handleRegister} />

        <Link href="/(auth)/login" asChild>
          <Button label="Já tenho conta" variant="outline" />
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
