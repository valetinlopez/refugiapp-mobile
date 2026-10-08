import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';

import { useAnimalOptionPhoto } from '@/application/animals';
import { ApiError } from '@/core/api';
import { useMutationRetryQueue } from '@/core/network';
import { useCapabilities } from '@/features/auth/hooks/useCapabilities';

import { useCancelCareTask, useCompleteCareTask } from '../hooks/useCareTaskActions';
import { useCareTask } from '../hooks/useCareTask';
import { useCareTaskAnimal } from '../hooks/useCareTaskAnimal';
import type { CareTask } from '../types';
import { CareTaskDetailScreen } from './CareTaskDetailScreen';

jest.mock('expo-router', () => ({
  router: { push: jest.fn() },
}));

jest.mock('@/application/animals', () => ({
  useAnimalOptionPhoto: jest.fn(),
}));

jest.mock('@/core/network', () => ({
  ...jest.requireActual('@/core/network'),
  useMutationRetryQueue: jest.fn(),
}));

jest.mock('@/features/auth/hooks/useCapabilities', () => ({
  useCapabilities: jest.fn(),
}));

jest.mock('../hooks/useCareTask', () => ({ useCareTask: jest.fn() }));
jest.mock('../hooks/useCareTaskAnimal', () => ({ useCareTaskAnimal: jest.fn() }));
jest.mock('../hooks/useCareTaskActions', () => ({
  useCancelCareTask: jest.fn(),
  useCompleteCareTask: jest.fn(),
}));

const mockUseAnimalOptionPhoto = useAnimalOptionPhoto as jest.Mock;
const mockUseMutationRetryQueue = useMutationRetryQueue as jest.Mock;
const mockUseCapabilities = useCapabilities as jest.Mock;
const mockUseCareTask = useCareTask as jest.Mock;
const mockUseCareTaskAnimal = useCareTaskAnimal as jest.Mock;
const mockUseCompleteCareTask = useCompleteCareTask as jest.Mock;
const mockUseCancelCareTask = useCancelCareTask as jest.Mock;

const TASK_ID = '7fa85f64-5717-4562-b3fc-2c963f66afa6';
const ANIMAL_ID = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

const task: CareTask = {
  id: TASK_ID,
  animalId: ANIMAL_ID,
  title: 'Control veterinario',
  description: 'Revisión general',
  status: 'pending',
  dueAt: null,
  completedAt: null,
  createdByUserId: null,
  createdAt: '2026-09-18T09:15:00.000Z',
  updatedAt: '2026-09-20T17:40:00.000Z',
};

function query(overrides: Record<string, unknown> = {}) {
  return {
    data: undefined,
    error: null,
    isError: false,
    isPending: false,
    refetch: jest.fn(),
    ...overrides,
  };
}

describe('CareTaskDetailScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseCapabilities.mockReturnValue({ canEditAnimal: true });
    mockUseAnimalOptionPhoto.mockReturnValue({ data: 'https://cdn.test/luna.jpg' });
    mockUseMutationRetryQueue.mockReturnValue({ queue: {}, pendingCount: 0 });
    mockUseCareTask.mockReturnValue(query({ data: task }));
    mockUseCareTaskAnimal.mockReturnValue(
      query({
        data: {
          id: ANIMAL_ID,
          name: 'Luna',
          species: 'Gata',
          breed: 'Mestiza',
          profilePhotoMediaId: 'media-id',
        },
      })
    );
    mockUseCompleteCareTask.mockReturnValue({
      error: null,
      isError: false,
      isPending: false,
      mutate: jest.fn(),
    });
    mockUseCancelCareTask.mockReturnValue({
      error: null,
      isError: false,
      isPending: false,
      mutate: jest.fn(),
    });
  });

  it('shows the redesigned detail with real animal data', async () => {
    const screen = await render(<CareTaskDetailScreen taskId={TASK_ID} />);

    expect(screen.getByRole('header', { name: 'Detalle del cuidado' })).toBeTruthy();
    expect(screen.getByText('Control veterinario')).toBeTruthy();
    expect(screen.getByText('Luna')).toBeTruthy();
    expect(screen.getByTestId('app-avatar-image')).toBeTruthy();
  });

  it('shows an empty state for an invalid task id', async () => {
    mockUseCareTask.mockReturnValue(query());
    const invalid = await render(<CareTaskDetailScreen taskId="" />);
    expect(invalid.getByText('Tarea no encontrada')).toBeTruthy();
  });

  it('shows loading while the task is being prepared', async () => {
    mockUseCareTask.mockReturnValue(query({ isPending: true }));
    const loading = await render(<CareTaskDetailScreen taskId={TASK_ID} />);
    expect(loading.getByText('Cargando detalle del cuidado')).toBeTruthy();
  });

  it('shows a connected error and retries', async () => {
    const refetch = jest.fn();
    mockUseCareTask.mockReturnValue(query({ error: new Error('boom'), isError: true, refetch }));
    const error = await render(<CareTaskDetailScreen taskId={TASK_ID} />);
    await fireEvent.press(error.getByRole('button', { name: 'Reintentar' }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('shows a distinct offline state', async () => {
    const refetch = jest.fn();
    mockUseCareTask.mockReturnValue(
      query({
        error: new ApiError({
          code: 'NETWORK_ERROR',
          message: 'offline',
          requestId: 'request-id',
          status: 0,
        }),
        isError: true,
        refetch,
      })
    );
    const offline = await render(<CareTaskDetailScreen taskId={TASK_ID} />);
    expect(offline.getByTestId('care-task-detail-offline')).toBeTruthy();
  });

  it('announces a successful completion', async () => {
    const announce = jest
      .spyOn(AccessibilityInfo, 'announceForAccessibility')
      .mockImplementation(jest.fn());
    const mutate = jest.fn((_id, options) => options.onSuccess());
    mockUseCompleteCareTask.mockReturnValue({
      error: null,
      isError: false,
      isPending: false,
      mutate,
    });
    const screen = await render(<CareTaskDetailScreen taskId={TASK_ID} />);

    await fireEvent.press(screen.getByLabelText('Completar tarea'));
    await fireEvent.press(screen.getByLabelText('Confirmar completada'));

    await waitFor(() => expect(mutate).toHaveBeenCalledWith(TASK_ID, expect.any(Object)));
    expect(announce).toHaveBeenCalledWith('Tarea completada.');
  });
});
