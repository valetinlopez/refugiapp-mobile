import { fireEvent, render, waitFor } from '@testing-library/react-native';

import { LoginForm } from './LoginForm';

describe('LoginForm', () => {
  it('normalizes credentials and submits an accessible form', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    const screen = await render(<LoginForm onSubmit={onSubmit} />);

    await fireEvent.changeText(screen.getByLabelText('Correo electrónico'), ' Admin@Example.com ');
    await fireEvent.changeText(screen.getByLabelText('Contraseña'), 'very-secure-password');
    await fireEvent.press(screen.getByRole('button', { name: 'Iniciar sesión' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        email: 'admin@example.com',
        password: 'very-secure-password',
      });
    });
  });

  it('shows validation feedback without sending invalid credentials', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    const screen = await render(<LoginForm onSubmit={onSubmit} />);

    await fireEvent.changeText(screen.getByLabelText('Correo electrónico'), 'invalid');
    await fireEvent.changeText(screen.getByLabelText('Contraseña'), 'short');
    await fireEvent.press(screen.getByRole('button', { name: 'Iniciar sesión' }));

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Ingresa un correo válido y una contraseña de al menos 12 caracteres.'
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
