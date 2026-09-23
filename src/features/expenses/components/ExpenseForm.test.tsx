import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { Pressable as MockPressable, Text as MockText } from 'react-native';

import type { ReceiptFile } from '../types';
import { ExpenseForm } from './ExpenseForm';

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

describe('ExpenseForm', () => {
  it('submits an expense with its receipt', async () => {
    const onSubmit = jest.fn();
    const screen = await render(
      <ExpenseForm
        animalOptions={[{ id: '9aa98390-2695-4d5b-86e8-e043410a7fe8', name: 'Luna' }]}
        isSubmitting={false}
        onCancelUpload={jest.fn()}
        onSubmit={onSubmit}
        uploadProgress={null}
      />
    );
    await fireEvent.press(screen.getByRole('radio', { name: 'Luna' }));
    await fireEvent.changeText(screen.getByLabelText('Concepto'), 'Vacuna');
    await fireEvent.changeText(screen.getByLabelText('Importe en centavos'), '2500');
    await fireEvent.press(screen.getByText('Adjuntar comprobante'));
    await fireEvent.press(screen.getByText('Registrar gasto'));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ amountCents: '2500', description: 'Vacuna' });
    expect(onSubmit.mock.calls[0][1]).toMatchObject({ name: 'ticket.pdf' });
  });

  it('shows validation for a negative amount', async () => {
    const screen = await render(
      <ExpenseForm
        animalOptions={[{ id: '9aa98390-2695-4d5b-86e8-e043410a7fe8', name: 'Luna' }]}
        isSubmitting={false}
        onCancelUpload={jest.fn()}
        onSubmit={jest.fn()}
        uploadProgress={null}
      />
    );
    await fireEvent.changeText(screen.getByLabelText('Importe en centavos'), '-1');
    await fireEvent.press(screen.getByText('Registrar gasto'));
    expect(
      await screen.findByText('El importe debe ser un número entero no negativo.')
    ).toBeTruthy();
  });
});
