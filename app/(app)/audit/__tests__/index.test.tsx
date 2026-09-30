import { render } from '@testing-library/react-native';

import { useCapabilities } from '@/features/auth/hooks/useCapabilities';
import AuditRoute from '../index';

jest.mock('@/features/auth/hooks/useCapabilities', () => ({ useCapabilities: jest.fn() }));
jest.mock('@/features/auth/components/AccountHeaderRow', () => ({ AccountHeaderRow: () => null }));
jest.mock('@/features/audit/components/AuditLogsScreen', () => ({ AuditLogsScreen: () => null }));
jest.mock('@/components/navigation', () => ({ navigateBack: jest.fn() }));

const mockUseCapabilities = useCapabilities as jest.Mock;

describe('AuditRoute', () => {
  it('explains restricted access to non-admin roles', async () => {
    mockUseCapabilities.mockReturnValue({ canReadAudit: false });
    const screen = await render(<AuditRoute />);
    expect(screen.getByText('Sin permiso')).toBeTruthy();
    expect(
      screen.getByText('Solo los administradores pueden consultar la auditoría.')
    ).toBeTruthy();
  });

  it('does not render the restricted state for admin', async () => {
    mockUseCapabilities.mockReturnValue({ canReadAudit: true });
    const screen = await render(<AuditRoute />);
    expect(screen.queryByText('Sin permiso')).toBeNull();
  });
});
