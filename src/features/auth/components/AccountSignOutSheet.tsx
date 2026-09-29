import { ConfirmDialog } from '@/components/feedback';

export type AccountSignOutSheetProps = {
  errorMessage?: string | null;
  onClose(): void;
  onConfirm(): void;
  signingOut: boolean;
  userEmail: string;
  visible: boolean;
};

export function AccountSignOutSheet({
  errorMessage,
  onClose,
  onConfirm,
  signingOut,
  userEmail,
  visible,
}: AccountSignOutSheetProps) {
  return (
    <ConfirmDialog
      cancelAccessibilityLabel="Cancelar cierre de sesión"
      confirmAccessibilityLabel="Confirmar cierre de sesión"
      confirmLabel="Cerrar sesión"
      confirming={signingOut}
      consequence={`Vas a salir de ${userEmail} en este dispositivo.`}
      errorMessage={errorMessage}
      onCancel={onClose}
      onConfirm={onConfirm}
      title="¿Querés cerrar sesión?"
      variant="danger"
      visible={visible}
    />
  );
}
