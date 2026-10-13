import { fireEvent, render } from '@testing-library/react-native';

import { VeterinarianDeleteDialog } from './VeterinarianDeleteDialog';

describe('VeterinarianDeleteDialog', () => {
  it('shows the first confirmation with the entity name', async () => {
    const screen = await render(
      <VeterinarianDeleteDialog
        name="Juana Diaz"
        onAdvance={jest.fn()}
        onCancel={jest.fn()}
        onConfirm={jest.fn()}
        step="confirm"
        submitting={false}
      />
    );

    expect(screen.getByText('¿Eliminar a Juana Diaz permanentemente?')).toBeTruthy();
  });

  it('requires explicit acknowledgement before the final delete', async () => {
    const onConfirm = jest.fn();
    const screen = await render(
      <VeterinarianDeleteDialog
        name="Juana Diaz"
        onAdvance={jest.fn()}
        onCancel={jest.fn()}
        onConfirm={onConfirm}
        step="acknowledge"
        submitting={false}
      />
    );

    const confirm = screen.getByTestId('delete-veterinarian-confirm');
    fireEvent.press(confirm);
    expect(onConfirm).not.toHaveBeenCalled();

    await fireEvent(screen.getByTestId('delete-veterinarian-acknowledge'), 'valueChange', true);
    fireEvent.press(confirm);
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('surfaces history blocks without technical codes', async () => {
    const screen = await render(
      <VeterinarianDeleteDialog
        errorMessage="Este veterinario tiene historial clínico asignado y no se puede eliminar."
        name="Juana Diaz"
        onAdvance={jest.fn()}
        onCancel={jest.fn()}
        onConfirm={jest.fn()}
        step="acknowledge"
        submitting={false}
      />
    );

    expect(
      screen.getByText('Este veterinario tiene historial clínico asignado y no se puede eliminar.')
    ).toBeTruthy();
  });
});
