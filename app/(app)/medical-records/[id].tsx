import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/feedback';
import { navigateBack } from '@/components/navigation';
import { AccountHeaderRow } from '@/features/auth/components/AccountHeaderRow';
import { useCapabilities } from '@/features/auth/hooks/useCapabilities';
import { MedicalRecordDetailScreen } from '@/features/medical-records/components/MedicalRecordDetailScreen';
import { isUuid } from '@/features/medical-records/utils/uuid';
import { colors, spacing } from '@/theme';

export default function MedicalRecordDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { canReadClinicalRecords } = useCapabilities();
  const recordId = typeof id === 'string' && isUuid(id) ? id : '';

  if (!canReadClinicalRecords) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <AccountHeaderRow
          accessibilityHint="Volver a Historia clínica"
          fallbackHref="/medical-records"
        />
        <View style={styles.centered}>
          <EmptyState
            actionLabel="Volver"
            message="Tu rol no habilita consultar registros clínicos."
            onAction={() => navigateBack('/medical-records')}
            title="Sin permiso"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <AccountHeaderRow
        accessibilityHint="Volver a Historia clínica"
        fallbackHref="/medical-records"
      />
      <MedicalRecordDetailScreen recordId={recordId} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', padding: spacing.lg },
  safeArea: { backgroundColor: colors.background, flex: 1 },
});
