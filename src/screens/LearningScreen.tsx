import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { router, type Href, useFocusEffect } from 'expo-router';
import Animated, {
  FadeInDown,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Container, ScreenHeader, Typography } from '@/src/components';
import type { LearningTrack, LearningTrackId } from '@/src/domain/learning';
import { LearningCover } from '@/src/screens/LearningCover';
import {
  getCompletedLearningTrackIds,
  listLearningTracks,
} from '@/src/services/learning.service';
import { colors, radii, shadows, spacing, type AppColors } from '@/src/theme/tokens';
import { useAppTheme } from '@/src/hooks/useAppTheme';

export function LearningScreen() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [tracks, setTracks] = useState<LearningTrack[]>([]);
  const [completedIds, setCompletedIds] = useState<LearningTrackId[]>([]);
  const { width } = useWindowDimensions();
  const cardWidth = Math.max(1, width - spacing.lg * 2 - 28 - spacing.sm);

  const loadLearning = useCallback(() => {
    void Promise.all([listLearningTracks(), getCompletedLearningTrackIds()]).then(
      ([nextTracks, nextCompletedIds]) => {
        setTracks(nextTracks);
        setCompletedIds(nextCompletedIds);
      },
    );
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadLearning();
    }, [loadLearning]),
  );

  const progress = useMemo(
    () => (tracks.length ? Math.round((completedIds.length / tracks.length) * 100) : 0),
    [completedIds.length, tracks.length],
  );

  return (
    <Container scroll contentStyle={styles.content}>
      <ScreenHeader
        title="Aprender"
        subtitle="Uma trilha prática para entender FIIs com calma e tomar decisões mais conscientes."
      />

      <View style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <View style={styles.progressText}>
            <Typography variant="label" color={colors.primaryDark}>
              SUA TRILHA
            </Typography>
            <Typography variant="h2">
              {completedIds.length} de {tracks.length} módulos concluídos
            </Typography>
          </View>
          <View style={styles.progressValue}>
            <Typography variant="bodyStrong">{progress}%</Typography>
          </View>
        </View>
        <LearningProgressBar progress={progress} />
        <Typography variant="caption" color={colors.textMuted}>
          Avance no seu ritmo. Todos os módulos permanecem disponíveis para consulta.
        </Typography>
      </View>

      <View style={styles.sectionHeader}>
        <Typography variant="h2">Do zero à prática</Typography>
        <Typography variant="caption" color={colors.textMuted}>
          Toque em uma capa para abrir o módulo.
        </Typography>
      </View>

      <View style={styles.timeline}>
        {tracks.map((track, index) => {
          const completed = completedIds.includes(track.id);
          const last = index === tracks.length - 1;

          return (
            <Animated.View
              key={track.id}
              entering={FadeInDown.delay(index * 55).duration(360)}
              layout={LinearTransition.duration(280)}
              style={styles.timelineItem}
            >
              <View style={styles.rail} pointerEvents="none">
                <View style={[styles.step, completed && styles.stepCompleted]}>
                  <Typography variant="caption" color={completed ? colors.surfaceElevated : colors.textMuted}>
                    {completed ? '✓' : track.order}
                  </Typography>
                </View>
                {!last ? <View style={[styles.connector, completed && styles.connectorCompleted]} /> : null}
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Abrir módulo ${track.order}: ${track.title}${completed ? ', concluído' : ''}`}
                onPress={() => router.push(`/learn/${track.id}` as Href)}
                style={({ pressed }) => [
                  styles.moduleCard,
                  completed && styles.moduleCardCompleted,
                  pressed && styles.pressed,
                ]}
              >
                <LearningCover
                  accessibilityLabel={track.coverAlt}
                  source={track.cover}
                  height={Math.round(cardWidth / track.coverAspectRatio)}
                />
                <View style={styles.cardContent}>
                  <View style={styles.cardTopline}>
                    <Typography variant="caption" color={completed ? colors.success : colors.primaryDark}>
                      {completed ? 'CONCLUÍDO' : `MÓDULO ${track.order}`}
                    </Typography>
                    <Typography variant="caption" color={colors.textMuted}>
                      {track.lessons.length} leituras
                    </Typography>
                  </View>
                  <Typography variant="h3">{track.title}</Typography>
                  <Typography numberOfLines={2} variant="caption" color={colors.textMuted}>
                    {track.description}
                  </Typography>
                  <Typography variant="label" color={completed ? colors.success : colors.primaryDark}>
                    {completed ? 'Revisar módulo →' : 'Começar módulo →'}
                  </Typography>
                </View>
              </Pressable>
            </Animated.View>
          );
        })}
      </View>

      <View style={styles.disclaimer}>
        <Typography variant="caption" color={colors.textMuted}>
          Conteúdo educacional. Não constitui recomendação de compra, venda ou alocação.
        </Typography>
      </View>
    </Container>
  );
}

function LearningProgressBar({ progress }: { progress: number }) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const progressValue = useSharedValue(0);

  useEffect(() => {
    progressValue.value = withTiming(progress, { duration: 480 });
  }, [progress, progressValue]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${progressValue.value}%`,
  }));

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: progress }}
      style={styles.progressRail}
    >
      <Animated.View style={[styles.progressFill, fillStyle]} />
    </View>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
  content: { gap: spacing.lg, paddingBottom: spacing.xxl },
  progressCard: {
    backgroundColor: colors.surfaceFeature,
    borderRadius: radii.lg,
    gap: spacing.sm,
    padding: spacing.md,
    ...shadows.card,
  },
  progressHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  progressText: { flex: 1, gap: spacing.xs },
  progressValue: {
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.full,
    justifyContent: 'center',
    minHeight: 42,
    minWidth: 54,
    paddingHorizontal: spacing.sm,
  },
  progressRail: {
    backgroundColor: 'rgba(13, 13, 13, 0.12)',
    borderRadius: radii.full,
    height: 8,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: colors.primaryDark,
    borderRadius: radii.full,
    height: '100%',
  },
  sectionHeader: { gap: spacing.xs },
  timeline: { gap: spacing.md },
  timelineItem: { flexDirection: 'row', gap: spacing.sm },
  rail: { alignItems: 'center', width: 28 },
  step: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: radii.full,
    borderWidth: 1,
    height: 28,
    justifyContent: 'center',
    width: 28,
    zIndex: 1,
  },
  stepCompleted: { backgroundColor: colors.success, borderColor: colors.success },
  connector: { backgroundColor: colors.border, flex: 1, marginVertical: -1, width: 2 },
  connectorCompleted: { backgroundColor: colors.success },
  moduleCard: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.lg,
    flex: 1,
    overflow: 'hidden',
    ...shadows.card,
  },
  moduleCardCompleted: { backgroundColor: '#F0F8F3' },
  pressed: { opacity: 0.92, transform: [{ scale: 0.99 }] },
  cardContent: { gap: spacing.xs, padding: spacing.md },
  cardTopline: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  disclaimer: { backgroundColor: colors.surfaceMuted, borderRadius: radii.md, padding: spacing.md },
  });
}
