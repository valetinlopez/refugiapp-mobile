import type { MedicalRecordRecordFields } from './medicalRecordSchema';
import { hasPatchChanges, toUpdateMedicalRecordRequest } from './toUpdateMedicalRecordRequest';

const INITIAL: MedicalRecordRecordFields = {
  recordType: 'consultation',
  title: 'Consulta general',
  occurredAt: '2026-09-22T14:30:00-03:00',
  veterinarianId: '7fa85f64-5717-4562-b3fc-2c963f66afa6',
  diagnosis: 'Otitis leve',
  treatment: 'Gotas auriculares',
  notes: null,
};

describe('toUpdateMedicalRecordRequest', () => {
  it('omits every field when nothing changed', () => {
    expect(
      toUpdateMedicalRecordRequest(INITIAL, {
        recordType: 'consultation',
        title: 'Consulta general',
        occurredAt: '2026-09-22T14:30:00-03:00',
        veterinarianId: '7fa85f64-5717-4562-b3fc-2c963f66afa6',
        diagnosis: 'Otitis leve',
        treatment: 'Gotas auriculares',
        notes: undefined,
      })
    ).toEqual({});
    expect(hasPatchChanges({})).toBe(false);
  });

  it('sends null to clear a nullable text field', () => {
    expect(
      toUpdateMedicalRecordRequest(INITIAL, {
        recordType: 'consultation',
        title: 'Consulta general',
        occurredAt: '2026-09-22T14:30:00-03:00',
        veterinarianId: '7fa85f64-5717-4562-b3fc-2c963f66afa6',
        diagnosis: undefined,
        treatment: 'Gotas auriculares',
        notes: undefined,
      })
    ).toEqual({ diagnosis: null });
  });

  it('does not send null when the initial value is already null and still empty', () => {
    expect(
      toUpdateMedicalRecordRequest(INITIAL, {
        recordType: 'consultation',
        title: 'Consulta general',
        occurredAt: '2026-09-22T14:30:00-03:00',
        veterinarianId: '7fa85f64-5717-4562-b3fc-2c963f66afa6',
        diagnosis: 'Otitis leve',
        treatment: 'Gotas auriculares',
        notes: undefined,
      })
    ).toEqual({});
  });

  it('sends null to unlink the veterinarian', () => {
    expect(
      toUpdateMedicalRecordRequest(INITIAL, {
        recordType: 'consultation',
        title: 'Consulta general',
        occurredAt: '2026-09-22T14:30:00-03:00',
        veterinarianId: undefined,
        diagnosis: 'Otitis leve',
        treatment: 'Gotas auriculares',
        notes: undefined,
      })
    ).toEqual({ veterinarianId: null });
  });

  it('sends only the changed scalar fields', () => {
    expect(
      toUpdateMedicalRecordRequest(INITIAL, {
        recordType: 'surgery',
        title: 'Consulta general',
        occurredAt: '2026-09-22T14:30:00-03:00',
        veterinarianId: '7fa85f64-5717-4562-b3fc-2c963f66afa6',
        diagnosis: 'Otitis leve',
        treatment: 'Gotas auriculares',
        notes: undefined,
      })
    ).toEqual({ recordType: 'surgery' });
  });

  it('reports a patch as changed when it has at least one key', () => {
    const patch = toUpdateMedicalRecordRequest(INITIAL, {
      recordType: 'consultation',
      title: 'Título actualizado',
      occurredAt: '2026-09-22T14:30:00-03:00',
      veterinarianId: '7fa85f64-5717-4562-b3fc-2c963f66afa6',
      diagnosis: 'Otitis leve',
      treatment: 'Gotas auriculares',
      notes: undefined,
    });
    expect(hasPatchChanges(patch)).toBe(true);
  });
});
