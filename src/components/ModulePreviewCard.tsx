import { Pressable, StyleSheet, View } from 'react-native';
import { useMemo } from 'react';
import { router, type Href } from 'expo-router';

import { ModuleIcon, type ModuleIconName } from '@/src/components/ModuleIcon';
import { Typography } from '@/src/components/Typography';
import { colors, radii, shadows, spacing, type AppColors } from '@/src/theme/tokens';
import { useAppTheme } from '@/src/hooks/useAppTheme';

export interface ModulePreviewData {
  id: string;
  title: string;
  href: string;
  eyebrow: string;
  headline: string;
  detail: string;
  icon: ModuleIconName;
  /** Mantido por compatibilidade; atalhos usam sempre o amarelo padrão. */
  accent?: 'primary' | 'soft';
}

interface ModulePreviewCardProps {
  module: ModulePreviewData;
}

export function ModulePreviewCard({ module }: ModulePreviewCardProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <Pressable
      onPress={() => router.push(module.href as Href)}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.header}>
        <ModuleIcon name={module.icon} size={20} tone="yellow" />
        <View style={styles.headerText}>
          <Typography variant="caption" color={colors.textMuted}>
            {module.eyebrow}
          </Typography>
          <Typography variant="h3" color={colors.black}>
            {module.title}
          </Typography>
        </View>
      </View>

      <Typography variant="bodyStrong" color={colors.black}>
        {module.headline}
      </Typography>
      <Typography variant="caption" color={colors.textMuted}>
        {module.detail}
      </Typography>

      <View style={styles.cta}>
        <Typography variant="label" color={colors.primaryDark}>
          Abrir →
        </Typography>
      </View>
    </Pressable>
  );
}

function createStyles(colors: AppColors) { return StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceWarm,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.xs,
    minHeight: 140,
    ...shadows.card,
  },
  pressed: {
    opacity: 0.94,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  cta: {
    marginTop: spacing.sm,
  },
}); }
