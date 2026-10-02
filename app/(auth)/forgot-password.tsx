import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeaderBack } from '@/components/navigation';
import { AppButton, AppText } from '@/components/primitives';
import { RequestPasswordResetForm } from '@/features/auth/components/RequestPasswordResetForm';
import { authApi } from '@/features/auth/api/authApi';
import { toRequestPasswordResetErrorMessage } from '@/features/auth/utils/passwordErrorMessages';
import { colors, spacing } from '@/theme';

const GENERIC_RECOVERY_MESSAGE =
  'Si existe una cuenta activa con ese correo, enviamos instrucciones para restablecer tu contraseña.';

export default function ForgotPasswordScreen() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <AppText variant="heading1">Revisá tu correo</AppText>
          <AppText color="textSecondary" testID="forgot-password-confirmation">
            {GENERIC_RECOVERY_MESSAGE}
          </AppText>
          <AppButton
            label="Volver al inicio de sesión"
            onPress={() => router.replace('/login')}
            testID="forgot-password-back-to-login"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <AppHeaderBack accessibilityHint="Volver al inicio de sesión" fallbackHref="/login" />
        <AppText variant="heading1">Recuperar contraseña</AppText>
        <AppText color="textSecondary">
          Ingresá el correo de tu cuenta y te enviamos un enlace para restablecer la contraseña.
        </AppText>
        <RequestPasswordResetForm
          errorMessage={errorMessage}
          onSubmit={async (email) => {
            setErrorMessage(null);
            try {
              await authApi.requestPasswordReset({ email });
              setSent(true);
            } catch (error) {
              setErrorMessage(toRequestPasswordResetErrorMessage(error));
            }
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    alignSelf: 'center',
    gap: spacing.md,
    maxWidth: 420,
    padding: spacing.lg,
    width: '100%',
  },
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: 'center',
  },
});
