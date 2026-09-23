import { fireEvent, render, waitFor } from '@testing-library/react-native';

import type { CareTask } from '../types';
import { CareTaskForm } from './CareTaskForm';

jest.mock('@react-native-community/datetimepicker', () => {
  const React = jest.requireActual<typeof import('react')>('react');
  const { Pressable, Text } = jest.requireActual<typeof import('react-native')>('react-native');
  const MockPicker = ({ onChange }: { onChange(event: { type: string }, date?: Date): void }) =>
    React.createElement(
      Pressable,
      {
        accessibilityLabel: 'selector de fecha y hora',
        onPress: () => onChange({ type: 'set' }, new Date(Date.now() + 86_400_000)),
      },
      React.createElement(Text, null, 'selector')
    );
  return { __esModule: true, default: MockPicker };
});

const ANIMAL_ID = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

function createTask(): CareTask {
  return {
    id: '7fa85f64-5717-4562-b3fc-2c963f66afa6',
    animalId: ANIMAL_ID,
    title: 'Dar medicación',
    description: 'Una dosis',
    status: 'pending',
    dueAt: '2026-09-22T18:00:00-03:00',
    completedAt: null,
    createdByUserId: '9fa85f64-5717-4562-b3fc-2c963f66afa6',
    createdAt: '2026-09-20T10:00:00.000Z',
    updatedAt: '2026-09-20T10:00:00.000Z',
  };
}

describe('CareTaskForm', () => {
  it('creates a task with animal, date and authenticated responsible', async () => {
    const onSubmit = jest.fn();
    const screen = await render(
      <CareTaskForm
        animalOptions={[{ id: ANIMAL_ID, name: 'Luna' }]}
        mode="create"
        onSubmit={onSubmit}
        responsibleLabel="admin@refugiapp.test"
      />
    );

    expect(screen.getByLabelText('Responsable del registro: admin@refugiapp.test')).toBeTruthy();
    await fireEvent.press(screen.getByRole('radio', { name: 'Luna' }));
    await fireEvent.changeText(screen.getByLabelText('Título'), '  Dar medicación  ');
    await fireEvent.changeText(screen.getByLabelText('Descripción'), '  Una dosis  ');
    await fireEvent.press(screen.getByLabelText('Elegir fecha y hora'));
    await fireEvent.press(screen.getByLabelText('selector de fecha y hora'));
    await fireEvent.press(screen.getByLabelText('Crear tarea'));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        animalId: ANIMAL_ID,
        title: 'Dar medicación',
        description: 'Una dosis',
        dueAt: expect.any(String),
      });
    });
  });

  it('edits a task and clears empty optional fields', async () => {
    const onSubmit = jest.fn();
    const screen = await render(
      <CareTaskForm
        animalName="Luna"
        mode="edit"
        onSubmit={onSubmit}
        responsibleLabel="manager@refugiapp.test"
        task={createTask()}
      />
    );

    expect(screen.getByLabelText('Animal: Luna')).toBeTruthy();
    expect(screen.getByLabelText('Título').props.value).toBe('Dar medicación');
    await fireEvent.changeText(screen.getByLabelText('Título'), 'Control general');
    await fireEvent.changeText(screen.getByLabelText('Descripción'), '');
    await fireEvent.press(screen.getByLabelText('Quitar fecha y hora'));
    await fireEvent.press(screen.getByLabelText('Guardar cambios'));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        title: 'Control general',
        description: null,
        dueAt: null,
      });
    });
  });

  it('shows validation and server errors without submitting invalid data', async () => {
    const onSubmit = jest.fn();
    const screen = await render(
      <CareTaskForm
        animalOptions={[{ id: ANIMAL_ID, name: 'Luna' }]}
        errorMessage="Tu rol no tiene permiso para realizar esta acción."
        mode="create"
        onSubmit={onSubmit}
        responsibleLabel="vet@refugiapp.test"
      />
    );

    await fireEvent.changeText(screen.getByLabelText('Título'), 'x');
    await fireEvent.press(screen.getByLabelText('Crear tarea'));

    expect(await screen.findByText('Seleccioná un animal válido.')).toBeTruthy();
    expect(screen.getByText('El título debe tener al menos 3 caracteres.')).toBeTruthy();
    expect(screen.getByText('Tu rol no tiene permiso para realizar esta acción.')).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
