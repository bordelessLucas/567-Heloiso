import { AuthGate } from '@/src/components/AuthGate';
import { AdminUsersScreen } from '@/src/screens/AdminUsersScreen';

export default function AdminUsersRoute() {
  return (
    <AuthGate>
      <AdminUsersScreen />
    </AuthGate>
  );
}
