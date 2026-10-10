import { fireEvent, render } from '@testing-library/react-native';

import { OFFLINE_STATE_TEST_ID } from '@/components/feedback/offlineCopy';
import { ApiError } from '@/core/api';

import { AuditLogsScreen } from './AuditLogsScreen';

import { useAuditLogs } from '../hooks/useAuditLogs';

jest.mock('../hooks/useAuditLogs', () => ({
  useAuditLogs: jest.fn(),
}));

jest.mock('@/components/patterns', () => {
  const actual = jest.requireActual('@/components/patterns');
  const React = jest.requireActual('react');
  const { Pressable, Text } = jest.requireActual('react-native');
  const RANGE_DATES: Record<string, string> = {
    'Fecha desde': '2026-09-01',
    'Fecha hasta': '2026-09-28',
  };
  function DateTimeFieldStub({
    accessibilityLabel,
    onChange,
  }: {
    accessibilityLabel: string;
    onChange(value: string): void;
  }) {
    const value = RANGE_DATES[accessibilityLabel] ?? '2026-09-01';
    return React.createElement(
      Pressable,
      {
        accessibilityLabel,
        accessibilityRole: 'button',
        onPress: () => onChange(value),
      },
      React.createElement(Text, null, accessibilityLabel)
    );
  }
  return { ...actual, DateTimeField: DateTimeFieldStub };
});

const mockUseAuditLogs = useAuditLogs as jest.Mock;

const ACTOR_UUID = '33333333-3333-4333-8333-333333333333';

function makeLog(overrides: Record<string, unknown> = {}) {
  return {
    id: '22222222-2222-4222-8222-222222222222',
    actor: null,
    actorFallbackId: ACTOR_UUID,
    action: 'user.create',
    resourceType: 'user',
    resourceId: null,
    metadata: {},
    occurredAt: '2026-09-29T12:00:00.000Z',
    ...overrides,
  };
}

function createQueryResult(overrides: Record<string, unknown> = {}) {
  const entry = makeLog();
  return {
    data: {
      pages: [{ items: [entry], page: 1, limit: 20, total: 1 }],
    },
    fetchNextPage: jest.fn(),
    hasNextPage: false,
    isError: false,
    isFetchNextPageError: false,
    isFetchingNextPage: false,
    isPending: false,
    isRefetching: false,
    refetch: jest.fn(),
    ...overrides,
  };
}

