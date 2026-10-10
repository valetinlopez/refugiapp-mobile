import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';

import { ApiError } from '@/core/api';
import { useAuditLog } from '../hooks/useAuditLogs';
import { AuditLogDetail } from './AuditLogDetail';

jest.mock('../hooks/useAuditLogs', () => ({ useAuditLog: jest.fn() }));
jest.mock('expo-clipboard', () => ({
  __esModule: true,
  setStringAsync: jest.fn(() => Promise.resolve(true)),
}));

const Clipboard = jest.requireMock('expo-clipboard') as { setStringAsync: jest.Mock };
const mockUseAuditLog = useAuditLog as jest.Mock;

const ACTOR_UUID = '22222222-2222-4222-8222-222222222222';
const RESOURCE_UUID = '33333333-3333-4333-8333-333333333333';
const EVENT_ID = '11111111-1111-4111-8111-111111111111';

function makeData(overrides: Record<string, unknown> = {}) {
  return {
    id: EVENT_ID,
    actor: {
      id: ACTOR_UUID,
      displayName: 'María López',
      initials: 'ML',
      email: 'maria@refugiapp.local',
    },
    actorFallbackId: ACTOR_UUID,
    action: 'auth.login_failure',
    resourceType: 'auth_session',
    resourceId: null,
    metadata: { email: 'admin@refugiapp.local', password: 'never-show', token: 'hidden' },
    occurredAt: '2026-09-29T12:00:00.000Z',
    ...overrides,
  };
}

describe('AuditLogDetail', () => {
  let announceSpy: jest.SpyInstance;

  beforeEach(() => {
    announceSpy = jest
      .spyOn(AccessibilityInfo, 'announceForAccessibility')
      .mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.clearAllMocks();
    announceSpy.mockRestore();
  });

  it('shows the audit context without exposing sensitive metadata', async () => {
    mockUseAuditLog.mockReturnValue({
      data: makeData(),
      isError: false,
      isPending: false,
    });

    const screen = await render(<AuditLogDetail id={EVENT_ID} />);

    expect(screen.getByTestId('audit-detail')).toBeTruthy();
    expect(screen.getAllByText('Inicio de sesión fallido').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Sesión').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('María López')).toBeTruthy();
    expect(screen.getByText('maria@refugiapp.local')).toBeTruthy();
    expect(screen.getByText('Sin identificador')).toBeTruthy();
    expect(screen.queryByText(/never-show/)).toBeNull();
    expect(screen.queryByText(/hidden/)).toBeNull();
    expect(screen.queryByText('auth.login_failure')).toBeNull();
    expect(screen.queryByText('auth_session')).toBeNull();
  });

  it('shows the fallback UUID during rollout when actor is absent', async () => {
    mockUseAuditLog.mockReturnValue({
      data: makeData({ actor: null }),
      isError: false,
      isPending: false,
    });

    const screen = await render(<AuditLogDetail id={EVENT_ID} />);

    expect(screen.getAllByText(ACTOR_UUID).length).toBeGreaterThanOrEqual(1);
  });

  it('renders the system label for null actor and null fallback', async () => {
    mockUseAuditLog.mockReturnValue({
      data: makeData({ actor: null, actorFallbackId: null }),
      isError: false,
      isPending: false,
    });

    const screen = await render(<AuditLogDetail id={EVENT_ID} />);

    expect(screen.getByText('Sistema')).toBeTruthy();
  });

  it('copies a resource identifier and announces success to assistive technology', async () => {
    mockUseAuditLog.mockReturnValue({
      data: makeData({ resourceId: RESOURCE_UUID }),
      isError: false,
      isPending: false,
    });

    const screen = await render(<AuditLogDetail id={EVENT_ID} />);
    fireEvent.press(screen.getByTestId('audit-copy-resource-id'));

    await waitFor(() => expect(Clipboard.setStringAsync).toHaveBeenCalledWith(RESOURCE_UUID));
    expect(announceSpy).toHaveBeenCalledWith('Identificador del recurso copiado.');
    expect(screen.getByText('Copiado')).toBeTruthy();
  });

  it('announces a safe message when copying fails', async () => {
    mockUseAuditLog.mockReturnValue({
      data: makeData({ resourceId: RESOURCE_UUID }),
      isError: false,
      isPending: false,
    });
    Clipboard.setStringAsync.mockRejectedValueOnce(new Error('nope'));

    const screen = await render(<AuditLogDetail id={EVENT_ID} />);
    fireEvent.press(screen.getByTestId('audit-copy-resource-id'));

    await waitFor(() =>
      expect(announceSpy).toHaveBeenCalledWith('No pudimos copiar. Intentá nuevamente.')
    );
    expect(screen.getByText('No se pudo copiar')).toBeTruthy();
  });

  it('presents unknown metadata as readable rows and a sanitized technical view', async () => {
    mockUseAuditLog.mockReturnValue({
      data: makeData({
        metadata: {
          result: 'Denegado',
          correlationId: 'corr-123',
          nested: { detail: 'estructurado' },
          token: 'leak',
        },
      }),
      isError: false,
      isPending: false,
    });

    const screen = await render(<AuditLogDetail id={EVENT_ID} />);

    expect(screen.getByText('Resultado')).toBeTruthy();
    expect(screen.getByText('Denegado')).toBeTruthy();
    expect(screen.getByText('ID de correlación')).toBeTruthy();

    fireEvent.press(screen.getByTestId('audit-metadata-json-toggle'));
    await waitFor(() => expect(screen.getByText('Ocultar datos sanitizados')).toBeTruthy());
    expect(screen.getByText(/estructurado/)).toBeTruthy();
    expect(screen.queryByText(/leak/)).toBeNull();
  });

  it('surfaces loading, offline and error states', async () => {
    mockUseAuditLog.mockReturnValue({ isPending: true, isError: false, data: undefined });
    const loading = await render(<AuditLogDetail id={EVENT_ID} />);
    expect(loading.getByText('Cargando detalle de auditoría')).toBeTruthy();

    const offlineError = new ApiError({
      code: 'NETWORK_ERROR',
      message: 'offline',
      requestId: 'req',
      status: 0,
    });
    mockUseAuditLog.mockReturnValue({
      isPending: false,
      isError: true,
      error: offlineError,
      refetch: jest.fn(),
    });
    const offline = await render(<AuditLogDetail id={EVENT_ID} />);
    expect(offline.getByText('Sin conexión')).toBeTruthy();

    const serverError = new ApiError({
      code: 'HTTP_500',
      message: 'boom',
      requestId: 'req',
      status: 500,
    });
    mockUseAuditLog.mockReturnValue({
      isPending: false,
      isError: true,
      error: serverError,
      refetch: jest.fn(),
    });
    const failure = await render(<AuditLogDetail id={EVENT_ID} />);
    expect(failure.getByText('No se pudo cargar el evento')).toBeTruthy();
  });

  it('rejects an empty identifier', async () => {
    mockUseAuditLog.mockReturnValue({ isPending: false, isError: false, data: undefined });
    const screen = await render(<AuditLogDetail id="" />);
    expect(screen.getByText('Evento no disponible')).toBeTruthy();
  });
});
