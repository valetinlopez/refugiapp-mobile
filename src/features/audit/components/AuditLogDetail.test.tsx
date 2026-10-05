import { render } from '@testing-library/react-native';

import { useAuditLog } from '../hooks/useAuditLogs';
import { AuditLogDetail } from './AuditLogDetail';

jest.mock('../hooks/useAuditLogs', () => ({ useAuditLog: jest.fn() }));

const mockUseAuditLog = useAuditLog as jest.Mock;

const ACTOR_UUID = '22222222-2222-4222-8222-222222222222';

function makeData(overrides: Record<string, unknown> = {}) {
  return {
    id: '11111111-1111-4111-8111-111111111111',
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
  it('shows the audit context without exposing sensitive metadata', async () => {
    mockUseAuditLog.mockReturnValue({
      data: makeData(),
      isError: false,
      isPending: false,
    });

    const screen = await render(<AuditLogDetail id="11111111-1111-4111-8111-111111111111" />);

    expect(screen.getByTestId('audit-detail')).toBeTruthy();
    expect(screen.getAllByText('Inicio de sesión fallido').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Sesión').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('María López')).toBeTruthy();
    expect(screen.getByText('maria@refugiapp.local')).toBeTruthy();
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

    const screen = await render(<AuditLogDetail id="11111111-1111-4111-8111-111111111111" />);

    expect(screen.getByText(ACTOR_UUID)).toBeTruthy();
  });

  it('renders the system label for null actor and null fallback', async () => {
    mockUseAuditLog.mockReturnValue({
      data: makeData({ actor: null, actorFallbackId: null }),
      isError: false,
      isPending: false,
    });

    const screen = await render(<AuditLogDetail id="11111111-1111-4111-8111-111111111111" />);

    expect(screen.getByText('Sistema')).toBeTruthy();
  });
});
