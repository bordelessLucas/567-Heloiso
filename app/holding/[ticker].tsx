import { AuthGate } from '@/src/components/AuthGate';
import { HoldingDetailScreen } from '@/src/screens/HoldingDetailScreen';

export default function HoldingRoute() {
  return (
    <AuthGate>
      <HoldingDetailScreen />
    </AuthGate>
  );
}
