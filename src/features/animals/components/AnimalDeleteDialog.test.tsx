import { fireEvent, render } from '@testing-library/react-native';

import { AnimalDeleteDialog } from './AnimalDeleteDialog';

describe('AnimalDeleteDialog', () => {
  it('shows the first confirmation with the entity name', async () => {
    const screen = await render(
      <AnimalDeleteDialog
        name="Toby"
        onAdvance={jest.fn()}
        onCancel={jest.fn()}
        onConfirm={jest.fn()}
        step="confirm"
        submitting={false}
      />
    );

    expect(screen.getByText('¿Eliminar a Toby permanentemente?')).toBeTruthy();
  });

  it('requires explicit acknowledgement before the final delete', async () => {
    const onConfirm = jest.fn();
    const screen = await render(
      <AnimalDeleteDialog
        name="Toby"
        onAdvance={jest.fn()}
        onCancel={jest.fn()}
        onConfirm={onConfirm}
        step="acknowledge"
        submitting={false}
      />
    );

    const confirm = screen.getByTestId('delete-animal-confirm');
    fireEvent.press(confirm);
    expect(onConfirm).not.toHaveBeenCalled();

    await fireEvent(screen.getByTestId('delete-animal-acknowledge'), 'valueChange', true);
    fireEvent.press(confirm);
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('explains integrity blocks without technical codes', async () => {
    const screen = await render(
      <AnimalDeleteDialog
        errorMessage="Este animal está en tratamiento y no se puede eliminar."
        name="Toby"
        onAdvance={jest.fn()}
        onCancel={jest.fn()}
        onConfirm={jest.fn()}
        step="acknowledge"
        submitting={false}
      />
    );

    expect(
      screen.getByText('Este animal está en tratamiento y no se puede eliminar.')
    ).toBeTruthy();
  });
});
