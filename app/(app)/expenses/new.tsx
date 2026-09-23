import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState, ErrorState, LoadingState } from '@/components/feedback';
import { AppText } from '@/components/primitives';
import { useSession } from '@/features/auth/session';
import { ExpenseForm } from '@/features/expenses/components/ExpenseForm';
import { useCreateExpense } from '@/features/expenses/hooks/useCreateExpense';
import { useExpenseAnimals } from '@/features/expenses/hooks/useExpenseAnimals';
import { colors, spacing } from '@/theme';

export default function CreateExpenseScreen() {
  const { animalId } = useLocalSearchParams<{ animalId?: string }>();
  const { user } = useSession();
  const canWrite =
    user?.roles.some((role) => role === 'admin' || role === 'shelter_manager') ?? false;
  const animals = useExpenseAnimals();
  const createExpense = useCreateExpense();

  if (!canWrite)
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <EmptyState
            actionLabel="Volver"
            message="Tu rol permite consultar gastos, pero no registrarlos."
            onAction={goBack}
            title="Sin permiso"
          />
        </View>
      </SafeAreaView>
    );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <AppText variant="heading1">Registrar gasto</AppText>
        <AppText color="textSecondary">
          El importe se registra en centavos y el comprobante queda asociado al gasto.
        </AppText>
        {animals.isPending ? <LoadingState label="Cargando animales" /> : null}
        {animals.isError ? (
          <ErrorState
            actionLabel="Reintentar"
            message="No pudimos cargar los animales."
            onAction={() => void animals.refetch()}
            title="No se pudo preparar el formulario"
          />
        ) : null}
        {animals.data ? (
          <ExpenseForm
            animalOptions={animals.data}
            errorMessage={createExpense.error?.message ?? null}
            {...(typeof animalId === 'string' ? { initialAnimalId: animalId } : {})}
            isSubmitting={createExpense.isPending}
            onCancelUpload={createExpense.cancelUpload}
            onSubmit={(form, receipt) =>
              createExpense.mutate({ form, receipt }, { onSuccess: goBack })
            }
            uploadProgress={createExpense.uploadProgress}
          />
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function goBack(): void {
  if (router.canGoBack()) router.back();
  else router.replace('/explore');
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', padding: spacing.lg },
  content: { flexGrow: 1, gap: spacing.md, padding: spacing.lg },
  safeArea: { backgroundColor: colors.background, flex: 1 },
});
