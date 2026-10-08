import { fireEvent, render } from '@testing-library/react-native';

import { useAnimalOptionPhoto } from '@/application/animals';

import type { CareTask } from '../types';
import { CareTaskOverviewCard } from './CareTaskOverviewCard';

jest.mock('@/application/animals', () => ({
  useAnimalOptionPhoto: jest.fn(),
}));

const mockUseAnimalOptionPhoto = useAnimalOptionPhoto as jest.Mock;

const task: CareTask = {
  id: '7fa85f64-5717-4562-b3fc-2c963f66afa6',
  animalId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  title: 'Control veterinario',
  description: 'Revisión de evolución general',
  status: 'pending',
  dueAt: null,
  completedAt: null,
  createdByUserId: null,
  createdAt: '2026-09-20T10:00:00.000Z',
  updatedAt: '2026-09-20T10:00:00.000Z',
};

describe('CareTaskOverviewCard', () => {
  beforeEach(() => {
    mockUseAnimalOptionPhoto.mockReturnValue({ data: undefined });
  });

  it('opens the detail from one accessible task summary', async () => {
    const onPress = jest.fn();
    const screen = await render(
      <CareTaskOverviewCard animalName="Luna" onPress={onPress} task={task} />
    );

    await fireEvent.press(screen.getByRole('button', { name: /Luna, Control veterinario/ }));

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Revisión de evolución general')).toBeTruthy();
    expect(screen.getByLabelText('Pendiente')).toBeTruthy();
  });

  it('shows the animal profile photo when the option exposes media', async () => {
    mockUseAnimalOptionPhoto.mockReturnValue({ data: 'https://cdn.test/luna.jpg' });
    const screen = await render(
      <CareTaskOverviewCard
        animalName="Luna"
        onPress={jest.fn()}
        profilePhotoMediaId="media-id"
        task={task}
      />
    );

    expect(mockUseAnimalOptionPhoto).toHaveBeenCalledWith('media-id');
    expect(screen.getByTestId('app-avatar-image')).toBeTruthy();
  });
});
