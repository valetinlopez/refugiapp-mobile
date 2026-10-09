import { type Href, router } from 'expo-router';
import { AccessibilityInfo, Linking, ScrollView, StyleSheet, View } from 'react-native';

import { useAnimalOption } from '@/application/animals';
import { useVeterinarianDirectoryEntry } from '@/application/veterinarians';
import { EmptyState, ErrorState, LoadingState, OfflineState } from '@/components/feedback';
import { navigateBack } from '@/components/navigation';
import { DecorativeBackground, ScreenHeader } from '@/components/patterns';
import { AppText } from '@/components/primitives';
import { isNetworkError } from '@/core/network';
import { useCapabilities } from '@/features/auth/hooks/useCapabilities';
import { colors, spacing } from '@/theme';

import type { ClinicalAttachment } from '../types';
import { useClinicalAttachments } from '../hooks/useClinicalAttachments';
import { useDeleteMedicalRecord } from '../hooks/useDeleteMedicalRecord';
import { useMedicalRecord } from '../hooks/useMedicalRecord';
import {
  toDeleteMedicalRecordErrorMessage,
  toMedicalRecordDetailErrorMessage,
} from '../utils/medicalRecordErrorMessages';
import { isSafeClinicalAttachmentUrl } from '../utils/medicalRecordDetailPresentation';
import { MedicalRecordDetail } from './MedicalRecordDetail';

export interface MedicalRecordDetailScreenProps {
  recordId: string;
}

export function MedicalRecordDetailScreen({ recordId }: MedicalRecordDetailScreenProps) {
  const { canReadClinicalRecords: canWrite } = useCapabilities();
  const fallbackHref: Href = '/medical-records';
  const isValidId = recordId !== '';
  const recordQuery = useMedicalRecord(recordId);
  const record = recordQuery.data;
  const animalQuery = useAnimalOption(record?.animalId, record !== undefined);
  const veterinarianQuery = useVeterinarianDirectoryEntry(
    record?.veterinarianId,
    record !== undefined
  );
  const attachmentsQuery = useClinicalAttachments(recordId, record !== undefined);
  const deleteRecord = useDeleteMedicalRecord();
  const hasVeterinarian = record?.veterinarianId !== null && record?.veterinarianId !== undefined;
  const isPending =
    recordQuery.isPending ||
    (record !== undefined && attachmentsQuery.isPending) ||
    (record !== undefined && animalQuery.isPending) ||
    (hasVeterinarian && veterinarianQuery.isPending);
  const loadError =
    recordQuery.error ?? animalQuery.error ?? veterinarianQuery.error ?? attachmentsQuery.error;
  const isError =
    recordQuery.isError ||
    animalQuery.isError ||
    attachmentsQuery.isError ||
    (hasVeterinarian && veterinarianQuery.isError);

  function retry(): void {
    void recordQuery.refetch();
    if (record !== undefined) {
      void attachmentsQuery.refetch();
      void animalQuery.refetch();
      if (record.veterinarianId !== null) void veterinarianQuery.refetch();
    }
  }

  function openAttachment(attachment: ClinicalAttachment): void {
    if (!isSafeClinicalAttachmentUrl(attachment.secureUrl)) {
      AccessibilityInfo.announceForAccessibility('No pudimos abrir el adjunto.');
      return;
    }
    Linking.openURL(attachment.secureUrl).catch(() => {
      AccessibilityInfo.announceForAccessibility('No pudimos abrir el adjunto.');
    });
  }

  function removeRecord(): void {
    deleteRecord.mutate(recordId, {
      onSuccess: () => {
        AccessibilityInfo.announceForAccessibility('Registro clínico eliminado.');
        navigateBack(fallbackHref);
      },
    });
  }

  return (
    <View style={styles.fill}>
      <DecorativeBackground variant="texture" />
      <ScrollView contentContainerStyle={styles.content}>
        <AppText color="textSecondary" variant="label">
          Historia clínica
        </AppText>
        <ScreenHeader title="Registro clínico" titleVariant="display" />

        {!isValidId ? (
          <EmptyState
            actionLabel="Volver"
            message="El registro clínico solicitado no es válido."
            onAction={() => navigateBack(fallbackHref)}
            title="Registro no encontrado"
          />
        ) : null}

        {isValidId && isPending ? <LoadingState label="Cargando registro clínico" /> : null}

        {isValidId && isError ? (
          isNetworkError(loadError) ? (
            <OfflineState
              actionLabel="Reintentar"
              message="Conectate a internet para cargar el registro clínico."
              onAction={retry}
              testID="medical-record-detail-offline"
              title="Sin conexión"
            />
          ) : (
            <ErrorState
              actionLabel="Reintentar"
              message={toMedicalRecordDetailErrorMessage(loadError)}
              onAction={retry}
              title="No se pudo cargar"
            />
          )
        ) : null}

        {record &&
        animalQuery.data &&
        attachmentsQuery.data &&
        (!hasVeterinarian || veterinarianQuery.data) ? (
          <MedicalRecordDetail
            animal={animalQuery.data}
            attachments={attachmentsQuery.data}
            canWrite={canWrite}
            {...(deleteRecord.isError
              ? { deleteError: toDeleteMedicalRecordErrorMessage(deleteRecord.error) }
              : {})}
            deleting={deleteRecord.isPending}
            onDelete={removeRecord}
            onEdit={() =>
              router.push({
                pathname: '/animals/[id]/medical-records/[recordId]/edit',
                params: { id: record.animalId, recordId: record.id },
              })
            }
            onOpenAnimal={() =>
              router.push({
                pathname: '/animals/[id]',
                params: { id: record.animalId, tab: 'clinical' },
              })
            }
            onOpenAttachment={openAttachment}
            record={record}
            veterinarian={record.veterinarianId === null ? null : (veterinarianQuery.data ?? null)}
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
