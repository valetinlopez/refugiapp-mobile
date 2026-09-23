import { fireEvent, render, waitFor } from '@testing-library/react-native';

import type { MedicalRecord } from '../types';
import { MedicalRecordForm } from './MedicalRecordForm';

jest.mock('@react-native-community/datetimepicker', () => {
  const React = jest.requireActual<typeof import('react')>('react');
  const { Pressable, Text } = jest.requireActual<typeof import('react-native')>('react-native');
  const MockPicker = ({ onChange }: { onChange: (event: { type: string }, date?: Date) => void }) =>
    React.createElement(
      Pressable,
      {
        accessibilityLabel: 'picker',
        onPress: () => onChange({ type: 'set' }, new Date('2026-09-22T14:30:00-03:00')),
      },
      React.createElement(Text, null, 'picker')
    );
  return { __esModule: true, default: MockPicker };
});

jest.mock('expo-image-picker', () => ({
  MediaTypeOptions: { Images: 'Images' },
  requestMediaLibraryPermissionsAsync: jest.fn(async () => ({ granted: true })),
  launchImageLibraryAsync: jest.fn(async () => ({ canceled: true })),
}));

const ANIMAL_ID = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
const VET_ID = '7fa85f64-5717-4562-b3fc-2c963f66afa6';
const INTAKE_DATE = '2026-01-10';

function createRecord(): MedicalRecord {
  return {
    id: '0e2a3b4c-5d6e-4f80-9a10-b11c12d13e14',
    animalId: ANIMAL_ID,
    veterinarianId: VET_ID,
    recordType: 'consultation',
    title: 'Consulta general',
    diagnosis: 'Otitis leve',
    treatment: 'Gotas auriculares',
    notes: null,
    occurredAt: '2026-09-22T14:30:00-03:00',
    createdAt: '2026-09-20T10:00:00.000Z',
    updatedAt: '2026-09-20T10:00:00.000Z',
  };
}

describe('MedicalRecordForm (create)', () => {
  it('submits a validated medical record with optional fields', async () => {
    const onSubmit = jest.fn();
    const screen = await render(
      <MedicalRecordForm
        animalId={ANIMAL_ID}
        intakeDate={INTAKE_DATE}
        mode="create"
        onSubmit={onSubmit}
        veterinarianOptions={[{ id: VET_ID, name: 'Sofía Romero', licenseNumber: 'VET-001' }]}
      />
    );

    expect(screen.getByRole('radio', { name: 'Consulta' })).toBeTruthy();
    await fireEvent.changeText(screen.getByLabelText('Título'), '  Consulta general  ');
    await fireEvent.press(screen.getByLabelText('Elegir fecha y hora'));
    await fireEvent.press(screen.getByLabelText('picker'));
    await fireEvent.press(screen.getByRole('radio', { name: 'Sofía Romero' }));
    await fireEvent.changeText(screen.getByLabelText('Diagnóstico'), '  Otitis leve  ');
    await fireEvent.changeText(screen.getByPlaceholderText('Plan indicado (opcional)'), '');
    await fireEvent.press(screen.getByLabelText('Registrar consulta'));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        form: {
          animalId: ANIMAL_ID,
          recordType: 'consultation',
          title: 'Consulta general',
          occurredAt: expect.any(String),
          veterinarianId: VET_ID,
          diagnosis: 'Otitis leve',
          treatment: undefined,
          notes: undefined,
        },
        attachments: [],
      });
    });
  });

  it('shows validation errors and does not submit invalid data', async () => {
    const onSubmit = jest.fn();
    const screen = await render(
      <MedicalRecordForm
        animalId={ANIMAL_ID}
        intakeDate={INTAKE_DATE}
        mode="create"
        onSubmit={onSubmit}
        veterinarianOptions={[]}
      />
    );

    await fireEvent.changeText(screen.getByLabelText('Título'), 'x');
    await fireEvent.press(screen.getByLabelText('Registrar consulta'));

    expect(await screen.findByText('El título debe tener al menos 3 caracteres.')).toBeTruthy();
    expect(screen.getByText('La fecha y hora es obligatoria.')).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('shows a server error like 403 while submitting', async () => {
    const screen = await render(
      <MedicalRecordForm
        animalId={ANIMAL_ID}
        errorMessage="Tu rol no tiene permiso para registrar datos clínicos."
        intakeDate={INTAKE_DATE}
        isSubmitting
        mode="create"
        onSubmit={() => undefined}
        veterinarianOptions={[]}
      />
    );

    expect(screen.getByLabelText('Registrar consulta')).toBeDisabled();
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Tu rol no tiene permiso para registrar datos clínicos.'
    );
  });
});

describe('MedicalRecordForm (edit)', () => {
  it('preloads the record and submits only changed fields', async () => {
    const onSubmit = jest.fn();
    const screen = await render(
      <MedicalRecordForm
        existingAttachments={[]}
        intakeDate={INTAKE_DATE}
        mode="edit"
        onSubmit={onSubmit}
        record={createRecord()}
        veterinarianOptions={[{ id: VET_ID, name: 'Sofía Romero', licenseNumber: 'VET-001' }]}
      />
    );

    expect(screen.getByLabelText('Título').props.value).toBe('Consulta general');
    expect(screen.getByLabelText('Diagnóstico').props.value).toBe('Otitis leve');

    await fireEvent.changeText(screen.getByLabelText('Diagnóstico'), '');
    await fireEvent.press(screen.getByLabelText('Guardar cambios'));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        id: '0e2a3b4c-5d6e-4f80-9a10-b11c12d13e14',
        initial: expect.objectContaining({ diagnosis: 'Otitis leve' }),
        form: expect.objectContaining({ diagnosis: undefined }),
        newAttachments: [],
        removedAttachmentIds: [],
      });
    });
  });
});
