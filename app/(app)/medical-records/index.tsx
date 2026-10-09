import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/feedback';
import { navigateBack } from '@/components/navigation';
import { AccountHeaderRow } from '@/features/auth/components/AccountHeaderRow';
import { useCapabilities } from '@/features/auth/hooks/useCapabilities';
import { MedicalRecordsOverviewScreen } from '@/features/medical-records/components/MedicalRecordsOverviewScreen';
import { isUuid } from '@/features/medical-records/utils/uuid';
import { colors, spacing } from '@/theme';

export default function MedicalRecordsRoute() {
  const params = useLocalSearchParams<{ animalId?: string; animalName?: string }>();
  const { canReadClinicalRecords } = useCapabilities();
  const initialAnimalId =
    typeof params.animalId === 'string' && isUuid(params.animalId) ? params.animalId : undefined;
  const initialAnimalName =
    initialAnimalId !== undefined && typeof params.animalName === 'string'
      ? params.animalName
      : undefined;

  if (!canReadClinicalRecords) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <AccountHeaderRow accessibilityHint="Volver a Más" fallbackHref="/more" />
        <View style={styles.centered}>
          <EmptyState
            actionLabel="Volver"
            message="Tu rol no habilita consultar la historia clínica del refugio."
            onAction={() => navigateBack('/more')}
            title="Sin permiso"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <AccountHeaderRow accessibilityHint="Volver a Más" fallbackHref="/more" />
      <MedicalRecordsOverviewScreen
        {...(initialAnimalId !== undefined ? { initialAnimalId } : {})}
        {...(initialAnimalName !== undefined ? { initialAnimalName } : {})}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', padding: spacing.lg },
  safeArea: { backgroundColor: colors.background, flex: 1 },
});
