import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ApiError } from '@/core/api';
import { AppText } from '@/components/primitives';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { useSession } from '@/features/auth/session';
import { colors, spacing } from '@/theme';

export default function LoginScreen() {
  const { signIn } = useSession();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <AppText variant="display">Refugiapp</AppText>
        <AppText color="textSecondary" variant="heading3">
          Iniciar sesión
        </AppText>
        <LoginForm
          errorMessage={errorMessage}
          onSubmit={async (credentials) => {
            setErrorMessage(null);
            try {
              await signIn(credentials);
            } catch (error) {
              setErrorMessage(
                error instanceof ApiError
                  ? error.message
                  : 'No pudimos iniciar sesión. Intenta nuevamente.'
              );
            }
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  content: {
    alignSelf: 'center',
    gap: spacing.md,
    maxWidth: 420,
    width: '100%',
  },
});
