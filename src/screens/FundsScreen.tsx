import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { useMemo } from 'react';
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
import type { ModuleIconName } from '@/src/components/ModuleIcon';
import { useFundsCatalog } from '@/src/hooks/useFundsCatalog';
import { usePlanner } from '@/src/hooks/usePlanner';
import { usePortfolio } from '@/src/hooks/usePortfolio';
import { colors, radii, shadows, spacing, type AppColors } from '@/src/theme/tokens';
import { useAppTheme } from '@/src/hooks/useAppTheme';
import { formatBrl, formatPercent } from '@/src/utils/format';

interface FundToolCard {
  id: string;
  title: string;
  detail: string;
  href: string;
  icon: ModuleIconName;
}

export function FundsScreen() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
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
  const { dashboard, loading: portfolioLoading } = usePortfolio();
  const { challenge, loading: plannerLoading } = usePlanner();

  const list = query.trim() || segment !== 'all' ? funds : popular;
  const hasQuery = query.trim().length > 0 || segment !== 'all';

  const tools: FundToolCard[] = [
    {
      id: 'tesouro',
      title: 'Comparar com Tesouro IPCA+',
      detail: 'Escolha um FII e veja DY × taxa real — só para estudo.',
      href: '/tools/tesouro-ipca',
      icon: 'funds',
    },
    {
      id: 'rankings',
      title: 'Rankings',
      detail: 'Ordene por DY, liquidez, PL ou P/VP com contexto didático.',
      href: '/rankings',
      icon: 'rankings',
    },
    {
      id: 'portfolio',
      title: 'Gerenciador de carteira',
      detail: 'Sua posição pessoal — separada dos dados públicos dos FIIs.',
      href: '/(tabs)/portfolio',
      icon: 'portfolio',
    },
  ];

  return (
    <Container scroll contentStyle={styles.content}>
      <ScreenHeader
        title="Fundos Imobiliários"
        subtitle="Consulte FIIs, compare indicadores e use as ferramentas para organizar o estudo."
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
            {hasQuery ? 'Resultados' : 'Mais buscados'}
          </Typography>
          <Pressable onPress={() => router.push('/rankings' as Href)}>
            <Typography variant="label" color={colors.primaryDark}>
              Rankings →
            </Typography>
          </Pressable>
        </View>

        {loading ? (
          <View style={styles.stateCard}>
            <ActivityIndicator color={colors.primary} />
            <Typography variant="caption" color={colors.textMuted}>
              Carregando dados de mercado...
            </Typography>
          </View>
        ) : list.length === 0 ? (
          <View style={styles.stateCard}>
            <Typography variant="h3">Nenhum FII encontrado</Typography>
            <Typography variant="body" color={colors.textMuted}>
              Ajuste a busca ou o segmento. A base inicial ainda e controlada no MVP.
            </Typography>
            <Pressable
              style={styles.clearBtn}
              onPress={() => {
                setQuery('');
                setSegment('all');
              }}
            >
              <Typography variant="label" color={colors.black}>
                Limpar filtros
              </Typography>
            </Pressable>
          </View>
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
        <Typography variant="h3">Ferramentas</Typography>
        <Typography variant="caption" color={colors.textMuted}>
          Fluxos completos — não só atalhos.
        </Typography>
        <View style={styles.tools}>
          {tools.map((tool) => (
            <Pressable
              key={tool.id}
              style={styles.tool}
              onPress={() => router.push(tool.href as Href)}
            >
              <ModuleIcon name={tool.icon} size={18} tone="yellow" />
              <View style={styles.toolLabel}>
                <Typography variant="bodyStrong">{tool.title}</Typography>
                <Typography variant="caption" color={colors.textMuted}>
                  {tool.detail}
                </Typography>
              </View>
              <Typography variant="caption" color={colors.primaryDark}>
                Abrir →
              </Typography>
            </Pressable>
          ))}

          <Pressable
            style={styles.featureCard}
            onPress={() => router.push('/planner?from=funds' as Href)}
          >
            {plannerLoading ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <>
                <View style={styles.bridgeHead}>
                  <ModuleIcon name="planner" size={18} tone="yellow" />
                  <Typography variant="bodyStrong">Planner financeiro</Typography>
                </View>
                <Typography variant="caption" color={colors.textMuted}>
                  {challenge
                    ? `Meta ativa: ${challenge.objective}. Sequência ${challenge.streak} dias — o planner não movimenta dinheiro.`
                    : 'Monte meta e check-ins de poupança após estudar os fundos. O planner só organiza o hábito.'}
                </Typography>
                <Typography variant="label" color={colors.primaryDark}>
                  {challenge ? 'Continuar planejamento →' : 'Começar planner →'}
                </Typography>
              </>
            )}
          </Pressable>
        </View>
      </View>

      <View style={styles.section}>
        <Typography variant="h3">Sua ponte com a carteira</Typography>
        <Pressable
          style={styles.featureCard}
          onPress={() => router.push('/(tabs)/portfolio' as Href)}
        >
          {portfolioLoading ? (
            <ActivityIndicator color={colors.primary} />
          ) : dashboard && dashboard.summary.holdingsCount > 0 ? (
            <>
              <Typography variant="caption" color={colors.textMuted}>
                Posição pessoal (separada dos dados públicos)
              </Typography>
              <Typography variant="h3" color={colors.black}>
                {formatBrl(dashboard.totalMarketValue)}
              </Typography>
              <Typography
                variant="body"
                color={
                  dashboard.totalPnlAmount >= 0 ? colors.success : colors.danger
                }
              >
                {dashboard.totalPnlAmount >= 0 ? '+' : ''}
                {formatPercent(dashboard.totalPnlPercent)} ·{' '}
                {dashboard.summary.holdingsCount} ativos
              </Typography>
              <Typography variant="label" color={colors.primaryDark}>
                Abrir gerenciador →
              </Typography>
            </>
          ) : (
            <>
              <Typography variant="h3">Carteira ainda vazia</Typography>
              <Typography variant="body" color={colors.textMuted}>
                Estude os FIIs aqui. Quando quiser organizar posições, use o gerenciador —
                sem misturar com os dados públicos do fundo.
              </Typography>
              <Typography variant="label" color={colors.primaryDark}>
                Ir à carteira →
              </Typography>
            </>
          )}
        </Pressable>
      </View>

      <View style={styles.section}>
        <Typography variant="h3">Rankings de FIIs</Typography>
        <RankingCards boards={boards} />
      </View>
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
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  list: {
    gap: spacing.sm,
  },
  stateCard: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.sm,
    alignItems: 'flex-start',
    ...shadows.card,
  },
  clearBtn: {
    marginTop: spacing.xs,
    backgroundColor: colors.primary,
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  tools: {
    gap: spacing.sm,
  },
  tool: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceWarm,
    borderRadius: radii.md,
    padding: spacing.md,
    ...shadows.card,
  },
  toolLabel: {
    flex: 1,
    gap: 2,
  },
  featureCard: {
    backgroundColor: colors.surfaceFeature,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.sm,
    ...shadows.card,
  },
  bridgeHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
}); }
