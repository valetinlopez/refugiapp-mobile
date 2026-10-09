import { fireEvent, render } from '@testing-library/react-native';

import { useAnimalOptionPhoto, type AnimalOption } from '@/application/animals';

import type { ExpenseDetail as ExpenseDetailModel } from '../types';
import { ExpenseDetail } from './ExpenseDetail';
import type { ExpenseReceiptCardState } from './ExpenseReceiptCard';

jest.mock('@/application/animals', () => ({
  useAnimalOptionPhoto: jest.fn(),
}));

const mockUseAnimalOptionPhoto = useAnimalOptionPhoto as jest.Mock;
const EXPENSE_ID = '5fa85f64-5717-4562-b3fc-2c963f66afa6';
const ANIMAL_ID = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

const animal: AnimalOption = {
  id: ANIMAL_ID,
  name: 'Luna',
  species: 'Gata',
  breed: 'Mestiza',
  profilePhotoMediaId: null,
};

function createExpense(overrides: Partial<ExpenseDetailModel> = {}): ExpenseDetailModel {
  return {
    id: EXPENSE_ID,
    animalId: ANIMAL_ID,
    category: 'veterinary',
    amountCents: 4_850_000,
    currency: 'ARS',
    description: 'Consulta de control',
    ticketMediaId: 'media-1',
    incurredAt: '2026-09-21T13:30:00.000Z',
    createdAt: '2026-09-21T14:05:00.000Z',
    updatedAt: '2026-09-21T14:05:00.000Z',
    createdByUserId: EXPENSE_ID,
    ...overrides,
  };
}

const emptyReceipt: ExpenseReceiptCardState = { status: 'empty' };

function renderDetail(overrides: Partial<React.ComponentProps<typeof ExpenseDetail>> = {}) {
  return render(
    <ExpenseDetail
      animal={animal}
      canWrite
      expense={createExpense()}
      onDelete={jest.fn()}
      onOpenAnimal={jest.fn()}
      onOpenReceipt={jest.fn()}
      onRetryReceipt={jest.fn()}
      receiptState={emptyReceipt}
      {...overrides}
    />
  );
}

describe('ExpenseDetail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAnimalOptionPhoto.mockReturnValue({ data: undefined });
  });

  it('formats the amount from cents and presents the category and animal', async () => {
    const screen = await renderDetail();

    expect(screen.getByText(/48\.500/)).toBeTruthy();
    expect(screen.getByText('Veterinaria')).toBeTruthy();
    expect(screen.getByText('Luna')).toBeTruthy();
    expect(screen.getByText('Gata · Mestiza')).toBeTruthy();
    expect(screen.getByLabelText(/Fecha del gasto:/)).toBeTruthy();
    expect(screen.getByLabelText(/Fecha de registro:/)).toBeTruthy();
  });

  it('opens the animal sheet from the animal card', async () => {
    const onOpenAnimal = jest.fn();
    const screen = await renderDetail({ onOpenAnimal });

    await fireEvent.press(screen.getByRole('button', { name: /Animal: Luna/ }));

    expect(onOpenAnimal).toHaveBeenCalledWith(ANIMAL_ID);
  });

  it('requires confirmation before deleting and only for writers', async () => {
    const onDelete = jest.fn();
    const screen = await renderDetail({ onDelete });

    await fireEvent.press(screen.getByTestId('expense-delete'));
    expect(onDelete).not.toHaveBeenCalled();

    await fireEvent.press(screen.getByTestId('confirm-accept'));
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it('cancelling the confirmation keeps the expense', async () => {
    const onDelete = jest.fn();
    const screen = await renderDetail({ onDelete });

    await fireEvent.press(screen.getByTestId('expense-delete'));
    await fireEvent.press(screen.getByTestId('confirm-cancel'));

    expect(onDelete).not.toHaveBeenCalled();
  });

  it('hides the delete action for read-only roles', async () => {
    const screen = await renderDetail({ canWrite: false });

    expect(screen.queryByTestId('expense-delete')).toBeNull();
    expect(screen.getByText(/Tu rol permite consultar/)).toBeTruthy();
  });

  it('shows the registered-by line only when a safe label exists', async () => {
    const withActor = await renderDetail({ registeredBy: 'Vos' });
    expect(withActor.getByText('Vos')).toBeTruthy();

    const withoutActor = await renderDetail({ registeredBy: null });
    expect(withoutActor.queryByText('Registrado por')).toBeNull();
  });

  it('explains an expense without a receipt instead of offering a broken action', async () => {
    const screen = await renderDetail({
      expense: createExpense({ ticketMediaId: null }),
      receiptState: { status: 'empty' },
    });

    expect(screen.getByText(/no tiene un comprobante adjunto/)).toBeTruthy();
    expect(screen.queryByTestId('expense-receipt-open')).toBeNull();
  });
});
