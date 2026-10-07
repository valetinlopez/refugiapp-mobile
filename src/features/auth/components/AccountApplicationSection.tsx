import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { SectionHeader } from '@/components/patterns';
import { AppBadge, AppCard, AppIcon, AppText } from '@/components/primitives';
import { colors, opacity, radii, sizes, spacing } from '@/theme';

interface AccountApplicationSectionProps {
  isOnline: boolean;
  onChangePassword(): void;
}

export function AccountApplicationSection({
  isOnline,
  onChangePassword,
}: AccountApplicationSectionProps) {
  const [aboutExpanded, setAboutExpanded] = useState(false);

  return (
    <View style={styles.section} testID="application-section">
      <SectionHeader subtitle="Tecnología al servicio del bienestar animal." title="Aplicación" />
      <AppCard padded={false} variant="outlined">
        <View accessibilityRole="summary" style={styles.row} testID="connectivity-status">
          <AppIcon
            color={isOnline ? 'positive' : 'textSecondary'}
            name={isOnline ? 'check' : 'offline'}
            size={sizes.iconMd}
          />
          <View style={styles.copy}>
            <AppText variant="bodyStrong">Conectividad</AppText>
            <AppText color="textSecondary" variant="caption">
              {isOnline ? 'Servicios disponibles' : 'Trabajando sin conexión'}
            </AppText>
          </View>
          <AppBadge
            label={isOnline ? 'En línea' : 'Sin conexión'}
            tone={isOnline ? 'positive' : 'neutral'}
          />
        </View>

        <View style={styles.divider} />

        <Pressable
          accessibilityHint="Muestra u oculta información sobre Refugiapp"
          accessibilityLabel="Acerca de Refugiapp"
          accessibilityRole="button"
          accessibilityState={{ expanded: aboutExpanded }}
          onPress={() => setAboutExpanded((expanded) => !expanded)}
          style={({ pressed }) => [styles.row, pressed && styles.pressed]}
          testID="about-toggle"
        >
          <AppIcon color="textSecondary" name="info" size={sizes.iconMd} />
          <View style={styles.copy}>
            <AppText variant="bodyStrong">Acerca de</AppText>
            <AppText color="textSecondary" variant="caption">
              {aboutExpanded ? 'Ocultar información' : 'Conocé el propósito de la aplicación'}
            </AppText>
          </View>
          <AppIcon color="textSecondary" name="chevronRight" size={sizes.iconSm} />
        </Pressable>

        {aboutExpanded ? (
          <View accessibilityLiveRegion="polite" style={styles.about} testID="about-content">
            <AppText variant="bodyStrong">Refugiapp</AppText>
            <AppText color="textSecondary">
              Centraliza el trabajo cotidiano del refugio para que el equipo pueda cuidar, organizar
              y dar seguimiento a cada animal.
            </AppText>
          </View>
        ) : null}

        <View style={styles.divider} />

        <Pressable
          accessibilityHint="Abre el formulario de cambio de contraseña"
          accessibilityLabel="Cambiar contraseña"
          accessibilityRole="button"
          onPress={onChangePassword}
          style={({ pressed }) => [styles.row, pressed && styles.pressed]}
          testID="account-change-password"
        >
          <AppIcon color="textSecondary" name="account" size={sizes.iconMd} />
          <View style={styles.copy}>
            <AppText variant="bodyStrong">Seguridad de la cuenta</AppText>
            <AppText color="textSecondary" variant="caption">
              Cambiar contraseña
            </AppText>
          </View>
          <AppIcon color="textSecondary" name="chevronRight" size={sizes.iconSm} />
        </Pressable>
      </AppCard>
    </View>
  );
}

const styles = StyleSheet.create({
  about: {
    gap: spacing.xs,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  copy: { flex: 1, gap: spacing.xxs, minWidth: 0 },
  divider: { backgroundColor: colors.divider, height: sizes.divider, marginHorizontal: spacing.md },
  pressed: { opacity: opacity.pressed },
  row: {
    alignItems: 'center',
    borderRadius: radii.lg,
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: sizes.touchTarget,
    padding: spacing.md,
  },
  section: { gap: spacing.md },
});
