import { fireEvent, render } from '@testing-library/react-native';

import type { AuditLog } from '../types';
import { auditActionLabel, formatAuditDate } from '../utils/auditPresentation';
import { AuditLogCard } from './AuditLogCard';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({ router: { push: (...args: unknown[]) => mockPush(...args) } }));
jest.mock('../utils/auditPresentation', () => ({
  auditActionLabel: jest.fn(() => 'Inicio de sesión fallido'),
  formatAuditDate: jest.fn(() => '1 oct 2026, 12:00'),
}));

const entry: AuditLog = {
  id: '11111111-1111-4111-8111-111111111111',
  actorUserId: '22222222-2222-4222-8222-222222222222',
  action: 'auth.login_failure',
  resourceType: 'auth_session',
  resourceId: null,
  metadata: {},
  occurredAt: '2026-10-01T15:00:00.000Z',
  createdAt: '2026-10-01T15:00:00.000Z',
};

describe('AuditLogCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not render the item again when its stable list props do not change', async () => {
    const screen = await render(<AuditLogCard entry={entry} />);
    const labelCalls = (auditActionLabel as jest.Mock).mock.calls.length;
    const dateCalls = (formatAuditDate as jest.Mock).mock.calls.length;

    await screen.rerender(<AuditLogCard entry={entry} />);

    expect(auditActionLabel).toHaveBeenCalledTimes(labelCalls);
    expect(formatAuditDate).toHaveBeenCalledTimes(dateCalls);
  });

  it('opens the selected audit detail', async () => {
    const screen = await render(<AuditLogCard entry={entry} />);

    fireEvent.press(screen.getByRole('button'));

    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/audit/[id]',
      params: { id: entry.id },
    });
  });
});
