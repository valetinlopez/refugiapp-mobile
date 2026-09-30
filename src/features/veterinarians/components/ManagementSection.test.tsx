import { fireEvent, render } from '@testing-library/react-native';

import { ManagementSection } from './ManagementSection';

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));

const { router } = jest.requireMock('expo-router') as {
  router: { push: jest.Mock };
};

describe('ManagementSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows the veterinarians card for any role', async () => {
    const screen = await render(<ManagementSection canManageUsers={false} canReadAudit={false} />);

    expect(screen.getByText('Veterinarios')).toBeTruthy();
  });

  it('shows the users card only when the role can manage users', async () => {
    const screen = await render(<ManagementSection canManageUsers canReadAudit={false} />);

    expect(screen.getByText('Usuarios')).toBeTruthy();
  });

  it('hides the users card without canManageUsers', async () => {
    const screen = await render(<ManagementSection canManageUsers={false} canReadAudit={false} />);

    expect(screen.queryByText('Usuarios')).toBeNull();
  });

  it('shows the audit card only when the role can read audit', async () => {
    const screen = await render(<ManagementSection canManageUsers={false} canReadAudit />);

    expect(screen.getByText('Ver auditoría')).toBeTruthy();
  });

  it('hides the audit card without canReadAudit', async () => {
    const screen = await render(<ManagementSection canManageUsers={false} canReadAudit={false} />);

    expect(screen.queryByText('Ver auditoría')).toBeNull();
  });

  it('navigates to veterinarians', async () => {
    const screen = await render(<ManagementSection canManageUsers={false} canReadAudit={false} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Veterinarios' }));

    expect(router.push).toHaveBeenCalledWith('/veterinarians');
  });

  it('navigates to users', async () => {
    const screen = await render(<ManagementSection canManageUsers canReadAudit={false} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Usuarios' }));

    expect(router.push).toHaveBeenCalledWith('/users');
  });

  it('navigates to audit', async () => {
    const screen = await render(<ManagementSection canManageUsers={false} canReadAudit />);

    await fireEvent.press(screen.getByRole('button', { name: 'Ver auditoría' }));

    expect(router.push).toHaveBeenCalledWith('/audit');
  });
});
