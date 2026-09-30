import { router, type Href } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/primitives';
import { spacing } from '@/theme';

import { ManagementCard } from './ManagementCard';

export interface ManagementSectionProps {
  canManageUsers: boolean;
  canReadAudit: boolean;
}

/**
 * Sección "Gestión" de la pestaña "Más". Coordina la navegación hacia las
 * rutas de administración existentes (veterinarios, usuarios y auditoría)
 * filtrando por capacidades. La card de veterinarios se muestra a todos los
 * roles porque la lectura está permitida; la de usuarios solo a quien puede
 * gestionarlos y la de auditoría solo a quien puede leerla (`canReadAudit`).
 * No importa internals de otras features; solo enlaza rutas.
 */
export function ManagementSection({ canManageUsers, canReadAudit }: ManagementSectionProps) {
  return (
    <View style={styles.section}>
      <AppText variant="heading2">Gestión</AppText>
      <View style={styles.cards}>
        <ManagementCard
          description="Listado, detalle y estados de profesionales"
          hint="Ir a veterinarios"
          icon="medical"
          label="Veterinarios"
          onPress={() => router.push('/veterinarians' as Href)}
        />
        {canManageUsers ? (
          <ManagementCard
            description="Cuentas internas del refugio"
            hint="Ir a usuarios"
            icon="account"
            label="Usuarios"
            onPress={() => router.push('/users' as Href)}
          />
        ) : null}
        {canReadAudit ? (
          <ManagementCard
            description="Trazabilidad de acciones del refugio"
            hint="Ir a auditoría"
            icon="clock"
            label="Ver auditoría"
            onPress={() => router.push('/audit' as Href)}
          />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cards: { gap: spacing.sm },
  section: { gap: spacing.md },
});
