import { fireEvent, render } from '@testing-library/react-native';

import { ConfirmDialog } from './ConfirmDialog';

describe('ConfirmDialog', () => {
  it('renders the title, consequence and both actions', async () => {
    const screen = await render(
      <ConfirmDialog
        confirmLabel="Confirmar borrado"
        consequence="El adjunto se eliminará y no podrá recuperarse."
        onCancel={jest.fn()}
        onConfirm={jest.fn()}
        title="¿Querés borrar este adjunto?"
        visible
      />
    );

    expect(screen.getByText('¿Querés borrar este adjunto?')).toBeTruthy();
    expect(screen.getByText('El adjunto se eliminará y no podrá recuperarse.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Confirmar borrado' })).toBeTruthy();
  });

  it('confirms the destructive action', async () => {
    const onConfirm = jest.fn();
    const screen = await render(
      <ConfirmDialog
        confirmLabel="Confirmar borrado"
        consequence="Consecuencia."
        onCancel={jest.fn()}
        onConfirm={onConfirm}
        title="¿Querés borrarlo?"
        visible
      />
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Confirmar borrado' }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('cancels from the cancel button without confirming', async () => {
    const onCancel = jest.fn();
    const onConfirm = jest.fn();
    const screen = await render(
      <ConfirmDialog
        confirmLabel="Confirmar"
        consequence="Consecuencia."
        onCancel={onCancel}
        onConfirm={onConfirm}
        title="¿Confirmás?"
        visible
      />
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Cancelar' }));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('cancels from the backdrop without confirming', async () => {
    const onCancel = jest.fn();
    const onConfirm = jest.fn();
    const screen = await render(
      <ConfirmDialog
        confirmLabel="Confirmar"
        consequence="Consecuencia."
        onCancel={onCancel}
        onConfirm={onConfirm}
        title="¿Confirmás?"
        visible
      />
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Cerrar confirmación' }));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('locks both actions while confirming', async () => {
    const onCancel = jest.fn();
    const onConfirm = jest.fn();
    const screen = await render(
      <ConfirmDialog
        confirmLabel="Confirmar"
        confirming
        consequence="Consecuencia."
        onCancel={onCancel}
        onConfirm={onConfirm}
        title="¿Confirmás?"
        visible
      />
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Confirmar' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Cancelar' }));

    expect(onConfirm).not.toHaveBeenCalled();
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('uses a custom confirm accessibility label when provided', async () => {
    const screen = await render(
      <ConfirmDialog
        confirmAccessibilityLabel="Confirmar cierre de sesión"
        confirmLabel="Cerrar sesión"
        consequence="Consecuencia."
        onCancel={jest.fn()}
        onConfirm={jest.fn()}
        title="¿Querés salir?"
        visible
      />
    );

    expect(screen.getByRole('button', { name: 'Confirmar cierre de sesión' })).toBeTruthy();
  });

  it('surfaces a safe error message as an alert', async () => {
    const screen = await render(
      <ConfirmDialog
        confirmLabel="Confirmar"
        consequence="Consecuencia."
        errorMessage="No pudimos completar la operación. Intentá de nuevo."
        onCancel={jest.fn()}
        onConfirm={jest.fn()}
        title="¿Confirmás?"
        visible
      />
    );

    expect(screen.getByText('No pudimos completar la operación. Intentá de nuevo.')).toBeTruthy();
  });
});
