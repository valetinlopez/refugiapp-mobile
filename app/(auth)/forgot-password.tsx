import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeaderBack } from '@/components/navigation';
import { AppButton, AppText } from '@/components/primitives';
import { RequestPasswordResetForm } from '@/features/auth/components/RequestPasswordResetForm';
import { authApi } from '@/features/auth/api/authApi';
import { useResendCooldown } from '@/features/auth/hooks/useResendCooldown';
import { toRequestPasswordResetErrorMessage } from '@/features/auth/utils/passwordErrorMessages';
import { PASSWORD_RESET_LINK_TTL_MINUTES } from '@/features/auth/utils/passwordValidation';
import { colors, spacing } from '@/theme';

const GENERIC_RECOVERY_MESSAGE =
  'Si existe una cuenta activa con ese correo, enviamos instrucciones para restablecer tu contraseña.';

export default function ForgotPasswordScreen() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sentEmail, setSentEmail] = useState<string | null>(null);
  const [resendErrorMessage, setResendErrorMessage] = useState<string | null>(null);
  const { remaining, start } = useResendCooldown();

  async function handleSubmit(email: string): Promise<void> {
    setErrorMessage(null);
    setResendErrorMessage(null);
    try {
      await authApi.requestPasswordReset({ email });
      setSentEmail(email);
      start();
    } catch (error) {
      setErrorMessage(toRequestPasswordResetErrorMessage(error));
    }
  }

  async function handleResend(): Promise<void> {
    if (sentEmail === null || remaining > 0) {
      return;
    }
    setResendErrorMessage(null);
    try {
      await authApi.requestPasswordReset({ email: sentEmail });
      start();
    } catch (error) {
      setResendErrorMessage(toRequestPasswordResetErrorMessage(error));
    }
  }

  if (sentEmail !== null) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <AppText variant="heading1">Revisá tu correo</AppText>
          <AppText color="textSecondary" testID="forgot-password-confirmation">
            {GENERIC_RECOVERY_MESSAGE}
          </AppText>
          <AppText color="textSecondary" testID="forgot-password-hints">
            Si no lo ves, revisá la carpeta de spam o correo no deseado. El enlace vence en{' '}
            {PASSWORD_RESET_LINK_TTL_MINUTES} minutos.
          </AppText>
          {resendErrorMessage ? (
            <AppText
              accessibilityLiveRegion="polite"
              color="danger"
              role="alert"
              testID="forgot-password-resend-error"
            >
              {resendErrorMessage}
            </AppText>
          ) : null}
          <AppButton
            disabled={remaining > 0}
            label={remaining > 0 ? `Reenviar en ${remaining}s` : 'Reenviar correo'}
            onPress={() => void handleResend()}
            testID="forgot-password-resend"
            variant="secondary"
          />
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
        <RequestPasswordResetForm errorMessage={errorMessage} onSubmit={handleSubmit} />
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
