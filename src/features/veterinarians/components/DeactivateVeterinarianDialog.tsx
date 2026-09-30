import { ConfirmDialog } from '@/components/feedback';

interface DeactivateVeterinarianDialogProps {
  errorMessage?: string | null;
  name: string;
  onCancel(): void;
  onConfirm(): void;
  submitting: boolean;
  visible: boolean;
}

export function DeactivateVeterinarianDialog({
  errorMessage,
  name,
  onCancel,
  onConfirm,
  submitting,
  visible,
}: DeactivateVeterinarianDialogProps) {
  return (
    <ConfirmDialog
      confirmLabel="Desactivar"
      confirming={submitting}
      consequence={`${name} dejará de estar disponible para nuevas asignaciones, pero se conserva el historial clínico vinculado.`}
      errorMessage={errorMessage}
      onCancel={onCancel}
      onConfirm={onConfirm}
      title="Desactivar veterinario"
      variant="danger"
      visible={visible}
    />
  );
}
