import { ConfirmDialog } from '@/components/feedback';

export interface UserStatusDialogProps {
  activating: boolean;
  errorMessage?: string | null;
  name: string;
  onCancel(): void;
  onConfirm(): void;
  submitting: boolean;
  visible: boolean;
}

export function UserStatusDialog({
  activating,
  errorMessage,
  name,
  onCancel,
  onConfirm,
  submitting,
  visible,
}: UserStatusDialogProps) {
  return (
    <ConfirmDialog
      cancelAccessibilityLabel="Cancelar cambio de estado"
      confirmAccessibilityLabel={activating ? 'Confirmar activación' : 'Confirmar desactivación'}
      confirmLabel={activating ? 'Activar usuario' : 'Desactivar usuario'}
      confirming={submitting}
      consequence={
        activating
          ? `${name} podrá volver a ingresar al sistema.`
          : `${name} perderá el acceso hasta que vuelvas a activar su cuenta.`
      }
      errorMessage={errorMessage}
      onCancel={onCancel}
      onConfirm={onConfirm}
      title={activating ? 'Activar usuario' : 'Desactivar usuario'}
      variant={activating ? 'primary' : 'danger'}
      visible={visible}
    />
  );
}
