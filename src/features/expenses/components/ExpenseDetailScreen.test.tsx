import { fireEvent, render } from '@testing-library/react-native';
import { Linking } from 'react-native';

import { ApiError } from '@/core/api';
import { navigateBack } from '@/components/navigation';
import { useCapabilities } from '@/features/auth/hooks/useCapabilities';
import { useSession } from '@/features/auth/session';

import { useDeleteExpense } from '../hooks/useDeleteExpense';
import { useExpense } from '../hooks/useExpense';
import { useExpenseAnimal } from '../hooks/useExpenseAnimal';
import { useExpenseReceiptAsset } from '../hooks/useExpenseReceiptAsset';
import type { ExpenseDetail as ExpenseDetailModel } from '../types';
import { ExpenseDetailScreen } from './ExpenseDetailScreen';

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));
jest.mock('@/components/navigation', () => ({ navigateBack: jest.fn() }));
jest.mock('@/application/animals', () => ({
  useAnimalOptionPhoto: jest.fn(() => ({ data: undefined })),
}));
jest.mock('@/features/auth/hooks/useCapabilities', () => ({ useCapabilities: jest.fn() }));
jest.mock('@/features/auth/session', () => ({ useSession: jest.fn() }));
jest.mock('../hooks/useExpense', () => ({ useExpense: jest.fn() }));
jest.mock('../hooks/useExpenseAnimal', () => ({ useExpenseAnimal: jest.fn() }));
jest.mock('../hooks/useExpenseReceiptAsset', () => ({ useExpenseReceiptAsset: jest.fn() }));
jest.mock('../hooks/useDeleteExpense', () => ({ useDeleteExpense: jest.fn() }));

const mockUseCapabilities = useCapabilities as jest.Mock;
const mockUseSession = useSession as jest.Mock;
const mockUseExpense = useExpense as jest.Mock;
const mockUseExpenseAnimal = useExpenseAnimal as jest.Mock;
const mockUseExpenseReceiptAsset = useExpenseReceiptAsset as jest.Mock;
const mockUseDeleteExpense = useDeleteExpense as jest.Mock;
const mockNavigateBack = navigateBack as jest.Mock;

const EXPENSE_ID = '5fa85f64-5717-4562-b3fc-2c963f66afa6';
const ANIMAL_ID = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

function expense(overrides: Partial<ExpenseDetailModel> = {}): ExpenseDetailModel {
  return {
    id: EXPENSE_ID,
    animalId: ANIMAL_ID,
    category: 'veterinary',
    amountCents: 4_850_000,
    currency: 'ARS',
    description: 'Consulta de control',
    ticketMediaId: null,
    incurredAt: '2026-09-21T13:30:00.000Z',
    createdAt: '2026-09-21T14:05:00.000Z',
    updatedAt: '2026-09-21T14:05:00.000Z',
    createdByUserId: null,
    ...overrides,
  };
}

function apiError(status: number, code = `HTTP_${String(status)}`): ApiError {
  return new ApiError({ code, message: 'Mensaje técnico del core.', requestId: 'req-1', status });
}

