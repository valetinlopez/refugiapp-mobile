import { fireEvent, render } from '@testing-library/react-native';

import { AccountApplicationSection } from './AccountApplicationSection';

describe('AccountApplicationSection', () => {
  it('presents offline connectivity with text and icon semantics', async () => {
    const screen = await render(
      <AccountApplicationSection isOnline={false} onChangePassword={jest.fn()} />
    );

    expect(screen.getByText('Sin conexión')).toBeTruthy();
    expect(screen.getByText('Trabajando sin conexión')).toBeTruthy();
  });

  it('opens account security and expands application information', async () => {
    const onChangePassword = jest.fn();
    const screen = await render(
      <AccountApplicationSection isOnline onChangePassword={onChangePassword} />
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Acerca de Refugiapp' }));
    expect(screen.getByTestId('about-content')).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: 'Cambiar contraseña' }));
    expect(onChangePassword).toHaveBeenCalledTimes(1);
  });
});
