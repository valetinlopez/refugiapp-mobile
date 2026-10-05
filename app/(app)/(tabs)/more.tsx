import { AccountScreen } from '@/features/auth/components/AccountScreen';
import { useCapabilities } from '@/features/auth/hooks/useCapabilities';
import { NotificationsSection } from '@/features/notifications/components/NotificationsSection';
import { ManagementSection } from '@/features/veterinarians/components/ManagementSection';

export default function MoreTabScreen() {
  const { canManageUsers, canReadAudit } = useCapabilities();

  return (
    <AccountScreen heading="Más" subtitle="Gestión, notificaciones, cuenta y salida segura">
      <ManagementSection canManageUsers={canManageUsers} canReadAudit={canReadAudit} />
      <NotificationsSection />
    </AccountScreen>
  );
}
