import { fireEvent, render, waitFor } from '@testing-library/react-native';

import { navigateBack } from '@/components/navigation';
import { ApiError } from '@/core/api';

import { useCreateVeterinarian } from '../hooks/useVeterinarianMutations';
import { CreateVeterinarianScreen } from './CreateVeterinarianScreen';

jest.mock('@/components/navigation', () => ({ navigateBack: jest.fn() }));
jest.mock('../hooks/useVeterinarianMutations', () => ({ useCreateVeterinarian: jest.fn() }));

const mockCreateVeterinarian = useCreateVeterinarian as jest.Mock;

function mutationState(overrides: Record<string, unknown> = {}) {
  return {
    error: null,
    isPending: false,
    mutate: jest.fn(),
    reset: jest.fn(),
    ...overrides,
  };
}

function apiError(status: number, code: string): ApiError {
  return new ApiError({ code, message: 'Safe message', requestId: 'request-id', status });
}

describe('CreateVeterinarianScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateVeterinarian.mockReturnValue(mutationState());
  });

  it('renders the D29 hierarchy and professional form', async () => {
    const screen = await render(<CreateVeterinarianScreen />);

    expect(screen.getByRole('header', { name: 'Nuevo veterinario' })).toBeTruthy();
    expect(screen.getByText('Creá un perfil profesional')).toBeTruthy();
    expect(screen.getByRole('header', { name: 'Información profesional' })).toBeTruthy();
  });

  it('submits one atomic createUser payload without userId or role selection', async () => {
    const mutate = jest.fn();
    mockCreateVeterinarian.mockReturnValue(mutationState({ mutate }));
    const screen = await render(<CreateVeterinarianScreen />);

    await fireEvent.changeText(screen.getByLabelText('Nombre'), 'Sofía');
    await fireEvent.changeText(screen.getByLabelText('Apellido'), 'Martínez');
    await fireEvent.changeText(screen.getByLabelText('Matrícula'), '45.821');
    await fireEvent(screen.getByLabelText('Crear usuario de acceso'), 'valueChange', true);
    await fireEvent.changeText(
      screen.getByLabelText('Correo electrónico de acceso'),
      'sofia@refugiapp.org'
    );
    await fireEvent.changeText(screen.getByLabelText('Contraseña inicial'), 'Refugia-2026-secure');
    await fireEvent.press(screen.getByRole('button', { name: 'Crear perfil' }));

    await waitFor(() => expect(mutate).toHaveBeenCalledTimes(1));
    expect(mutate.mock.calls[0]?.[0]).toEqual({
      firstName: 'Sofía',
      lastName: 'Martínez',
      licenseNumber: '45.821',
      createUser: {
        email: 'sofia@refugiapp.org',
        password: 'Refugia-2026-secure',
      },
    });
    expect(mutate.mock.calls[0]?.[0]).not.toHaveProperty('userId');
    expect(mutate.mock.calls[0]?.[0]).not.toHaveProperty('roles');
  });

  it('places a license conflict beside the license field', async () => {
    mockCreateVeterinarian.mockReturnValue(
      mutationState({ error: apiError(409, 'LICENSE_NUMBER_ALREADY_EXISTS') })
    );
    const screen = await render(<CreateVeterinarianScreen />);

    expect(screen.getByText('Ya existe un veterinario con esa matrícula.')).toBeTruthy();
  });

  it('keeps the draft retryable after an offline mutation error', async () => {
    mockCreateVeterinarian.mockReturnValue(mutationState({ error: apiError(0, 'NETWORK_ERROR') }));
    const screen = await render(<CreateVeterinarianScreen />);

    await fireEvent.changeText(screen.getByLabelText('Nombre'), 'Sofía');

    expect(screen.getByDisplayValue('Sofía')).toBeTruthy();
    expect(screen.getByText('Safe message')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Crear perfil' })).toBeEnabled();
  });

  it('returns to the veterinarian list when cancelled', async () => {
    const screen = await render(<CreateVeterinarianScreen />);

    await fireEvent.press(screen.getByRole('button', { name: 'Cancelar' }));

    expect(navigateBack).toHaveBeenCalledWith('/veterinarians');
  });
});
