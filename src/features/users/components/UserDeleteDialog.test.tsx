import { fireEvent, render } from '@testing-library/react-native';

import { UserDeleteDialog } from './UserDeleteDialog';

describe('UserDeleteDialog', () => {
  it('shows the first confirmation with the entity name', async () => {
    const screen = await render(
      <UserDeleteDialog
        name="Ana Perez"
        onAdvance={jest.fn()}
        onCancel={jest.fn()}
        onConfirm={jest.fn()}
        step="confirm"
        submitting={false}
      />
    );

    expect(screen.getByText('¿Eliminar a Ana Perez permanentemente?')).toBeTruthy();
  });

  it('advances from the first confirmation without side effects', async () => {
    const onAdvance = jest.fn();
    const screen = await render(
      <UserDeleteDialog
        name="Ana Perez"
        onAdvance={onAdvance}
        onCancel={jest.fn()}
        onConfirm={jest.fn()}
        step="confirm"
        submitting={false}
      />
    );

    fireEvent.press(screen.getByText('Continuar'));
    expect(onAdvance).toHaveBeenCalledTimes(1);
  });

  it('requires explicit acknowledgement before the final delete', async () => {
    const onConfirm = jest.fn();
    const screen = await render(
      <UserDeleteDialog
        name="Ana Perez"
        onAdvance={jest.fn()}
        onCancel={jest.fn()}
        onConfirm={onConfirm}
        step="acknowledge"
        submitting={false}
      />
    );

    const confirm = screen.getByTestId('delete-user-confirm');
    fireEvent.press(confirm);
    expect(onConfirm).not.toHaveBeenCalled();

    await fireEvent(screen.getByTestId('delete-user-acknowledge'), 'valueChange', true);
    fireEvent.press(confirm);
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('cancelling leaves no side effects and shows server errors without internals', async () => {
    const onCancel = jest.fn();
    const screen = await render(
      <UserDeleteDialog
        errorMessage="No se puede eliminar al último administrador activo. Asigná otro administrador antes de eliminarlo."
        name="Ana Perez"
        onAdvance={jest.fn()}
        onCancel={onCancel}
        onConfirm={jest.fn()}
        step="acknowledge"
        submitting={false}
      />
    );

    expect(
      screen.getByText(
        'No se puede eliminar al último administrador activo. Asigná otro administrador antes de eliminarlo.'
      )
    ).toBeTruthy();
    fireEvent.press(screen.getByTestId('delete-user-cancel'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
