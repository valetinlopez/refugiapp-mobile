import { fireEvent, render } from '@testing-library/react-native';

import { ApiError } from '@/core/api';
import { useCapabilities } from '@/features/auth/hooks/useCapabilities';

import { useExpenseAnimals } from '../hooks/useExpenseAnimals';
import { useInfiniteExpenses } from '../hooks/useInfiniteExpenses';
import type { Expense, PaginatedExpenses } from '../types';
import { ExpensesOverviewScreen } from './ExpensesOverviewScreen';

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));
jest.mock('@/features/auth/hooks/useCapabilities', () => ({ useCapabilities: jest.fn() }));
jest.mock('../hooks/useExpenseAnimals', () => ({ useExpenseAnimals: jest.fn() }));
jest.mock('../hooks/useInfiniteExpenses', () => {
  const actual = jest.requireActual('../hooks/useInfiniteExpenses');
  return { ...actual, useInfiniteExpenses: jest.fn() };
});

const mockUseCapabilities = useCapabilities as jest.Mock;
const mockUseExpenseAnimals = useExpenseAnimals as jest.Mock;
const mockUseInfiniteExpenses = useInfiniteExpenses as jest.Mock;

const ANIMAL_ID = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

function expense(overrides: Partial<Expense> = {}): Expense {
  return {
    id: 'expense-1',
    animalId: ANIMAL_ID,
    category: 'food',
    amountCents: 1000,
    currency: 'ARS',
    description: 'Consulta anual',
    ticketMediaId: null,
    incurredAt: '2026-09-22T14:30:00.000Z',
    ...overrides,
  };
}

function page(items: Expense[], total = items.length): PaginatedExpenses {
  return { items, page: 1, limit: 20, total };
}

function queryResult(pages: PaginatedExpenses[]) {
  return {
    data: { pages },
    error: null,
    hasNextPage: false,
    isError: false,
    isFetchNextPageError: false,
    isFetchingNextPage: false,
    isPending: false,
    isRefetching: false,
    refetch: jest.fn(),
  };
}

describe('ExpensesOverviewScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseCapabilities.mockReturnValue({ canManageExpenses: true });
    mockUseExpenseAnimals.mockReturnValue({
      data: [{ id: ANIMAL_ID, name: 'Luna' }],
      isError: false,
      isPending: false,
      refetch: jest.fn(),
    });
    mockUseInfiniteExpenses.mockReturnValue(queryResult([page([expense()])]));
  });

  it('shows the loaded subtotal and the paginated server total without calling it a global total', async () => {
    mockUseInfiniteExpenses.mockReturnValue(
      queryResult([
        page(
          [
            expense({ id: 'expense-1', amountCents: 1000 }),
            expense({ id: 'expense-2', amountCents: 2000 }),
          ],
          50
        ),
      ])
    );

    const screen = await render(<ExpensesOverviewScreen />);

    expect(screen.getByText('Subtotal cargado')).toBeTruthy();
    expect(screen.getByText(/30,00/)).toBeTruthy();
    expect(screen.getByText('50 gastos según los filtros')).toBeTruthy();
    expect(screen.getByText('Subtotal de 2 de 50 gastos cargados.')).toBeTruthy();
    expect(screen.getAllByText('Luna').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Alimentación').length).toBeGreaterThan(0);
  });

  it('resolves animal names best-effort and never exposes a raw UUID', async () => {
    mockUseExpenseAnimals.mockReturnValue({
      data: [],
      isError: false,
      isPending: false,
      refetch: jest.fn(),
    });
    mockUseInfiniteExpenses.mockReturnValue(
      queryResult([page([expense({ animalId: '3fa85f64-5717-4562-b3fc-2c963f66af00' })])])
    );

    const screen = await render(<ExpensesOverviewScreen />);

    expect(screen.getByText('Animal no disponible')).toBeTruthy();
    expect(screen.queryByText('3fa85f64-5717-4562-b3fc-2c963f66af00')).toBeNull();
  });

  it('renders an explicit empty state', async () => {
    mockUseInfiniteExpenses.mockReturnValue(queryResult([page([], 0)]));

    const screen = await render(<ExpensesOverviewScreen />);

    expect(screen.getByText('Sin gastos')).toBeTruthy();
  });

  it('renders a loading state while the first page is pending', async () => {
    mockUseInfiniteExpenses.mockReturnValue({
      ...queryResult([]),
      data: undefined,
      isPending: true,
    });

    const screen = await render(<ExpensesOverviewScreen />);

    expect(screen.getByText('Cargando gastos')).toBeTruthy();
  });

  it('renders a retryable server error state', async () => {
    mockUseInfiniteExpenses.mockReturnValue({
      ...queryResult([]),
      data: undefined,
      error: new ApiError({
        code: 'HTTP_500',
        message: 'Ocurrió un error en el servidor. Intenta nuevamente.',
        requestId: 'req-1',
        status: 500,
      }),
      isError: true,
    });

    const screen = await render(<ExpensesOverviewScreen />);

    expect(screen.getByText('No se pudieron cargar los gastos')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeTruthy();
  });

  it('distinguishes a transport failure with an offline state', async () => {
    mockUseInfiniteExpenses.mockReturnValue({
      ...queryResult([]),
      data: undefined,
      error: new ApiError({
        code: 'NETWORK_ERROR',
        message: 'No pudimos conectar con el servidor.',
        requestId: 'req-1',
        status: 0,
      }),
      isError: true,
    });

    const screen = await render(<ExpensesOverviewScreen />);

    expect(screen.getByText('Sin conexión')).toBeTruthy();
    expect(screen.getByTestId('offline-state')).toBeTruthy();
  });

  it('exposes the creation FAB to writers and navigates to the form', async () => {
    const screen = await render(<ExpensesOverviewScreen />);
    const { router } = jest.requireMock('expo-router') as { router: { push: jest.Mock } };

    await fireEvent.press(screen.getByRole('button', { name: 'Registrar gasto' }));

    expect(router.push).toHaveBeenCalledWith({ pathname: '/expenses/new', params: {} });
  });

  it('keeps read-only access for roles without the write capability', async () => {
    mockUseCapabilities.mockReturnValue({ canManageExpenses: false });

    const screen = await render(<ExpensesOverviewScreen />);

    expect(screen.queryByRole('button', { name: 'Registrar gasto' })).toBeNull();
    expect(screen.getByText(/consultar gastos/)).toBeTruthy();
  });

  it('applies a category filter through the accessible sheet', async () => {
    const screen = await render(<ExpensesOverviewScreen />);

    await fireEvent.press(screen.getByTestId('expense-category-filter'));
    const option = screen.getByTestId('expense-category-option-veterinary');
    expect(option.props.accessibilityState).toEqual({ checked: false });

    await fireEvent.press(option);

    expect(mockUseInfiniteExpenses).toHaveBeenLastCalledWith({ category: 'veterinary' });
    expect(screen.getByText('Veterinaria')).toBeTruthy();
  });

  it('clears active filters back to the unfiltered list', async () => {
    const screen = await render(
      <ExpensesOverviewScreen initialAnimalId={ANIMAL_ID} initialAnimalName="Luna" />
    );

    expect(screen.getByTestId('expense-clear-filters')).toBeTruthy();

    await fireEvent.press(screen.getByTestId('expense-clear-filters'));

    expect(screen.queryByTestId('expense-clear-filters')).toBeNull();
    expect(screen.getByText('Todos los animales')).toBeTruthy();
  });
});
