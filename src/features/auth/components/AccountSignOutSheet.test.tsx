import { fireEvent, render } from '@testing-library/react-native';

import { AccountSignOutSheet } from './AccountSignOutSheet';

const EMAIL = 'member@refugiapp.local';

describe('AccountSignOutSheet', () => {
  it('renders the confirmation with the account email', async () => {
    const screen = await render(
      <AccountSignOutSheet
        onClose={jest.fn()}
        onConfirm={jest.fn()}
        signingOut={false}
        userEmail={EMAIL}
        visible
      />
    );

    expect(screen.getByText('¿Querés cerrar sesión?')).toBeTruthy();
    expect(screen.getByText(`Vas a salir de ${EMAIL} en este dispositivo.`)).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Confirmar cierre de sesión' })).toBeTruthy();
  });

  it('confirms sign out', async () => {
    const onConfirm = jest.fn();
    const screen = await render(
      <AccountSignOutSheet
        onClose={jest.fn()}
        onConfirm={onConfirm}
        signingOut={false}
        userEmail={EMAIL}
        visible
      />
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Confirmar cierre de sesión' }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('locks actions while signing out', async () => {
    const onClose = jest.fn();
    const onConfirm = jest.fn();
    const screen = await render(
      <AccountSignOutSheet
        onClose={onClose}
        onConfirm={onConfirm}
        signingOut
        userEmail={EMAIL}
        visible
      />
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Confirmar cierre de sesión' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Cancelar' }));

    expect(onConfirm).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('surfaces a safe error message without leaking internals', async () => {
    const screen = await render(
      <AccountSignOutSheet
        errorMessage="No pudimos cerrar la sesión. Revisá tu conexión e intentá de nuevo."
        onClose={jest.fn()}
        onConfirm={jest.fn()}
        signingOut={false}
        userEmail={EMAIL}
        visible
      />
    );

    expect(
      screen.getByText('No pudimos cerrar la sesión. Revisá tu conexión e intentá de nuevo.')
    ).toBeTruthy();
  });
});
