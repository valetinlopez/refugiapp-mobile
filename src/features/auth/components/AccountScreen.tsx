import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LoadingState } from '@/components/feedback';
import { AppButton, AppCard, AppText } from '@/components/primitives';
import { useSession } from '@/features/auth/session';
import { colors, spacing } from '@/theme';

import { useSignOut } from '../session/useSignOut';
import { roleLabels } from '../utils/roleLabels';
import { AccountSignOutSheet } from './AccountSignOutSheet';

export function AccountScreen() {
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
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.state}>
          <LoadingState label="Cargando cuenta" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heading}>
          <AppText variant="heading1">Cuenta</AppText>
          <AppText color="textSecondary">Datos de tu sesión y salida segura</AppText>
        </View>

        <AppCard>
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
          icon="logout"
          label="Cerrar sesión"
          onPress={handleOpenSheet}
          variant="secondary"
        />

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
  state: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
});