describe('ExpenseDetailScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseCapabilities.mockReturnValue({ canManageExpenses: true });
    mockUseSession.mockReturnValue({ user: { id: EXPENSE_ID } });
    mockUseExpense.mockReturnValue({
      data: undefined,
      error: null,
      isError: false,
      isPending: false,
      refetch: jest.fn(),
    });
    mockUseExpenseAnimal.mockReturnValue({ data: { id: ANIMAL_ID, name: 'Luna' } });
    mockUseExpenseReceiptAsset.mockReturnValue({
      data: undefined,
      isError: false,
      isFetching: false,
      isPending: false,
      refetch: jest.fn(),
    });
    mockUseDeleteExpense.mockReturnValue({
      error: null,
      isError: false,
      isPending: false,
      mutate: jest.fn(),
    });
  });

  it('renders an invalid-id empty state without querying', async () => {
    const screen = await render(<ExpenseDetailScreen expenseId="" />);

    expect(screen.getByText('Gasto no encontrado')).toBeTruthy();
  });

  it('renders a loading state while the detail is pending', async () => {
    mockUseExpense.mockReturnValue({
      data: undefined,
      error: null,
      isError: false,
      isPending: true,
    });

    const screen = await render(<ExpenseDetailScreen expenseId={EXPENSE_ID} />);

    expect(screen.getByText('Cargando detalle del gasto')).toBeTruthy();
  });

  it('distinguishes a transport failure with an offline state', async () => {
    mockUseExpense.mockReturnValue({
      data: undefined,
      error: apiError(0, 'NETWORK_ERROR'),
      isError: true,
      isPending: false,
      refetch: jest.fn(),
    });

    const screen = await render(<ExpenseDetailScreen expenseId={EXPENSE_ID} />);

    expect(screen.getByTestId('expense-detail-offline')).toBeTruthy();
  });

  it('translates a gone expense to a safe error message', async () => {
    mockUseExpense.mockReturnValue({
      data: undefined,
      error: apiError(404),
      isError: true,
      isPending: false,
      refetch: jest.fn(),
    });

    const screen = await render(<ExpenseDetailScreen expenseId={EXPENSE_ID} />);

    expect(screen.getByText('El gasto ya no está disponible.')).toBeTruthy();
  });

  it('renders the detail and confirms deletion before navigating back', async () => {
    const mutate = jest.fn((_id: string, options: { onSuccess?: () => void }) => {
      options.onSuccess?.();
    });
    mockUseExpense.mockReturnValue({
      data: expense(),
      error: null,
      isError: false,
      isPending: false,
      refetch: jest.fn(),
    });
    mockUseDeleteExpense.mockReturnValue({
      error: null,
      isError: false,
      isPending: false,
      mutate,
    });

    const screen = await render(<ExpenseDetailScreen expenseId={EXPENSE_ID} />);
    await fireEvent.press(screen.getByTestId('expense-delete'));
    await fireEvent.press(screen.getByTestId('confirm-accept'));

    expect(mutate).toHaveBeenCalledWith(EXPENSE_ID, expect.anything());
    expect(mockNavigateBack).toHaveBeenCalledWith('/expenses');
  });

  it('hides the destructive action for read-only roles', async () => {
    mockUseCapabilities.mockReturnValue({ canManageExpenses: false });
    mockUseExpense.mockReturnValue({
      data: expense(),
      error: null,
      isError: false,
      isPending: false,
      refetch: jest.fn(),
    });

    const screen = await render(<ExpenseDetailScreen expenseId={EXPENSE_ID} />);

    expect(screen.queryByTestId('expense-delete')).toBeNull();
    expect(screen.getByText(/Tu rol permite consultar/)).toBeTruthy();
  });

  it('opens the receipt only through a validated https URL', async () => {
    const openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
    mockUseExpense.mockReturnValue({
      data: expense({ ticketMediaId: 'media-1' }),
      error: null,
      isError: false,
      isPending: false,
      refetch: jest.fn(),
    });
    mockUseExpenseReceiptAsset.mockReturnValue({
      data: {
        id: 'media-1',
        secureUrl: 'https://res.cloudinary.com/demo/raw/upload/ticket.pdf',
        resourceType: 'raw',
        format: 'pdf',
        bytes: 1024,
      },
      isError: false,
      isFetching: false,
      isPending: false,
      refetch: jest.fn(),
    });

    const screen = await render(<ExpenseDetailScreen expenseId={EXPENSE_ID} />);
    await fireEvent.press(screen.getByTestId('expense-receipt-open'));

    expect(openURL).toHaveBeenCalledWith('https://res.cloudinary.com/demo/raw/upload/ticket.pdf');
    openURL.mockRestore();
  });
});
