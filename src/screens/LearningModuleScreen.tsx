import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';

import { Button, Container, EmptyState, ScreenHeader, Typography } from '@/src/components';
import type { LearningTrack, LearningTrackId } from '@/src/domain/learning';
import { LearningCover } from '@/src/screens/LearningCover';
import {
  completeLearningTrack,
  getCompletedLearningTrackIds,
  getLearningMentorImage,
  getLearningTrack,
  getLearningTrackCount,
} from '@/src/services/learning.service';
import { colors, radii, shadows, spacing, type AppColors } from '@/src/theme/tokens';
import { useAppTheme } from '@/src/hooks/useAppTheme';

interface LearningModuleScreenProps {
  moduleId?: string;
}

export function LearningModuleScreen({ moduleId }: LearningModuleScreenProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [track, setTrack] = useState<LearningTrack>();
  const [completed, setCompleted] = useState(false);
  const [savingProgress, setSavingProgress] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [finishedTrail, setFinishedTrail] = useState(false);
  const { width } = useWindowDimensions();
  const mentorImage = getLearningMentorImage();

  useEffect(() => {
    const validId = moduleId as LearningTrackId | undefined;
    if (!validId) {
      return;
    }

    void Promise.all([getLearningTrack(validId), getCompletedLearningTrackIds()]).then(
      ([nextTrack, completedIds]) => {
        setTrack(nextTrack);
        setCompleted(completedIds.includes(validId));
      },
    );
  }, [moduleId]);

  const handleComplete = () => {
    if (!track || completed) {
      router.back();
      return;
    }

    setSavingProgress(true);
    void completeLearningTrack(track.id)
      .then((completedIds) => {
        setCompleted(true);
        setFinishedTrail(completedIds.length === getLearningTrackCount());
        setShowCelebration(true);
      })
      .finally(() => setSavingProgress(false));
  };

  if (!moduleId) {
    return (
      <Container scroll contentStyle={styles.content} safeBottom>
        <ScreenHeader showBack title="Módulo não encontrado" />
        <EmptyState title="Escolha um módulo" description="Volte à trilha para continuar aprendendo." />
      </Container>
    );
  }

  if (!track) {
    return (
      <Container scroll contentStyle={styles.content} safeBottom>
        <ScreenHeader showBack title="Carregando módulo" />
      </Container>
    );
  }

  return (
    <Container scroll contentStyle={styles.content} safeBottom>
      <ScreenHeader showBack title={track.title} subtitle={track.description} />

      <Animated.View entering={FadeInDown.duration(380)} style={styles.heroCard}>
        <LearningCover
          accessibilityLabel={track.coverAlt}
          source={track.cover}
          height={Math.round(
            Math.max(1, width - spacing.lg * 2) / track.coverAspectRatio,
          )}
        />
        <View style={styles.heroBadge}>
          <Typography variant="label" color={colors.black}>
            Módulo {track.order}
          </Typography>
        </View>
      </Animated.View>

      <View style={styles.mentorCard}>
        <Image
          accessibilityLabel="Seu guia Mercado FiiS"
          contentFit="cover"
          contentPosition="right"
          source={mentorImage}
          style={styles.mentorImage}
          transition={180}
        />
        <View style={styles.mentorText}>
          <Typography variant="caption" color={colors.primaryDark}>
            SEU GUIA MERCADO FIIS
          </Typography>
          <Typography variant="bodyStrong">{track.mentorNote}</Typography>
        </View>
      </View>

      <View style={styles.lessonList}>
        {track.lessons.map((lesson, index) => (
          <LessonCard index={index} key={lesson.id} lesson={lesson} />
        ))}
      </View>

      {showCelebration ? (
        <Animated.View entering={FadeInDown.duration(440)} style={styles.celebrationCard}>
          <Animated.View entering={ZoomIn.delay(120).springify().damping(14)} style={styles.successIcon}>
            <Typography variant="h2" color={colors.surfaceElevated}>
              ✓
            </Typography>
          </Animated.View>
          <View style={styles.celebrationCopy}>
            <Typography variant="caption" color={colors.success}>
              PROGRESSO REGISTRADO
            </Typography>
            <Typography style={styles.centerText} variant="h2">
              {finishedTrail ? 'Parabéns! Você concluiu a trilha.' : 'Parabéns! Módulo concluído.'}
            </Typography>
            <Typography style={styles.centerText} variant="body" color={colors.textMuted}>
              {finishedTrail
                ? 'Você completou os nove módulos e pode voltar a qualquer conteúdo sempre que quiser revisar.'
                : 'Mais um passo concluído. Este conteúdo continuará disponível para revisão na sua trilha.'}
            </Typography>
          </View>
          <Button
            label={finishedTrail ? 'Revisar a trilha' : 'Continuar na trilha'}
            onPress={() => router.back()}
          />
        </Animated.View>
      ) : (
        <View style={styles.footer}>
          <Typography variant="caption" color={colors.textMuted}>
            {completed
              ? 'Módulo concluído. Você pode revisá-lo sempre que quiser.'
              : 'Quando terminar, registre seu progresso para colorir a trilha.'}
          </Typography>
          <Button
            label={completed ? 'Voltar para a trilha' : 'Concluir módulo'}
            loading={savingProgress}
            onPress={handleComplete}
          />
        </View>
      )}
    </Container>
  );
}

