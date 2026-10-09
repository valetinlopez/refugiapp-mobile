import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import type { AnimalOption } from '@/application/animals';
import type { VeterinarianDirectoryEntry } from '@/application/veterinarians';
import { ConfirmDialog } from '@/components/feedback';
import { AttachmentRow, formatDateTime } from '@/components/patterns';
import {
  AppBadge,
  AppButton,
  AppCard,
  AppIcon,
  AppText,
  type AppIconName,
} from '@/components/primitives';
import { opacity, radii, spacing } from '@/theme';

import type { ClinicalAttachment, MedicalRecord } from '../types';
import { getClinicalAttachmentMeta } from '../utils/medicalRecordDetailPresentation';
import { getRecordTypeLabel } from '../utils/medicalRecordPresentation';
import { AnimalOptionAvatar } from './AnimalOptionAvatar';

export interface MedicalRecordDetailProps {
  animal: AnimalOption;
  attachments: ClinicalAttachment[];
  canWrite: boolean;
  deleteError?: string | null | undefined;
  deleting?: boolean | undefined;
  onDelete(): void;
  onEdit(): void;
  onOpenAnimal(): void;
  onOpenAttachment(attachment: ClinicalAttachment): void;
  record: MedicalRecord;
  veterinarian: VeterinarianDirectoryEntry | null;
}

export function MedicalRecordDetail({
  animal,
  attachments,
  canWrite,
  deleteError,
  deleting = false,
  onDelete,
  onEdit,
  onOpenAnimal,
  onOpenAttachment,
  record,
  veterinarian,
}: MedicalRecordDetailProps) {
  const [confirmVisible, setConfirmVisible] = useState(false);
  const typeLabel = getRecordTypeLabel(record.recordType);
  const animalDetails = [animal.species, animal.breed].filter(Boolean).join(' · ');
  const veterinarianLabel = veterinarian?.name ?? 'Sin veterinario asignado';

  function confirmDelete(): void {
    onDelete();
    setConfirmVisible(false);
  }

  return (
    <View style={styles.container}>
      <Pressable
        accessibilityHint="Abre la ficha del animal"
        accessibilityLabel={`Animal: ${animal.name}${animalDetails ? `, ${animalDetails}` : ''}. ${record.title}, ${typeLabel}. Ver ficha`}
        accessibilityRole="button"
        onPress={onOpenAnimal}
        style={({ pressed }) => (pressed ? styles.pressed : null)}
        testID="medical-record-animal"
      >
        <AppCard style={styles.heroCard} variant="elevated">
          <AnimalOptionAvatar animal={animal} size="xl" />
          <View style={styles.heroCopy}>
            <AppText variant="heading2">{animal.name}</AppText>
            {animalDetails ? <AppText color="textSecondary">{animalDetails}</AppText> : null}
            <AppBadge icon="medical" label={typeLabel} style={styles.badge} tone="info" />
            <AppText variant="heading2">{record.title}</AppText>
            <DetailMeta icon="calendar" value={formatDateTime(record.occurredAt)} />
            <DetailMeta icon="account" value={veterinarianLabel} />
          </View>
          <View style={styles.heroAction}>
            <AppIcon color="textSecondary" name="chevronRight" />
            <AppText color="textSecondary" variant="caption">
              Ver ficha
            </AppText>
          </View>
        </AppCard>
      </Pressable>

      <ClinicalTextSection icon="medical" title="Diagnóstico" value={record.diagnosis} />
      <ClinicalTextSection icon="medical" title="Tratamiento" value={record.treatment} />
      <ClinicalTextSection icon="document" title="Notas" value={record.notes} />

      <AppCard style={styles.sectionCard} variant="elevated">
        <View style={styles.sectionHeader}>
          <AppIcon color="textSecondary" name="document" />
          <AppText style={styles.sectionTitle} variant="heading2">
            Adjuntos
          </AppText>
          <AppText color="textSecondary" variant="caption">
            {attachments.length === 1 ? '1 archivo' : `${String(attachments.length)} archivos`}
          </AppText>
        </View>
        {attachments.length === 0 ? (
          <AppText color="textSecondary">Sin adjuntos registrados.</AppText>
        ) : (
          attachments.map((attachment) => (
            <Pressable
              accessibilityHint="Abre el archivo adjunto"
              accessibilityLabel={`Abrir ${attachment.name}, ${getClinicalAttachmentMeta(attachment)}`}
              accessibilityRole="button"
              key={attachment.id}
              onPress={() => onOpenAttachment(attachment)}
              style={({ pressed }) => [styles.attachment, pressed && styles.pressed]}
              testID={`medical-record-attachment-${attachment.id}`}
            >
              <AttachmentRow
                attachment={{
                  id: attachment.id,
                  name: attachment.name,
                  sizeLabel: getClinicalAttachmentMeta(attachment),
                  status: 'ready',
                  thumbnailUri:
                    attachment.resourceType === 'image' ? attachment.secureUrl : undefined,
                }}
              />
              <AppIcon color="textSecondary" name="chevronRight" />
            </Pressable>
          ))
        )}
      </AppCard>

      {deleteError ? (
        <AppText accessibilityLiveRegion="polite" color="danger" role="alert">
          {deleteError}
        </AppText>
      ) : null}

      {canWrite ? (
        <View style={styles.actions}>
          <AppButton
            disabled={deleting}
            icon="document"
            label="Editar registro"
            onPress={onEdit}
            testID="medical-record-edit"
            variant="secondary"
          />
          <AppButton
            disabled={deleting}
            icon="trash"
            label="Eliminar registro"
            onPress={() => setConfirmVisible(true)}
            testID="medical-record-delete"
            variant="danger"
          />
        </View>
      ) : (
        <AppText color="textSecondary">
          Tu rol permite consultar este registro, pero no editarlo ni eliminarlo.
        </AppText>
      )}

      <ConfirmDialog
        confirmLabel="Eliminar registro"
        confirming={deleting}
        consequence="El registro se dará de baja y dejará de aparecer en la historia clínica. Su historial de cambios se conservará."
        {...(deleteError ? { errorMessage: deleteError } : {})}
        onCancel={() => setConfirmVisible(false)}
        onConfirm={confirmDelete}
        title="¿Querés eliminar este registro clínico?"
        variant="danger"
        visible={confirmVisible}
      />
    </View>
  );
}

function ClinicalTextSection({
  icon,
  title,
  value,
}: {
  icon: AppIconName;
  title: string;
  value: string | null;
}) {
  return (
    <AppCard style={styles.sectionCard} variant="elevated">
      <View style={styles.sectionHeader}>
        <AppIcon color="info" name={icon} />
        <AppText variant="heading2">{title}</AppText>
      </View>
      <AppText color={value ? 'textPrimary' : 'textSecondary'}>
        {value ?? 'Sin información registrada.'}
      </AppText>
    </AppCard>
  );
}

function DetailMeta({ icon, value }: { icon: AppIconName; value: string }) {
  return (
    <View style={styles.metaRow}>
      <AppIcon color="textSecondary" name={icon} />
      <AppText color="textSecondary">{value}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  attachment: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  badge: { alignSelf: 'flex-start' },
  container: { gap: spacing.md },
  heroAction: { alignItems: 'center', flexShrink: 0, gap: spacing.xxs },
  heroCard: {
    alignItems: 'center',
    borderRadius: radii.xl,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  heroCopy: { flex: 1, gap: spacing.xs, minWidth: 0 },
  metaRow: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  pressed: { opacity: opacity.pressed },
  sectionCard: { gap: spacing.md },
  sectionHeader: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  sectionTitle: { flex: 1 },
});
