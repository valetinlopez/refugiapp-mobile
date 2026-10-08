import type { AnimalFile, AnimalResponse, MediaAsset, PaginatedAnimalFiles } from './types';
import {
  flattenAnimalFilesPages,
  toAnimalFile,
  toAnimalView,
  toPaginatedAnimalFiles,
} from './types';

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
          breed: 'mixed',
          birthDate: '2025-06-01',
          profilePhotoMediaId: '7fa85f64-5717-4562-b3fc-2c963f66afa6',
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

  it('normalizes ISO datetime dates from the backend to date-only values', () => {
    expect(
      toAnimalView(
        createResponse({
          intakeDate: '2026-01-10T00:00:00.000Z',
          birthDate: '2025-06-01T00:00:00.000Z',
          profilePhotoMediaId: '7fa85f64-5717-4562-b3fc-2c963f66afa6',
        })
      )
    ).toEqual({
      id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      name: 'Luna',
      species: 'dog',
      breed: null,
      sex: 'female',
      status: 'admitted',
      intakeDate: '2026-01-10',
      birthDate: '2025-06-01',
      profilePhotoMediaId: '7fa85f64-5717-4562-b3fc-2c963f66afa6',
    });
  });

  it('falls back to an empty string when the intake date cannot be normalized', () => {
    expect(toAnimalView(createResponse({ intakeDate: 'not-a-date' })).intakeDate).toBe('');
  });
});

function createAsset(overrides: Partial<MediaAsset> = {}): MediaAsset {
  return {
    id: '7fa85f64-5717-4562-b3fc-2c963f66afa6',
    resourceType: 'image',
    publicId: 'refugiapp/animals/luna',
    secureUrl: 'https://res.cloudinary.com/demo/image/upload/luna.jpg',
    ...overrides,
  };
}

describe('toAnimalFile', () => {
  it('marks image resources and derives the name from the public id', () => {
    expect(toAnimalFile(createAsset({ bytes: 2048, format: 'jpg' }))).toEqual({
      id: '7fa85f64-5717-4562-b3fc-2c963f66afa6',
      name: 'luna',
      secureUrl: 'https://res.cloudinary.com/demo/image/upload/luna.jpg',
      isImage: true,
      bytes: 2048,
      format: 'jpg',
    });
  });

  it('appends the PDF extension for raw resources when missing', () => {
    const file = toAnimalFile(
      createAsset({ resourceType: 'raw', publicId: 'refugiapp/animals/estudio', format: 'pdf' })
    );

    expect(file.isImage).toBe(false);
    expect(file.name).toBe('estudio.pdf');
  });

  it('does not duplicate an extension already present in the public id', () => {
    const file = toAnimalFile(
      createAsset({ resourceType: 'raw', publicId: 'refugiapp/animals/estudio.pdf', format: 'pdf' })
    );

    expect(file.name).toBe('estudio.pdf');
  });

  it('normalizes missing optional fields to null', () => {
    const file = toAnimalFile(createAsset());

    expect(file.bytes).toBeNull();
    expect(file.format).toBeNull();
  });
});

describe('toPaginatedAnimalFiles', () => {
  it('maps every item and keeps pagination metadata', () => {
    const page = toPaginatedAnimalFiles({
      items: [createAsset()],
      page: 1,
      limit: 20,
      total: 1,
    });

    expect(page.page).toBe(1);
    expect(page.total).toBe(1);
    expect(page.items[0]?.isImage).toBe(true);
  });
});

describe('flattenAnimalFilesPages', () => {
  function page(items: AnimalFile[], overrides: Partial<PaginatedAnimalFiles> = {}) {
    return { items, page: 1, limit: 20, total: items.length, ...overrides };
  }

  const first = toAnimalFile(createAsset({ id: 'file-1' }));
  const second = toAnimalFile(createAsset({ id: 'file-2' }));

  it('deduplicates repeated ids while preserving the server order', () => {
    const flattened = flattenAnimalFilesPages([
      page([first, second]),
      page([first, toAnimalFile(createAsset({ id: 'file-3' }))], { page: 2 }),
    ]);

    expect(flattened.map((file) => file.id)).toEqual(['file-1', 'file-2', 'file-3']);
  });

  it('excludes the current profile photo so it is never duplicated', () => {
    const flattened = flattenAnimalFilesPages(
      [page([first, second]), page([toAnimalFile(createAsset({ id: 'file-4' }))], { page: 2 })],
      'file-1'
    );

    expect(flattened.map((file) => file.id)).toEqual(['file-2', 'file-4']);
  });

  it('returns an empty list when there are no pages', () => {
    expect(flattenAnimalFilesPages(undefined, null)).toEqual([]);
  });
});
