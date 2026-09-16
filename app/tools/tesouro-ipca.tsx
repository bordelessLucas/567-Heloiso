import { AuthGate } from '@/src/components/AuthGate';
import { TesouroCompareScreen } from '@/src/screens/TesouroCompareScreen';

export default function TesouroCompareRoute() {
  return (
    <AuthGate>
      <TesouroCompareScreen />
    </AuthGate>
  );
}
