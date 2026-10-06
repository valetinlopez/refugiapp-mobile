import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ConfirmDialog, EmptyState } from '@/components/feedback';
import { spacing } from '@/theme';

import { AttachmentRow, type AttachmentItem } from './AttachmentRow';

export interface AttachmentListProps {
  attachments: readonly AttachmentItem[];
  emptyMessage?: string | undefined;
  onRemove?: ((id: string) => void) | undefined;
  onRetry?: ((id: string) => void) | undefined;
  removeConfirmConsequence?: string | undefined;
  removeConfirmTitle?: string | undefined;
  removeDisabled?: boolean | undefined;
  testID?: string | undefined;
}

/**
 * Shared attachment list (D03 / RFG-136).
 *
 * Renders the attachments of an entity (animal files, expense receipts,
 * clinical attachments) and owns the removal confirmation: a row's "Quitar"
 * only opens a `ConfirmDialog`, and `onRemove` runs after explicit
 * confirmation, honouring the destructive-action rule of the design system.
 * An empty list explains the missing content without inventing an action.
 */
export function AttachmentList({
  attachments,
  emptyMessage,
  onRemove,
  onRetry,
  removeConfirmConsequence = 'El archivo se quitará de la lista.',
  removeConfirmTitle = '¿Querés quitar el adjunto?',
  removeDisabled,
  testID,
}: AttachmentListProps) {
  const [pendingRemovalId, setPendingRemovalId] = useState<string | null>(null);

  if (attachments.length === 0) {
    return (
      <EmptyState
        message={emptyMessage ?? 'Todavía no hay archivos adjuntos.'}
        testID={testID}
        title="Sin adjuntos"
      />
    );
  }

  function handleConfirmRemove() {
    if (pendingRemovalId !== null) onRemove?.(pendingRemovalId);
    setPendingRemovalId(null);
  }

  return (
    <View style={styles.list} testID={testID}>
      {attachments.map((attachment) => (
        <AttachmentRow
          attachment={attachment}
          key={attachment.id}
          onRemove={onRemove ? () => setPendingRemovalId(attachment.id) : undefined}
          onRetry={onRetry}
          removeDisabled={removeDisabled}
        />
      ))}
      <ConfirmDialog
        confirmLabel="Quitar"
        consequence={removeConfirmConsequence}
        onCancel={() => setPendingRemovalId(null)}
        onConfirm={handleConfirmRemove}
        title={removeConfirmTitle}
        visible={pendingRemovalId !== null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.xs,
  },
});
