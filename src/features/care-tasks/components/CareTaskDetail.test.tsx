import { fireEvent, render } from '@testing-library/react-native';

import { useAnimalOptionPhoto, type AnimalOption } from '@/application/animals';

import type { CareTask } from '../types';
import { CareTaskDetail } from './CareTaskDetail';

jest.mock('@/application/animals', () => ({
  useAnimalOptionPhoto: jest.fn(),
}));

const mockUseAnimalOptionPhoto = useAnimalOptionPhoto as jest.Mock;
const TASK_ID = '7fa85f64-5717-4562-b3fc-2c963f66afa6';

const animal: AnimalOption = {
  id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  name: 'Luna',
  species: 'Gata',
  breed: 'Mestiza',
  profilePhotoMediaId: 'media-id',
};

function createTask(overrides: Partial<CareTask> = {}): CareTask {
  return {
    id: TASK_ID,
    animalId: animal.id,
    title: 'Control veterinario',
    description: 'Revisión de evolución general',
    status: 'pending',
    dueAt: '2020-09-20T11:00:00.000Z',
    completedAt: null,
    createdByUserId: null,
    createdAt: '2026-09-18T09:15:00.000Z',
    updatedAt: '2026-09-20T17:40:00.000Z',
    ...overrides,
  };
}

function renderDetail(overrides: Partial<React.ComponentProps<typeof CareTaskDetail>> = {}) {
  return render(
    <CareTaskDetail
      animal={animal}
      canWrite
      onCancel={jest.fn()}
      onComplete={jest.fn()}
      onEdit={jest.fn()}
      onOpenAnimal={jest.fn()}
      task={createTask()}
      {...overrides}
    />
  );
}

describe('CareTaskDetail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAnimalOptionPhoto.mockReturnValue({ data: 'https://cdn.test/luna.jpg' });
  });

  it('shows persisted and derived status, animal photo, description and dates', async () => {
    const screen = await renderDetail();

    expect(screen.getByLabelText('Pendiente')).toBeTruthy();
    expect(screen.getByLabelText('Vencida')).toBeTruthy();
    expect(screen.getByTestId('app-avatar-image')).toBeTruthy();
    expect(screen.getByText('Gata · Mestiza')).toBeTruthy();
    expect(screen.getByText('Revisión de evolución general')).toBeTruthy();
    expect(screen.getByLabelText(/Vencimiento:/)).toBeTruthy();
    expect(screen.getByLabelText(/Creada:/)).toBeTruthy();
    expect(screen.getByLabelText(/Última actualización:/)).toBeTruthy();
  });

  it('opens the animal and edit destinations', async () => {
    const onOpenAnimal = jest.fn();
    const onEdit = jest.fn();
    const screen = await renderDetail({ onEdit, onOpenAnimal });

    await fireEvent.press(screen.getByRole('button', { name: /Animal: Luna/ }));
    await fireEvent.press(screen.getByRole('button', { name: 'Editar' }));

    expect(onOpenAnimal).toHaveBeenCalledWith(animal.id);
    expect(onEdit).toHaveBeenCalledWith(TASK_ID);
  });

  it('confirms completing and cancelling before mutating', async () => {
    const onComplete = jest.fn();
    const onCancel = jest.fn();
    const screen = await renderDetail({ onCancel, onComplete });

    await fireEvent.press(screen.getByLabelText('Completar tarea'));
    expect(onComplete).not.toHaveBeenCalled();
    await fireEvent.press(screen.getByLabelText('Confirmar completada'));
    expect(onComplete).toHaveBeenCalledWith(TASK_ID);

    await fireEvent.press(screen.getByLabelText('Cancelar tarea'));
    expect(onCancel).not.toHaveBeenCalled();
    await fireEvent.press(screen.getByLabelText('Confirmar cancelación'));
    expect(onCancel).toHaveBeenCalledWith(TASK_ID);
  });

  it('reacts to permission loss and terminal states by removing actions', async () => {
    const screen = await renderDetail({ canWrite: false });
    expect(screen.queryByLabelText('Editar')).toBeNull();
    expect(screen.getByText(/Tu rol permite consultar/)).toBeTruthy();

    await screen.rerender(
      <CareTaskDetail
        animal={animal}
        canWrite
        onCancel={jest.fn()}
        onComplete={jest.fn()}
        onEdit={jest.fn()}
        onOpenAnimal={jest.fn()}
        task={createTask({ status: 'completed', completedAt: '2026-09-20T18:00:00.000Z' })}
      />
    );

    expect(screen.getByLabelText('Completada')).toBeTruthy();
    expect(screen.queryByLabelText('Completar tarea')).toBeNull();
    expect(screen.getByLabelText(/Completada:/)).toBeTruthy();
  });
});
