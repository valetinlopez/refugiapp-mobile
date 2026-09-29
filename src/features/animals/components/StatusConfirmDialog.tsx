import { ConfirmDialog } from '@/components/feedback';

interface StatusConfirmDialogProps {
  consequence: string;
  label: string;
  onCancel(): void;
  onConfirm(): void;
  submitting: boolean;
  visible: boolean;
}

export function StatusConfirmDialog({
  consequence,
  label,
  onCancel,
  onConfirm,
  submitting,
  visible,
}: StatusConfirmDialogProps) {
  const terminal = label === 'Fallecido' || label === 'Adoptado';

  return (
    <ConfirmDialog
      confirmLabel="Confirmar cambio"
      confirming={submitting}
      consequence={consequence}
      onCancel={onCancel}
      onConfirm={onConfirm}
      title={`Cambiar a “${label}”`}
      variant={terminal ? 'danger' : 'primary'}
      visible={visible}
    />
  );
}
