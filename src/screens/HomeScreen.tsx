import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { router, type Href } from 'expo-router';

import { Container, Typography } from '@/src/components';
import { AllocationRing } from '@/src/components/AllocationRing';
import { HomeStreakCard } from '@/src/components/HomeStreakCard';
import { ModuleIcon } from '@/src/components/ModuleIcon';
import {
  ModulePreviewCard,
  type ModulePreviewData,
} from '@/src/components/ModulePreviewCard';
import { DEMO_RECOMMENDATIONS, isDemoAccount } from '@/src/data/mocks/demo.account';
import { useAuth } from '@/src/hooks/useAuth';
import { usePlanner } from '@/src/hooks/usePlanner';
import { usePortfolio } from '@/src/hooks/usePortfolio';
import { useFundsCatalog } from '@/src/hooks/useFundsCatalog';
import { colors, radii, spacing, type AppColors } from '@/src/theme/tokens';
import { useAppTheme } from '@/src/hooks/useAppTheme';
import { formatBrl, formatPercent } from '@/src/utils/format';

export function HomeScreen() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { profile, user } = useAuth();
  const { challenge, loading: plannerLoading } = usePlanner();
  const { dashboard, loading: portfolioLoading } = usePortfolio();
  const { popular, boards, loading: fundsLoading } = useFundsCatalog();

  const displayName =
    profile?.displayName?.trim() ||
    user?.displayName?.trim() ||
    'investidor';
  const email = profile?.email ?? user?.email;
  const demo = isDemoAccount(email);

  const topFund = popular[0];
  const topDy = boards[0]?.entries[0];

  const previews = useMemo<ModulePreviewData[]>(() => {
    const portfolioHeadline = dashboard?.summary.holdingsCount
      ? `${formatBrl(dashboard.totalMarketValue)} · ${dashboard.summary.holdingsCount} ativos`
      : 'Monte sua primeira posição';

    const portfolioDetail = dashboard
      ? `Resultado: ${formatPercent(dashboard.totalPnlPercent)} no snapshot`
      : 'Sem posições ainda — comece com calma';

    // Carteira em destaque logo após o Planner (2º módulo da Home).
    return [
      {
        id: 'portfolio',
        title: 'Carteira',
        href: '/(tabs)/portfolio',
        icon: 'portfolio' as const,
        eyebrow: 'Sua posição',
        headline: portfolioHeadline,
        detail: portfolioDetail,
      },
      {
        id: 'funds',
        title: 'Fundos',
        href: '/(tabs)/funds',
        icon: 'funds' as const,
        eyebrow: 'Explorar FIIs',
        headline: topFund
          ? `${topFund.ticker} · ${formatBrl(topFund.sharePrice)}`
          : 'Busca e indicadores',
        detail: topFund
          ? `DY ${formatPercent(topFund.dividendYield)} · toque para analisar`
          : 'Listagens claras, sem jargão desnecessário',
      },
      {
        id: 'learn',
        title: 'Aprender',
        href: '/(tabs)/learn',
        icon: 'learn' as const,
        eyebrow: 'Do zero ao avançado',
        headline: 'O que é um FII?',
        detail: 'Trilhas curtas para mexer sem medo',
      },
      {
        id: 'rankings',
        title: 'Rankings',
        href: '/rankings',
        icon: 'rankings' as const,
        eyebrow: 'Descoberta rápida',
        headline: topDy ? `#1 DY · ${topDy.ticker}` : 'Maiores indicadores',
        detail: topDy
          ? `${topDy.formattedValue} no snapshot atual`
          : 'Compare fundos por DY, liquidez e PL',
      },
    ];
  }, [dashboard, topFund, topDy]);

  const loading = plannerLoading || portfolioLoading || fundsLoading;

  return (
    <Container scroll contentStyle={styles.content}>
      <View style={styles.navbar}>
        <View style={styles.navText}>
          <Typography variant="caption" color={colors.textMuted}>
            Mercado FiiS
          </Typography>
          <Typography variant="h2">Olá, {displayName}</Typography>
          {demo ? (
            <Typography variant="caption" color={colors.primaryDark}>
              Conta demo com dados para teste
            </Typography>
          ) : null}
        </View>
        <Pressable
          onPress={() => router.push('/(tabs)/profile' as Href)}
          style={styles.avatar}
        >
          <ModuleIcon name="profile" size={16} tone="yellow" />
        </Pressable>
      </View>

      <View style={styles.hero}>
        <Typography variant="h1">Finanças claras. Decisão sua.</Typography>
        <Typography variant="body" color={colors.textMuted}>
          Comece pelo Planner ou explore os módulos abaixo — tudo em linguagem simples.
        </Typography>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} />
      ) : (
        <HomeStreakCard challenge={challenge} />
      )}

      {!loading && dashboard && dashboard.summary.holdingsCount > 0 ? (
        <AllocationRing
          positions={dashboard.positions}
          variant="hero"
          title="Sua carteira agora"
          onPress={() => router.push('/(tabs)/portfolio' as Href)}
        />
      ) : null}

      <View style={styles.section}>
        <Typography variant="h3">Explorar</Typography>
        <View style={styles.grid}>
          {previews.map((module) => (
            <ModulePreviewCard key={module.id} module={module} />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHead}>
          <ModuleIcon name="funds" size={18} tone="light" />
          <Typography variant="h3">Para estudar agora</Typography>
        </View>
        <Typography variant="caption" color={colors.textMuted}>
          Sugestões educacionais — não são ordens de compra ou venda.
        </Typography>
        <View style={styles.recs}>
          {DEMO_RECOMMENDATIONS.map((item) => (
            <Pressable
              key={item.ticker}
              style={styles.recCard}
              onPress={() => router.push(`/fund/${item.ticker}` as Href)}
            >
              <View style={styles.recHead}>
                <View style={styles.recTitle}>
                  <ModuleIcon name="rankings" size={16} tone="yellow" />
                  <Typography variant="bodyStrong">{item.ticker}</Typography>
                </View>
                <Typography variant="caption" color={colors.primaryDark}>
                  {item.highlight}
                </Typography>
              </View>
              <Typography variant="caption" color={colors.textMuted}>
                {item.name}
              </Typography>
              <Typography variant="body">{item.reason}</Typography>
            </Pressable>
          ))}
        </View>
      </View>
    </Container>
  );
}

function createStyles(colors: AppColors) { return StyleSheet.create({
  content: {
    gap: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  navbar: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  navText: {
    flex: 1,
    gap: 2,
  },
  avatar: {
    borderRadius: radii.full,
  },
  hero: {
    gap: spacing.sm,
  },
  section: {
    gap: spacing.md,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  grid: {
    gap: spacing.md,
  },
  recs: {
    gap: spacing.sm,
  },
  recCard: {
    backgroundColor: colors.surfaceWarm,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  recHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  recTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
}); }
