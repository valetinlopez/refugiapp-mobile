import { type Href, router } from 'expo-router';
import { AccessibilityInfo, Linking, ScrollView, StyleSheet, View } from 'react-native';

import { EmptyState, ErrorState, LoadingState, OfflineState } from '@/components/feedback';
import { navigateBack } from '@/components/navigation';
import { DecorativeBackground, ScreenHeader } from '@/components/patterns';
import { AppText } from '@/components/primitives';
import { isNetworkError } from '@/core/network';
import { useCapabilities } from '@/features/auth/hooks/useCapabilities';
import { useSession } from '@/features/auth/session';
import { colors, spacing } from '@/theme';

import { useDeleteExpense } from '../hooks/useDeleteExpense';
import { useExpense } from '../hooks/useExpense';
import { useExpenseAnimal } from '../hooks/useExpenseAnimal';
import { useExpenseReceiptAsset } from '../hooks/useExpenseReceiptAsset';
import {
  toDeleteExpenseErrorMessage,
  toExpenseDetailErrorMessage,
} from '../utils/expenseErrorMessages';
import { getRegisteredByLabel } from '../utils/expensePresentation';
import { isSafeReceiptUrl } from '../utils/expenseReceipt';
import { ExpenseDetail } from './ExpenseDetail';
import type { ExpenseReceiptCardState } from './ExpenseReceiptCard';

export interface ExpenseDetailScreenProps {
  expenseId: string;
}

/**
 * Expense detail screen (D24 / RFG-157).
 *
 * Coordinates the expense query with its animal identity and optional receipt,
 * and owns the delete flow. Read access is available to every role; the delete
 * action is presented only with `canManageExpenses` and always confirmed.
 * Errors, offline state and an invalid route id each have an explicit surface.
 */
export function ExpenseDetailScreen({ expenseId }: ExpenseDetailScreenProps) {
  const { canManageExpenses: canWrite } = useCapabilities();
  const { user } = useSession();
  const fallbackHref: Href = '/expenses';

  const expenseQuery = useExpense(expenseId);
  const expense = expenseQuery.data;
  const animalQuery = useExpenseAnimal(expense?.animalId);
  const receiptQuery = useExpenseReceiptAsset(expense?.ticketMediaId ?? null);
  const deleteExpense = useDeleteExpense();
  const isValidId = expenseId !== '';
  const loadError = expenseQuery.error;

  function retry(): void {
    void expenseQuery.refetch();
    if (expense !== undefined) void animalQuery.refetch();
  }

  function openReceipt(): void {
    const url = receiptQuery.data?.secureUrl;
    if (url === undefined || !isSafeReceiptUrl(url)) {
      AccessibilityInfo.announceForAccessibility('No pudimos abrir el comprobante.');
      return;
    }
    Linking.openURL(url).catch(() => {
      AccessibilityInfo.announceForAccessibility('No pudimos abrir el comprobante.');
    });
  }

  function handleDelete(): void {
    deleteExpense.mutate(expenseId, {
      onSuccess: () => {
        AccessibilityInfo.announceForAccessibility('Gasto eliminado.');
        navigateBack(fallbackHref);
      },
    });
  }

  const receiptState: ExpenseReceiptCardState =
    expense === undefined || expense.ticketMediaId === null
      ? { status: 'empty' }
      : receiptQuery.isPending
        ? { status: 'loading' }
        : receiptQuery.isError || receiptQuery.data === undefined
          ? { status: 'error', message: 'No pudimos cargar el comprobante.' }
          : { status: 'ready', receipt: receiptQuery.data };

  return (
    <View style={styles.fill}>
      <DecorativeBackground variant="texture" />
      <ScrollView contentContainerStyle={styles.content}>
        <AppText color="textSecondary" variant="label">
          Gastos
        </AppText>
        <ScreenHeader title="Detalle del gasto" titleVariant="display" />

        {!isValidId ? (
          <EmptyState
            actionLabel="Volver"
            message="El gasto solicitado no es válido."
            onAction={() => navigateBack(fallbackHref)}
            title="Gasto no encontrado"
          />
        ) : null}

        {isValidId && expenseQuery.isPending ? (
          <LoadingState label="Cargando detalle del gasto" />
        ) : null}

        {isValidId && expenseQuery.isError ? (
          isNetworkError(loadError) ? (
            <OfflineState
              actionLabel="Reintentar"
              message="Conectate a internet para cargar el detalle del gasto."
              onAction={retry}
              testID="expense-detail-offline"
              title="Sin conexión"
            />
          ) : (
            <ErrorState
              actionLabel="Reintentar"
              message={toExpenseDetailErrorMessage(loadError)}
              onAction={retry}
              title="No se pudo cargar"
            />
          )
        ) : null}

        {expense ? (
          <ExpenseDetail
            {...(animalQuery.data !== undefined ? { animal: animalQuery.data } : {})}
            canWrite={canWrite}
            {...(deleteExpense.isError
              ? { deleteError: toDeleteExpenseErrorMessage(deleteExpense.error) }
              : {})}
            expense={expense}
            isDeleting={deleteExpense.isPending}
            onDelete={handleDelete}
            onOpenAnimal={(animalId) =>
              router.push({ pathname: '/animals/[id]', params: { id: animalId, tab: 'expenses' } })
            }
            onOpenReceipt={openReceipt}
            onRetryReceipt={() => void receiptQuery.refetch()}
            receiptOpening={receiptQuery.isFetching}
            receiptState={receiptState}
            registeredBy={getRegisteredByLabel(expense.createdByUserId, user?.id)}
          />
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, gap: spacing.md, padding: spacing.lg, paddingBottom: spacing['3xl'] },
  fill: { backgroundColor: colors.background, flex: 1 },
});
