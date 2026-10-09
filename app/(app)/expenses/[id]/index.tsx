import { useLocalSearchParams } from 'expo-router';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { isUuid } from '@/core/validation';
import { AccountHeaderRow } from '@/features/auth/components/AccountHeaderRow';
import { ExpenseDetailScreen } from '@/features/expenses/components/ExpenseDetailScreen';
import { colors } from '@/theme';

export default function ExpenseDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const expenseId = typeof id === 'string' && isUuid(id) ? id : '';

  return (
    <SafeAreaView style={styles.safeArea}>
      <AccountHeaderRow accessibilityHint="Volver a Gastos" fallbackHref="/expenses" />
      <ExpenseDetailScreen expenseId={expenseId} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 },
});
