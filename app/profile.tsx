import { Redirect } from 'expo-router';

import { AuthGate } from '@/src/components/AuthGate';

/** Mantém rota legado /profile redirecionando para a tab. */
export default function ProfileStackRoute() {
  return (
    <AuthGate>
      <Redirect href="/(tabs)/profile" />
    </AuthGate>
  );
}
