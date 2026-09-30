import { fireEvent, render, waitFor } from '@testing-library/react-native';

import { ApiError } from '@/core/api';

import { useVeterinarians } from '../hooks/useVeterinarians';
import { VeterinariansScreen } from './VeterinariansScreen';

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));
jest.mock('../hooks/useVeterinarians', () => ({ useVeterinarians: jest.fn() }));

const mockUseVeterinarians = useVeterinarians as jest.Mock;
const activeVet = {
  id: '11111111-1111-4111-8111-111111111111',
  userId: null,
  firstName: 'Sofía',
  lastName: 'Romero',
  licenseNumber: 'VET-001',
  email: null,
  phone: null,
  notes: null,
  isActive: true,
  createdAt: '2026-09-01T00:00:00.000Z',
  updatedAt: '2026-09-01T00:00:00.000Z',
};
const inactiveVet = {
  ...activeVet,
  id: '22222222-2222-4222-8222-222222222222',
  firstName: 'Valeria',
  lastName: 'Torres',
  licenseNumber: 'VET-002',
  isActive: false,
};

function listQuery(overrides: Record<string, unknown> = {}) {
  return {
    data: { pages: [{ items: [activeVet, inactiveVet], page: 1, limit: 20, total: 2 }] },
    fetchNextPage: jest.fn(),
    hasNextPage: false,
    isError: false,
    isFetchingNextPage: false,
    isFetchNextPageError: false,
    isPending: false,
    isRefetching: false,
    refetch: jest.fn(),
    ...overrides,
  };
}

describe('VeterinariansScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseVeterinarians.mockReturnValue(listQuery());
  });

  it('shows license number and state for each veterinarian', async () => {
    const screen = await render(<VeterinariansScreen canWrite />);

    expect(screen.getByText('Sofía Romero')).toBeTruthy();
    expect(screen.getByText('Matrícula VET-001')).toBeTruthy();
    expect(screen.getByText('Activo')).toBeTruthy();
    expect(screen.getByText('Inactivo')).toBeTruthy();
  });

  it('hides the new button without write permission', async () => {
    const screen = await render(<VeterinariansScreen canWrite={false} />);

    expect(screen.queryByRole('button', { name: 'Nuevo' })).toBeNull();
  });

  it('shows the new button with write permission', async () => {
    const screen = await render(<VeterinariansScreen canWrite />);

    expect(screen.getByRole('button', { name: 'Nuevo' })).toBeTruthy();
  });

  it('navigates to the detail on press', async () => {
    const { router } = jest.requireMock('expo-router') as { router: { push: jest.Mock } };
    const screen = await render(<VeterinariansScreen canWrite />);

    await fireEvent.press(
      screen.getByRole('button', { name: 'Sofía Romero, matrícula VET-001, Activo' })
    );

    expect(router.push).toHaveBeenCalledWith({
      pathname: '/veterinarians/[id]',
      params: { id: activeVet.id },
    });
  });

  it('filters by status and search through the query filters', async () => {
    const screen = await render(<VeterinariansScreen canWrite />);

    await fireEvent.press(screen.getByRole('button', { name: 'Inactivos' }));
    expect(mockUseVeterinarians).toHaveBeenLastCalledWith({ isActive: false });

    await fireEvent.changeText(screen.getByLabelText('Buscar veterinario'), 'Sofía');
    await waitFor(() =>
      expect(mockUseVeterinarians).toHaveBeenLastCalledWith({ isActive: false, name: 'Sofía' })
    );
  });

  it('loads the next page when the list reaches the end', async () => {
    const fetchNextPage = jest.fn();
    mockUseVeterinarians.mockReturnValue(listQuery({ fetchNextPage, hasNextPage: true }));
    const screen = await render(<VeterinariansScreen canWrite />);

    fireEvent(screen.getByTestId('veterinarians-list'), 'onEndReached');

    expect(fetchNextPage).toHaveBeenCalledTimes(1);
  });

  it('translates a 403 response', async () => {
    mockUseVeterinarians.mockReturnValue(
      listQuery({
        data: undefined,
        error: new ApiError({
          code: 'FORBIDDEN',
          message: 'Forbidden',
          requestId: 'request-id',
          status: 403,
        }),
        isError: true,
      })
    );
    const screen = await render(<VeterinariansScreen canWrite={false} />);

    expect(screen.getByText('Tu rol no tiene permiso para gestionar veterinarios.')).toBeTruthy();
  });

  it('shows an empty state when there are no veterinarians', async () => {
    mockUseVeterinarians.mockReturnValue(
      listQuery({ data: { pages: [{ items: [], page: 1, limit: 20, total: 0 }] } })
    );
    const screen = await render(<VeterinariansScreen canWrite={false} />);

    expect(screen.getByText('Sin veterinarios')).toBeTruthy();
  });
});
