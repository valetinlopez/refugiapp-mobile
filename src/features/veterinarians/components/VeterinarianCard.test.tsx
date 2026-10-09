import { fireEvent, render } from '@testing-library/react-native';

import type { VeterinarianResponse } from '../types';
import { VeterinarianCard } from './VeterinarianCard';

const VET: VeterinarianResponse = {
  id: '11111111-1111-4111-8111-111111111111',
  userId: null,
  firstName: 'Sofía',
  lastName: 'Romero',
  licenseNumber: 'VET-001',
  email: 'sofia@refugiapp.local',
  phone: '1145550101',
  notes: null,
  isActive: true,
  createdAt: '2026-09-01T00:00:00.000Z',
  updatedAt: '2026-09-01T00:00:00.000Z',
};

describe('VeterinarianCard', () => {
  it('renders identity, contact and active state as a single accessible button', async () => {
    const onPress = jest.fn();
    const screen = await render(<VeterinarianCard onPress={onPress} veterinarian={VET} />);

    expect(screen.getByText('Sofía Romero')).toBeTruthy();
    expect(screen.getByText('Matrícula VET-001')).toBeTruthy();
    expect(screen.getByText('sofia@refugiapp.local')).toBeTruthy();
    expect(screen.getByText('1145550101')).toBeTruthy();
    expect(screen.getByText('Activo')).toBeTruthy();
    expect(
      screen.getByLabelText(
        'Sofía Romero, matrícula VET-001, email sofia@refugiapp.local, teléfono 1145550101, Activo'
      )
    ).toBeTruthy();

    await fireEvent.press(screen.getByRole('button'));
    expect(onPress).toHaveBeenCalledWith(VET);
  });

  it('marks an inactive veterinarian with text, not color alone', async () => {
    const screen = await render(
      <VeterinarianCard onPress={jest.fn()} veterinarian={{ ...VET, isActive: false }} />
    );

    expect(screen.getByText('Inactivo')).toBeTruthy();
  });

  it('omits contact lines that do not exist', async () => {
    const screen = await render(
      <VeterinarianCard onPress={jest.fn()} veterinarian={{ ...VET, email: null, phone: null }} />
    );

    expect(screen.queryByText('sofia@refugiapp.local')).toBeNull();
    expect(screen.queryByText('1145550101')).toBeNull();
    expect(screen.getByLabelText('Sofía Romero, matrícula VET-001, Activo')).toBeTruthy();
  });
});
