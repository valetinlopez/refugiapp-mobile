import { fireEvent, render, waitFor } from '@testing-library/react-native';

import { CreateAnimalEventForm } from './CreateAnimalEventForm';

describe('CreateAnimalEventForm', () => {
  it('offers only manual event types and submits a validated event', async () => {
    const onSubmit = jest.fn();
    const screen = await render(<CreateAnimalEventForm onSubmit={onSubmit} />);

    expect(screen.getByRole('radio', { name: 'Nota general' })).toBeTruthy();
    expect(screen.getByRole('radio', { name: 'Nota de comportamiento' })).toBeTruthy();
    expect(screen.getByRole('radio', { name: 'Traslado' })).toBeTruthy();
    expect(screen.queryByRole('radio', { name: 'Ingreso' })).toBeNull();

    await fireEvent.press(screen.getByRole('radio', { name: 'Traslado' }));
    await fireEvent.changeText(
      screen.getByLabelText('Descripción'),
      '  Traslado a hogar temporal.  '
    );
    await fireEvent.changeText(screen.getByLabelText('Fecha y hora'), '2026-09-21T14:30:00-03:00');
    await fireEvent.press(screen.getByLabelText('Registrar evento'));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        eventType: 'transfer',
        description: 'Traslado a hogar temporal.',
        occurredAt: '2026-09-21T14:30:00-03:00',
      });
    });
  });

  it('shows validation errors and does not submit an empty description', async () => {
    const onSubmit = jest.fn();
    const screen = await render(<CreateAnimalEventForm onSubmit={onSubmit} />);

    await fireEvent.press(screen.getByLabelText('Registrar evento'));

    expect(await screen.findByText('La descripción es obligatoria.')).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('disables fields and announces server errors while submitting', async () => {
    const screen = await render(
      <CreateAnimalEventForm
        errorMessage="Tu rol no tiene permiso para registrar eventos generales."
        isSubmitting
        onSubmit={() => undefined}
      />
    );

    expect(screen.getByLabelText('Registrar evento')).toBeDisabled();
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Tu rol no tiene permiso para registrar eventos generales.'
    );
  });
});
