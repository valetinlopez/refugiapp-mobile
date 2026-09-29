import { ConfirmDialog } from '@/components/feedback';

export type CareTaskAction = 'complete' | 'cancel';

interface CareTaskActionDialogProps {
  action: CareTaskAction;
  onClose(): void;
  onConfirm(): void;
  submitting?: boolean;
  taskTitle: string;
  visible: boolean;
}

export function CareTaskActionDialog({
  action,
  onClose,
  onConfirm,
  submitting = false,
  taskTitle,
  visible,
}: CareTaskActionDialogProps) {
  const completing = action === 'complete';
  const verb = completing ? 'completar' : 'cancelar';

  return (
    <ConfirmDialog
      cancelLabel="Volver"
      confirmLabel={completing ? 'Confirmar completada' : 'Confirmar cancelación'}
      confirming={submitting}
      consequence={`“${taskTitle}” cambiará de estado y no podrá editarse.`}
      onCancel={onClose}
      onConfirm={onConfirm}
      title={`¿Querés ${verb} esta tarea?`}
      variant={completing ? 'primary' : 'danger'}
      visible={visible}
    />
  );
}
