import { fireEvent, render } from '@testing-library/react-native';

import type { CareTask } from '../types';
import { CareTaskCard } from './CareTaskCard';

function createTask(overrides: Partial<CareTask> = {}): CareTask {
  return {
    id: '7fa85f64-5717-4562-b3fc-2c963f66afa6',
    animalId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    title: 'Dar medicación',
    description: 'Una dosis',
    status: 'pending',
    dueAt: '2099-01-01T00:00:00.000Z',
    completedAt: null,
    createdByUserId: null,
    createdAt: '2026-09-20T10:00:00.000Z',
    updatedAt: '2026-09-20T10:00:00.000Z',
    ...overrides,
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
        task={createTask({ status: 'completed' })}
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
        task={createTask({ status: 'completed' })}
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
        task={createTask({ status: 'cancelled' })}
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

  it('keeps the badge from shrinking and lets the heading truncate on narrow layouts', async () => {
    const screen = await render(
      <CareTaskCard
        animalName="Luna"
        canWrite={false}
        onCancel={() => undefined}
        onComplete={() => undefined}
        onEdit={() => undefined}
        task={createTask()}
      />
    );

    const badge = screen.getByLabelText('Pendiente');
    expect(badge).toHaveStyle({ flexShrink: 0 });

    const heading = screen.getByText('Dar medicación').parent;
    expect(heading).toHaveStyle({ flex: 1, minWidth: 0 });
  });

  it('wraps the action row while keeping accessible labels and touch targets', async () => {
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

    const actions = screen.getByLabelText('Editar').parent;
    expect(actions).toHaveStyle({ flexDirection: 'row', flexWrap: 'wrap' });

    for (const label of ['Editar', 'Completar', 'Cancelar tarea']) {
      const button = screen.getByLabelText(label);
      expect(button).toHaveStyle({ minHeight: 48, minWidth: 44 });
      expect(button.props.accessibilityState?.disabled).toBe(false);
    }
  });

  it('truncates long titles and dates while keeping the full text in the card label', async () => {
    const title = 'Dar medicación y revisar heridas en la pata trasera izquierda';
    const screen = await render(
      <CareTaskCard
        animalName="Luna"
        canWrite={false}
        onCancel={() => undefined}
        onComplete={() => undefined}
        onEdit={() => undefined}
        task={createTask({ title })}
      />
    );

    expect(screen.getByText(title)).toHaveProp('numberOfLines', 2);
    expect(screen.getByText('Luna')).toHaveProp('numberOfLines', 1);
    expect(screen.getByText(/Fecha:/)).toHaveProp('numberOfLines', 1);
    expect(screen.getByLabelText(new RegExp(title))).toBeTruthy();
  });
});
