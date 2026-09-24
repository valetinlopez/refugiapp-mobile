import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import type { PropsWithChildren } from 'react';

import { animalsApi } from '../api/animalsApi';
import { mediaApi } from '../api/mediaApi';
import type { Animal } from '../types';
import { UpdateAnimalError } from '../utils/animalErrorMessages';

import { animalKeys } from './animalKeys';
import { useUpdateAnimal, type UpdateAnimalInput } from './useUpdateAnimal';

function createAnimal(): Animal {
  return {
    id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    name: 'Luna',
    species: 'dog',
    breed: 'Mestizo',
    sex: 'female',
    status: 'admitted',
    intakeDate: '2026-01-10',
    birthDate: '2025-06-01',
    profilePhotoMediaId: '7fa85f64-5717-4562-b3fc-2c963f66afa6',
  };
}

function createInput(overrides: Partial<UpdateAnimalInput> = {}): UpdateAnimalInput {
  return {
    initial: createAnimal(),
    form: {
      name: 'Luna',
      species: 'dog',
      breed: 'Mestizo',
      sex: 'female',
      intakeDate: '2026-01-10',
      birthDate: '2025-06-01',
    },
    photo: null,
    ...overrides,
  };
}

const ANIMAL_ID = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

describe('useUpdateAnimal', () => {
  let queryClient: QueryClient;

  function wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  beforeEach(() => {
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

  it('updates only the diff without a new photo and invalidates the detail', async () => {
    const update = jest.spyOn(animalsApi, 'update').mockResolvedValue(createAnimal());
    const upload = jest.spyOn(mediaApi, 'uploadOrphanPhoto');
    const invalidate = jest.spyOn(queryClient, 'invalidateQueries');
    const { result } = await renderHook(() => useUpdateAnimal(ANIMAL_ID), { wrapper });

    result.current.mutate(
      createInput({
        form: { ...createInput().form, name: 'Luna Editada' },
      })
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(upload).not.toHaveBeenCalled();
    expect(update).toHaveBeenCalledWith(ANIMAL_ID, { name: 'Luna Editada' });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: animalKeys.all });
  });

  it('skips the PATCH when nothing changed', async () => {
    const update = jest.spyOn(animalsApi, 'update');
    const { result } = await renderHook(() => useUpdateAnimal(ANIMAL_ID), { wrapper });

    result.current.mutate(createInput());

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(update).not.toHaveBeenCalled();
    expect(result.current.data).toEqual(createAnimal());
  });

  it('sends null to clear a nullable text field', async () => {
    const update = jest.spyOn(animalsApi, 'update').mockResolvedValue(createAnimal());
    const { result } = await renderHook(() => useUpdateAnimal(ANIMAL_ID), { wrapper });

    result.current.mutate(
      createInput({
        form: { ...createInput().form, breed: undefined },
      })
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(update).toHaveBeenCalledWith(ANIMAL_ID, { breed: null });
  });

  it('skips the upload and keeps the current photo when saving without photo', async () => {
    const upload = jest.spyOn(mediaApi, 'uploadOrphanPhoto');
    const update = jest.spyOn(animalsApi, 'update').mockResolvedValue(createAnimal());
    const { result } = await renderHook(() => useUpdateAnimal(ANIMAL_ID), { wrapper });

    result.current.mutate(
      createInput({
        form: { ...createInput().form, name: 'Luna Editada' },
        photo: { uri: 'file:///photo.jpg', name: 'photo.jpg', mimeType: 'image/jpeg' },
        skipPhoto: true,
      })
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(upload).not.toHaveBeenCalled();
    expect(update).toHaveBeenCalledWith(
      ANIMAL_ID,
      expect.not.objectContaining({ profilePhotoMediaId: expect.anything() })
    );
  });

  it('uploads an orphan photo and links it on update', async () => {
    const upload = jest.spyOn(mediaApi, 'uploadOrphanPhoto').mockResolvedValue({
      id: '7fa85f64-5717-4562-b3fc-2c963f66afa6',
      resourceType: 'image',
      publicId: 'refugiapp/profile-photo',
      secureUrl: 'https://cloudinary.test/profile-photo.jpg',
    });
    const update = jest.spyOn(animalsApi, 'update').mockResolvedValue(createAnimal());
    const { result } = await renderHook(() => useUpdateAnimal(ANIMAL_ID), { wrapper });

    result.current.mutate(
      createInput({
        photo: { uri: 'file:///photo.jpg', name: 'photo.jpg', mimeType: 'image/jpeg' },
      })
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(upload).toHaveBeenCalledWith(
      {
        uri: 'file:///photo.jpg',
        name: 'photo.jpg',
        mimeType: 'image/jpeg',
      },
      undefined,
      expect.objectContaining({
        onUploadProgress: expect.any(Function),
        signal: expect.any(AbortSignal),
      })
    );
    expect(update).toHaveBeenCalledWith(
      ANIMAL_ID,
      expect.objectContaining({
        profilePhotoMediaId: '7fa85f64-5717-4562-b3fc-2c963f66afa6',
      })
    );
  });

  it('wraps photo failures without attempting the update', async () => {
    const upload = jest
      .spyOn(mediaApi, 'uploadOrphanPhoto')
      .mockRejectedValue(new Error('upload failed'));
    const update = jest.spyOn(animalsApi, 'update');
    const { result } = await renderHook(() => useUpdateAnimal(ANIMAL_ID), { wrapper });

    result.current.mutate(
      createInput({
        photo: { uri: 'file:///photo.jpg', name: 'photo.jpg', mimeType: 'image/jpeg' },
      })
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
    expect(upload).toHaveBeenCalledTimes(1);
    expect(update).not.toHaveBeenCalled();
    expect(result.current.error).toBeInstanceOf(UpdateAnimalError);
    expect((result.current.error as UpdateAnimalError | null)?.phase).toBe('photo');
  });

  it('deletes the orphan asset best-effort when the update fails afterwards', async () => {
    jest.spyOn(mediaApi, 'uploadOrphanPhoto').mockResolvedValue({
      id: '7fa85f64-5717-4562-b3fc-2c963f66afa6',
      resourceType: 'image',
      publicId: 'refugiapp/profile-photo',
      secureUrl: 'https://cloudinary.test/profile-photo.jpg',
    });
    jest.spyOn(animalsApi, 'update').mockRejectedValue(new Error('update failed'));
    const remove = jest.spyOn(mediaApi, 'deleteAsset').mockResolvedValue(undefined);
    const { result } = await renderHook(() => useUpdateAnimal(ANIMAL_ID), { wrapper });

    result.current.mutate(
      createInput({
        photo: { uri: 'file:///photo.jpg', name: 'photo.jpg', mimeType: 'image/jpeg' },
      })
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
    expect(remove).toHaveBeenCalledWith('7fa85f64-5717-4562-b3fc-2c963f66afa6');
    expect((result.current.error as UpdateAnimalError | null)?.phase).toBe('update');
  });
});
