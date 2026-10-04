import { useLocalSearchParams, type Href } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/feedback';
import { navigateBack } from '@/components/navigation';
import { AccountHeaderRow } from '@/features/auth/components/AccountHeaderRow';
import { useCapabilities } from '@/features/auth/hooks/useCapabilities';
import { MedicalRecordChangesScreen } from '@/features/medical-records/components/MedicalRecordChangesScreen';
import { isUuid } from '@/features/medical-records/utils/uuid';
import { colors, spacing } from '@/theme';

export default function MedicalRecordChangesRoute() {
  const params = useLocalSearchParams<{ id?: string; recordId?: string }>();
  const { canReadClinicalRecords } = useCapabilities();
  const id = typeof params.id === 'string' && isUuid(params.id) ? params.id : '';
  const recordId =
    typeof params.recordId === 'string' && isUuid(params.recordId) ? params.recordId : '';
  const fallbackHref: Href = id ? { pathname: '/animals/[id]', params: { id } } : '/explore';

  if (!canReadClinicalRecords || recordId === '') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <AccountHeaderRow
          accessibilityHint="Volver al detalle del animal"
          fallbackHref={fallbackHref}
        />
        <View style={styles.centered}>
          <EmptyState
            actionLabel="Volver"
            message={
              recordId === ''
                ? 'No pudimos identificar el registro clínico.'
                : 'Tu rol no habilita consultar el historial clínico.'
            }
            onAction={() => navigateBack(fallbackHref)}
            title={recordId === '' ? 'Registro inválido' : 'Sin permiso'}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <AccountHeaderRow
        accessibilityHint="Volver al detalle del animal"
        fallbackHref={fallbackHref}
      />
      <MedicalRecordChangesScreen recordId={recordId} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', padding: spacing.lg },
  safeArea: { backgroundColor: colors.background, flex: 1 },
});
