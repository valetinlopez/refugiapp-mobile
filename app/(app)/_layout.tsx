import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="animals/new" options={{ title: 'Alta de animal' }} />
      <Stack.Screen name="animals/[id]" options={{ title: 'Detalle del animal' }} />
      <Stack.Screen name="animals/[id]/edit" options={{ title: 'Editar animal' }} />
      <Stack.Screen
        name="animals/[id]/events/new"
        options={{ title: 'Registrar evento general' }}
      />
      <Stack.Screen
        name="animals/[id]/medical-records/new"
        options={{ title: 'Registrar consulta' }}
      />
      <Stack.Screen
        name="animals/[id]/medical-records/[recordId]/edit"
        options={{ title: 'Editar registro clínico' }}
      />
      <Stack.Screen name="care-tasks/new" options={{ title: 'Crear tarea' }} />
      <Stack.Screen name="care-tasks/[id]/edit" options={{ title: 'Editar tarea' }} />
    </Stack>
  );
}
