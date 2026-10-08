import { fireEvent, render } from '@testing-library/react-native';

import { AnimalStatusSheet } from './AnimalStatusSheet';

describe('AnimalStatusSheet', () => {
  it('offers only the transitions allowed for the current status', async () => {
    const screen = await render(
      <AnimalStatusSheet
        animalName="Luna"
        currentStatus="available_for_adoption"
        onClose={jest.fn()}
        onConfirm={jest.fn()}
        visible
      />
    );

    expect(screen.getByTestId('status-option-under_treatment')).toBeTruthy();
    expect(screen.getByTestId('status-option-adopted')).toBeTruthy();
    expect(screen.getByTestId('status-option-deceased')).toBeTruthy();
    expect(screen.queryByTestId('status-option-admitted')).toBeNull();
  });

  it('explains a final status instead of offering options', async () => {
    const screen = await render(
      <AnimalStatusSheet
        animalName="Luna"
        currentStatus="deceased"
        onClose={jest.fn()}
        onConfirm={jest.fn()}
        visible
      />
    );

    expect(screen.getByText(/final y no admite cambios/)).toBeTruthy();
    expect(screen.queryByRole('radio')).toBeNull();
  });

  it('confirms the selected status without occurredAt when the field is empty', async () => {
    const onConfirm = jest.fn();
    const screen = await render(
      <AnimalStatusSheet
        animalName="Luna"
        currentStatus="under_treatment"
        onClose={jest.fn()}
        onConfirm={onConfirm}
        visible
      />
    );

    await fireEvent.press(screen.getByTestId('status-option-admitted'));
    await fireEvent.press(screen.getByTestId('status-confirm'));

    expect(onConfirm).toHaveBeenCalledWith('admitted', undefined);
  });

  it('does not confirm before choosing a status', async () => {
    const onConfirm = jest.fn();
    const screen = await render(
      <AnimalStatusSheet
        animalName="Luna"
        currentStatus="admitted"
        onClose={jest.fn()}
        onConfirm={onConfirm}
        visible
      />
    );

    await fireEvent.press(screen.getByTestId('status-confirm'));

    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('exposes the option as an accessible radio with selected state', async () => {
    const screen = await render(
      <AnimalStatusSheet
        animalName="Luna"
        currentStatus="under_treatment"
        onClose={jest.fn()}
        onConfirm={jest.fn()}
        visible
      />
    );

    expect(screen.queryByRole('radio', { name: /Ingresado\./, selected: true })).toBeNull();

    await fireEvent.press(screen.getByTestId('status-option-admitted'));

    expect(screen.getByRole('radio', { name: /Ingresado\./, selected: true })).toBeTruthy();
  });

  it('closes from the sheet backdrop', async () => {
    const onClose = jest.fn();
    const screen = await render(
      <AnimalStatusSheet
        animalName="Luna"
        currentStatus="under_treatment"
        onClose={onClose}
        onConfirm={jest.fn()}
        visible
      />
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Cerrar el selector de estado' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('surfaces a backend error as an alert', async () => {
    const screen = await render(
      <AnimalStatusSheet
        animalName="Luna"
        currentStatus="under_treatment"
        errorMessage="No se puede pasar a este estado desde el estado actual."
        onClose={jest.fn()}
        onConfirm={jest.fn()}
        visible
      />
    );

    expect(
      screen.getByText('No se puede pasar a este estado desde el estado actual.')
    ).toBeTruthy();
  });
});
