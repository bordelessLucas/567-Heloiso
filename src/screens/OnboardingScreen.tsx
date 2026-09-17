import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

import { Button, Container, Typography } from '@/src/components';
import type { InvestmentExperience } from '@/src/domain/onboarding';
import { useAppTheme } from '@/src/hooks/useAppTheme';
import { useOnboarding } from '@/src/hooks/useOnboarding';
import { radii, spacing } from '@/src/theme/tokens';

const OPTIONS: Array<{ id: InvestmentExperience; title: string; description: string }> = [
  {
    id: 'beginner',
    title: 'Estou começando agora',
    description: 'Quero aprender os fundamentos e avançar com segurança.',
  },
  {
    id: 'experienced',
    title: 'Já conheço investimentos',
    description: 'Já invisto ou conheço conceitos e quero ir mais direto ao ponto.',
  },
];

export function OnboardingScreen() {
  const { colors } = useAppTheme();
  const { complete } = useOnboarding();
  const [selected, setSelected] = useState<InvestmentExperience | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleContinue() {
    if (!selected) return;
    setSaving(true);
    try {
      await complete(selected);
      router.replace('/(tabs)');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Container safeBottom contentStyle={styles.content}>
      <View style={styles.intro}>
        <View style={[styles.eyebrow, { backgroundColor: colors.surfaceWarm }]}>
          <Typography variant="label" color={colors.primaryDark}>Seu ponto de partida</Typography>
        </View>
        <Typography variant="display">Como você se sente sobre investimentos?</Typography>
        <Typography variant="body" color={colors.textMuted}>
          Sua resposta ajuda a preparar uma experiência mais clara. Você poderá revisar todo o conteúdo depois.
        </Typography>
      </View>

      <View style={styles.options}>
        {OPTIONS.map((option) => {
          const active = selected === option.id;
          return (
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ checked: active }}
              key={option.id}
              onPress={() => setSelected(option.id)}
              style={({ pressed }) => [
                styles.option,
                { backgroundColor: colors.surfaceElevated, borderColor: active ? colors.primary : colors.border },
                active && { backgroundColor: colors.surfaceWarm },
                pressed && styles.pressed,
              ]}
            >
              <View style={[styles.radio, { borderColor: active ? colors.primaryDark : colors.border }]}>
                {active ? <View style={[styles.radioDot, { backgroundColor: colors.primary }]} /> : null}
              </View>
              <View style={styles.optionText}>
                <Typography variant="bodyStrong">{option.title}</Typography>
                <Typography variant="caption" color={colors.textMuted}>{option.description}</Typography>
              </View>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.footer}>
        <Typography variant="caption" color={colors.textMuted}>
          Por enquanto, esta escolha fica somente neste aparelho.
        </Typography>
        <Button label="Continuar" disabled={!selected} loading={saving} onPress={() => void handleContinue()} />
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  content: { justifyContent: 'space-between', gap: spacing.xl, paddingVertical: spacing.xl },
  intro: { gap: spacing.md },
  eyebrow: { alignSelf: 'flex-start', borderRadius: radii.full, paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  options: { gap: spacing.md },
  option: { minHeight: 96, flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderWidth: 1.5, borderRadius: radii.lg, padding: spacing.lg },
  optionText: { flex: 1, gap: spacing.xs },
  radio: { width: 24, height: 24, borderWidth: 2, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 12, height: 12, borderRadius: 6 },
  pressed: { opacity: 0.88 },
  footer: { gap: spacing.md },
});
