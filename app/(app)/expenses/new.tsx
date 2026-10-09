import { useLocalSearchParams } from 'expo-router';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { isUuid } from '@/core/validation';
import { AccountHeaderRow } from '@/features/auth/components/AccountHeaderRow';
import { CreateExpenseScreen } from '@/features/expenses/components/CreateExpenseScreen';
import { colors } from '@/theme';

export default function CreateExpenseRoute() {
  const { animalId } = useLocalSearchParams<{ animalId?: string }>();
  const initialAnimalId = typeof animalId === 'string' && isUuid(animalId) ? animalId : undefined;

  return (
    <SafeAreaView style={styles.safeArea}>
      <AccountHeaderRow accessibilityHint="Volver" fallbackHref="/expenses" />
      <CreateExpenseScreen {...(initialAnimalId ? { initialAnimalId } : {})} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 },
});
