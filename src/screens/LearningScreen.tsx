import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Container, EmptyState, ScreenHeader, Typography } from '@/src/components';
import type { LearningTrack } from '@/src/domain/learning';
import { listLearningTracks } from '@/src/services/learning.service';
import { colors, radii, spacing } from '@/src/theme/tokens';

export function LearningScreen() {
  const [tracks, setTracks] = useState<LearningTrack[]>([]);

  useEffect(() => {
    void listLearningTracks().then(setTracks);
  }, []);

  return (
    <Container scroll contentStyle={styles.content}>
      <ScreenHeader
        title="Aprender"
        subtitle="Conteúdo voluntário para quem está começando — não é obrigatório para usar o app."
      />

      {tracks.length === 0 ? (
        <EmptyState
          title="Trilhas em preparação"
          description="O conteúdo didático será carregado em breve."
        />
      ) : (
        <View style={styles.list}>
          {tracks.map((track) => (
            <View key={track.id} style={styles.card}>
              <Typography variant="bodyStrong">{track.title}</Typography>
              <Typography variant="caption" color={colors.textMuted}>
                {track.description}
              </Typography>
            </View>
          ))}
        </View>
      )}
    </Container>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  list: {
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
});
