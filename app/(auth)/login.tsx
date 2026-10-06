import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DecorativeBackground, DecorativeImage, resolveBrandSource } from '@/components/patterns';
import { AppCard, AppIcon, AppText } from '@/components/primitives';
import { ApiError } from '@/core/api';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { useSession } from '@/features/auth/session';
import { colors, sizes, spacing } from '@/theme';

const brandMark = resolveBrandSource('brandLeafMark');

/**
 * Editorial login (D04 / RFG-137).
 *
 * Thin route: it only composes the decorative hero (D02 assets through
 * `DecorativeBackground`, hidden from assistive technologies), the native
 * editorial copy and the organic access card that hosts `LoginForm`. All
 * functional text stays native and no screenshot is used as a background.
 * The content scrolls inside a `KeyboardAvoidingView`, so fields and actions
 * remain reachable with the keyboard open on 320 × 568 and 390 × 844.
 */
export default function LoginScreen() {
  const { notice, signIn } = useSession();
  const [errorMessage, setErrorMessage] = useState<string | null>(notice);

  return (
    <View style={styles.root}>
      <View pointerEvents="none" style={styles.heroLayer}>
        <DecorativeBackground priority="high" testID="login-hero" variant="hero" />
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
            testID="login-screen"
          >
            <View style={styles.editorial}>
              <DecorativeImage
                aspectRatio={1}
                fallbackSource={brandMark.png}
                source={brandMark.webp}
                style={styles.brandMark}
              />
              <AppText accessibilityRole="header" testID="login-brand" variant="display">
                Refugiapp
              </AppText>
              <AppText variant="heading3">Cuidar también es organizar</AppText>
              <AppText color="textSecondary">
                Animales, tareas, gastos e historia clínica en un solo lugar.
              </AppText>
            </View>

            <AppCard style={styles.card} testID="login-card" variant="organic">
              <View style={styles.cardHeader}>
                <AppIcon color="positive" name="account" size={sizes.iconMd} />
                <AppText accessibilityRole="header" style={styles.cardTitle} variant="heading3">
                  Acceso para personal autorizado
                </AppText>
              </View>
              <AppText color="textSecondary" variant="caption">
                Ingresá con las credenciales asignadas por el refugio.
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
                        : 'No pudimos iniciar sesión. Intentá nuevamente.'
                    );
                  }
                }}
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
    height: '62%',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
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
