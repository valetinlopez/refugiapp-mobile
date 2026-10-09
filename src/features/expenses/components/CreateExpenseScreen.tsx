import { type Href } from 'expo-router';
import { AccessibilityInfo, ScrollView, StyleSheet, View } from 'react-native';

import {
  EmptyState,
  ErrorState,
  FeedbackState,
  LoadingState,
  OfflineState,
} from '@/components/feedback';
import { navigateBack } from '@/components/navigation';
import { DecorativeBackground, ScreenHeader } from '@/components/patterns';
import { AppText } from '@/components/primitives';
import { useConnectivityStatus } from '@/core/network';
import { useCapabilities } from '@/features/auth/hooks/useCapabilities';
import { colors, spacing } from '@/theme';

import { useCreateExpense } from '../hooks/useCreateExpense';
import { useExpenseAnimals } from '../hooks/useExpenseAnimals';
import type { ReceiptFile } from '../types';
import { toCreateExpenseErrorMessage } from '../utils/expenseErrorMessages';
import type { ExpenseFormValues } from '../utils/expenseSchema';
import { ExpenseForm } from './ExpenseForm';

export interface CreateExpenseScreenProps {
  initialAnimalId?: string | undefined;
}

export function CreateExpenseScreen({ initialAnimalId }: CreateExpenseScreenProps) {
  const { canManageExpenses: canWrite } = useCapabilities();
  const isOnline = useConnectivityStatus();
  const fallbackHref: Href = initialAnimalId
    ? { pathname: '/animals/[id]', params: { id: initialAnimalId, tab: 'expenses' } }
    : '/expenses';
  const animals = useExpenseAnimals(initialAnimalId);
  const createExpense = useCreateExpense();

  if (!canWrite) {
    return (
      <View style={styles.fill}>
        <DecorativeBackground variant="texture" />
        <View style={styles.centered}>
          <EmptyState
            actionLabel="Volver"
            message="Tu rol permite consultar gastos, pero no registrarlos."
            onAction={() => navigateBack(fallbackHref)}
            title="Sin permiso"
          />
        </View>
      </View>
    );
  }

  const hasAnimals = animals.data !== undefined && animals.data.length > 0;

  return (
    <View style={styles.fill}>
      <DecorativeBackground variant="texture" />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <AppText color="textSecondary" variant="label">
          Gastos
        </AppText>
        <ScreenHeader
          subtitle="Añade un gasto del refugio"
          title="Registrar gasto"
          titleVariant="display"
        />

        {animals.isPending && animals.data === undefined ? (
          <LoadingState label="Cargando animales" />
        ) : null}
        {animals.isError ? (
          isOnline ? (
            <ErrorState
              actionLabel="Reintentar"
              message={animals.errorMessage ?? 'No pudimos cargar los animales.'}
              onAction={() => void animals.refetch()}
              title="No se pudo preparar el formulario"
            />
          ) : (
            <OfflineState
              actionLabel="Reintentar"
              message="Conectate a internet para cargar los animales y registrar el gasto."
              onAction={() => void animals.refetch()}
              testID="new-expense-offline"
              title="Sin conexión"
            />
          )
        ) : null}
        {animals.isFallback ? (
          <FeedbackState
            icon="info"
            message="Se muestra solo el animal seleccionado; el listado completo no pudo cargarse."
            title="Listado de animales incompleto"
            tone="info"
          />
        ) : null}
        {!animals.isPending && !animals.isError && !hasAnimals ? (
          <EmptyState
            actionLabel="Actualizar"
            message="Necesitás al menos un animal registrado para cargar un gasto."
            onAction={() => void animals.refetch()}
            title="No hay animales disponibles"
          />
        ) : null}
        {hasAnimals ? (
          <ExpenseForm
            animalOptions={animals.data ?? []}
            errorMessage={
              createExpense.error ? toCreateExpenseErrorMessage(createExpense.error) : null
            }
            {...(initialAnimalId ? { initialAnimalId } : {})}
            isSubmitting={createExpense.isPending}
            onCancel={() => navigateBack(fallbackHref)}
            onCancelUpload={createExpense.cancelUpload}
            onSubmit={(values: ExpenseFormValues, receipt: ReceiptFile | null) =>
              createExpense.mutate(
                { form: values, receipt },
                {
                  onSuccess: () => {
                    AccessibilityInfo.announceForAccessibility('Gasto registrado.');
                    navigateBack(fallbackHref);
                  },
                }
              )
            }
            uploadProgress={createExpense.uploadProgress}
          />
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', padding: spacing.lg },
  content: { flexGrow: 1, gap: spacing.md, padding: spacing.lg, paddingBottom: spacing['3xl'] },
  fill: { backgroundColor: colors.background, flex: 1 },
});
