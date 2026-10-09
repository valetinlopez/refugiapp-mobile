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

import { useCreateMedicalRecord } from '../hooks/useCreateMedicalRecord';
import { useMedicalRecordAnimals } from '../hooks/useMedicalRecordAnimals';
import { useVeterinarianOptions } from '../hooks/useVeterinarianOptions';
import { toCreateMedicalRecordErrorMessage } from '../utils/medicalRecordErrorMessages';
import { MedicalRecordForm } from './MedicalRecordForm';

export interface CreateMedicalRecordScreenProps {
  initialAnimalId?: string | undefined;
}

/**
 * Global "Nuevo registro clínico" composer (D26 / RFG-159).
 *
 * Owns preparation and permissions for the global create flow: resolves the
 * selectable animal options through the shared `application/animals` boundary,
 * loads active veterinarians (non-blocking) and delegates the mutation to
 * `useCreateMedicalRecord`. The route passes an optional `animalId` so a deep
 * link or the animal detail tab can preselect the animal without breaking the
 * global entry. All clinical data stays in memory only.
 */
export function CreateMedicalRecordScreen({ initialAnimalId }: CreateMedicalRecordScreenProps) {
  const { canReadClinicalRecords: canWrite } = useCapabilities();
  const isOnline = useConnectivityStatus();
  const fallbackHref: Href = initialAnimalId
    ? { pathname: '/animals/[id]', params: { id: initialAnimalId, tab: 'clinical' } }
    : '/medical-records';
  const animalsQuery = useMedicalRecordAnimals(initialAnimalId);
  const veterinariansQuery = useVeterinarianOptions();
  const createRecord = useCreateMedicalRecord();

  if (!canWrite) {
    return (
      <View style={styles.fill}>
        <DecorativeBackground variant="texture" />
        <View style={styles.centered}>
          <EmptyState
            actionLabel="Volver"
            message="Tu rol no habilita registrar datos clínicos."
            onAction={() => navigateBack(fallbackHref)}
            title="Sin permiso"
          />
        </View>
      </View>
    );
  }

  const hasAnimals = animalsQuery.data !== undefined && animalsQuery.data.length > 0;

  return (
    <View style={styles.fill}>
      <DecorativeBackground variant="texture" />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <AppText color="textSecondary" variant="label">
          Historia clínica
        </AppText>
        <ScreenHeader
          subtitle="Registra una nueva atención"
          title="Nuevo registro clínico"
          titleVariant="display"
        />

        {animalsQuery.isPending && animalsQuery.data === undefined ? (
          <LoadingState label="Cargando animales" />
        ) : null}
        {animalsQuery.isError ? (
          isOnline ? (
            <ErrorState
              actionLabel="Reintentar"
              message={animalsQuery.errorMessage ?? 'No pudimos cargar los animales.'}
              onAction={() => void animalsQuery.refetch()}
              title="No se pudo preparar el formulario"
            />
          ) : (
            <OfflineState
              actionLabel="Reintentar"
              message="Conectate a internet para cargar los animales y registrar el registro clínico."
              onAction={() => void animalsQuery.refetch()}
              testID="new-clinical-offline"
              title="Sin conexión"
            />
          )
        ) : null}
        {animalsQuery.isFallback ? (
          <FeedbackState
            icon="info"
            message="Se muestra solo el animal seleccionado; el listado completo no pudo cargarse."
            title="Listado de animales incompleto"
            tone="info"
          />
        ) : null}
        {!animalsQuery.isPending && !animalsQuery.isError && !hasAnimals ? (
          <EmptyState
            actionLabel="Actualizar"
            message="Necesitás al menos un animal registrado para crear un registro clínico."
            onAction={() => void animalsQuery.refetch()}
            title="No hay animales disponibles"
          />
        ) : null}
        {hasAnimals ? (
          <MedicalRecordForm
            animalOptions={animalsQuery.data ?? []}
            errorMessage={
              createRecord.error ? toCreateMedicalRecordErrorMessage(createRecord.error) : null
            }
            {...(initialAnimalId ? { initialAnimalId } : {})}
            isSubmitting={createRecord.isPending}
            mode="create"
            onCancel={() => navigateBack(fallbackHref)}
            onCancelUpload={createRecord.cancelUpload}
            onRetryVeterinarians={() => void veterinariansQuery.refetch()}
            onSubmit={(input) =>
              createRecord.mutate(input, {
                onSuccess: () => {
                  AccessibilityInfo.announceForAccessibility('Registro clínico creado.');
                  navigateBack(fallbackHref);
                },
              })
            }
            upload={createRecord.upload}
            veterinarianOptions={veterinariansQuery.data ?? []}
            veterinariansStatus={veterinariansQuery.veterinariansStatus}
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
