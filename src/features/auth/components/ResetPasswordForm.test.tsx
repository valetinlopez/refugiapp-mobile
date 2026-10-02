import { fireEvent, render, waitFor } from '@testing-library/react-native';

import { ResetPasswordForm } from './ResetPasswordForm';

describe('ResetPasswordForm', () => {
  it('submits the new password when it is strong and matches its confirmation', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    const screen = await render(<ResetPasswordForm onSubmit={onSubmit} />);

    await fireEvent.changeText(screen.getByLabelText('Contraseña nueva'), 'strong-password');
    await fireEvent.changeText(
      screen.getByLabelText('Confirmar contraseña nueva'),
      'strong-password'
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Definir nueva contraseña' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith('strong-password');
    });
  });

  it('rejects passwords shorter than the minimum policy before sending', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    const screen = await render(<ResetPasswordForm onSubmit={onSubmit} />);

    await fireEvent.changeText(screen.getByLabelText('Contraseña nueva'), 'short');
    await fireEvent.changeText(screen.getByLabelText('Confirmar contraseña nueva'), 'short');
    await fireEvent.press(screen.getByRole('button', { name: 'Definir nueva contraseña' }));

    expect(screen.getByRole('alert')).toHaveTextContent(
      'La contraseña debe tener al menos 12 caracteres.'
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('rejects a mismatch between the new password and its confirmation', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    const screen = await render(<ResetPasswordForm onSubmit={onSubmit} />);

    await fireEvent.changeText(screen.getByLabelText('Contraseña nueva'), 'strong-password');
    await fireEvent.changeText(
      screen.getByLabelText('Confirmar contraseña nueva'),
      'different-password'
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Definir nueva contraseña' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Las contraseñas no coinciden.');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('surfaces a translated error from the parent without leaking details', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    const screen = await render(
      <ResetPasswordForm
        errorMessage="El enlace de recuperación venció. Solicitá uno nuevo."
        onSubmit={onSubmit}
      />
    );

    expect(screen.getByRole('alert')).toHaveTextContent(
      'El enlace de recuperación venció. Solicitá uno nuevo.'
    );
  });
});
