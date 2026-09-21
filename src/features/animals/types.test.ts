import type { AnimalResponse } from './types';
import { toAnimalView } from './types';

function createResponse(overrides: Partial<AnimalResponse> = {}): AnimalResponse {
  return {
    id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    name: 'Luna',
    species: 'dog',
    sex: 'female',
    status: 'admitted',
    intakeDate: '2026-01-10',
    ...overrides,
  };
}

describe('toAnimalView', () => {
  it('maps the backend response to the view model', () => {
    expect(
      toAnimalView(
        createResponse({
          // The generator types nullable backend objects as Record; cast the real runtime values.
          breed: 'mixed' as unknown as Record<string, unknown>,
          birthDate: '2025-06-01',
          profilePhotoMediaId: '7fa85f64-5717-4562-b3fc-2c963f66afa6' as unknown as Record<
            string,
            unknown
          >,
        })
      )
    ).toEqual({
      id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      name: 'Luna',
      species: 'dog',
      breed: 'mixed',
      sex: 'female',
      status: 'admitted',
      intakeDate: '2026-01-10',
      birthDate: '2025-06-01',
      profilePhotoMediaId: '7fa85f64-5717-4562-b3fc-2c963f66afa6',
    });
  });

  it('normalizes missing nullable fields to null', () => {
    expect(toAnimalView(createResponse())).toEqual({
      id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      name: 'Luna',
      species: 'dog',
      breed: null,
      sex: 'female',
      status: 'admitted',
      intakeDate: '2026-01-10',
      birthDate: null,
      profilePhotoMediaId: null,
    });
  });
});
