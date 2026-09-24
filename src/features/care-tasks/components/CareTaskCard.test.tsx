import { fireEvent, render } from '@testing-library/react-native';

import type { CareTask } from '../types';
import { CareTaskCard } from './CareTaskCard';

function createTask(status: CareTask['status'] = 'pending'): CareTask {
  return {
    id: '7fa85f64-5717-4562-b3fc-2c963f66afa6',
    animalId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    title: 'Dar medicación',
    description: 'Una dosis',
    status,
    dueAt: '2026-09-30T18:00:00.000Z',
    completedAt: status === 'completed' ? '2026-09-22T18:00:00.000Z' : null,
    createdByUserId: null,
    createdAt: '2026-09-20T10:00:00.000Z',
    updatedAt: '2026-09-20T10:00:00.000Z',
  };
}

describe('CareTaskCard', () => {
  it('edits a pending task', async () => {
    const onEdit = jest.fn();
    const screen = await render(
      <CareTaskCard
        animalName="Luna"
        canWrite
        onCancel={() => undefined}
        onComplete={() => undefined}
        onEdit={onEdit}
        task={createTask()}
      />
    );

    await fireEvent.press(screen.getByLabelText('Editar'));
    expect(onEdit).toHaveBeenCalledWith('7fa85f64-5717-4562-b3fc-2c963f66afa6');
  });

  it('requires confirmation before completing', async () => {
    const onComplete = jest.fn();
    const screen = await render(
      <CareTaskCard
        animalName="Luna"
        canWrite
        onCancel={() => undefined}
        onComplete={onComplete}
        onEdit={() => undefined}
        task={createTask()}
      />
    );

    await fireEvent.press(screen.getByLabelText('Completar'));
    expect(screen.getByText('¿Querés completar esta tarea?')).toBeTruthy();
    expect(onComplete).not.toHaveBeenCalled();
    await fireEvent.press(screen.getByLabelText('Confirmar completada'));
    expect(onComplete).toHaveBeenCalledWith('7fa85f64-5717-4562-b3fc-2c963f66afa6');
  });

  it('requires confirmation before cancelling', async () => {
    const onCancel = jest.fn();
    const screen = await render(
      <CareTaskCard
        animalName="Luna"
        canWrite
        onCancel={onCancel}
        onComplete={() => undefined}
        onEdit={() => undefined}
        task={createTask()}
      />
    );

    await fireEvent.press(screen.getByLabelText('Cancelar tarea'));
    expect(screen.getByText('¿Querés cancelar esta tarea?')).toBeTruthy();
    await fireEvent.press(screen.getByLabelText('Confirmar cancelación'));
    expect(onCancel).toHaveBeenCalledWith('7fa85f64-5717-4562-b3fc-2c963f66afa6');
  });

  it('hides mutations for read-only roles and closed tasks', async () => {
    const readonly = await render(
      <CareTaskCard
        animalName="Luna"
        canWrite={false}
        onCancel={() => undefined}
        onComplete={() => undefined}
        onEdit={() => undefined}
        task={createTask()}
      />
    );
    expect(readonly.queryByLabelText('Editar')).toBeNull();

    readonly.rerender(
      <CareTaskCard
        animalName="Luna"
        canWrite
        onCancel={() => undefined}
        onComplete={() => undefined}
        onEdit={() => undefined}
        task={createTask('completed')}
      />
    );
    expect(readonly.queryByLabelText('Completar')).toBeNull();
  });

  it('shows an explicit final state without actions for completed tasks', async () => {
    const screen = await render(
      <CareTaskCard
        animalName="Luna"
        canWrite
        onCancel={() => undefined}
        onComplete={() => undefined}
        onEdit={() => undefined}
        task={createTask('completed')}
      />
    );

    expect(screen.getByLabelText('Completada')).toBeTruthy();
    expect(screen.queryByLabelText('Editar')).toBeNull();
    expect(screen.queryByLabelText('Completar')).toBeNull();
    expect(screen.queryByLabelText('Cancelar tarea')).toBeNull();
  });

  it('shows an explicit final state without actions for cancelled tasks', async () => {
    const screen = await render(
      <CareTaskCard
        animalName="Luna"
        canWrite
        onCancel={() => undefined}
        onComplete={() => undefined}
        onEdit={() => undefined}
        task={createTask('cancelled')}
      />
    );

    expect(screen.getByLabelText('Cancelada')).toBeTruthy();
    expect(screen.queryByLabelText('Editar')).toBeNull();
    expect(screen.queryByLabelText('Completar')).toBeNull();
    expect(screen.queryByLabelText('Cancelar tarea')).toBeNull();
  });

  it('disables only the busy row actions', async () => {
    const screen = await render(
      <CareTaskCard
        animalName="Luna"
        canWrite
        isBusy
        onCancel={() => undefined}
        onComplete={() => undefined}
        onEdit={() => undefined}
        task={createTask()}
      />
    );

    expect(screen.getByLabelText('Editar').props.accessibilityState?.disabled).toBe(true);
    expect(screen.getByLabelText('Completar').props.accessibilityState?.disabled).toBe(true);
    expect(screen.getByLabelText('Cancelar tarea').props.accessibilityState?.disabled).toBe(true);
  });

  it('keeps a pending task actionable when the row is not busy', async () => {
    const screen = await render(
      <CareTaskCard
        animalName="Luna"
        canWrite
        onCancel={() => undefined}
        onComplete={() => undefined}
        onEdit={() => undefined}
        task={createTask()}
      />
    );

    expect(screen.getByLabelText('Editar').props.accessibilityState?.disabled).toBe(false);
    expect(screen.getByLabelText('Completar').props.accessibilityState?.disabled).toBe(false);
    expect(screen.getByLabelText('Cancelar tarea').props.accessibilityState?.disabled).toBe(false);
  });
});
