import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { Pressable as MockPressable, Text as MockText } from 'react-native';

import type { ReceiptFile } from '../types';
import { ExpenseForm } from './ExpenseForm';

jest.mock('@/application/animals', () => ({
  useAnimalOptionPhoto: () => ({ data: undefined }),
}));

jest.mock('@react-native-community/datetimepicker', () => {
  const React = jest.requireActual<typeof import('react')>('react');
  const { Pressable, Text } = jest.requireActual<typeof import('react-native')>('react-native');
  const MockPicker = ({
    onValueChange,
  }: {
    onValueChange(
      event: { nativeEvent: { timestamp: number; utcOffset: number } },
      date: Date
    ): void;
  }) =>
    React.createElement(
      Pressable,
      {
        accessibilityLabel: 'selector de fecha',
        onPress: () =>
          onValueChange(
            { nativeEvent: { timestamp: 0, utcOffset: 0 } },
            new Date(2026, 8, 23, 12, 30)
          ),
      },
      React.createElement(Text, null, 'selector')
    );
  return { __esModule: true, default: MockPicker };
});

jest.mock('./ExpenseReceiptPicker', () => ({
  ExpenseReceiptPicker: ({ onChange }: { onChange(file: ReceiptFile): void }) => {
    return (
      <MockPressable
        accessibilityRole="button"
        onPress={() =>
          onChange({
            uri: 'file://ticket.pdf',
            name: 'ticket.pdf',
            mimeType: 'application/pdf',
            size: 100,
          })
        }
      >
        <MockText>Adjuntar comprobante</MockText>
      </MockPressable>
    );
  },
}));

const ANIMAL_ID = '9aa98390-2695-4d5b-86e8-e043410a7fe8';
const animalOptions = [{ id: ANIMAL_ID, name: 'Luna', profilePhotoMediaId: null }];

function renderForm(onSubmit = jest.fn()) {
  return render(
    <ExpenseForm
      animalOptions={animalOptions}
      isSubmitting={false}
      onCancel={jest.fn()}
      onCancelUpload={jest.fn()}
      onSubmit={onSubmit}
      uploadProgress={null}
    />
  );
}

describe('ExpenseForm', () => {
  it('submits an expense without a receipt (optional)', async () => {
    const onSubmit = jest.fn();
    const screen = await renderForm(onSubmit);

    await fireEvent.press(screen.getByLabelText('Seleccionar animal'));
    await fireEvent.press(await screen.findByRole('radio', { name: 'Luna' }));
    await fireEvent.press(screen.getByLabelText('Categoría: Otro'));
    await fireEvent.press(await screen.findByRole('radio', { name: 'Alimentación' }));
    await fireEvent.changeText(screen.getByLabelText('Importe'), '48.500,00');
    await fireEvent.changeText(screen.getByLabelText('Descripción'), 'Vacuna antirrábica');
    await fireEvent.press(screen.getByText('Registrar gasto'));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      animalId: ANIMAL_ID,
      category: 'food',
      amountUnits: '48.500,00',
      description: 'Vacuna antirrábica',
    });
    expect(onSubmit.mock.calls[0][1]).toBeNull();
  });

  it('submits with the attached receipt', async () => {
    const onSubmit = jest.fn();
    const screen = await renderForm(onSubmit);

    await fireEvent.press(screen.getByLabelText('Seleccionar animal'));
    await fireEvent.press(await screen.findByRole('radio', { name: 'Luna' }));
    await fireEvent.changeText(screen.getByLabelText('Importe'), '2500');
    await fireEvent.changeText(screen.getByLabelText('Descripción'), 'Vacuna');
    await fireEvent.press(screen.getByText('Adjuntar comprobante'));
    await fireEvent.press(screen.getByText('Registrar gasto'));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][1]).toMatchObject({ name: 'ticket.pdf' });
  });

  it('shows the ARS preview and the conversion helper while typing', async () => {
    const screen = await renderForm();
    await fireEvent.changeText(screen.getByLabelText('Importe'), '48.500,00');
    expect(await screen.findByText(/48\.500,00/)).toBeTruthy();
    expect(screen.getByText(/se convertirá a centavos al guardar/)).toBeTruthy();
    expect(screen.getByLabelText('Moneda: ARS')).toBeTruthy();
  });

  it('shows the description counter', async () => {
    const screen = await renderForm();
    await fireEvent.changeText(screen.getByLabelText('Descripción'), 'abc');
    expect(await screen.findByText('3/1000')).toBeTruthy();
  });

  it('validates an invalid amount before submitting', async () => {
    const onSubmit = jest.fn();
    const screen = await renderForm(onSubmit);
    await fireEvent.changeText(screen.getByLabelText('Importe'), 'abc');
    await fireEvent.press(screen.getByText('Registrar gasto'));
    expect(await screen.findByText(/Ingresá un importe válido/)).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('sets the date and time with the shared field', async () => {
    const onSubmit = jest.fn();
    const screen = await renderForm(onSubmit);

    await fireEvent.press(screen.getByLabelText('Seleccionar animal'));
    await fireEvent.press(await screen.findByRole('radio', { name: 'Luna' }));
    await fireEvent.changeText(screen.getByLabelText('Importe'), '100');
    await fireEvent.changeText(screen.getByLabelText('Descripción'), 'Gasto');
    await fireEvent.press(screen.getByLabelText(/^Fecha y hora del gasto:/));
    await fireEvent.press(screen.getByLabelText('selector de fecha'));
    await fireEvent.press(screen.getByText('Registrar gasto'));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0].incurredAt).toMatch(/^2026-09-23T12:30/);
  });
});
