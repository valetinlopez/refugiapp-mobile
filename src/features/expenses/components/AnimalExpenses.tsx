import { router, type Href } from 'expo-router';
import { Image } from 'expo-image';
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { EmptyState, ErrorState, LoadingState, OfflineState } from '@/components/feedback';
import { OFFLINE_STATE_TEST_ID, offlineCopy } from '@/components/feedback/offlineCopy';
import { AppButton, AppCard, AppText } from '@/components/primitives';
import { optimizeCloudinaryImageUrl } from '@/core/media';
import { isNetworkError } from '@/core/network';
import { colors, radii, sizes, spacing } from '@/theme';

import { useAnimalExpenses } from '../hooks/useAnimalExpenses';
import { useExpenseReceipt } from '../hooks/useExpenseReceipt';
import type { Expense } from '../types';
import {
  formatAmountCents,
  formatExpenseDate,
  getExpenseCategoryLabel,
} from '../utils/expensePresentation';

export function AnimalExpenses({ animalId, canWrite }: { animalId: string; canWrite: boolean }) {
  const query = useAnimalExpenses(animalId);

  return (
    <View accessibilityLabel="Gastos del animal" style={styles.list}>
      {canWrite ? (
        <>
          <AppButton
            icon="money"
            label="Registrar gasto"
            onPress={() =>
              router.push({ pathname: '/expenses/new', params: { animalId } } as unknown as Href)
            }
          />
          <AppText color="textSecondary" variant="caption">
            La edición de gastos no está disponible en el backend.
          </AppText>
        </>
      ) : (
        <AppText color="textSecondary">
          Tu rol permite consultar estos gastos, pero no registrarlos ni modificarlos.
        </AppText>
      )}
      {query.isPending ? <LoadingState label="Cargando gastos" /> : null}
      {query.isError ? (
        isNetworkError(query.error) ? (
          <OfflineState
            actionLabel={offlineCopy.actionLabel}
            message={offlineCopy.message}
            onAction={() => void query.refetch()}
            testID={OFFLINE_STATE_TEST_ID}
            title={offlineCopy.title}
          />
        ) : (
          <ErrorState
            actionLabel="Reintentar"
            message="No pudimos cargar los gastos del animal."
            onAction={() => void query.refetch()}
            title="No se pudieron cargar los gastos"
          />
        )
      ) : null}
      {!query.isPending && !query.isError && !query.data?.items.length ? (
        <EmptyState message="Todavía no hay gastos registrados." title="Sin gastos" />
      ) : null}
      {query.data?.items.map((expense) => (
        <ExpenseCard expense={expense} key={expense.id} />
      ))}
    </View>
  );
}

const ExpenseCard = memo(function ExpenseCard({ expense }: { expense: Expense }) {
  const receipt = useExpenseReceipt(expense.ticketMediaId);
  const receiptUri = receipt.data
    ? optimizeCloudinaryImageUrl(receipt.data, { width: 400 })
    : undefined;
  return (
    <AppCard
      accessibilityLabel={`${getExpenseCategoryLabel(expense.category)}, ${formatAmountCents(expense.amountCents)}, ${expense.description}`}
    >
      <View style={styles.row}>
        <View style={styles.text}>
          <AppText numberOfLines={1} variant="heading3">
            {formatAmountCents(expense.amountCents)}
          </AppText>
          <AppText color="textSecondary" numberOfLines={2} variant="label">
            {getExpenseCategoryLabel(expense.category)} · {formatExpenseDate(expense.incurredAt)}
          </AppText>
          <AppText numberOfLines={3}>{expense.description}</AppText>
        </View>
        {receiptUri ? (
          <Image
            accessibilityLabel="Comprobante del gasto"
            allowDownscaling
            cachePolicy="memory-disk"
            contentFit="cover"
            loading="lazy"
            priority="low"
            recyclingKey={expense.id}
            source={{ uri: receiptUri }}
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
});

const styles = StyleSheet.create({
  list: { gap: spacing.sm },
  receipt: {
    borderRadius: radii.md,
    flexShrink: 0,
    height: sizes.avatarLg,
    width: sizes.avatarLg,
  },
  receiptFallback: {
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.md,
    flexShrink: 0,
    height: sizes.avatarLg,
    justifyContent: 'center',
    width: sizes.avatarLg,
  },
  row: { alignItems: 'flex-start', flexDirection: 'row', gap: spacing.md },
  text: { flex: 1, gap: spacing.xxs, minWidth: 0 },
});