function LessonCard({
  index,
  lesson,
}: {
  index: number;
  lesson: LearningTrack['lessons'][number];
}) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [expanded, setExpanded] = useState(index === 0);

  return (
    <Animated.View entering={FadeInDown.delay(110 + index * 80).duration(360)}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        onPress={() => setExpanded((value) => !value)}
        style={({ pressed }) => [styles.lessonCard, pressed && styles.pressed]}
      >
        <View style={styles.lessonHeader}>
          <View style={styles.lessonNumber}>
            <Typography variant="label" color={colors.primaryDark}>
              {index + 1}
            </Typography>
          </View>
          <View style={styles.lessonHeading}>
            <Typography variant="h3">{lesson.title}</Typography>
            {!expanded ? (
              <Typography numberOfLines={1} variant="caption" color={colors.textMuted}>
                {lesson.description}
              </Typography>
            ) : null}
          </View>
          <Typography variant="bodyStrong" color={colors.primaryDark}>
            {expanded ? '−' : '+'}
          </Typography>
        </View>

        {expanded ? (
          <View style={styles.lessonBody}>
            <Typography variant="body" color={colors.textMuted}>
              {lesson.description}
            </Typography>
            {lesson.items?.map((item) => (
              <View key={item} style={styles.lessonItem}>
                <View style={styles.bullet} />
                <Typography style={styles.itemText} variant="body">
                  {item}
                </Typography>
              </View>
            ))}
          </View>
        ) : null}
      </Pressable>
    </Animated.View>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
  content: { gap: spacing.lg, paddingBottom: spacing.xl },
  heroCard: {
    borderRadius: radii.lg,
    overflow: 'hidden',
    position: 'relative',
    ...shadows.card,
  },
  heroBadge: {
    backgroundColor: colors.primary,
    borderRadius: radii.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    position: 'absolute',
    right: spacing.sm,
    top: spacing.sm,
  },
  mentorCard: {
    alignItems: 'center',
    backgroundColor: colors.surfaceWarm,
    borderRadius: radii.lg,
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 104,
    overflow: 'hidden',
    paddingRight: spacing.md,
  },
  mentorImage: {
    alignSelf: 'stretch',
    backgroundColor: colors.surfaceFeature,
    width: 104,
  },
  mentorText: { flex: 1, gap: spacing.xs, paddingVertical: spacing.md },
  lessonList: { gap: spacing.sm },
  lessonCard: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.lg,
    gap: spacing.sm,
    padding: spacing.md,
    ...shadows.card,
  },
  lessonHeader: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm },
  lessonNumber: {
    alignItems: 'center',
    backgroundColor: colors.surfaceWarm,
    borderRadius: radii.full,
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
  lessonHeading: { flex: 1, gap: 2 },
  lessonBody: { gap: spacing.sm, paddingLeft: 38 },
  lessonItem: { alignItems: 'flex-start', flexDirection: 'row', gap: spacing.sm },
  bullet: {
    backgroundColor: colors.primary,
    borderRadius: radii.full,
    height: 7,
    marginTop: 8,
    width: 7,
  },
  itemText: { flex: 1 },
  footer: { gap: spacing.sm },
  celebrationCard: {
    alignItems: 'center',
    backgroundColor: '#F0F8F3',
    borderRadius: radii.lg,
    gap: spacing.md,
    padding: spacing.lg,
    ...shadows.card,
  },
  successIcon: {
    alignItems: 'center',
    backgroundColor: colors.success,
    borderRadius: radii.full,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  celebrationCopy: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  centerText: {
    textAlign: 'center',
  },
  pressed: { opacity: 0.92 },
  });
}
