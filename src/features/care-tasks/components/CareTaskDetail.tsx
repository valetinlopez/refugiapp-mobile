import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import type { AnimalOption } from '@/application/animals';
import { formatDateTime, SectionHeader } from '@/components/patterns';
import {
  AppBadge,
  AppButton,
  AppCard,
  AppDivider,
  AppIcon,
  AppText,
  type AppIconName,
} from '@/components/primitives';
import { colors, opacity, radii, sizes, spacing } from '@/theme';

import type { CareTask } from '../types';
import {
  formatCareTaskDate,
  getCareTaskDetailStatusPresentation,
} from '../utils/careTaskPresentation';
import { CareTaskActionDialog, type CareTaskAction } from './CareTaskActionDialog';
import { CareTaskAnimalAvatar } from './CareTaskAnimalAvatar';

export interface CareTaskDetailProps {
  animal: AnimalOption;
  canWrite: boolean;
  errorMessage?: string | null;
  isBusy?: boolean;
  onCancel(id: string): void;
  onComplete(id: string): void;
  onEdit(id: string): void;
  onOpenAnimal(id: string): void;
  pendingSyncCount?: number;
  task: CareTask;
}

export function CareTaskDetail({
  animal,
  canWrite,
  errorMessage,
  isBusy = false,
  onCancel,
  onComplete,
  onEdit,
  onOpenAnimal,
  pendingSyncCount = 0,
  task,
}: CareTaskDetailProps) {
  const [action, setAction] = useState<CareTaskAction | null>(null);
  const status = getCareTaskDetailStatusPresentation(task.status, task.dueAt);
  const actionable = canWrite && task.status === 'pending';
  const animalDetails = [animal.species, animal.breed].filter(Boolean).join(' · ');

  function confirmAction(): void {
    if (action === 'complete') onComplete(task.id);
    if (action === 'cancel') onCancel(task.id);
    setAction(null);
  }

  return (
    <View style={styles.container}>
      <AppCard
        accessibilityLabel={
          task.title +
          ', ' +
          status.primary.label +
          (status.secondary ? ', ' + status.secondary.label : '') +
          '. ' +
          status.message
        }
        style={[styles.statusCard, status.secondary?.label === 'Vencida' && styles.overdueCard]}
        testID="care-task-detail-status"
        variant="outlined"
      >
        <AppText variant="display">{task.title}</AppText>
        <View style={styles.badges}>
          <AppBadge {...status.primary} />
          {status.secondary ? <AppBadge {...status.secondary} /> : null}
        </View>
        <AppText color="textSecondary">{status.message}</AppText>
      </AppCard>

      <Pressable
        accessibilityHint="Abre la ficha del animal"
        accessibilityLabel={
          'Animal: ' + animal.name + (animalDetails ? ', ' + animalDetails : '') + '. Ver ficha'
        }
        accessibilityRole="button"
        onPress={() => onOpenAnimal(animal.id)}
        style={({ pressed }) => pressed && styles.pressed}
      >
        <AppCard style={styles.sectionCard} variant="elevated">
          <SectionHeader title="Animal" />
          <View style={styles.animalRow}>
            <CareTaskAnimalAvatar
              name={animal.name}
              profilePhotoMediaId={animal.profilePhotoMediaId}
              size="xl"
            />
            <View style={styles.animalCopy}>
              <AppText variant="heading2">{animal.name}</AppText>
              {animalDetails ? <AppText color="textSecondary">{animalDetails}</AppText> : null}
            </View>
            <View style={styles.animalAction}>
              <AppIcon color="textSecondary" name="chevronRight" />
              <AppText color="textSecondary" variant="caption">
                Ver ficha
              </AppText>
            </View>
          </View>
        </AppCard>
      </Pressable>

      <AppCard style={styles.sectionCard} variant="elevated">
        <SectionHeader title="Descripción" />
        <AppText color={task.description ? 'textPrimary' : 'textSecondary'}>
          {task.description ?? 'Sin descripción registrada.'}
        </AppText>
      </AppCard>

      <AppCard style={styles.sectionCard} variant="elevated">
        <SectionHeader title="Fechas" />
        <DateRow
          emphasis={status.secondary?.label === 'Vencida'}
          icon="clock"
          label="Vencimiento"
          value={formatCareTaskDate(task.dueAt)}
        />
        <AppDivider />
        <DateRow icon="calendar" label="Creada" value={formatDateTime(task.createdAt)} />
        <AppDivider />
        <DateRow
          icon="document"
          label="Última actualización"
          value={formatDateTime(task.updatedAt)}
        />
        {task.completedAt ? (
          <>
            <AppDivider />
            <DateRow icon="check" label="Completada" value={formatDateTime(task.completedAt)} />
          </>
        ) : null}
      </AppCard>

      {pendingSyncCount > 0 ? (
        <AppText
          accessibilityLiveRegion="polite"
          color="textSecondary"
          testID="care-task-pending-sync"
        >
          El cambio quedó pendiente de envío y se aplicará al recuperar conexión.
        </AppText>
      ) : null}
      {errorMessage ? (
        <AppText accessibilityLiveRegion="polite" color="danger" role="alert">
          {errorMessage}
        </AppText>
      ) : null}

      {actionable ? (
        <View style={styles.actions}>
          <AppButton
            disabled={isBusy}
            icon="document"
            label="Editar"
            onPress={() => onEdit(task.id)}
            variant="secondary"
          />
          <AppButton
            disabled={isBusy}
            icon="check"
            label="Completar tarea"
            onPress={() => setAction('complete')}
          />
          <AppButton
            disabled={isBusy}
            icon="trash"
            label="Cancelar tarea"
            onPress={() => setAction('cancel')}
            variant="danger"
          />
        </View>
      ) : !canWrite && task.status === 'pending' ? (
        <AppText color="textSecondary">
          Tu rol permite consultar esta tarea, pero no editarla ni cambiar su estado.
        </AppText>
      ) : null}

      {action ? (
        <CareTaskActionDialog
          action={action}
          onClose={() => setAction(null)}
          onConfirm={confirmAction}
          submitting={isBusy}
          taskTitle={task.title}
          visible
        />
      ) : null}
    </View>
  );
}

function DateRow({
  emphasis = false,
  icon,
  label,
  value,
}: {
  emphasis?: boolean;
  icon: AppIconName;
  label: string;
  value: string;
}) {
  return (
    <View
      accessibilityLabel={label + ': ' + value}
      accessibilityRole="summary"
      style={styles.dateRow}
    >
      <AppIcon color={emphasis ? 'danger' : 'textSecondary'} name={icon} />
      <AppText color="textSecondary" style={styles.dateLabel}>
        {label}
      </AppText>
      <AppText
        color={emphasis ? 'danger' : 'textPrimary'}
        style={styles.dateValue}
        variant="bodyStrong"
      >
        {value}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  actions: { gap: spacing.sm },
  animalAction: { alignItems: 'center', flexShrink: 0, gap: spacing.xxs },
  animalCopy: { flex: 1, gap: spacing.xxs, minWidth: 0 },
  animalRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  container: { gap: spacing.md },
  dateLabel: { flexShrink: 0 },
  dateRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    minHeight: sizes.touchTarget,
  },
  dateValue: { flex: 1, minWidth: sizes.touchTarget, textAlign: 'right' },
  overdueCard: { borderColor: colors.danger },
  pressed: { opacity: opacity.pressed },
  sectionCard: { gap: spacing.md },
  statusCard: { borderRadius: radii.xl, gap: spacing.md },
});
