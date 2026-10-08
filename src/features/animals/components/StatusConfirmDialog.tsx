import { ConfirmDialog } from '@/components/feedback';

import type { AnimalStatus } from '../types';
import { getStatusConsequence, getStatusLabel, isTerminalStatus } from '../utils/animalTransitions';

interface StatusConfirmDialogProps {
  onCancel(): void;
  onConfirm(): void;
  status: AnimalStatus;
  submitting: boolean;
  visible: boolean;
}

/**
 * Confirma el cambio de estado derivándolo del enum, no de una comparación de
 * strings: los estados terminales (`adopted`, `deceased`) usan el tono
 * destructivo y el resto el tono primario.
 */
export function StatusConfirmDialog({
  onCancel,
  onConfirm,
  status,
  submitting,
  visible,
}: StatusConfirmDialogProps) {
  const label = getStatusLabel(status);

  return (
    <ConfirmDialog
      confirmLabel="Confirmar cambio"
      confirming={submitting}
      consequence={getStatusConsequence(status)}
      onCancel={onCancel}
      onConfirm={onConfirm}
      title={`Cambiar a “${label}”`}
      variant={isTerminalStatus(status) ? 'danger' : 'primary'}
      visible={visible}
    />
  );
}
