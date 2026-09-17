import { StyleSheet, View } from 'react-native';
import { useMemo } from 'react';

import { Container, EmptyState, ScreenHeader, Typography } from '@/src/components';
import { colors, radii, spacing, type AppColors } from '@/src/theme/tokens';
import { useAppTheme } from '@/src/hooks/useAppTheme';

interface ModuleScreenProps {
  title: string;
  subtitle: string;
  emptyTitle: string;
  emptyDescription: string;
  showBack?: boolean;
  sections?: Array<{ title: string; items: string[] }>;
}

export function ModuleScreen({
  title,
  subtitle,
  emptyTitle,
  emptyDescription,
  showBack = false,
  sections = [],
}: ModuleScreenProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <Container scroll contentStyle={styles.content}>
      <ScreenHeader title={title} subtitle={subtitle} showBack={showBack} />
      <EmptyState title={emptyTitle} description={emptyDescription} />

      {sections.map((section) => (
        <View key={section.title} style={styles.section}>
          <Typography variant="h3">{section.title}</Typography>
          {section.items.map((item) => (
            <View key={item} style={styles.row}>
              <Typography variant="body">{item}</Typography>
            </View>
          ))}
        </View>
      ))}
    </Container>
  );
}

function createStyles(colors: AppColors) { return StyleSheet.create({
  content: {
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  section: {
    gap: spacing.sm,
  },
  row: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.md,
    padding: spacing.md,
  },
}); }
