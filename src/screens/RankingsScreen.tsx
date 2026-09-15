import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { router, type Href } from 'expo-router';
import { useEffect, useState } from 'react';

import { Container, ScreenHeader, Typography } from '@/src/components';
import { RankingCards } from '@/src/components/RankingCards';
import { FundListItem } from '@/src/components/FundListItem';
import type { RankingBoard } from '@/src/domain/ranking';
import { listFunds, listRankingBoards } from '@/src/services/funds.service';
import type { FundSummary } from '@/src/domain/fund';
import { colors, spacing } from '@/src/theme/tokens';

export function RankingsScreen() {
  const [boards, setBoards] = useState<RankingBoard[]>([]);
  const [funds, setFunds] = useState<FundSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void Promise.all([listRankingBoards(), listFunds()]).then(([nextBoards, nextFunds]) => {
      setBoards(nextBoards);
      setFunds(nextFunds);
      setLoading(false);
    });
  }, []);

  return (
    <Container scroll contentStyle={styles.content} safeBottom>
      <ScreenHeader
        title="Rankings de FIIs"
        subtitle="Classificações do snapshot mock — mesma lógica pronta para dados ao vivo."
        showBack
      />

      {loading ? (
        <ActivityIndicator color={colors.primary} />
      ) : (
        <>
          <RankingCards boards={boards} />
          <View style={styles.section}>
            <Typography variant="h3">Todos os fundos do snapshot</Typography>
            <View style={styles.list}>
              {funds.map((fund) => (
                <FundListItem
                  key={fund.id}
                  fund={fund}
                  onPress={() => router.push(`/fund/${fund.ticker}` as Href)}
                />
              ))}
            </View>
          </View>
        </>
      )}
    </Container>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  section: {
    gap: spacing.md,
  },
  list: {
    gap: spacing.sm,
  },
});
