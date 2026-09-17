import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { useAppTheme } from '@/src/hooks/useAppTheme';

interface LearningCoverProps {
  accessibilityLabel: string;
  height: number;
  source: number;
}

/**
 * Mantém a arte inteira e usa uma continuação desfocada da própria imagem nas
 * sobras laterais. Assim, proporções diferentes parecem parte do card.
 */
export function LearningCover({
  accessibilityLabel,
  height,
  source,
}: LearningCoverProps) {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.frame, { height, backgroundColor: colors.black }]}>
      <Image
        accessibilityElementsHidden
        blurRadius={22}
        contentFit="cover"
        source={source}
        style={styles.backdrop}
      />
      <View pointerEvents="none" style={styles.tint} />
      <Image
        accessibilityLabel={accessibilityLabel}
        cachePolicy="memory-disk"
        contentFit="contain"
        source={source}
        style={styles.foreground}
        transition={180}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
  },
  backdrop: {
    bottom: 0,
    left: 0,
    opacity: 0.64,
    position: 'absolute',
    right: 0,
    top: 0,
    transform: [{ scale: 1.12 }],
  },
  tint: {
    backgroundColor: 'rgba(13, 13, 13, 0.16)',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  foreground: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
});
