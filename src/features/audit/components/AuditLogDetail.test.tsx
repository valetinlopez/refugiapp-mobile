import { render } from '@testing-library/react-native';

import { useAuditLog } from '../hooks/useAuditLogs';
import { AuditLogDetail } from './AuditLogDetail';

jest.mock('../hooks/useAuditLogs', () => ({ useAuditLog: jest.fn() }));

const mockUseAuditLog = useAuditLog as jest.Mock;

describe('AuditLogDetail', () => {
  it('shows the audit context without exposing sensitive metadata', async () => {
    mockUseAuditLog.mockReturnValue({
      data: {
        id: '11111111-1111-4111-8111-111111111111',
        actorUserId: '22222222-2222-4222-8222-222222222222',
        action: 'auth.login_failure',
        resourceType: 'auth_session',
        resourceId: null,
        metadata: { email: 'admin@refugiapp.local', password: 'never-show', token: 'hidden' },
        occurredAt: '2026-09-29T12:00:00.000Z',
        createdAt: '2026-09-29T12:00:00.000Z',
      },
      isError: false,
      isPending: false,
    });

    const screen = await render(<AuditLogDetail id="11111111-1111-4111-8111-111111111111" />);

    expect(screen.getByText('Inicio de sesión fallido')).toBeTruthy();
    expect(screen.getByText(/admin@refugiapp.local/)).toBeTruthy();
    expect(screen.queryByText(/never-show/)).toBeNull();
    expect(screen.queryByText(/hidden/)).toBeNull();
  });
});
