import { router, type Href } from 'expo-router';
import { useCallback, useState, type ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LoadingState } from '@/components/feedback';
import { AppButton, AppCard, AppText } from '@/components/primitives';
import { useSession } from '@/features/auth/session';
import { colors, sizes, spacing } from '@/theme';

import { useSignOut } from '../session/useSignOut';
import { roleLabels } from '../utils/roleLabels';
import { AccountSignOutSheet } from './AccountSignOutSheet';

export interface AccountScreenProps {
  /** Slot opcional renderizado entre el encabezado y la identidad de cuenta. */
  children?: ReactNode;
  heading?: string;
  subtitle?: string;
}

export function AccountScreen({
  children,
  heading = 'Cuenta',
  subtitle = 'Datos de tu sesión y salida segura',
}: AccountScreenProps) {
  const { status, user } = useSession();
  const { errorMessage, isSigningOut, reset, signOut } = useSignOut();
  const [sheetVisible, setSheetVisible] = useState(false);

  const handleOpenSheet = useCallback(() => {
    reset();
    setSheetVisible(true);
  }, [reset]);

  const handleCloseSheet = useCallback(() => {
    if (!isSigningOut) {
      setSheetVisible(false);
    }
  }, [isSigningOut]);

  const handleConfirm = useCallback(() => {
    void signOut();
  }, [signOut]);

  if (status === 'restoring' || user === null) {
    return (
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
        <View style={styles.state}>
          <LoadingState label="Cargando cuenta" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heading}>
          <AppText variant="heading1">{heading}</AppText>
          <AppText color="textSecondary">{subtitle}</AppText>
        </View>

        {children}

        <View style={styles.section} testID="account-section">
          <AppText variant="heading2">Cuenta</AppText>
          <AppCard testID="account-identity">
            <View style={styles.field}>
              <AppText color="textSecondary" variant="label">
                Correo
              </AppText>
              <AppText variant="bodyStrong">{user.email}</AppText>
            </View>
            <View style={styles.field}>
              <AppText color="textSecondary" variant="label">
                Rol
              </AppText>
              <AppText>{roleLabels(user.roles).join(' · ')}</AppText>
            </View>
          </AppCard>

          <AppButton
            icon="account"
            label="Cambiar contraseña"
            onPress={() => router.push('/account/change-password' as Href)}
            testID="account-change-password"
            variant="secondary"
          />
          <AppButton
            icon="logout"
            label="Cerrar sesión"
            onPress={handleOpenSheet}
            testID="account-logout"
            variant="secondary"
          />
        </View>

        <AccountSignOutSheet
          errorMessage={errorMessage}
          onClose={handleCloseSheet}
          onConfirm={handleConfirm}
          signingOut={isSigningOut}
          userEmail={user.email}
          visible={sheetVisible}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    backgroundColor: colors.background,
    flexGrow: 1,
    gap: spacing.lg,
    padding: spacing.lg,
    paddingBottom: sizes.bottomNavigationHeight + sizes.bottomNavigationCurve + spacing.lg,
  },
  field: {
    gap: spacing.xxs,
  },
  heading: {
    gap: spacing.xxs,
  },
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
  section: {
    gap: spacing.md,
  },
  state: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
});
