import { router, type Href } from 'expo-router';
import { useCallback } from 'react';

import {
  MANAGEMENT_DESTINATIONS,
  getAuthorizedManagementDestinations,
  type ManagementDestinationId,
} from '@/application/management';
import { ManagementSection, type ManagementItem } from '@/components/patterns';
import { AccountScreen } from '@/features/auth/components/AccountScreen';
import { useCapabilities } from '@/features/auth/hooks/useCapabilities';
import { NotificationsSection } from '@/features/notifications/components/NotificationsSection';

type ManagementPresentation = Omit<ManagementItem, 'id'>;

const MANAGEMENT_PRESENTATION: Readonly<Record<ManagementDestinationId, ManagementPresentation>> = {
  veterinarians: {
    description: 'Listado, detalle y estados de profesionales',
    hint: 'Ir a veterinarios',
    icon: 'medical',
    label: 'Veterinarios',
  },
  users: {
    description: 'Cuentas internas del refugio',
    hint: 'Ir a usuarios',
    icon: 'account',
    label: 'Usuarios',
  },
  audit: {
    description: 'Trazabilidad de acciones del refugio',
    hint: 'Ir a auditoría',
    icon: 'clock',
    label: 'Ver auditoría',
  },
};

export default function MoreTabScreen() {
  const capabilities = useCapabilities();
  const managementItems = getAuthorizedManagementDestinations(capabilities).map(
    ({ id }): ManagementItem => ({
      ...MANAGEMENT_PRESENTATION[id],
      id,
    })
  );
  const handleManagementSelect = useCallback((id: string) => {
    const destination = MANAGEMENT_DESTINATIONS.find((item) => item.id === id);
    if (destination) {
      router.push(destination.path as Href);
    }
  }, []);

  return (
    <AccountScreen
      heading="Más"
      management={<ManagementSection items={managementItems} onSelect={handleManagementSelect} />}
      notifications={<NotificationsSection />}
      onOpenProfile={() => router.push('/profile' as Href)}
      subtitle="Tu espacio de trabajo"
    />
  );
}
