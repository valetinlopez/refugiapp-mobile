import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';

import { useConnectivityStatus } from '@/core/network';
import { useCapabilities } from '@/features/auth/hooks/useCapabilities';
import { useCareTaskAnimals } from '@/features/care-tasks/hooks/useCareTaskAnimals';
import { useCreateCareTask } from '@/features/care-tasks/hooks/useCreateCareTask';

import NewCareTaskScreen from '../new';

jest.mock('@/application/animals', () => ({
  useAnimalOptionPhoto: jest.fn(() => ({ data: undefined })),
}));

jest.mock('expo-router', () => ({
  router: { back: jest.fn(), canGoBack: jest.fn(), replace: jest.fn() },
  useLocalSearchParams: () => ({}),
}));

jest.mock('@/features/auth/hooks/useCapabilities', () => ({
  useCapabilities: jest.fn(),
}));

jest.mock('@/core/network', () => ({
  useConnectivityStatus: jest.fn(),
}));

jest.mock('@/features/care-tasks/hooks/useCareTaskAnimals', () => ({
  useCareTaskAnimals: jest.fn(),
}));

jest.mock('@/features/care-tasks/hooks/useCreateCareTask', () => ({
  useCreateCareTask: jest.fn(),
}));

const mockUseCapabilities = useCapabilities as jest.Mock;
const mockUseConnectivityStatus = useConnectivityStatus as jest.Mock;
const mockUseCareTaskAnimals = useCareTaskAnimals as jest.Mock;
const mockUseCreateCareTask = useCreateCareTask as jest.Mock;

const { router } = jest.requireMock('expo-router') as {
  router: { back: jest.Mock; canGoBack: jest.Mock; replace: jest.Mock };
};

describe('NewCareTaskScreen navigation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseCapabilities.mockReturnValue({ canEditAnimal: false });
    mockUseConnectivityStatus.mockReturnValue(true);
    mockUseCareTaskAnimals.mockReturnValue({
      data: [],
      errorMessage: null,
      isError: false,
      isFallback: false,
      isPending: false,
      refetch: jest.fn(),
    });
    mockUseCreateCareTask.mockReturnValue({ error: null, isPending: false, mutate: jest.fn() });
  });

  it('shows the persistent back header alongside the denied empty state', async () => {
    const screen = await render(<NewCareTaskScreen />);

    expect(screen.getByText('Sin permiso')).toBeTruthy();
    expect(screen.getAllByRole('button', { name: 'Volver' })).toHaveLength(2);
  });

  it('falls back to the care tasks list when opened as a deep link', async () => {
    router.canGoBack.mockReturnValue(false);
    const screen = await render(<NewCareTaskScreen />);

    const backButtons = screen.getAllByRole('button', { name: 'Volver' });
    if (backButtons[0]) {
      await fireEvent.press(backButtons[0]);
    }

    expect(router.replace).toHaveBeenCalledWith('/care-tasks');
    expect(router.back).not.toHaveBeenCalled();
  });

  it('shows loading while preparing animal options', async () => {
    mockUseCapabilities.mockReturnValue({ canEditAnimal: true });
    mockUseCareTaskAnimals.mockReturnValue({
      data: undefined,
      errorMessage: null,
      isError: false,
      isFallback: false,
      isPending: true,
      refetch: jest.fn(),
    });
    const loading = await render(<NewCareTaskScreen />);
    expect(loading.getByText('Cargando animales')).toBeTruthy();
  });

  it('shows an empty state when no animals are available', async () => {
    mockUseCapabilities.mockReturnValue({ canEditAnimal: true });
    const empty = await render(<NewCareTaskScreen />);
    expect(empty.getByText('No hay animales disponibles')).toBeTruthy();
  });

  it('shows a connected error and allows retrying animal preparation', async () => {
    mockUseCapabilities.mockReturnValue({ canEditAnimal: true });
    const refetch = jest.fn();
    mockUseCareTaskAnimals.mockReturnValue({
      data: undefined,
      errorMessage: 'El servicio no está disponible.',
      isError: true,
      isFallback: false,
      isPending: false,
      refetch,
    });
    const screen = await render(<NewCareTaskScreen />);

    expect(screen.getByText('No se pudo preparar el formulario')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Reintentar' }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('shows the offline state and allows retrying animal preparation', async () => {
    mockUseCapabilities.mockReturnValue({ canEditAnimal: true });
    const refetch = jest.fn();
    mockUseConnectivityStatus.mockReturnValue(false);
    mockUseCareTaskAnimals.mockReturnValue({
      data: undefined,
      errorMessage: 'Sin conexión',
      isError: true,
      isFallback: false,
      isPending: false,
      refetch,
    });
    const offline = await render(<NewCareTaskScreen />);
    expect(offline.getByTestId('new-care-task-offline')).toBeTruthy();
    await fireEvent.press(offline.getByRole('button', { name: 'Reintentar' }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('creates the task, announces its pending state and returns to the list', async () => {
    mockUseCapabilities.mockReturnValue({ canEditAnimal: true });
    mockUseCareTaskAnimals.mockReturnValue({
      data: [{ id: '3fa85f64-5717-4562-b3fc-2c963f66afa6', name: 'Luna' }],
      errorMessage: null,
      isError: false,
      isFallback: false,
      isPending: false,
      refetch: jest.fn(),
    });
    router.canGoBack.mockReturnValue(false);
    const announce = jest
      .spyOn(AccessibilityInfo, 'announceForAccessibility')
      .mockImplementation(jest.fn());
    const mutate = jest.fn((data, options) =>
      options.onSuccess({
        id: '7fa85f64-5717-4562-b3fc-2c963f66afa6',
        animalId: data.animalId,
        title: data.title,
        description: null,
        status: 'pending',
        dueAt: null,
        completedAt: null,
        createdByUserId: null,
        createdAt: '2026-10-08T10:00:00.000Z',
        updatedAt: '2026-10-08T10:00:00.000Z',
      })
    );
    mockUseCreateCareTask.mockReturnValue({ error: null, isPending: false, mutate });
    const screen = await render(<NewCareTaskScreen />);

    await fireEvent.press(screen.getByRole('button', { name: 'Seleccionar animal' }));
    await fireEvent.press(screen.getByRole('radio', { name: 'Luna' }));
    await fireEvent.changeText(screen.getByLabelText('Título'), 'Dar medicación');
    await fireEvent.press(screen.getByRole('button', { name: 'Crear tarea' }));

    await waitFor(() => expect(mutate).toHaveBeenCalled());
    expect(announce).toHaveBeenCalledWith('Tarea Dar medicación creada como Pendiente.');
    expect(router.replace).toHaveBeenCalledWith('/care-tasks');
  });
});
