import { AuthGate } from '@/src/components/AuthGate';
import { PlannerScreen } from '@/src/screens/PlannerScreen';

export default function PlannerRoute() {
  return (
    <AuthGate>
      <PlannerScreen />
    </AuthGate>
  );
}
