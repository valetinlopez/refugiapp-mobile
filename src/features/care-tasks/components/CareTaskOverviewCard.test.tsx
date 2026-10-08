import { fireEvent, render } from '@testing-library/react-native';

import type { CareTask } from '../types';
import { CareTaskOverviewCard } from './CareTaskOverviewCard';

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
});
