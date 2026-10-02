import { fireEvent, render, waitFor } from '@testing-library/react-native';

import { ChangePasswordForm } from './ChangePasswordForm';

describe('ChangePasswordForm', () => {
  it('submits current and new password when the new one is strong and confirmed', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    const screen = await render(<ChangePasswordForm onSubmit={onSubmit} />);

    await fireEvent.changeText(screen.getByLabelText('Contraseña actual'), 'current-password');
    await fireEvent.changeText(screen.getByLabelText('Contraseña nueva'), 'strong-password');
    await fireEvent.changeText(
      screen.getByLabelText('Confirmar contraseña nueva'),
      'strong-password'
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Cambiar contraseña' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        currentPassword: 'current-password',
        newPassword: 'strong-password',
      });
    });
  });

  it('requires the current password before sending', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    const screen = await render(<ChangePasswordForm onSubmit={onSubmit} />);

    await fireEvent.changeText(screen.getByLabelText('Contraseña nueva'), 'strong-password');
    await fireEvent.changeText(
      screen.getByLabelText('Confirmar contraseña nueva'),
      'strong-password'
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Cambiar contraseña' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Ingresá tu contraseña actual.');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('rejects passwords shorter than the minimum policy before sending', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    const screen = await render(<ChangePasswordForm onSubmit={onSubmit} />);

    await fireEvent.changeText(screen.getByLabelText('Contraseña actual'), 'current-password');
    await fireEvent.changeText(screen.getByLabelText('Contraseña nueva'), 'short');
    await fireEvent.changeText(screen.getByLabelText('Confirmar contraseña nueva'), 'short');
    await fireEvent.press(screen.getByRole('button', { name: 'Cambiar contraseña' }));

    expect(screen.getByRole('alert')).toHaveTextContent(
      'La contraseña debe tener al menos 12 caracteres.'
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('rejects a mismatch between the new password and its confirmation', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    const screen = await render(<ChangePasswordForm onSubmit={onSubmit} />);

    await fireEvent.changeText(screen.getByLabelText('Contraseña actual'), 'current-password');
    await fireEvent.changeText(screen.getByLabelText('Contraseña nueva'), 'strong-password');
    await fireEvent.changeText(
      screen.getByLabelText('Confirmar contraseña nueva'),
      'different-password'
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Cambiar contraseña' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Las contraseñas no coinciden.');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('surfaces an invalid current password error from the parent', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    const screen = await render(
      <ChangePasswordForm
        errorMessage="La contraseña actual no es correcta. Intentá de nuevo."
        onSubmit={onSubmit}
      />
    );

    expect(screen.getByRole('alert')).toHaveTextContent(
      'La contraseña actual no es correcta. Intentá de nuevo.'
    );
  });

  it('exposes a logical keyboard focus order', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    const screen = await render(<ChangePasswordForm onSubmit={onSubmit} />);

    expect(screen.getByLabelText('Contraseña actual').props.returnKeyType).toBe('next');
    expect(screen.getByLabelText('Contraseña nueva').props.returnKeyType).toBe('next');
    expect(screen.getByLabelText('Confirmar contraseña nueva').props.returnKeyType).toBe('done');
  });
});
