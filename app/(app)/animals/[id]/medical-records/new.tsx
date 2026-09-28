import { useLocalSearchParams, type Href } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { navigateBack } from '@/components/navigation';
import { EmptyState, ErrorState, LoadingState } from '@/components/feedback';
import { AppText } from '@/components/primitives';
import { useAnimal } from '@/features/animals/hooks/useAnimal';
import { isUuid } from '@/features/animals/utils/uuid';
import { AccountHeaderRow } from '@/features/auth/components/AccountHeaderRow';
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
  const fallbackHref: Href = animalId
    ? { pathname: '/animals/[id]', params: { id: animalId } }
    : '/explore';
  const animalQuery = useAnimal(animalId);
  const veterinariansQuery = useVeterinarianOptions();
  const createRecord = useCreateMedicalRecord();

  if (!canWriteClinical || animalId === '') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <AccountHeaderRow
          accessibilityHint="Volver al detalle del animal"
          fallbackHref={fallbackHref}
        />
        <View style={styles.centered}>
          <EmptyState
            actionLabel="Volver"
            message={
              animalId === ''
                ? 'No pudimos identificar el animal.'
                : 'Tu rol no habilita registrar datos clínicos.'
            }
            onAction={() => navigateBack(fallbackHref)}
            title={animalId === '' ? 'Animal inválido' : 'Sin permiso'}
          />
        </View>
      </SafeAreaView>
    );
  }

  const pending = animalQuery.isPending;
  const hasError = animalQuery.isError;

  return (
    <SafeAreaView style={styles.safeArea}>
      <AccountHeaderRow
        accessibilityHint="Volver al detalle del animal"
        fallbackHref={fallbackHref}
      />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <AppText variant="heading1">Registrar consulta</AppText>
        <AppText color="textSecondary">
          Completá el registro clínico del animal. Podés adjuntar imágenes o PDF.
        </AppText>
        {pending ? <LoadingState label="Preparando formulario" /> : null}
        {hasError ? (
          <ErrorState
            actionLabel="Reintentar"
            message="No pudimos preparar el formulario del registro clínico."
            onAction={() => {
              void animalQuery.refetch();
            }}
            title="No se pudo preparar"
          />
        ) : null}
        {animalQuery.data ? (
          <MedicalRecordForm
            animalId={animalId}
            errorMessage={
              createRecord.error ? toCreateMedicalRecordErrorMessage(createRecord.error) : null
            }
            intakeDate={animalQuery.data.intakeDate}
            isSubmitting={createRecord.isPending}
            mode="create"
            onCancelUpload={createRecord.cancelUpload}
            onRetryVeterinarians={() => void veterinariansQuery.refetch()}
            onSubmit={(input) =>
              createRecord.mutate(input, {
                onSuccess: () => navigateBack(fallbackHref),
              })
            }
            veterinarianOptions={veterinariansQuery.data ?? []}
            veterinariansStatus={veterinariansQuery.veterinariansStatus}
            upload={createRecord.upload}
          />
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', padding: spacing.lg },
  content: { flexGrow: 1, gap: spacing.md, padding: spacing.lg },
  safeArea: { backgroundColor: colors.background, flex: 1 },
});
