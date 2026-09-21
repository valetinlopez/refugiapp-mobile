import { fireEvent, render, waitFor } from '@testing-library/react-native';

import { AnimalStatusChanger } from './AnimalStatusChanger';

describe('AnimalStatusChanger', () => {
  it('offers only the transitions allowed by the backend for the current status', async () => {
    const screen = await render(
      <AnimalStatusChanger currentStatus="admitted" onConfirm={() => undefined} />
    );

    for (const label of ['En tratamiento', 'Disponible para adopción', 'Fallecido']) {
      expect(screen.getByText(label)).toBeTruthy();
    }
    expect(screen.queryByText('Adoptado')).toBeNull();
  });

  it('explains that a terminal status cannot be changed', async () => {
    const screen = await render(
      <AnimalStatusChanger currentStatus="adopted" onConfirm={() => undefined} />
    );

    expect(screen.getByText(/final y no admite cambios/)).toBeTruthy();
  });

  it('shows the consequence before confirming a change', async () => {
    const onConfirm = jest.fn();
    const screen = await render(
      <AnimalStatusChanger currentStatus="available_for_adoption" onConfirm={onConfirm} />
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Cambiar estado a Adoptado' }));

    expect(await screen.findByText('Cambiar a “Adoptado”')).toBeTruthy();
    expect(screen.getByText(/final e irreversible/)).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: 'Confirmar cambio' }));

    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalledWith('adopted');
    });
  });

  it('does not confirm when the user cancels', async () => {
    const onConfirm = jest.fn();
    const screen = await render(
      <AnimalStatusChanger currentStatus="under_treatment" onConfirm={onConfirm} />
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Cambiar estado a Ingresado' }));
    expect(await screen.findByText('Cambiar a “Ingresado”')).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: 'Cancelar' }));

    await waitFor(() => {
      expect(onConfirm).not.toHaveBeenCalled();
    });
  });

  it('uses a danger confirm for terminal transitions', async () => {
    const screen = await render(
      <AnimalStatusChanger currentStatus="admitted" onConfirm={() => undefined} />
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Cambiar estado a Fallecido' }));
    expect(await screen.findByText('Cambiar a “Fallecido”')).toBeTruthy();
  });

  it('displays translated backend errors such as 403', async () => {
    const screen = await render(
      <AnimalStatusChanger
        currentStatus="admitted"
        errorMessage="Tu rol no tiene permiso para cambiar el estado del animal."
        onConfirm={() => undefined}
      />
    );

    expect(
      screen.getByText('Tu rol no tiene permiso para cambiar el estado del animal.')
    ).toBeTruthy();
  });

  it('disables interactions while submitting', async () => {
    const screen = await render(
      <AnimalStatusChanger currentStatus="admitted" onConfirm={() => undefined} submitting />
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Cambiar estado a En tratamiento' }));
    expect(screen.queryByText('Cambiar a “En tratamiento”')).toBeNull();
  });
});
