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
    const screen = await render(<ManagementSection canManageUsers={false} />);

    expect(screen.getByText('Veterinarios')).toBeTruthy();
  });

  it('shows the users card only when the role can manage users', async () => {
    const screen = await render(<ManagementSection canManageUsers />);

    expect(screen.getByText('Usuarios')).toBeTruthy();
  });

  it('hides the users card without canManageUsers', async () => {
    const screen = await render(<ManagementSection canManageUsers={false} />);

    expect(screen.queryByText('Usuarios')).toBeNull();
  });

  it('navigates to veterinarians', async () => {
    const screen = await render(<ManagementSection canManageUsers={false} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Veterinarios' }));

    expect(router.push).toHaveBeenCalledWith('/veterinarians');
  });

  it('navigates to users', async () => {
    const screen = await render(<ManagementSection canManageUsers />);

    await fireEvent.press(screen.getByRole('button', { name: 'Usuarios' }));

    expect(router.push).toHaveBeenCalledWith('/users');
  });
});
