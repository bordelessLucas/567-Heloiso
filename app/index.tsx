import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Redirect } from 'expo-router';

import { useAuth } from '@/src/hooks/useAuth';
import { useAppTheme } from '@/src/hooks/useAppTheme';
import { useOnboarding } from '@/src/hooks/useOnboarding';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();
  const { colors } = useAppTheme();
  const { isComplete, isLoading: onboardingLoading } = useOnboarding();

  if (isLoading || (isAuthenticated && onboardingLoading)) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href={isComplete ? '/(tabs)' : '/onboarding'} />;
  }

  return <Redirect href="/(auth)/login" />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
