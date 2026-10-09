import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/feedback';
import { navigateBack } from '@/components/navigation';
import { AccountHeaderRow } from '@/features/auth/components/AccountHeaderRow';
import { useCapabilities } from '@/features/auth/hooks/useCapabilities';
import { CreateMedicalRecordScreen } from '@/features/medical-records/components/CreateMedicalRecordScreen';
import { isUuid } from '@/features/medical-records/utils/uuid';
import { colors, spacing } from '@/theme';

export default function NewMedicalRecordRoute() {
  const { animalId } = useLocalSearchParams<{ animalId?: string }>();
  const { canReadClinicalRecords } = useCapabilities();
  const initialAnimalId = typeof animalId === 'string' && isUuid(animalId) ? animalId : undefined;

  if (!canReadClinicalRecords) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <AccountHeaderRow accessibilityHint="Volver a Más" fallbackHref="/more" />
        <View style={styles.centered}>
          <EmptyState
            actionLabel="Volver"
            message="Tu rol no habilita registrar datos clínicos."
            onAction={() => navigateBack('/more')}
            title="Sin permiso"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <AccountHeaderRow
        accessibilityHint="Volver a la historia clínica"
        fallbackHref="/medical-records"
      />
      <CreateMedicalRecordScreen {...(initialAnimalId !== undefined ? { initialAnimalId } : {})} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', padding: spacing.lg },
  safeArea: { backgroundColor: colors.background, flex: 1 },
});
