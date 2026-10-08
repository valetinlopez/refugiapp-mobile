import { useLocalSearchParams } from 'expo-router';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { isUuid } from '@/core/validation';
import { AccountHeaderRow } from '@/features/auth/components/AccountHeaderRow';
import { ExpensesOverviewScreen } from '@/features/expenses/components/ExpensesOverviewScreen';
import { colors } from '@/theme';

export default function ExpensesRoute() {
  const params = useLocalSearchParams<{ animalId?: string; animalName?: string }>();
  const initialAnimalId =
    typeof params.animalId === 'string' && isUuid(params.animalId) ? params.animalId : undefined;
  const initialAnimalName =
    initialAnimalId !== undefined && typeof params.animalName === 'string'
      ? params.animalName
      : undefined;

  return (
    <SafeAreaView style={styles.safeArea}>
      <AccountHeaderRow accessibilityHint="Volver a Más" fallbackHref="/more" />
      <ExpensesOverviewScreen
        {...(initialAnimalId !== undefined ? { initialAnimalId } : {})}
        {...(initialAnimalName !== undefined ? { initialAnimalName } : {})}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 },
});
