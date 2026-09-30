import { fireEvent, render } from '@testing-library/react-native';

import type { UserResponse } from '../types';
import { UserCard } from './UserCard';

const activeUser: UserResponse = {
  id: '11111111-1111-4111-8111-111111111111',
  email: 'andres.borrego.boxer.largo@refugiapp.local',
  firstName: 'Andres',
  lastName: 'Borrego',
  roles: ['shelter_manager'],
  isActive: true,
  createdAt: '2026-09-01T00:00:00.000Z',
  updatedAt: '2026-09-01T00:00:00.000Z',
};

const inactiveUser: UserResponse = {
  ...activeUser,
  id: '22222222-2222-4222-8222-222222222222',
  email: 'vet@refugiapp.local',
  firstName: 'Valeria',
  lastName: 'Torres',
  roles: ['veterinarian'],
  isActive: false,
};

describe('UserCard', () => {
  it('shows identity, role and state without relying only on color', async () => {
    const screen = await render(
      <>
        <UserCard onChangeStatus={jest.fn()} user={activeUser} />
        <UserCard onChangeStatus={jest.fn()} user={inactiveUser} />
      </>
    );

    expect(screen.getByText('Andres Borrego')).toBeTruthy();
    expect(screen.getByText('Encargado de refugio')).toBeTruthy();
    expect(screen.getByText('Veterinario')).toBeTruthy();
    expect(screen.getByText('Activo')).toBeTruthy();
    expect(screen.getByText('Inactivo')).toBeTruthy();
  });

  it('truncates the email visually but keeps the full value accessible', async () => {
    const screen = await render(<UserCard onChangeStatus={jest.fn()} user={activeUser} />);

    const email = screen.getByLabelText(activeUser.email);
    expect(email).toHaveProp('numberOfLines', 1);
    expect(email).toHaveProp('ellipsizeMode', 'tail');
  });

  it('keeps full name, email, roles and state in the card label', async () => {
    const screen = await render(<UserCard onChangeStatus={jest.fn()} user={activeUser} />);

    expect(
      screen.getByLabelText(
        'Andres Borrego, andres.borrego.boxer.largo@refugiapp.local, Encargado de refugio, Activo'
      )
    ).toBeTruthy();
  });

  it('offers deactivation as a secondary action and forwards the user', async () => {
    const onChangeStatus = jest.fn();
    const screen = await render(<UserCard onChangeStatus={onChangeStatus} user={activeUser} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Desactivar usuario' }));
    expect(onChangeStatus).toHaveBeenCalledWith(activeUser);
  });

  it('offers activation as the primary action for inactive accounts', async () => {
    const screen = await render(<UserCard onChangeStatus={jest.fn()} user={inactiveUser} />);

    expect(screen.getByRole('button', { name: 'Activar usuario' })).toBeTruthy();
  });
});
