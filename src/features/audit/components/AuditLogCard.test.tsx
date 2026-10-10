import { fireEvent, render } from '@testing-library/react-native';

import type { AuditLogView } from '../types';
import { auditActionLabel, formatAuditDate } from '../utils/auditPresentation';
import { AuditLogCard } from './AuditLogCard';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({ router: { push: (...args: unknown[]) => mockPush(...args) } }));
jest.mock('../utils/auditPresentation', () => ({
  auditActionLabel: jest.fn(() => 'Inicio de sesión fallido'),
  auditResourceTypeLabel: jest.fn(() => 'Sesión'),
  formatAuditDate: jest.fn(() => '1 oct 2026, 12:00'),
  formatAuditIdentifier: jest.fn(() => 'Sin identificador'),
  isHighRiskAuditAction: jest.fn(() => true),
}));

const UUID = '22222222-2222-4222-8222-222222222222';

function entry(overrides: Partial<AuditLogView> = {}): AuditLogView {
  return {
    id: '11111111-1111-4111-8111-111111111111',
    actor: null,
    actorFallbackId: UUID,
    action: 'auth.login_failure',
    resourceType: 'auth_session',
    resourceId: null,
    metadata: {},
    occurredAt: '2026-10-01T15:00:00.000Z',
    ...overrides,
  };
}

describe('AuditLogCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not render the item again when its stable list props do not change', async () => {
    const stableEntry = entry();
    const screen = await render(<AuditLogCard entry={stableEntry} />);
    const labelCalls = (auditActionLabel as jest.Mock).mock.calls.length;
    const dateCalls = (formatAuditDate as jest.Mock).mock.calls.length;

    await screen.rerender(<AuditLogCard entry={stableEntry} />);

    expect(auditActionLabel).toHaveBeenCalledTimes(labelCalls);
    expect(formatAuditDate).toHaveBeenCalledTimes(dateCalls);
  });

  it('opens the selected audit detail', async () => {
    const screen = await render(<AuditLogCard entry={entry()} />);

    expect(screen.getByTestId('audit-card')).toBeTruthy();
    fireEvent.press(screen.getByRole('button'));

    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/audit/[id]',
      params: { id: entry().id },
    });
  });

  it('shows the actor display name when available', async () => {
    const screen = await render(
      <AuditLogCard
        entry={entry({
          actor: {
            id: UUID,
            displayName: 'María López',
            initials: 'ML',
            email: 'maria@refugiapp.local',
          },
        })}
      />
    );

    expect(screen.getByText('María López')).toBeTruthy();
    expect(screen.queryByText(UUID)).toBeNull();
  });

  it('communicates a high-risk event with text and an icon-backed badge', async () => {
    const screen = await render(<AuditLogCard entry={entry()} />);

    expect(screen.getByText('Riesgo alto')).toBeTruthy();
    expect(screen.getByLabelText(/riesgo alto/)).toBeTruthy();
  });

  it('does not expose event metadata in the list card', async () => {
    const screen = await render(
      <AuditLogCard entry={entry({ metadata: { reason: 'internal-only-value' } })} />
    );

    expect(screen.queryByText('internal-only-value')).toBeNull();
  });

  it('falls back to the UUID during rollout when actor is absent', async () => {
    const screen = await render(<AuditLogCard entry={entry()} />);

    expect(screen.getByText(UUID)).toBeTruthy();
  });

  it('renders the system label for null actor and null fallback', async () => {
    const screen = await render(
      <AuditLogCard entry={entry({ actor: null, actorFallbackId: null })} />
    );

    expect(screen.getByText('Sistema')).toBeTruthy();
  });

  it('exposes the actor in the accessible label', async () => {
    const screen = await render(
      <AuditLogCard
        entry={entry({
          actor: {
            id: UUID,
            displayName: 'María López',
            initials: 'ML',
            email: 'maria@refugiapp.local',
          },
        })}
      />
    );

    expect(screen.getByLabelText('Actor: María López')).toBeTruthy();
  });
});