describe('AuditLogsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows a loading state while fetching', async () => {
    mockUseAuditLogs.mockReturnValue(createQueryResult({ data: undefined, isPending: true }));
    const screen = await render(<AuditLogsScreen />);

    expect(screen.getByText('Cargando auditoría')).toBeTruthy();
  });

  it('shows an error state with retry', async () => {
    const refetch = jest.fn();
    mockUseAuditLogs.mockReturnValue(
      createQueryResult({ data: undefined, isError: true, refetch })
    );
    const screen = await render(<AuditLogsScreen />);

    expect(screen.getByText('No se pudo cargar la auditoría')).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: 'Reintentar' }));
    expect(refetch).toHaveBeenCalled();
  });

  it('shows an offline state with a retry action for network failures', async () => {
    const refetch = jest.fn();
    mockUseAuditLogs.mockReturnValue(
      createQueryResult({
        data: undefined,
        error: new ApiError({
          code: 'NETWORK_ERROR',
          message: 'No pudimos conectar.',
          requestId: 'request-id',
          status: 0,
        }),
        isError: true,
        refetch,
      })
    );
    const screen = await render(<AuditLogsScreen />);

    expect(screen.getByTestId(OFFLINE_STATE_TEST_ID)).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Reintentar' }));
    expect(refetch).toHaveBeenCalled();
  });

  it('shows an empty state when there are no events', async () => {
    mockUseAuditLogs.mockReturnValue(
      createQueryResult({ data: { pages: [{ items: [], page: 1, limit: 20, total: 0 }] } })
    );
    const screen = await render(<AuditLogsScreen />);

    expect(screen.getByText('Sin eventos')).toBeTruthy();
  });

  it('renders a log with Spanish labels and no raw codes', async () => {
    mockUseAuditLogs.mockReturnValue(createQueryResult());
    const screen = await render(<AuditLogsScreen />);

    expect(screen.getAllByText('Usuario creado').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Usuario').length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText('user.create')).toBeNull();
    expect(screen.queryByText('auth_session')).toBeNull();
  });

  it('applies action, resource type, actor and date filters', async () => {
    mockUseAuditLogs.mockReturnValue(createQueryResult());
    const screen = await render(<AuditLogsScreen />);

    await fireEvent.press(screen.getByTestId('audit-filter-action-open'));
    await fireEvent.press(screen.getByRole('button', { name: 'Acceso denegado' }));
    await fireEvent.press(screen.getByTestId('audit-filter-resource-open'));
    await fireEvent.press(screen.getByRole('button', { name: 'Autorización' }));
    const actorInput = screen.getByLabelText('Actor (UUID)');
    await fireEvent.changeText(actorInput, ACTOR_UUID);
    await fireEvent.changeText(
      screen.getByLabelText('Identificador del recurso (UUID)'),
      '44444444-4444-4444-8444-444444444444'
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Fecha desde' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Fecha hasta' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Aplicar filtros' }));

    const filters = mockUseAuditLogs.mock.calls.at(-1)?.[0];
    expect(filters.action).toBe('access.denied');
    expect(filters.resourceType).toBe('authorization');
    expect(filters.actorUserId).toBe(ACTOR_UUID);
    expect(filters.resourceId).toBe('44444444-4444-4444-8444-444444444444');
    expect(filters.from).toMatch(/^2026-09-01T00:00:00/);
    expect(filters.to).toMatch(/^2026-09-28T23:59:00/);
  });

  it('drops an invalid actor UUID when applying filters', async () => {
    mockUseAuditLogs.mockReturnValue(createQueryResult());
    const screen = await render(<AuditLogsScreen />);

    const actorInput = screen.getByLabelText('Actor (UUID)');
    await fireEvent.changeText(actorInput, 'not-a-uuid');
    await fireEvent.press(screen.getByRole('button', { name: 'Aplicar filtros' }));

    const filters = mockUseAuditLogs.mock.calls.at(-1)?.[0];
    expect(filters.actorUserId).toBeUndefined();
  });

  it('shows a range error and keeps filters empty when only one date is set', async () => {
    mockUseAuditLogs.mockReturnValue(createQueryResult());
    const screen = await render(<AuditLogsScreen />);

    await fireEvent.press(screen.getByRole('button', { name: 'Fecha desde' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Aplicar filtros' }));

    expect(screen.getByText('Definí las dos fechas del período.')).toBeTruthy();
    expect(mockUseAuditLogs).toHaveBeenLastCalledWith({});
  });

  it('clears all filters', async () => {
    mockUseAuditLogs.mockReturnValue(createQueryResult());
    const screen = await render(<AuditLogsScreen />);

    await fireEvent.press(screen.getByTestId('audit-filter-action-open'));
    await fireEvent.press(screen.getByRole('button', { name: 'Acceso denegado' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Aplicar filtros' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Limpiar' }));

    expect(mockUseAuditLogs).toHaveBeenLastCalledWith({});
  });

  it('renders an end-of-list hint once pagination is exhausted', async () => {
    mockUseAuditLogs.mockReturnValue(createQueryResult({ hasNextPage: false }));
    const screen = await render(<AuditLogsScreen />);

    expect(screen.getByText('No hay más eventos')).toBeTruthy();
  });

  it('offers an explicit retry when a later page fails', async () => {
    const fetchNextPage = jest.fn();
    mockUseAuditLogs.mockReturnValue(
      createQueryResult({ fetchNextPage, hasNextPage: true, isFetchNextPageError: true })
    );
    const screen = await render(<AuditLogsScreen />);

    await fireEvent.press(screen.getByRole('button', { name: 'Reintentar carga' }));
    expect(fetchNextPage).toHaveBeenCalled();
  });

  it('concatenates pages preserving the deterministic server order without duplicates', async () => {
    mockUseAuditLogs.mockReturnValue(
      createQueryResult({
        data: {
          pages: [
            {
              items: [makeLog({ id: '22222222-2222-4222-8222-222222222222' })],
              page: 1,
              limit: 20,
              total: 21,
            },
            {
              items: [makeLog({ id: '55555555-5555-4555-8555-555555555555' })],
              page: 2,
              limit: 20,
              total: 21,
            },
          ],
        },
        hasNextPage: false,
      })
    );
    const screen = await render(<AuditLogsScreen />);

    expect(screen.getAllByLabelText(/^Usuario creado, /).length).toBe(2);
  });

  it('exposes deterministic selectors for the E2E flow (RFG-132)', async () => {
    mockUseAuditLogs.mockReturnValue(createQueryResult({ hasNextPage: false }));
    const screen = await render(<AuditLogsScreen />);

    expect(screen.getByTestId('audit-filter-action-open')).toBeTruthy();
    expect(screen.getByTestId('audit-filter-resource-open')).toBeTruthy();
    expect(screen.getByTestId('audit-filter-actor')).toBeTruthy();
    expect(screen.getByTestId('audit-filter-resource-id')).toBeTruthy();
    expect(screen.getByTestId('audit-filter-apply')).toBeTruthy();
    expect(screen.getByTestId('audit-filter-clear')).toBeTruthy();
    expect(screen.getByTestId('audit-end-of-list')).toBeTruthy();

    await fireEvent.press(screen.getByTestId('audit-filter-action-open'));
    expect(screen.getByTestId('audit-filter-action-user.create')).toBeTruthy();
    expect(screen.getByTestId('audit-filter-action-access.denied')).toBeTruthy();
  });
});
