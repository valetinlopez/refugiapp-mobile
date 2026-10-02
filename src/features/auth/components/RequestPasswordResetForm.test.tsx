import { act, fireEvent, render, waitFor } from '@testing-library/react-native';

import { RequestPasswordResetForm } from './RequestPasswordResetForm';

describe('RequestPasswordResetForm', () => {
  it('normalizes the email and submits an accessible form', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    const screen = await render(<RequestPasswordResetForm onSubmit={onSubmit} />);

    await fireEvent.changeText(screen.getByLabelText('Correo electrónico'), ' User@Example.com ');
    await fireEvent.press(screen.getByRole('button', { name: 'Enviar enlace de recuperación' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith('user@example.com');
    });
  });

  it('shows validation feedback without sending an invalid email', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    const screen = await render(<RequestPasswordResetForm onSubmit={onSubmit} />);

    await fireEvent.changeText(screen.getByLabelText('Correo electrónico'), 'invalid');
    await fireEvent.press(screen.getByRole('button', { name: 'Enviar enlace de recuperación' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Ingresá un correo válido.');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('surfaces a translated error from the parent and keeps double submit blocked while sending', async () => {
    let resolveSubmit: (() => void) | undefined;
    const onSubmit = jest.fn().mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveSubmit = resolve;
        })
    );
    const screen = await render(
      <RequestPasswordResetForm errorMessage="Error de red simulado." onSubmit={onSubmit} />
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Error de red simulado.');

    await fireEvent.changeText(screen.getByLabelText('Correo electrónico'), 'user@example.com');
    const submit = screen.getByRole('button', { name: 'Enviar enlace de recuperación' });
    await fireEvent.press(submit);
    await fireEvent.press(submit);

    expect(onSubmit).toHaveBeenCalledTimes(1);
    await act(async () => {
      resolveSubmit?.();
    });
  });
});
