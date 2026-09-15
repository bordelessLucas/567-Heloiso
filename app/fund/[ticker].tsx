import { AuthGate } from '@/src/components/AuthGate';
import { FundDetailScreen } from '@/src/screens/FundDetailScreen';

export default function FundDetailRoute() {
  return (
    <AuthGate>
      <FundDetailScreen />
    </AuthGate>
  );
}
