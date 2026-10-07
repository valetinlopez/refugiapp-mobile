import { fireEvent, render, waitFor } from '@testing-library/react-native';

import type { UserResponse } from '../types';
import { UserForm } from './UserForm';

const existingUser: UserResponse = {
  id: '11111111-1111-4111-8111-111111111111',
  email: 'manager@refugiapp.local',
  firstName: 'Sofia',
  lastName: 'Ramirez',
  roles: ['shelter_manager'],
  isActive: true,
  createdAt: '2026-09-01T00:00:00.000Z',
  updatedAt: '2026-09-01T00:00:00.000Z',
};

describe('UserForm', () => {
  it('submits normalized values and every selected role', async () => {
    const onSubmit = jest.fn();
    const screen = await render(
      <UserForm isSubmitting={false} onCancel={jest.fn()} onSubmit={onSubmit} />
    );

    await fireEvent.changeText(screen.getByLabelText('Nombre'), ' Ana ');
    await fireEvent.changeText(screen.getByLabelText('Apellido'), ' Perez ');
    await fireEvent.changeText(
      screen.getByLabelText('Correo electrónico'),
      ' ADMIN@Refugiapp.Local '
    );
    await fireEvent.changeText(screen.getByLabelText('Contraseña inicial'), 'secure-pass-123');
    await fireEvent.press(screen.getByRole('checkbox', { name: 'Administrador' }));
    await fireEvent.press(screen.getByRole('checkbox', { name: 'Veterinario' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Revisar y crear' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'admin@refugiapp.local',
        firstName: 'Ana',
        lastName: 'Perez',
        roles: ['shelter_manager', 'admin', 'veterinarian'],
      }),
      undefined
    );
  });

  it('shows validation messages before submitting invalid data', async () => {
    const screen = await render(
      <UserForm isSubmitting={false} onCancel={jest.fn()} onSubmit={jest.fn()} />
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Revisar y crear' }));

    expect(await screen.findByText('Ingresá el nombre.')).toBeTruthy();
    expect(screen.getByText('Ingresá el email.')).toBeTruthy();
    expect(screen.getByText('La contraseña debe tener al menos 12 caracteres.')).toBeTruthy();
  });

  it('announces a create-user error returned by the feature', async () => {
    const screen = await render(
      <UserForm
        errorMessage="Ya existe un usuario registrado con ese email."
        isSubmitting={false}
        onCancel={jest.fn()}
        onSubmit={jest.fn()}
      />
    );

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Ya existe un usuario registrado con ese email.'
    );
  });

  it('explains the password requirement and exposes multirole state accessibly', async () => {
    const screen = await render(
      <UserForm isSubmitting={false} onCancel={jest.fn()} onSubmit={jest.fn()} />
    );

    expect(screen.getByText(/Mínimo 12 caracteres/)).toBeTruthy();
    expect(screen.queryByText(/8 caracteres/)).toBeNull();
    expect(screen.getByTestId('create-user-first-name')).toBeTruthy();
    expect(screen.getByTestId('create-user-last-name')).toBeTruthy();
    expect(screen.getByTestId('create-user-email')).toBeTruthy();
    expect(screen.getByTestId('create-user-password')).toBeTruthy();
    expect(
      screen.getByRole('checkbox', { name: 'Encargado de refugio' }).props.accessibilityState
    ).toEqual(expect.objectContaining({ checked: true }));

    await fireEvent.press(screen.getByRole('checkbox', { name: 'Administrador' }));
    expect(screen.getByText(/permite gestionar usuarios internos/)).toBeTruthy();
  });

  it('allows cancelling the create flow', async () => {
    const onCancel = jest.fn();
    const screen = await render(
      <UserForm isSubmitting={false} onCancel={onCancel} onSubmit={jest.fn()} />
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('prefills profile data in edit mode without a password field', async () => {
    const screen = await render(
      <UserForm initialUser={existingUser} isSubmitting={false} mode="edit" onSubmit={jest.fn()} />
    );

    expect(screen.getByDisplayValue('Sofia')).toBeTruthy();
    expect(screen.getByDisplayValue('manager@refugiapp.local')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Guardar cambios' })).toBeTruthy();
    expect(screen.queryByLabelText('Contraseña inicial')).toBeNull();
  });

  it('submits normalized edit values', async () => {
    const onSubmit = jest.fn();
    const screen = await render(
      <UserForm initialUser={existingUser} isSubmitting={false} mode="edit" onSubmit={onSubmit} />
    );

    await fireEvent.changeText(screen.getByLabelText('Nombre'), ' Sofía ');
    await fireEvent.press(screen.getByRole('button', { name: 'Guardar cambios' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ firstName: 'Sofía' }),
      undefined
    );
  });
});
