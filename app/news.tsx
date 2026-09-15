import { AuthGate } from '@/src/components/AuthGate';
import { NewsScreen } from '@/src/screens/NewsScreen';

export default function NewsRoute() {
  return (
    <AuthGate>
      <NewsScreen />
    </AuthGate>
  );
}
