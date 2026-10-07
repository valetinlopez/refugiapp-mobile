import { fireEvent, render } from '@testing-library/react-native';

import { ManagementSection, type ManagementItem } from './ManagementSection';

const onSelect = jest.fn();

const ITEMS: readonly ManagementItem[] = [
  {
    description: 'Listado, detalle y estados de profesionales',
    hint: 'Ir a veterinarios',
    icon: 'medical',
    id: 'veterinarians',
    label: 'Veterinarios',
  },
  {
    description: 'Cuentas internas del refugio',
    hint: 'Ir a usuarios',
    icon: 'account',
    id: 'users',
    label: 'Usuarios',
  },
];

describe('ManagementSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders only the supplied destinations with an accessible section heading', async () => {
    const screen = await render(
      <ManagementSection items={ITEMS.slice(0, 1)} onSelect={onSelect} />
    );

    expect(screen.getByRole('header', { name: 'Gestión' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Veterinarios' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Usuarios' })).toBeNull();
  });

  it('exposes the destination hint and invokes its callback', async () => {
    const screen = await render(<ManagementSection items={ITEMS} onSelect={onSelect} />);
    const usersButton = screen.getByRole('button', { name: 'Usuarios' });

    expect(usersButton.props.accessibilityHint).toBe('Ir a usuarios');
    fireEvent.press(usersButton);

    expect(onSelect).toHaveBeenCalledWith('users');
  });
});
