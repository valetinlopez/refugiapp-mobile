import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="animals/new" options={{ title: 'Alta de animal' }} />
      <Stack.Screen name="animals/[id]" options={{ title: 'Detalle del animal' }} />
      <Stack.Screen name="animals/[id]/edit" options={{ title: 'Editar animal' }} />
    </Stack>
  );
}
