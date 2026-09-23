import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState, ErrorState, LoadingState } from '@/components/feedback';
import { AppText } from '@/components/primitives';
import { useAnimal } from '@/features/animals/hooks/useAnimal';
import { isUuid } from '@/features/animals/utils/uuid';
import { useSession } from '@/features/auth/session';
import { MedicalRecordForm } from '@/features/medical-records/components/MedicalRecordForm';
import { useCreateMedicalRecord } from '@/features/medical-records/hooks/useCreateMedicalRecord';
import { useVeterinarianOptions } from '@/features/medical-records/hooks/useVeterinarianOptions';
import { toCreateMedicalRecordErrorMessage } from '@/features/medical-records/utils/medicalRecordErrorMessages';
import { colors, spacing } from '@/theme';

export default function NewMedicalRecordScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useSession();
  const canWriteClinical =
    user?.roles.some((role) => role === 'admin' || role === 'veterinarian') ?? false;
  const animalId = typeof id === 'string' && isUuid(id) ? id : '';
  const animalQuery = useAnimal(animalId);
  const veterinariansQuery = useVeterinarianOptions();
  const createRecord = useCreateMedicalRecord();

  if (!canWriteClinical || animalId === '') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <EmptyState
            actionLabel="Volver"
            message={
              animalId === ''
                ? 'No pudimos identificar el animal.'
                : 'Tu rol no habilita registrar datos clínicos.'
            }
            onAction={goBack}
            title={animalId === '' ? 'Animal inválido' : 'Sin permiso'}
          />
        </View>
      </SafeAreaView>
    );
  }

  const pending = animalQuery.isPending || veterinariansQuery.isPending;
  const hasError = animalQuery.isError || veterinariansQuery.isError;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <AppText variant="heading1">Registrar consulta</AppText>
        <AppText color="textSecondary">
          Completá el registro clínico del animal. Podés adjuntar imágenes.
        </AppText>
        {pending ? <LoadingState label="Preparando formulario" /> : null}
        {hasError ? (
          <ErrorState
            actionLabel="Reintentar"
            message="No pudimos preparar el formulario del registro clínico."
            onAction={() => {
              void animalQuery.refetch();
              void veterinariansQuery.refetch();
            }}
            title="No se pudo preparar"
          />
        ) : null}
        {animalQuery.data && veterinariansQuery.data ? (
          <MedicalRecordForm
            animalId={animalId}
            errorMessage={
              createRecord.error ? toCreateMedicalRecordErrorMessage(createRecord.error) : null
            }
            intakeDate={animalQuery.data.intakeDate}
            isSubmitting={createRecord.isPending}
            mode="create"
            onSubmit={(input) =>
              createRecord.mutate(input, {
                onSuccess: () => goBack(),
              })
            }
            veterinarianOptions={veterinariansQuery.data}
          />
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function goBack(): void {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace('/explore');
  }
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', padding: spacing.lg },
  content: { flexGrow: 1, gap: spacing.md, padding: spacing.lg },
  safeArea: { backgroundColor: colors.background, flex: 1 },
});