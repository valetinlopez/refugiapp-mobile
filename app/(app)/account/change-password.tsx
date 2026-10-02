import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/components/primitives';
import { ChangePasswordForm } from '@/features/auth/components/ChangePasswordForm';
import { AccountHeaderRow } from '@/features/auth/components/AccountHeaderRow';
import { authApi } from '@/features/auth/api/authApi';
import { useSession } from '@/features/auth/session';
import { toChangePasswordErrorMessage } from '@/features/auth/utils/passwordErrorMessages';
import { colors, spacing } from '@/theme';

const PASSWORD_CHANGED_NOTICE = 'Tu contraseña fue actualizada. Iniciá sesión nuevamente.';

export default function ChangePasswordScreen() {
  const { endSession } = useSession();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  return (
    <SafeAreaView style={styles.safeArea}>
      <AccountHeaderRow accessibilityHint="Volver a Más" fallbackHref="/more" />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <AppText variant="heading1">Cambiar contraseña</AppText>
        <AppText color="textSecondary">
          Ingresá tu contraseña actual y una nueva de al menos 12 caracteres.
        </AppText>
        <ChangePasswordForm
          errorMessage={errorMessage}
          onSubmit={async (values) => {
            setErrorMessage(null);
            try {
              await authApi.changePassword(values);
              await endSession(PASSWORD_CHANGED_NOTICE);
            } catch (error) {
              setErrorMessage(toChangePasswordErrorMessage(error));
            }
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    gap: spacing.md,
    padding: spacing.lg,
  },
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
});
