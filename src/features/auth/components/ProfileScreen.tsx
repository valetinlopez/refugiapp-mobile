import { router, type Href } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LoadingState } from '@/components/feedback';
import {
  DecorativeBackground,
  formatDateMedium,
  MetadataRow,
  SectionHeader,
} from '@/components/patterns';
import {
  AppAvatar,
  AppBadge,
  AppButton,
  AppCard,
  AppDivider,
  AppIcon,
  AppText,
} from '@/components/primitives';
import { colors, sizes, spacing } from '@/theme';

import { useCapabilities } from '../hooks/useCapabilities';
import { useSession } from '../session';
import { useSignOut } from '../session/useSignOut';
import { accountDisplayName, accountInitials } from '../utils/accountPresentation';
import { grantedCapabilityPresentation } from '../utils/profilePresentation';
import { roleLabels } from '../utils/roleLabels';
import { AccountHeaderRow } from './AccountHeaderRow';
import { AccountSignOutSheet } from './AccountSignOutSheet';

export function ProfileScreen() {
  const { status, user } = useSession();
  const capabilities = useCapabilities();
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
        <AccountHeaderRow accessibilityHint="Volver a Más" fallbackHref="/more" />
        <View style={styles.state}>
          <LoadingState label="Cargando perfil" />
        </View>
      </SafeAreaView>
    );
  }

  const grantedCapabilities = grantedCapabilityPresentation(capabilities);
  const roles = roleLabels(user.roles).join(', ');

  return (
    <SafeAreaView style={styles.safeArea} testID="profile-screen">
      <DecorativeBackground overlay testID="profile-background" variant="texture" />
      <AccountHeaderRow accessibilityHint="Volver a Más" fallbackHref="/more" />
      <ScrollView contentContainerStyle={styles.content}>
        <AppText accessibilityRole="header" variant="heading1">
          Mi perfil
        </AppText>

        <AppCard style={styles.identityCard} testID="profile-identity" variant="organic">
          <View accessibilityRole="summary" style={styles.identity}>
            <AppAvatar
              accessibilityLabel={`Iniciales de ${accountDisplayName(user)}`}
              initials={accountInitials(user)}
              size="lg"
            />
            <View style={styles.identityCopy}>
              <AppText variant="heading3">{accountDisplayName(user)}</AppText>
              <AppText color="textSecondary">{user.email}</AppText>
              <AppBadge
                icon={user.isActive ? 'check' : 'offline'}
                label={user.isActive ? 'Activo' : 'Inactivo'}
                tone={user.isActive ? 'positive' : 'neutral'}
              />
            </View>
          </View>
        </AppCard>

        <View style={styles.section}>
          <SectionHeader title="Información personal" />
          <AppCard>
            <MetadataRow label="Correo electrónico" value={user.email} />
            <AppDivider />
            <MetadataRow label="Nombre" value={user.firstName} />
            <AppDivider />
            <MetadataRow label="Apellido" value={user.lastName} />
            <AppDivider />
            <MetadataRow label="Roles asignados" value={roles} />
            <AppDivider />
            <MetadataRow label="Fecha de creación" value={formatDateMedium(user.createdAt)} />
            <AppDivider />
            <MetadataRow label="Última actualización" value={formatDateMedium(user.updatedAt)} />
          </AppCard>
        </View>

        <View style={styles.section}>
          <SectionHeader subtitle="Accesos efectivos según tus roles asignados." title="Permisos" />
          <AppCard padded={false}>
            {grantedCapabilities.map(({ capability, icon, label }, index) => (
              <View key={capability}>
                {index > 0 ? <AppDivider /> : null}
                <View
                  accessibilityLabel={label}
                  accessibilityRole="summary"
                  style={styles.permission}
                >
                  <AppIcon color="positive" name={icon} size={sizes.iconMd} />
                  <AppText style={styles.permissionLabel} variant="bodyStrong">
                    {label}
                  </AppText>
                </View>
              </View>
            ))}
          </AppCard>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Seguridad" />
          <AppButton
            icon="account"
            label="Cambiar contraseña"
            onPress={() => router.push('/account/change-password' as Href)}
            testID="profile-change-password"
            variant="secondary"
          />
          <AppButton
            icon="logout"
            label="Cerrar sesión"
            onPress={handleOpenSheet}
            testID="profile-logout"
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
    paddingBottom: spacing.xl,
  },
  identity: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  identityCard: { overflow: 'hidden' },
  identityCopy: { flex: 1, gap: spacing.xs, minWidth: 0 },
  permission: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: sizes.touchTarget,
    padding: spacing.md,
  },
  permissionLabel: { flex: 1, minWidth: 0 },
  safeArea: { backgroundColor: colors.background, flex: 1 },
  section: { gap: spacing.md },
  state: { flex: 1, justifyContent: 'center', padding: spacing.lg },
});
