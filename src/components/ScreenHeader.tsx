import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

import { Typography } from '@/src/components/Typography';
import { colors, spacing } from '@/src/theme/tokens';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
}

export function ScreenHeader({ title, subtitle, showBack = false }: ScreenHeaderProps) {
  return (
    <View style={styles.wrap}>
      {showBack ? (
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.back}>
          <Typography variant="label" color={colors.black}>
            Voltar
          </Typography>
        </Pressable>
      ) : null}
      <Typography variant="h1">{title}</Typography>
      {subtitle ? (
        <Typography variant="body" color={colors.textMuted}>
          {subtitle}
        </Typography>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  back: {
    alignSelf: 'flex-start',
    marginBottom: spacing.xs,
  },
});
