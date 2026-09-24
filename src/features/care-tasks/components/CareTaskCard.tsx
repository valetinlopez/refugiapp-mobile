import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppBadge, AppButton, AppCard, AppText } from '@/components/primitives';
import { spacing } from '@/theme';

import type { CareTask } from '../types';
import { formatCareTaskDate, getCareTaskStatusPresentation } from '../utils/careTaskPresentation';
import { CareTaskActionDialog, type CareTaskAction } from './CareTaskActionDialog';

interface CareTaskCardProps {
  animalName: string;
  canWrite: boolean;
  isBusy?: boolean;
  onCancel(id: string): void;
  onComplete(id: string): void;
  onEdit(id: string): void;
  task: CareTask;
}

export function CareTaskCard({
  animalName,
  canWrite,
  isBusy = false,
  onCancel,
  onComplete,
  onEdit,
  task,
}: CareTaskCardProps) {
  const [action, setAction] = useState<CareTaskAction | null>(null);
  const presentation = getCareTaskStatusPresentation(task.status, task.dueAt);
  const actionable = canWrite && task.status === 'pending';

  function confirmAction(): void {
    if (action === 'complete') onComplete(task.id);
    if (action === 'cancel') onCancel(task.id);
    setAction(null);
  }

  return (
    <AppCard accessibilityLabel={`${task.title}, ${animalName}, ${presentation.label}`}>
      <View style={styles.header}>
        <View style={styles.heading}>
          <AppText variant="heading3">{task.title}</AppText>
          <AppText color="textSecondary">{animalName}</AppText>
        </View>
        <AppBadge
          icon={presentation.icon}
          label={presentation.label}
          style={styles.badge}
          tone={presentation.tone}
        />
      </View>
      {task.description ? <AppText>{task.description}</AppText> : null}
      <AppText color="textSecondary" variant="caption">
        Fecha: {formatCareTaskDate(task.dueAt)}
      </AppText>
      {actionable ? (
        <View style={styles.actions}>
          <AppButton
            disabled={isBusy}
            label="Editar"
            onPress={() => onEdit(task.id)}
            variant="secondary"
          />
          <AppButton disabled={isBusy} label="Completar" onPress={() => setAction('complete')} />
          <AppButton
            disabled={isBusy}
            label="Cancelar tarea"
            onPress={() => setAction('cancel')}
            variant="danger"
          />
        </View>
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
    </AppCard>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  badge: { flexShrink: 0 },
  header: { alignItems: 'flex-start', flexDirection: 'row', gap: spacing.sm },
  heading: { flex: 1, gap: spacing.xxs, minWidth: 0 },
});
