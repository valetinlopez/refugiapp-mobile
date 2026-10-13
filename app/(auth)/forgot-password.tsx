import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppHeaderBack } from '@/components/navigation';
import { DecorativeBackground, DecorativeImage, resolveBrandSource } from '@/components/patterns';
import { AppButton, AppCard, AppIcon, AppText } from '@/components/primitives';
import { RequestPasswordResetForm } from '@/features/auth/components/RequestPasswordResetForm';
import { authApi } from '@/features/auth/api/authApi';
import { useResendCooldown } from '@/features/auth/hooks/useResendCooldown';
import { toRequestPasswordResetErrorMessage } from '@/features/auth/utils/passwordErrorMessages';
import { PASSWORD_RESET_LINK_TTL_MINUTES } from '@/features/auth/utils/passwordValidation';
import { colors, sizes, spacing } from '@/theme';

const GENERIC_RECOVERY_MESSAGE =
  'Si existe una cuenta activa con ese correo, enviamos instrucciones para restablecer tu contraseña.';

const brandMark = resolveBrandSource('brandLeafMark');

/**
 * Editorial forgot-password (D45 / RFG-181).
 *
 * Thin route: the request form mirrors the login editorial system (D04) —
 * decorative a-bleed hero hidden from assistive technologies (anchored below
 * the top safe-area inset so the notch / Dynamic Island never crops the
 * artwork, keeping its bottom edge at the documented 62 %), native copy and
 * an organic access card hosting `RequestPasswordResetForm`. The confirmation
 * state stays functional on purpose (D45 scope: form only) with the same
 * generic anti-enumeration copy, spam guidance, TTL and resend cooldown.
 */
export default function ForgotPasswordScreen() {
  const insets = useSafeAreaInsets();
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
      <SafeAreaView style={styles.legacySafeArea}>
        <View style={styles.legacyContent}>
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
    <View style={styles.root}>
      <View pointerEvents="none" style={[styles.heroLayer, { top: insets.top }]}>
        <DecorativeBackground priority="high" testID="forgot-password-hero" variant="hero" />
      </View>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.flex}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            testID="forgot-password-screen"
          >
            <AppHeaderBack accessibilityHint="Volver al inicio de sesión" fallbackHref="/login" />
            <View style={styles.editorial}>
              <DecorativeImage
                aspectRatio={1}
                fallbackSource={brandMark.png}
                source={brandMark.webp}
                style={styles.brandMark}
              />
              <AppText accessibilityRole="header" testID="forgot-password-title" variant="display">
                Recuperar contraseña
              </AppText>
              <AppText color="textSecondary">
                Ingresá el correo de tu cuenta y te enviamos un enlace para restablecer la
                contraseña.
              </AppText>
            </View>

            <AppCard style={styles.card} testID="forgot-password-card" variant="organic">
              <View style={styles.cardHeader}>
                <AppIcon color="positive" name="mail" size={sizes.iconMd} />
                <AppText accessibilityRole="header" style={styles.cardTitle} variant="heading3">
                  Enlace de recuperación
                </AppText>
              </View>
              <AppText color="textSecondary" variant="caption">
                Usá el correo con el que ingresás al refugio.
              </AppText>
              <RequestPasswordResetForm errorMessage={errorMessage} onSubmit={handleSubmit} />
              <AppButton
                label="Volver al inicio de sesión"
                onPress={() => router.replace('/login')}
                testID="forgot-password-back"
                variant="ghost"
              />
            </AppCard>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  brandMark: {
    height: 40,
    width: 40,
  },
  card: {
    gap: spacing.md,
  },
  cardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  cardTitle: {
    flex: 1,
    minWidth: 0,
  },
  editorial: {
    gap: spacing.xs,
    paddingTop: spacing.sm,
  },
  flex: {
    flex: 1,
  },
  heroLayer: {
    bottom: '38%',
    left: 0,
    position: 'absolute',
    right: 0,
  },
  legacyContent: {
    alignSelf: 'center',
    gap: spacing.md,
    maxWidth: 420,
    padding: spacing.lg,
    width: '100%',
  },
  legacySafeArea: {
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: 'center',
  },
  root: {
    backgroundColor: colors.background,
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    gap: spacing.lg,
    justifyContent: 'space-between',
    padding: spacing.lg,
    paddingBottom: spacing['2xl'],
  },
});
