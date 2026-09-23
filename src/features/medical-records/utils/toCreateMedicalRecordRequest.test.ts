import { toCreateMedicalRecordRequest } from './toCreateMedicalRecordRequest';

const ANIMAL_ID = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
const VET_ID = '7fa85f64-5717-4562-b3fc-2c963f66afa6';
const MEDIA_ID = '1b2a3b4c-5d6e-4f80-9a10-b11c12d13e14';

describe('toCreateMedicalRecordRequest', () => {
  it('builds a create request without optional fields', () => {
    expect(
      toCreateMedicalRecordRequest({
        animalId: ANIMAL_ID,
        recordType: 'consultation',
        title: 'Consulta general',
        occurredAt: '2026-09-22T14:30:00-03:00',
        veterinarianId: undefined,
        diagnosis: undefined,
        treatment: undefined,
        notes: undefined,
        attachmentMediaIds: undefined,
      })
    ).toEqual({
      animalId: ANIMAL_ID,
      recordType: 'consultation',
      title: 'Consulta general',
      occurredAt: '2026-09-22T14:30:00-03:00',
    });
  });

  it('includes optional fields when present', () => {
    expect(
      toCreateMedicalRecordRequest(
        {
          animalId: ANIMAL_ID,
          recordType: 'surgery',
          title: 'Cirugía',
          occurredAt: '2026-09-22T14:30:00-03:00',
          veterinarianId: VET_ID,
          diagnosis: 'Fractura',
          treatment: 'Fijación',
          notes: 'Control en 7 días',
          attachmentMediaIds: undefined,
        },
        [MEDIA_ID]
      )
    ).toEqual({
      animalId: ANIMAL_ID,
      recordType: 'surgery',
      title: 'Cirugía',
      occurredAt: '2026-09-22T14:30:00-03:00',
      veterinarianId: VET_ID,
      diagnosis: 'Fractura',
      treatment: 'Fijación',
      notes: 'Control en 7 días',
      attachmentMediaIds: [MEDIA_ID],
    });
  });

  it('omits attachmentMediaIds when empty', () => {
    expect(
      toCreateMedicalRecordRequest(
        {
          animalId: ANIMAL_ID,
          recordType: 'other',
          title: 'Registro',
          occurredAt: '2026-09-22T10:00:00Z',
        },
        []
      )
    ).toEqual({
      animalId: ANIMAL_ID,
      recordType: 'other',
      title: 'Registro',
      occurredAt: '2026-09-22T10:00:00Z',
    });
  });
});
