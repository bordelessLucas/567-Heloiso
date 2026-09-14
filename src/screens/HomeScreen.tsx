import { Pressable, StyleSheet, View } from 'react-native';

import { Container, Typography } from '@/src/components';
import { colors, radii, spacing } from '@/src/theme/tokens';

const MODULES = [
  { id: 'funds', title: 'Fundos', description: 'Buscar e analisar FIIs' },
  { id: 'portfolio', title: 'Carteira', description: 'Acompanhar sua posição' },
  { id: 'learn', title: 'Aprender', description: 'Educação do zero ao avançado' },
  { id: 'planner', title: 'Planner', description: 'Desafios de poupança' },
] as const;

export function HomeScreen() {
  const handleOpenModule = (_moduleId: string) => {};
  const handleOpenProfile = () => {};

  return (
    <Container scroll contentStyle={styles.content}>
      <View style={styles.navbar}>
        <View>
          <Typography variant="caption" color={colors.textMuted}>
            Mercado FiiS
          </Typography>
          <Typography variant="h2">Olá, investidor</Typography>
        </View>
        <Pressable onPress={handleOpenProfile} style={styles.avatar}>
          <Typography variant="label" color={colors.black}>
            Perfil
          </Typography>
        </Pressable>
      </View>

      <View style={styles.hero}>
        <Typography variant="h1">Organize, entenda e acompanhe FIIs</Typography>
        <Typography variant="body" color={colors.textMuted}>
          Informações claras para você decidir com mais segurança — sem recomendações de
          compra ou venda.
        </Typography>
      </View>

      <View style={styles.section}>
        <Typography variant="h3">Módulos</Typography>
        <View style={styles.grid}>
          {MODULES.map((module) => (
            <Pressable
              key={module.id}
              onPress={() => handleOpenModule(module.id)}
              style={styles.card}
            >
              <Typography variant="bodyStrong">{module.title}</Typography>
              <Typography variant="caption" color={colors.textMuted}>
                {module.description}
              </Typography>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.skeletonBlock}>
        <Typography variant="h3">Destaques</Typography>
        <View style={styles.skeletonRow} />
        <View style={[styles.skeletonRow, styles.skeletonShort]} />
        <View style={styles.skeletonRow} />
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatar: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
  },
  hero: {
    gap: spacing.sm,
  },
  section: {
    gap: spacing.md,
  },
  grid: {
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  skeletonBlock: {
    gap: spacing.md,
  },
  skeletonRow: {
    height: 14,
    borderRadius: radii.sm,
    backgroundColor: colors.border,
    width: '100%',
  },
  skeletonShort: {
    width: '62%',
  },
});
