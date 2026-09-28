import { fireEvent, render, waitFor } from '@testing-library/react-native';

import { toLocalDateTimeIso } from '@/components/patterns';

import { CreateAnimalEventForm } from './CreateAnimalEventForm';

const SELECTED_DATE = new Date(2026, 8, 21, 14, 30);

jest.mock('@react-native-community/datetimepicker', () => {
  const React = jest.requireActual<typeof import('react')>('react');
  const { Pressable, Text } = jest.requireActual<typeof import('react-native')>('react-native');
  const MockPicker = ({
    maximumDate,
    onChange,
  }: {
    maximumDate?: Date;
    onChange(event: { type: string }, date?: Date): void;
  }) =>
    React.createElement(
      Pressable,
      {
        accessibilityLabel: 'selector de fecha y hora',
        accessibilityHint: maximumDate?.toISOString(),
        onPress: () => onChange({ type: 'set' }, new Date(2026, 8, 21, 14, 30)),
      },
      React.createElement(Text, null, 'selector')
    );
  return { __esModule: true, default: MockPicker };
});

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
    await fireEvent.press(screen.getByLabelText('Elegir fecha y hora'));
    const picker = screen.getByLabelText('selector de fecha y hora');
    expect(picker.props.accessibilityHint).toEqual(expect.any(String));
    await fireEvent.press(picker);
    await fireEvent.press(screen.getByLabelText('Registrar evento'));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        eventType: 'transfer',
        description: 'Traslado a hogar temporal.',
        occurredAt: toLocalDateTimeIso(SELECTED_DATE),
      });
    });
  });

  it('omits the optional date so the backend uses the current time', async () => {
    const onSubmit = jest.fn();
    const screen = await render(<CreateAnimalEventForm onSubmit={onSubmit} />);

    await fireEvent.changeText(screen.getByLabelText('Descripción'), 'Control diario');
    await fireEvent.press(screen.getByLabelText('Registrar evento'));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        eventType: 'general_note',
        description: 'Control diario',
      })
    );
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
