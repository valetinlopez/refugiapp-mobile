import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState, ErrorState, LoadingState } from '@/components/feedback';
import { AppText } from '@/components/primitives';
import { useAnimal } from '@/features/animals/hooks/useAnimal';
import { isUuid } from '@/features/animals/utils/uuid';
import { useSession } from '@/features/auth/session';
import { MedicalRecordForm } from '@/features/medical-records/components/MedicalRecordForm';
import { useClinicalAttachments } from '@/features/medical-records/hooks/useClinicalAttachments';
import { useMedicalRecord } from '@/features/medical-records/hooks/useMedicalRecord';
import { useUpdateMedicalRecord } from '@/features/medical-records/hooks/useUpdateMedicalRecord';
import { useVeterinarianOptions } from '@/features/medical-records/hooks/useVeterinarianOptions';
import { toUpdateMedicalRecordErrorMessage } from '@/features/medical-records/utils/medicalRecordErrorMessages';
import { colors, spacing } from '@/theme';

export default function EditMedicalRecordScreen() {
  const { id, recordId } = useLocalSearchParams<{ id: string; recordId: string }>();
  const { user } = useSession();
  const canWriteClinical =
    user?.roles.some((role) => role === 'admin' || role === 'veterinarian') ?? false;
  const animalId = typeof id === 'string' && isUuid(id) ? id : '';
  const recordUuid = typeof recordId === 'string' && isUuid(recordId) ? recordId : '';
  const recordQuery = useMedicalRecord(recordUuid);
  const attachmentsQuery = useClinicalAttachments(recordUuid);
  const animalQuery = useAnimal(animalId);
  const veterinariansQuery = useVeterinarianOptions();
  const updateRecord = useUpdateMedicalRecord();

  if (!canWriteClinical || animalId === '' || recordUuid === '') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <EmptyState
            actionLabel="Volver"
            message={
              animalId === '' || recordUuid === ''
                ? 'No pudimos identificar el registro clínico.'
                : 'Tu rol no habilita editar datos clínicos.'
            }
            onAction={goBack}
            title={animalId === '' || recordUuid === '' ? 'Registro inválido' : 'Sin permiso'}
          />
        </View>
      </SafeAreaView>
    );
  }

  const pending =
    recordQuery.isPending ||
    attachmentsQuery.isPending ||
    animalQuery.isPending ||
    veterinariansQuery.isPending;
  const hasError =
    recordQuery.isError ||
    attachmentsQuery.isError ||
    animalQuery.isError ||
    veterinariansQuery.isError;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <AppText variant="heading1">Editar registro clínico</AppText>
        <AppText color="textSecondary">
          Actualizá el registro. Los campos que no cambies se conservan.
        </AppText>
        {pending ? <LoadingState label="Cargando registro clínico" /> : null}
        {hasError ? (
          <ErrorState
            actionLabel="Reintentar"
            message="No pudimos cargar el registro clínico."
            onAction={() => {
              void recordQuery.refetch();
              void attachmentsQuery.refetch();
              void animalQuery.refetch();
              void veterinariansQuery.refetch();
            }}
            title="No se pudo editar"
          />
        ) : null}
        {recordQuery.data &&
        attachmentsQuery.data &&
        animalQuery.data &&
        veterinariansQuery.data ? (
          <MedicalRecordForm
            errorMessage={
              updateRecord.error ? toUpdateMedicalRecordErrorMessage(updateRecord.error) : null
            }
            existingAttachments={attachmentsQuery.data}
            intakeDate={animalQuery.data.intakeDate}
            isSubmitting={updateRecord.isPending}
            mode="edit"
            onCancelUpload={updateRecord.cancelUpload}
            onSubmit={(input) => updateRecord.mutate(input, { onSuccess: goBack })}
            record={recordQuery.data}
            veterinarianOptions={veterinariansQuery.data}
            upload={updateRecord.upload}
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
