import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, StyleSheet, View } from 'react-native';
import { router, type Href } from 'expo-router';

import { Container, ScreenHeader, Typography } from '@/src/components';
import type { NewsItem } from '@/src/domain/news';
import { listNews } from '@/src/services/news.service';
import { colors, radii, shadows, spacing } from '@/src/theme/tokens';

function formatPublishedAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function NewsScreen() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void listNews().then((next) => {
      setItems(next);
      setLoading(false);
    });
  }, []);

  const styles = useMemo(() => StyleSheet.create({
    content: { gap: spacing.lg, paddingBottom: spacing.xxl },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    card: {
      backgroundColor: colors.surfaceWarm,
      borderRadius: radii.lg,
      padding: spacing.md,
      gap: spacing.xs,
      ...shadows.card,
    },
    tickers: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.xs },
    tickerChip: {
      backgroundColor: colors.surfaceElevated,
      borderRadius: radii.full,
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
    },
  }), []);

  if (loading) {
    return (
      <Container contentStyle={styles.center} safeBottom>
        <ActivityIndicator color={colors.primary} size="large" />
      </Container>
    );
  }

  return (
    <Container scroll contentStyle={styles.content} safeBottom>
      <ScreenHeader
        title="Notícias"
        subtitle="Conteúdo estruturado sobre FIIs e mercado imobiliário — educativo, sem ordem de investimento."
        showBack
      />

      {items.length === 0 ? (
        <View style={styles.card}>
          <Typography variant="h3">Nenhuma notícia carregada</Typography>
          <Typography variant="body" color={colors.textMuted}>
            A fonte estruturada está vazia no momento.
          </Typography>
        </View>
      ) : (
        items.map((item) => (
          <Pressable
            key={item.id}
            style={styles.card}
            onPress={() => {
              if (item.url) {
                void Linking.openURL(item.url);
              }
            }}
          >
            <Typography variant="caption" color={colors.textMuted}>
              {item.source} · {formatPublishedAt(item.publishedAt)}
            </Typography>
            <Typography variant="bodyStrong">{item.title}</Typography>
            <Typography variant="body" color={colors.textMuted}>
              {item.summary}
            </Typography>
            <View style={styles.tickers}>
              {item.relatedTickers.map((ticker) => (
                <Pressable
                  key={ticker}
                  style={styles.tickerChip}
                  onPress={() => router.push(`/fund/${ticker}` as Href)}
                >
                  <Typography variant="caption">{ticker}</Typography>
                </Pressable>
              ))}
            </View>
          </Pressable>
        ))
      )}
    </Container>
  );
}
