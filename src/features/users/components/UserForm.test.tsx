import { fireEvent, render, waitFor } from '@testing-library/react-native';

import { UserForm } from './UserForm';

describe('UserForm', () => {
  it('submits normalized values and the selected role', async () => {
    const onSubmit = jest.fn();
    const screen = await render(<UserForm isSubmitting={false} onSubmit={onSubmit} />);

    await fireEvent.changeText(screen.getByLabelText('Nombre'), ' Ana ');
    await fireEvent.changeText(screen.getByLabelText('Apellido'), ' Perez ');
    await fireEvent.changeText(screen.getByLabelText('Email'), ' ADMIN@Refugiapp.Local ');
    await fireEvent.changeText(screen.getByLabelText('Contraseña inicial'), 'secure-pass-123');
    await fireEvent.press(screen.getByRole('radio', { name: 'Administrador' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Crear usuario' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'admin@refugiapp.local',
        firstName: 'Ana',
        lastName: 'Perez',
        role: 'admin',
      }),
      undefined
    );
  });

  it('shows validation messages before submitting invalid data', async () => {
    const screen = await render(<UserForm isSubmitting={false} onSubmit={jest.fn()} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Crear usuario' }));

    expect(await screen.findByText('Ingresá el nombre.')).toBeTruthy();
    expect(screen.getByText('Ingresá el email.')).toBeTruthy();
    expect(screen.getByText('La contraseña debe tener al menos 12 caracteres.')).toBeTruthy();
  });

  it('announces a create-user error returned by the feature', async () => {
    const screen = await render(
      <UserForm
        errorMessage="Ya existe un usuario registrado con ese email."
        isSubmitting={false}
        onSubmit={jest.fn()}
      />
    );

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Ya existe un usuario registrado con ese email.'
    );
  });
});
