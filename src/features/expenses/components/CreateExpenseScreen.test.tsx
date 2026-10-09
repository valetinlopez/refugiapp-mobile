import { fireEvent, render } from '@testing-library/react-native';

import { ApiError } from '@/core/api';
import { useConnectivityStatus } from '@/core/network';
import { useCapabilities } from '@/features/auth/hooks/useCapabilities';

import { useCreateExpense } from '../hooks/useCreateExpense';
import { useExpenseAnimals } from '../hooks/useExpenseAnimals';
import { CreateExpenseScreen } from './CreateExpenseScreen';

jest.mock('expo-router', () => ({
  router: { back: jest.fn(), canGoBack: jest.fn(() => true), replace: jest.fn() },
}));
jest.mock('@/core/network', () => ({ useConnectivityStatus: jest.fn() }));
jest.mock('@/features/auth/hooks/useCapabilities', () => ({ useCapabilities: jest.fn() }));
jest.mock('../hooks/useExpenseAnimals', () => ({ useExpenseAnimals: jest.fn() }));
jest.mock('../hooks/useCreateExpense', () => ({ useCreateExpense: jest.fn() }));
jest.mock('@/application/animals', () => ({
  useAnimalOptionPhoto: () => ({ data: undefined }),
}));

const mockUseConnectivityStatus = useConnectivityStatus as jest.Mock;
const mockUseCapabilities = useCapabilities as jest.Mock;
const mockUseExpenseAnimals = useExpenseAnimals as jest.Mock;
const mockUseCreateExpense = useCreateExpense as jest.Mock;

const ANIMAL_ID = '9aa98390-2695-4d5b-86e8-e043410a7fe8';

function animalsResult(overrides: Record<string, unknown> = {}) {
  return {
    data: [{ id: ANIMAL_ID, name: 'Luna' }],
    errorMessage: null,
    isError: false,
    isFallback: false,
    isPending: false,
    refetch: jest.fn(),
    ...overrides,
  };
}

function createExpenseResult(overrides: Record<string, unknown> = {}) {
  return {
    error: null,
    isPending: false,
    mutate: jest.fn(),
    cancelUpload: jest.fn(),
    uploadProgress: null,
    ...overrides,
  };
}

describe('CreateExpenseScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseConnectivityStatus.mockReturnValue(true);
    mockUseCapabilities.mockReturnValue({ canManageExpenses: true });
    mockUseExpenseAnimals.mockReturnValue(animalsResult());
    mockUseCreateExpense.mockReturnValue(createExpenseResult());
  });

  it('renders the form when the role can register expenses', async () => {
    const screen = await render(<CreateExpenseScreen />);
    expect(screen.getByRole('header', { name: 'Registrar gasto' })).toBeTruthy();
    expect(screen.getByText('Comprobante (opcional)')).toBeTruthy();
  });

  it('blocks the form for roles without permission', async () => {
    mockUseCapabilities.mockReturnValue({ canManageExpenses: false });
    const screen = await render(<CreateExpenseScreen />);
    expect(screen.getByText('Sin permiso')).toBeTruthy();
    expect(screen.queryByText('Comprobante (opcional)')).toBeNull();
  });

  it('shows a server error with retry when the animal list fails online', async () => {
    const refetch = jest.fn();
    mockUseExpenseAnimals.mockReturnValue(
      animalsResult({ data: undefined, isError: true, errorMessage: 'Falló el servidor', refetch })
    );
    const screen = await render(<CreateExpenseScreen />);
    expect(screen.getByText('No se pudo preparar el formulario')).toBeTruthy();
    await fireEvent.press(screen.getByText('Reintentar'));
    expect(refetch).toHaveBeenCalled();
  });

  it('shows an offline state when the animal list fails without network', async () => {
    mockUseConnectivityStatus.mockReturnValue(false);
    mockUseExpenseAnimals.mockReturnValue(
      animalsResult({ data: undefined, isError: true, errorMessage: 'Sin red' })
    );
    const screen = await render(<CreateExpenseScreen />);
    expect(screen.getByText('Sin conexión')).toBeTruthy();
  });

  it('shows the mapped creation error', async () => {
    mockUseCreateExpense.mockReturnValue(
      createExpenseResult({
        error: new ApiError({
          code: 'HTTP_403',
          message: 'forbidden',
          requestId: 'req-1',
          status: 403,
        }),
      })
    );
    const screen = await render(<CreateExpenseScreen />);
    expect(screen.getByText('Tu rol no tiene permiso para registrar gastos.')).toBeTruthy();
  });
});
