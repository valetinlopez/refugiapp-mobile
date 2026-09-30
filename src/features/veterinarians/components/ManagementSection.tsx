import { router, type Href } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/primitives';
import { spacing } from '@/theme';

import { ManagementCard } from './ManagementCard';

export interface ManagementSectionProps {
  canManageUsers: boolean;
}

/**
 * Sección "Gestión" de la pestaña "Más". Coordina la navegación hacia las
 * rutas de administración existentes (veterinarios y usuarios) filtrando por
 * capacidades. La card de veterinarios se muestra a todos los roles porque la
 * lectura está permitida; la de usuarios solo a quien puede gestionarlos.
 * No importa internals de otras features; solo enlaza rutas.
 */
export function ManagementSection({ canManageUsers }: ManagementSectionProps) {
  return (
    <View style={styles.section}>
      <AppText variant="heading2">Gestión</AppText>
      <View style={styles.cards}>
        <ManagementCard
          description="Listado, detalle y estados de profesionales"
          label="Veterinarios"
          onPress={() => router.push('/veterinarians' as Href)}
          variant="primary"
        />
        {canManageUsers ? (
          <ManagementCard
            description="Cuentas internas del refugio"
            label="Usuarios"
            onPress={() => router.push('/users' as Href)}
            variant="secondary"
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
