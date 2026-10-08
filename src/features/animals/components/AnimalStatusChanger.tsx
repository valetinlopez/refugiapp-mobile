import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppBadge, AppButton, AppCard, AppText } from '@/components/primitives';
import { spacing } from '@/theme';

import type { AnimalStatus } from '../types';
import {
  getAllowedTransitions,
  getStatusBadge,
  getStatusLabel,
  isTerminalStatus,
} from '../utils/animalTransitions';

import { AnimalStatusSheet } from './AnimalStatusSheet';
import { StatusConfirmDialog } from './StatusConfirmDialog';

export interface AnimalStatusChangerProps {
  animalName: string;
  currentStatus: AnimalStatus;
  disabled?: boolean;
  errorMessage?: string | null;
  onConfirm(status: AnimalStatus, occurredAt?: string): void;
  submitting?: boolean;
}

interface PendingStatus {
  status: AnimalStatus;
  occurredAt?: string;
}

/**
 * Orquesta el cambio de estado (D14 / RFG-147): tarjeta de estado actual,
 * sheet con las transiciones válidas y confirmación destructiva adicional para
 * estados terminales (`adopted`, `deceased`). Nunca ejecuta la mutación: delega
 * en `onConfirm` y el backend sigue siendo la autoridad final.
 */
export function AnimalStatusChanger({
  animalName,
  currentStatus,
  disabled = false,
  errorMessage,
  onConfirm,
  submitting = false,
}: AnimalStatusChangerProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [pending, setPending] = useState<PendingStatus | null>(null);
  const allowed = getAllowedTransitions(currentStatus);
  const busy = disabled || submitting;
  const badge = getStatusBadge(currentStatus);

  function handleConfirmFromSheet(status: AnimalStatus, occurredAt?: string): void {
    setSheetOpen(false);
    if (isTerminalStatus(status)) {
      setPending(occurredAt === undefined ? { status } : { status, occurredAt });
      return;
    }
    onConfirm(status, occurredAt);
  }

  function handleConfirmTerminal(): void {
    if (pending === null) {
      return;
    }
    const target = pending;
    setPending(null);
    onConfirm(target.status, target.occurredAt);
  }

  return (
    <AppCard style={styles.card} variant="outlined">
      <View style={styles.current}>
        <AppText color="textSecondary" variant="label">
          Estado actual
        </AppText>
        <AppBadge icon={badge.icon} label={badge.label} tone={badge.tone} />
      </View>

      {allowed.length === 0 ? (
        <AppText color="textSecondary">
          El estado actual (“{getStatusLabel(currentStatus)}”) es final y no admite cambios.
        </AppText>
      ) : (
        <AppButton
          accessibilityHint="Abre el selector de estados disponibles"
          disabled={busy}
          label="Cambiar estado"
          onPress={() => setSheetOpen(true)}
          testID="status-change-open"
          variant="secondary"
        />
      )}

      {errorMessage ? (
        <AppText accessibilityLiveRegion="polite" color="danger" role="alert">
          {errorMessage}
        </AppText>
      ) : null}

      <AnimalStatusSheet
        animalName={animalName}
        currentStatus={currentStatus}
        onClose={() => setSheetOpen(false)}
        onConfirm={handleConfirmFromSheet}
        submitting={submitting}
        visible={sheetOpen}
      />

      {pending !== null ? (
        <StatusConfirmDialog
          onCancel={() => setPending(null)}
          onConfirm={handleConfirmTerminal}
          status={pending.status}
          submitting={submitting}
          visible
        />
      ) : null}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
  },
  current: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
});
