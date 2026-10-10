import { render } from '@testing-library/react-native';

import { useCapabilities } from '@/features/auth/hooks/useCapabilities';
import AuditDetailRoute from '../[id]';

jest.mock('@/features/auth/hooks/useCapabilities', () => ({ useCapabilities: jest.fn() }));
jest.mock('@/features/auth/components/AccountHeaderRow', () => ({ AccountHeaderRow: () => null }));
jest.mock('@/features/audit/components/AuditLogDetail', () => ({ AuditLogDetail: () => null }));
jest.mock('@/components/navigation', () => ({ navigateBack: jest.fn() }));
jest.mock('expo-router', () => ({ useLocalSearchParams: () => ({ id: 'event-id' }) }));
jest.mock('react', () => ({
  ...jest.requireActual<typeof import('react')>('react'),
  lazy: () => () => null,
}));

const mockUseCapabilities = useCapabilities as jest.Mock;

describe('AuditDetailRoute', () => {
  it('explains restricted access to non-admin roles without mounting the detail', async () => {
    mockUseCapabilities.mockReturnValue({ canReadAudit: false });
    const screen = await render(<AuditDetailRoute />);
    expect(screen.getByText('Sin permiso')).toBeTruthy();
    expect(
      screen.getByText('Solo los administradores pueden consultar la auditoría.')
    ).toBeTruthy();
  });

  it('renders the detail for admin', async () => {
    mockUseCapabilities.mockReturnValue({ canReadAudit: true });
    const screen = await render(<AuditDetailRoute />);
    expect(screen.queryByText('Sin permiso')).toBeNull();
  });

  it('reacts to permission loss and replaces the protected module', async () => {
    mockUseCapabilities.mockReturnValue({ canReadAudit: true });
    const screen = await render(<AuditDetailRoute />);

    mockUseCapabilities.mockReturnValue({ canReadAudit: false });
    await screen.rerender(<AuditDetailRoute />);

    expect(screen.getByText('Sin permiso')).toBeTruthy();
  });
});
