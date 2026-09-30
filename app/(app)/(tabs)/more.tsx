import { AccountScreen } from '@/features/auth/components/AccountScreen';
import { useCapabilities } from '@/features/auth/hooks/useCapabilities';
import { ManagementSection } from '@/features/veterinarians/components/ManagementSection';

export default function MoreTabScreen() {
  const { canManageUsers } = useCapabilities();

  return (
    <AccountScreen heading="Más" subtitle="Gestión, cuenta y salida segura">
      <ManagementSection canManageUsers={canManageUsers} />
    </AccountScreen>
  );
}
