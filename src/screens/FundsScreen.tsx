import { Pressable, StyleSheet, View } from 'react-native';
import { router, type Href } from 'expo-router';

import {
  Container,
  FundListItem,
  Input,
  ModuleIcon,
  RankingCards,
  ScreenHeader,
  SegmentChips,
  Typography,
} from '@/src/components';
import { useFundsCatalog } from '@/src/hooks/useFundsCatalog';
import { colors, radii, spacing } from '@/src/theme/tokens';

export function FundsScreen() {
  const {
    query,
    setQuery,
    segment,
    setSegment,
    segments,
    funds,
    popular,
    boards,
    loading,
  } = useFundsCatalog();

  const list = query.trim() || segment !== 'all' ? funds : popular;

  return (
    <Container scroll contentStyle={styles.content}>
      <ScreenHeader
        title="Fundos Imobiliários"
        subtitle="Explore FIIs como em um hub de investimentos — dados mock estáticos no MVP."
      />

      <Input
        placeholder="Buscar ticker, nome ou segmento"
        value={query}
        onChangeText={setQuery}
        autoCapitalize="characters"
      />

      <SegmentChips
        segments={segments}
        selected={segment}
        onSelect={(id) => setSegment(id as typeof segment)}
      />

      <View style={styles.section}>
        <View style={styles.sectionHead}>
          <Typography variant="h3">
            {query.trim() || segment !== 'all' ? 'Resultados' : 'Mais buscados'}
          </Typography>
          <Pressable onPress={() => router.push('/rankings' as Href)}>
            <Typography variant="label">Ver todos</Typography>
          </Pressable>
        </View>

        {loading ? (
          <Typography variant="caption" color={colors.textMuted}>
            Carregando snapshot...
          </Typography>
        ) : (
          <View style={styles.list}>
            {list.map((fund) => (
              <FundListItem
                key={fund.id}
                fund={fund}
                onPress={() => router.push(`/fund/${fund.ticker}` as Href)}
              />
            ))}
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Typography variant="h3">Rankings de FIIs</Typography>
        <RankingCards boards={boards} />
      </View>

      <View style={styles.section}>
        <Typography variant="h3">Ferramentas</Typography>
        <View style={styles.tools}>
          {(
            [
              {
                label: 'Gerenciador de carteira',
                href: '/(tabs)/portfolio',
                icon: 'portfolio' as const,
              },
              { label: 'Rankings', href: '/rankings', icon: 'rankings' as const },
              {
                label: 'Comparar com Tesouro IPCA+',
                href: '/fund/HGLG11',
                icon: 'funds' as const,
              },
              {
                label: 'Planner de poupança',
                href: '/planner',
                icon: 'planner' as const,
              },
            ] as const
          ).map((tool) => (
            <Pressable
              key={tool.label}
              style={styles.tool}
              onPress={() => router.push(tool.href as Href)}
            >
              <ModuleIcon name={tool.icon} size={18} tone="yellow" />
              <View style={styles.toolLabel}>
                <Typography variant="bodyStrong">{tool.label}</Typography>
              </View>
              <Typography variant="caption" color={colors.primaryDark}>
                Abrir →
              </Typography>
            </Pressable>
          ))}
        </View>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  section: {
    gap: spacing.sm,
  },
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  list: {
    gap: spacing.sm,
  },
  tools: {
    gap: spacing.sm,
  },
  tool: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  toolLabel: {
    flex: 1,
  },
});
