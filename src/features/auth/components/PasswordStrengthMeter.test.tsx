import { render } from '@testing-library/react-native';

import { PasswordStrengthMeter } from './PasswordStrengthMeter';

describe('PasswordStrengthMeter', () => {
  it('renders nothing for an empty password', async () => {
    const screen = await render(<PasswordStrengthMeter password="" />);

    expect(screen.queryByTestId('password-strength-meter')).toBeNull();
  });

  it('announces a weak level below the minimum policy', async () => {
    const screen = await render(<PasswordStrengthMeter password="short" />);

    expect(screen.getByLabelText('Fortaleza de la contraseña: Débil')).toBeTruthy();
    expect(screen.getByText('Débil')).toBeTruthy();
  });

  it('announces a medium level for 12 to 15 characters', async () => {
    const screen = await render(<PasswordStrengthMeter password={'a'.repeat(12)} />);

    expect(screen.getByLabelText('Fortaleza de la contraseña: Media')).toBeTruthy();
    expect(screen.getByText('Media')).toBeTruthy();
  });

  it('announces a strong level for 16 or more characters', async () => {
    const screen = await render(<PasswordStrengthMeter password={'a'.repeat(16)} />);

    expect(screen.getByLabelText('Fortaleza de la contraseña: Fuerte')).toBeTruthy();
    expect(screen.getByText('Fuerte')).toBeTruthy();
  });
});
