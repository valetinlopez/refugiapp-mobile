import { Image, StyleSheet, View } from 'react-native';

import { EmptyState, ErrorState, LoadingState } from '@/components/feedback';
import { AppCard, AppText } from '@/components/primitives';
import { colors, radii, sizes, spacing } from '@/theme';

import { useAnimalExpenses } from '../hooks/useAnimalExpenses';
import { useExpenseReceipt } from '../hooks/useExpenseReceipt';
import type { Expense } from '../types';
import {
  formatAmountCents,
  formatExpenseDate,
  getExpenseCategoryLabel,
} from '../utils/expensePresentation';

export function AnimalExpenses({ animalId }: { animalId: string }) {
  const query = useAnimalExpenses(animalId);

  if (query.isPending) return <LoadingState label="Cargando gastos" />;
  if (query.isError) {
    return (
      <ErrorState
        actionLabel="Reintentar"
        message="No pudimos cargar los gastos del animal."
        onAction={() => void query.refetch()}
        title="No se pudieron cargar los gastos"
      />
    );
  }
  if (!query.data?.items.length) {
    return <EmptyState message="Todavía no hay gastos registrados." title="Sin gastos" />;
  }

  return (
    <View accessibilityLabel="Gastos del animal" style={styles.list}>
      {query.data.items.map((expense) => (
        <ExpenseCard expense={expense} key={expense.id} />
      ))}
    </View>
  );
}

function ExpenseCard({ expense }: { expense: Expense }) {
  const receipt = useExpenseReceipt(expense.ticketMediaId);
  return (
    <AppCard
      accessibilityLabel={`${getExpenseCategoryLabel(expense.category)}, ${formatAmountCents(expense.amountCents)}`}
    >
      <View style={styles.row}>
        <View style={styles.text}>
          <AppText variant="heading3">{formatAmountCents(expense.amountCents)}</AppText>
          <AppText color="textSecondary" variant="label">
            {getExpenseCategoryLabel(expense.category)} · {formatExpenseDate(expense.incurredAt)}
          </AppText>
          <AppText>{expense.description}</AppText>
        </View>
        {receipt.data ? (
          <Image
            accessibilityLabel="Comprobante del gasto"
            resizeMode="cover"
            source={{ uri: receipt.data }}
            style={styles.receipt}
          />
        ) : expense.ticketMediaId ? (
          <View accessibilityLabel="Comprobante no disponible" style={styles.receiptFallback}>
            <AppText color="textSecondary" variant="caption">
              Comprobante
            </AppText>
          </View>
        ) : null}
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.sm },
  receipt: { borderRadius: radii.md, height: sizes.avatarLg, width: sizes.avatarLg },
  receiptFallback: {
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.md,
    height: sizes.avatarLg,
    justifyContent: 'center',
    width: sizes.avatarLg,
  },
  row: { alignItems: 'flex-start', flexDirection: 'row', gap: spacing.md },
  text: { flex: 1, gap: spacing.xxs },
});
