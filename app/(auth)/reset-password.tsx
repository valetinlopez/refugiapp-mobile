import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeaderBack } from '@/components/navigation';
import { AppButton, AppText } from '@/components/primitives';
import { ResetPasswordForm } from '@/features/auth/components/ResetPasswordForm';
import { authApi } from '@/features/auth/api/authApi';
import { useSession } from '@/features/auth/session';
import {
  isPasswordResetTokenError,
  toConfirmPasswordResetErrorMessage,
} from '@/features/auth/utils/passwordErrorMessages';
import { colors, spacing } from '@/theme';

const PASSWORD_CHANGED_NOTICE = 'Tu contraseña fue actualizada. Iniciá sesión nuevamente.';

export default function ResetPasswordScreen() {
  const params = useLocalSearchParams<{ token?: string | string[] }>();
  const { endSession } = useSession();
  const [token, setToken] = useState<string | null>(() => {
    const raw = params.token;
    return typeof raw === 'string' && raw.length > 0 ? raw : null;
  });
  const sanitizedRef = useRef(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);

  useEffect(() => {
    if (token !== null && !sanitizedRef.current) {
      sanitizedRef.current = true;
      router.replace('/reset-password' as Href);
    }
  }, [token]);

  const handleSubmit = useCallback(
    async (newPassword: string): Promise<void> => {
      if (token === null) {
        return;
      }
      setErrorMessage(null);
      setTokenError(null);
      try {
        await authApi.confirmPasswordReset({ token, newPassword });
        await endSession(PASSWORD_CHANGED_NOTICE);
        router.replace('/login');
      } catch (error) {
        if (isPasswordResetTokenError(error)) {
          setTokenError(toConfirmPasswordResetErrorMessage(error));
          setToken(null);
        } else {
          setErrorMessage(toConfirmPasswordResetErrorMessage(error));
        }
      }
    },
    [endSession, token]
  );

  if (token === null) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <AppHeaderBack accessibilityHint="Volver al inicio de sesión" fallbackHref="/login" />
          <AppText variant="heading1">Enlace no válido</AppText>
          <AppText color="textSecondary" testID="reset-password-invalid">
            {tokenError ?? 'El enlace de recuperación no es válido o ya fue usado.'}
          </AppText>
          <AppButton
            label="Solicitar enlace nuevo"
            onPress={() => router.replace('/forgot-password' as Href)}
            testID="reset-password-request-new"
          />
          <AppButton
            label="Volver al inicio de sesión"
            onPress={() => router.replace('/login')}
            testID="reset-password-back-to-login"
            variant="ghost"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <AppHeaderBack accessibilityHint="Volver al inicio de sesión" fallbackHref="/login" />
        <AppText variant="heading1">Definir nueva contraseña</AppText>
        <AppText color="textSecondary">
          Ingresá una contraseña nueva de al menos 12 caracteres y confirmala.
        </AppText>
        <ResetPasswordForm errorMessage={errorMessage} onSubmit={handleSubmit} />
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
