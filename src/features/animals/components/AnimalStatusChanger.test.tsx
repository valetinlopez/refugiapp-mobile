import { fireEvent, render, waitFor, type RenderResult } from '@testing-library/react-native';

import { AnimalStatusChanger } from './AnimalStatusChanger';

const ANIMAL_NAME = 'Luna';

async function openSheet(screen: RenderResult): Promise<void> {
  await fireEvent.press(screen.getByRole('button', { name: 'Cambiar estado' }));
}

describe('AnimalStatusChanger', () => {
  it('offers only the transitions allowed by the backend in the sheet', async () => {
    const screen = await render(
      <AnimalStatusChanger
        animalName={ANIMAL_NAME}
        currentStatus="admitted"
        onConfirm={() => undefined}
      />
    );

    await openSheet(screen);

    expect(screen.getByTestId('status-sheet')).toBeTruthy();
    for (const label of ['En tratamiento', 'Disponible para adopción', 'Fallecido']) {
      expect(screen.getByText(label)).toBeTruthy();
    }
    expect(screen.queryByText('Adoptado')).toBeNull();
  });

  it('explains that a terminal status cannot be changed', async () => {
    const screen = await render(
      <AnimalStatusChanger
        animalName={ANIMAL_NAME}
        currentStatus="adopted"
        onConfirm={() => undefined}
      />
    );

    expect(screen.getByText(/final y no admite cambios/)).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Cambiar estado' })).toBeNull();
  });

  it('confirms a non-terminal change directly from the sheet', async () => {
    const onConfirm = jest.fn();
    const screen = await render(
      <AnimalStatusChanger
        animalName={ANIMAL_NAME}
        currentStatus="under_treatment"
        onConfirm={onConfirm}
      />
    );

    await openSheet(screen);
    await fireEvent.press(screen.getByTestId('status-option-admitted'));
    await fireEvent.press(screen.getByTestId('status-confirm'));

    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalledWith('admitted', undefined);
    });
  });

  it('requires a second confirmation for terminal transitions', async () => {
    const onConfirm = jest.fn();
    const screen = await render(
      <AnimalStatusChanger
        animalName={ANIMAL_NAME}
        currentStatus="admitted"
        onConfirm={onConfirm}
      />
    );

    await openSheet(screen);
    await fireEvent.press(screen.getByTestId('status-option-deceased'));
    await fireEvent.press(screen.getByTestId('status-confirm'));

    expect(await screen.findByText('Cambiar a “Fallecido”')).toBeTruthy();
    expect(screen.getByText(/final e irreversible/)).toBeTruthy();
    expect(onConfirm).not.toHaveBeenCalled();

    await fireEvent.press(screen.getByRole('button', { name: 'Confirmar cambio' }));

    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalledWith('deceased', undefined);
    });
  });

  it('does not confirm when the user cancels the sheet', async () => {
    const onConfirm = jest.fn();
    const screen = await render(
      <AnimalStatusChanger
        animalName={ANIMAL_NAME}
        currentStatus="under_treatment"
        onConfirm={onConfirm}
      />
    );

    await openSheet(screen);
    await fireEvent.press(screen.getByTestId('status-cancel'));

    await waitFor(() => {
      expect(onConfirm).not.toHaveBeenCalled();
    });
  });

  it('does not confirm without a selection', async () => {
    const onConfirm = jest.fn();
    const screen = await render(
      <AnimalStatusChanger
        animalName={ANIMAL_NAME}
        currentStatus="admitted"
        onConfirm={onConfirm}
      />
    );

    await openSheet(screen);
    await fireEvent.press(screen.getByTestId('status-confirm'));

    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('displays translated backend errors such as 403', async () => {
    const screen = await render(
      <AnimalStatusChanger
        animalName={ANIMAL_NAME}
        currentStatus="admitted"
        errorMessage="Tu rol no tiene permiso para cambiar el estado del animal."
        onConfirm={() => undefined}
      />
    );

    expect(
      screen.getByText('Tu rol no tiene permiso para cambiar el estado del animal.')
    ).toBeTruthy();
  });

  it('does not open the sheet while submitting', async () => {
    const screen = await render(
      <AnimalStatusChanger
        animalName={ANIMAL_NAME}
        currentStatus="admitted"
        onConfirm={() => undefined}
        submitting
      />
    );

    await openSheet(screen);
    expect(screen.queryByTestId('status-sheet')).toBeNull();
  });
});
