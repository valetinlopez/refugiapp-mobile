import { fireEvent, render } from '@testing-library/react-native';

import { PasswordField } from './PasswordField';

describe('PasswordField', () => {
  it('renders the label and hides the password by default', async () => {
    const screen = await render(<PasswordField label="Contraseña" />);

    expect(screen.getByLabelText('Contraseña').props.secureTextEntry).toBe(true);
    expect(screen.getByRole('button', { name: 'Mostrar contraseña' })).toBeTruthy();
  });

  it('reveals and hides the password from its toggle', async () => {
    const screen = await render(<PasswordField label="Contraseña nueva" />);

    await fireEvent.press(screen.getByRole('button', { name: 'Mostrar contraseña' }));

    expect(screen.getByLabelText('Contraseña nueva').props.secureTextEntry).toBe(false);
    expect(screen.getByRole('button', { name: 'Ocultar contraseña' })).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: 'Ocultar contraseña' }));

    expect(screen.getByLabelText('Contraseña nueva').props.secureTextEntry).toBe(true);
  });

  it('forwards text content and keyboard props to the input', async () => {
    const screen = await render(
      <PasswordField
        label="Contraseña nueva"
        onSubmitEditing={() => undefined}
        returnKeyType="next"
        textContentType="newPassword"
      />
    );

    const input = screen.getByLabelText('Contraseña nueva');
    expect(input.props.textContentType).toBe('newPassword');
    expect(input.props.returnKeyType).toBe('next');
    expect(input.props.onSubmitEditing).toBeDefined();
  });
});
