import { ConfirmDialog } from '@/components/feedback';

interface ReactivateVeterinarianDialogProps {
  errorMessage?: string | null;
  name: string;
  onCancel(): void;
  onConfirm(): void;
  submitting: boolean;
  visible: boolean;
}

export function ReactivateVeterinarianDialog({
  errorMessage,
  name,
  onCancel,
  onConfirm,
  submitting,
  visible,
}: ReactivateVeterinarianDialogProps) {
  return (
    <ConfirmDialog
      confirmAccessibilityLabel="Confirmar reactivación"
      confirmLabel="Reactivar"
      confirming={submitting}
      consequence={`${name} volverá a estar disponible para nuevas asignaciones. Se conserva el historial clínico vinculado.`}
      errorMessage={errorMessage}
      onCancel={onCancel}
      onConfirm={onConfirm}
      title="Reactivar veterinario"
      variant="primary"
      visible={visible}
    />
  );
}
