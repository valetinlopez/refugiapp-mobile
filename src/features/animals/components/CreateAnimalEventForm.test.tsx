import { fireEvent, render, waitFor } from '@testing-library/react-native';

import { toLocalDateTimeIso } from '@/components/patterns';

import { CreateAnimalEventForm } from './CreateAnimalEventForm';

const SELECTED_DATE = new Date(2026, 8, 21, 14, 30);
const INTAKE_DATE = '2026-08-15';

jest.mock('@react-native-community/datetimepicker', () => {
  const React = jest.requireActual<typeof import('react')>('react');
  const { Pressable, Text } = jest.requireActual<typeof import('react-native')>('react-native');
  const MockPicker = ({
    maximumDate,
    onValueChange,
  }: {
    maximumDate?: Date;
    onValueChange(
      event: { nativeEvent: { timestamp: number; utcOffset: number } },
      date: Date
    ): void;
  }) =>
    React.createElement(
      Pressable,
      {
        accessibilityLabel: 'selector de fecha y hora',
        accessibilityHint: maximumDate?.toISOString(),
        onPress: () =>
          onValueChange(
            { nativeEvent: { timestamp: 0, utcOffset: 0 } },
            new Date(2026, 8, 21, 14, 30)
          ),
      },
      React.createElement(Text, null, 'selector')
    );
  return { __esModule: true, default: MockPicker };
});

function renderForm(overrides: Partial<React.ComponentProps<typeof CreateAnimalEventForm>> = {}) {
  return render(
    <CreateAnimalEventForm
      animalName="Luna"
      intakeDate={INTAKE_DATE}
      onCancel={jest.fn()}
      onSubmit={jest.fn()}
      {...overrides}
    />
  );
}

describe('CreateAnimalEventForm', () => {
  it('offers only manual event types and submits a validated event', async () => {
    const onSubmit = jest.fn();
    const screen = await renderForm({ onSubmit });

    expect(screen.getByText('Nota general')).toBeTruthy();

    await fireEvent.press(screen.getByTestId('create-event-type-trigger'));
    expect(screen.getByTestId('create-event-type-option-general_note')).toBeTruthy();
    expect(screen.getByTestId('create-event-type-option-behavior_note')).toBeTruthy();
    expect(screen.getByTestId('create-event-type-option-transfer')).toBeTruthy();
    expect(screen.queryByTestId('create-event-type-option-intake')).toBeNull();

    await fireEvent.press(screen.getByTestId('create-event-type-option-transfer'));
    await fireEvent.changeText(
      screen.getByLabelText('Descripción'),
      '  Traslado a hogar temporal.  '
    );
    await fireEvent.press(screen.getByLabelText('Elegir fecha y hora'));
    const picker = screen.getByLabelText('selector de fecha y hora');
    expect(picker.props.accessibilityHint).toEqual(expect.any(String));
    await fireEvent.press(picker);
    await fireEvent.press(screen.getByTestId('create-event-submit'));

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
    const screen = await renderForm({ onSubmit });

    await fireEvent.changeText(screen.getByLabelText('Descripción'), 'Control diario');
    await fireEvent.press(screen.getByTestId('create-event-submit'));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        eventType: 'general_note',
        description: 'Control diario',
      })
    );
  });

  it('counts the description characters', async () => {
    const screen = await renderForm();

    expect(screen.getByText('0/1000')).toBeTruthy();

    await fireEvent.changeText(screen.getByLabelText('Descripción'), 'Adaptación');

    expect(screen.getByText('10/1000')).toBeTruthy();
  });

  it('shows validation errors and does not submit an empty description', async () => {
    const onSubmit = jest.fn();
    const screen = await renderForm({ onSubmit });

    await fireEvent.press(screen.getByTestId('create-event-submit'));

    expect(await screen.findByText('La descripción es obligatoria.')).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('rejects a date before the intake day before submitting', async () => {
    const onSubmit = jest.fn();
    const screen = await renderForm({ intakeDate: '2026-10-01', onSubmit });

    await fireEvent.changeText(screen.getByLabelText('Descripción'), 'Evento previo al ingreso');
    await fireEvent.press(screen.getByLabelText('Elegir fecha y hora'));
    await fireEvent.press(screen.getByLabelText('selector de fecha y hora'));
    await fireEvent.press(screen.getByTestId('create-event-submit'));

    expect(
      await screen.findByText('La fecha y hora no puede ser anterior al ingreso del animal.')
    ).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('cancels without submitting', async () => {
    const onCancel = jest.fn();
    const onSubmit = jest.fn();
    const screen = await renderForm({ onCancel, onSubmit });

    await fireEvent.press(screen.getByTestId('create-event-cancel'));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('disables fields and announces server errors while submitting', async () => {
    const screen = await renderForm({
      errorMessage: 'Tu rol no tiene permiso para registrar eventos generales.',
      isSubmitting: true,
    });

    expect(screen.getByTestId('create-event-submit')).toBeDisabled();
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Tu rol no tiene permiso para registrar eventos generales.'
    );
  });
});
