import { router, type Href } from 'expo-router';
import { useCallback, useState, type ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LoadingState } from '@/components/feedback';
import { DecorativeBackground } from '@/components/patterns';
import { AppAvatar, AppBadge, AppButton, AppCard, AppText } from '@/components/primitives';
import { useConnectivityStatus } from '@/core/network';
import { useSession } from '@/features/auth/session';
import { colors, sizes, spacing } from '@/theme';

import { useSignOut } from '../session/useSignOut';
import { accountDisplayName, accountInitials } from '../utils/accountPresentation';
import { roleLabels } from '../utils/roleLabels';
import { AccountApplicationSection } from './AccountApplicationSection';
import { AccountSignOutSheet } from './AccountSignOutSheet';

export interface AccountScreenProps {
  /** Destinos autorizados de gestión coordinados por la ruta. */
  management?: ReactNode;
  /** Preferencias y permiso push coordinados por la ruta. */
  notifications?: ReactNode;
  heading?: string;
  subtitle?: string;
}

export function AccountScreen({
  management,
  notifications,
  heading = 'Cuenta',
  subtitle = 'Datos de tu sesión y salida segura',
}: AccountScreenProps) {
  const { status, user } = useSession();
  const isOnline = useConnectivityStatus();
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
      <DecorativeBackground overlay testID="more-background" variant="texture" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heading}>
          <AppText variant="heading1">{heading}</AppText>
          <AppText color="textSecondary">{subtitle}</AppText>
        </View>

        <AppCard style={styles.profileCard} testID="account-identity" variant="organic">
          <View accessibilityRole="summary" style={styles.profile}>
            <AppAvatar
              accessibilityLabel={`Iniciales de ${accountDisplayName(user)}`}
              initials={accountInitials(user)}
              size="lg"
            />
            <View style={styles.profileCopy}>
              <AppText variant="heading3">{accountDisplayName(user)}</AppText>
              <AppText color="textSecondary">{user.email}</AppText>
              <View style={styles.roles}>
                {roleLabels(user.roles).map((role) => (
                  <AppBadge key={role} label={role} tone="positive" />
                ))}
              </View>
            </View>
          </View>
        </AppCard>

        {management}

        <AccountApplicationSection
          isOnline={isOnline}
          onChangePassword={() => router.push('/account/change-password' as Href)}
        />

        {notifications}

        <View style={styles.section} testID="account-section">
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
    flexGrow: 1,
    gap: spacing.lg,
    padding: spacing.lg,
    paddingBottom: sizes.bottomNavigationHeight + sizes.bottomNavigationCurve + spacing.lg,
  },
  heading: {
    gap: spacing.xxs,
  },
  profile: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  profileCard: {
    overflow: 'hidden',
  },
  profileCopy: {
    flex: 1,
    gap: spacing.xxs,
    minWidth: 0,
  },
  roles: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
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
