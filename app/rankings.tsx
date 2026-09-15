import { AuthGate } from '@/src/components/AuthGate';
import { RankingsScreen } from '@/src/screens/RankingsScreen';

export default function RankingsRoute() {
  return (
    <AuthGate>
      <RankingsScreen />
    </AuthGate>
  );
}
