import { Stack } from 'expo-router';
import { useEffect } from 'react';

import { useSession } from '@/features/auth/session';
import { useNotificationObserver } from '@/features/notifications/hooks/useNotificationObserver';
import { usePushRegistration } from '@/features/notifications/hooks/usePushRegistration';
import { unregisterCurrentDevice } from '@/features/notifications/utils/registeredDevice';

/**
 * Wires the notifications feature into the authenticated session without
 * coupling the features to each other: registration follows the session status
 * and the device is unregistered as part of the sign-out cleanup.
 */
function NotificationsWiring() {
  const { registerSignOutHandler, status, user } = useSession();
  usePushRegistration({ enabled: status === 'authenticated', userId: user?.id ?? null });
  useNotificationObserver();

  useEffect(() => registerSignOutHandler(unregisterCurrentDevice), [registerSignOutHandler]);

  return null;
}

export default function AppLayout() {
  return (
    <>
      <NotificationsWiring />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="profile" options={{ title: 'Mi perfil' }} />
        <Stack.Screen name="account/change-password" options={{ title: 'Cambiar contraseña' }} />
        <Stack.Screen name="animals/new" options={{ title: 'Alta de animal' }} />
        <Stack.Screen name="animals/[id]" options={{ title: 'Detalle del animal' }} />
        <Stack.Screen name="animals/[id]/edit" options={{ title: 'Editar animal' }} />
        <Stack.Screen name="animals/[id]/events/new" options={{ title: 'Agregar evento' }} />
        <Stack.Screen
          name="animals/[id]/medical-records/new"
          options={{ title: 'Registrar consulta' }}
        />
        <Stack.Screen
          name="animals/[id]/medical-records/[recordId]/edit"
          options={{ title: 'Editar registro clínico' }}
        />
        <Stack.Screen
          name="animals/[id]/medical-records/[recordId]/changes"
          options={{ title: 'Historial de cambios' }}
        />
        <Stack.Screen name="medical-records/index" options={{ title: 'Historia clínica' }} />
        <Stack.Screen name="care-tasks/new" options={{ title: 'Crear tarea' }} />
        <Stack.Screen name="care-tasks/[id]/index" options={{ title: 'Detalle de la tarea' }} />
        <Stack.Screen name="care-tasks/[id]/edit" options={{ title: 'Editar tarea' }} />
        <Stack.Screen name="expenses/new" options={{ title: 'Registrar gasto' }} />
        <Stack.Screen name="users/index" options={{ title: 'Usuarios' }} />
        <Stack.Screen name="users/new" options={{ title: 'Nuevo usuario' }} />
        <Stack.Screen name="veterinarians/index" options={{ title: 'Veterinarios' }} />
        <Stack.Screen name="veterinarians/new" options={{ title: 'Nuevo veterinario' }} />
        <Stack.Screen name="veterinarians/[id]" options={{ title: 'Detalle del veterinario' }} />
        <Stack.Screen name="veterinarians/[id]/edit" options={{ title: 'Editar veterinario' }} />
        <Stack.Screen name="audit/index" options={{ title: 'Auditoría' }} />
        <Stack.Screen name="audit/[id]" options={{ title: 'Detalle de auditoría' }} />
      </Stack>
    </>
  );
}
