import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen name="login" options={{ headerShown: false, title: 'Iniciar sesión' }} />
      <Stack.Screen
        name="forgot-password"
        options={{ headerShown: false, title: 'Recuperar contraseña' }}
      />
      <Stack.Screen
        name="reset-password"
        options={{ headerShown: false, title: 'Nueva contraseña' }}
      />
    </Stack>
  );
}
