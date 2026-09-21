import { AuthGate } from '@/src/components/AuthGate';
import { PouparScreen } from '@/src/screens/PouparScreen';

export default function PouparRoute() {
  return (
    <AuthGate>
      <PouparScreen />
    </AuthGate>
  );
}
