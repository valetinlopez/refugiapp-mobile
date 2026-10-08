import { render } from '@testing-library/react-native';

import { useAnimal } from '../hooks/useAnimal';
import { useAnimalFiles } from '../hooks/useAnimalFiles';
import { useAnimalPhoto } from '../hooks/useAnimalPhoto';
import { useDeleteAnimalFile } from '../hooks/useDeleteAnimalFile';
import { useUploadAnimalFile } from '../hooks/useUploadAnimalFile';

import { AnimalFilesScreen } from './AnimalFilesScreen';

jest.mock('../hooks/useAnimal', () => ({ useAnimal: jest.fn() }));
jest.mock('../hooks/useAnimalPhoto', () => ({ useAnimalPhoto: jest.fn() }));
jest.mock('../hooks/useAnimalFiles', () => ({ useAnimalFiles: jest.fn() }));
jest.mock('../hooks/useUploadAnimalFile', () => ({ useUploadAnimalFile: jest.fn() }));
jest.mock('../hooks/useDeleteAnimalFile', () => ({ useDeleteAnimalFile: jest.fn() }));

const ANIMAL_ID = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
const PROFILE_MEDIA_ID = 'profile-1';

const mockUseAnimal = useAnimal as jest.Mock;
const mockUseAnimalPhoto = useAnimalPhoto as jest.Mock;
const mockUseAnimalFiles = useAnimalFiles as jest.Mock;
const mockUseUploadAnimalFile = useUploadAnimalFile as jest.Mock;
const mockUseDeleteAnimalFile = useDeleteAnimalFile as jest.Mock;

function fileItem(id: string) {
  return {
    id,
    name: `archivo-${id}`,
    secureUrl: `https://res.cloudinary.com/demo/image/upload/${id}.jpg`,
    isImage: true,
    bytes: null,
    format: 'jpg',
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockUseAnimal.mockReturnValue({
    data: {
      id: ANIMAL_ID,
      name: 'Luna',
      species: 'dog',
      breed: null,
      sex: 'female',
      status: 'admitted',
      intakeDate: '2026-01-10',
      birthDate: null,
      profilePhotoMediaId: PROFILE_MEDIA_ID,
    },
    isError: false,
    isPending: false,
  });
  mockUseAnimalPhoto.mockReturnValue({ data: undefined });
  mockUseAnimalFiles.mockReturnValue({
    data: {
      pages: [
        { items: [fileItem(PROFILE_MEDIA_ID), fileItem('file-2')], page: 1, limit: 20, total: 2 },
      ],
    },
    isPending: false,
    isError: false,
    isRefetching: false,
    isFetchingNextPage: false,
    hasNextPage: false,
    fetchNextPage: jest.fn(),
    refetch: jest.fn(),
  });
  mockUseUploadAnimalFile.mockReturnValue({
    upload: null,
    isPending: false,
    error: null,
    mutate: jest.fn(),
    cancelUpload: jest.fn(),
  });
  mockUseDeleteAnimalFile.mockReturnValue({
    isPending: false,
    variables: null,
    error: null,
    mutate: jest.fn(),
  });
});

describe('AnimalFilesScreen', () => {
  it('never duplicates the current profile photo in the archive', async () => {
    const screen = await render(<AnimalFilesScreen animalId={ANIMAL_ID} canWrite />);

    expect(screen.queryByTestId(`animal-file-${PROFILE_MEDIA_ID}`)).toBeNull();
    expect(screen.getByTestId('animal-file-file-2')).toBeTruthy();
  });

  it('offers upload and delete to roles with write capability', async () => {
    const screen = await render(<AnimalFilesScreen animalId={ANIMAL_ID} canWrite />);

    expect(screen.getByTestId('animal-files-add')).toBeTruthy();
    expect(screen.getByTestId('animal-file-remove-file-2')).toBeTruthy();
  });

  it('keeps the archive read-only for veterinarians', async () => {
    const screen = await render(<AnimalFilesScreen animalId={ANIMAL_ID} canWrite={false} />);

    expect(screen.queryByTestId('animal-files-add')).toBeNull();
    expect(screen.queryByTestId('animal-file-remove-file-2')).toBeNull();
    expect(screen.getByText('archivo-file-2')).toBeTruthy();
  });
});
