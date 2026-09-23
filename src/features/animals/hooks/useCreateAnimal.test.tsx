import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import type { PropsWithChildren } from 'react';

import { animalsApi } from '../api/animalsApi';
import { mediaApi } from '../api/mediaApi';
import type { Animal } from '../types';
import { CreateAnimalError } from '../utils/animalErrorMessages';

import { animalKeys } from './animalKeys';
import { useCreateAnimal, type CreateAnimalInput } from './useCreateAnimal';

function createInput(overrides: Partial<CreateAnimalInput> = {}): CreateAnimalInput {
  return {
    name: 'Luna',
    species: 'dog',
    breed: undefined,
    sex: 'female',
    status: 'admitted',
    intakeDate: '2026-01-10',
    birthDate: undefined,
    photo: null,
    ...overrides,
  };
}

function createAnimal(): Animal {
  return {
    id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    name: 'Luna',
    species: 'dog',
    breed: null,
    sex: 'female',
    status: 'admitted',
    intakeDate: '2026-01-10',
    birthDate: null,
    profilePhotoMediaId: '7fa85f64-5717-4562-b3fc-2c963f66afa6',
  };
}

describe('useCreateAnimal', () => {
  let queryClient: QueryClient;

  function wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  beforeEach(() => {
    // gcTime: 0 avoids the 5-minute mutation gc timer keeping jest open.
    queryClient = new QueryClient({
      defaultOptions: {
        mutations: { retry: false, gcTime: 0 },
        queries: { retry: false },
      },
    });
  });

  afterEach(() => {
    queryClient.clear();
    queryClient.unmount();
    jest.restoreAllMocks();
  });

  it('creates without photo when none is selected', async () => {
    const create = jest.spyOn(animalsApi, 'create').mockResolvedValue(createAnimal());
    const upload = jest.spyOn(mediaApi, 'uploadOrphanPhoto');
    const invalidate = jest.spyOn(queryClient, 'invalidateQueries');
    const { result } = await renderHook(() => useCreateAnimal(), { wrapper });

    result.current.mutate(createInput());

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(upload).not.toHaveBeenCalled();
    expect(create).toHaveBeenCalledWith({
      name: 'Luna',
      species: 'dog',
      sex: 'female',
      status: 'admitted',
      intakeDate: '2026-01-10',
    });
    expect(queryClient.getQueryData(animalKeys.detail(createAnimal().id))).toEqual(createAnimal());
    expect(invalidate).toHaveBeenCalledWith({ queryKey: animalKeys.lists() });
  });

  it('uploads the orphan photo first and links it on creation', async () => {
    const upload = jest.spyOn(mediaApi, 'uploadOrphanPhoto').mockResolvedValue({
      id: '7fa85f64-5717-4562-b3fc-2c963f66afa6',
      resourceType: 'image',
      publicId: 'refugiapp/profile-photo',
      secureUrl: 'https://cloudinary.test/profile-photo.jpg',
    });
    const create = jest.spyOn(animalsApi, 'create').mockResolvedValue(createAnimal());
    const { result } = await renderHook(() => useCreateAnimal(), { wrapper });
    const photo = { uri: 'file:///photo.jpg', name: 'photo.jpg', mimeType: 'image/jpeg' };

    result.current.mutate(createInput({ photo }));

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(upload).toHaveBeenCalledWith(
      photo,
      undefined,
      expect.objectContaining({
        onUploadProgress: expect.any(Function),
        signal: expect.any(AbortSignal),
      })
    );
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        profilePhotoMediaId: '7fa85f64-5717-4562-b3fc-2c963f66afa6',
      })
    );
  });

  it('wraps photo failures without attempting creation', async () => {
    const upload = jest
      .spyOn(mediaApi, 'uploadOrphanPhoto')
      .mockRejectedValue(new Error('upload failed'));
    const create = jest.spyOn(animalsApi, 'create');
    const { result } = await renderHook(() => useCreateAnimal(), { wrapper });

    result.current.mutate(
      createInput({
        photo: { uri: 'file:///photo.jpg', name: 'photo.jpg', mimeType: 'image/jpeg' },
      })
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
    expect(upload).toHaveBeenCalledTimes(1);
    expect(create).not.toHaveBeenCalled();
    expect(result.current.error).toBeInstanceOf(CreateAnimalError);
    expect((result.current.error as CreateAnimalError | null)?.phase).toBe('photo');
  });

  it('deletes the orphan asset best-effort when creation fails afterwards', async () => {
    jest.spyOn(mediaApi, 'uploadOrphanPhoto').mockResolvedValue({
      id: '7fa85f64-5717-4562-b3fc-2c963f66afa6',
      resourceType: 'image',
      publicId: 'refugiapp/profile-photo',
      secureUrl: 'https://cloudinary.test/profile-photo.jpg',
    });
    jest.spyOn(animalsApi, 'create').mockRejectedValue(new Error('create failed'));
    const remove = jest.spyOn(mediaApi, 'deleteAsset').mockResolvedValue(undefined);
    const { result } = await renderHook(() => useCreateAnimal(), { wrapper });

    result.current.mutate(
      createInput({
        photo: { uri: 'file:///photo.jpg', name: 'photo.jpg', mimeType: 'image/jpeg' },
      })
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
    expect(remove).toHaveBeenCalledWith('7fa85f64-5717-4562-b3fc-2c963f66afa6');
    expect((result.current.error as CreateAnimalError | null)?.phase).toBe('create');
  });
});
