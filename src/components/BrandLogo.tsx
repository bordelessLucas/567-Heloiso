import { Image } from 'expo-image';
import { StyleSheet, type ImageStyle, type StyleProp } from 'react-native';

const LOGO_ASPECT_RATIO = 1897 / 829;

interface BrandLogoProps {
  width?: number;
  style?: StyleProp<ImageStyle>;
}

export function BrandLogo({ width = 184, style }: BrandLogoProps) {
  return (
    <Image
      accessibilityLabel="Mercado FIIs"
      cachePolicy="memory-disk"
      contentFit="contain"
      source={require('../../assets/images/mercado-fiis-logo.png')}
      style={[styles.logo, { width, height: width / LOGO_ASPECT_RATIO }, style]}
      transition={160}
    />
  );
}

const styles = StyleSheet.create({
  logo: {
    flexShrink: 0,
  },
});
