import { fireEvent, render } from '@testing-library/react-native';

import { useAnimalPhoto } from '../hooks/useAnimalPhoto';
import type { Animal } from '../types';
import { AnimalCard } from './AnimalCard';

jest.mock('../hooks/useAnimalPhoto', () => ({
  useAnimalPhoto: jest.fn(),
}));

const mockUseAnimalPhoto = useAnimalPhoto as jest.Mock;

function createAnimal(): Animal {
  return {
    id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    name: 'Luna',
    species: 'dog',
    breed: 'mixed',
    sex: 'female',
    status: 'available_for_adoption',
    intakeDate: '2026-01-10',
    birthDate: null,
    profilePhotoMediaId: null,
  };
}

describe('AnimalCard', () => {
  beforeEach(() => {
    mockUseAnimalPhoto.mockReturnValue({ data: undefined, isError: false, isPending: false });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('announces the animal and its status for accessibility', async () => {
    const screen = await render(<AnimalCard animal={createAnimal()} onPress={() => undefined} />);

    expect(screen.getByLabelText('Luna, dog, mixed, Disponible para adopción')).toBeTruthy();
    expect(screen.getByRole('button')).toBeTruthy();
  });

  it('calls onPress with the animal when pressed', async () => {
    const onPress = jest.fn();
    const screen = await render(<AnimalCard animal={createAnimal()} onPress={onPress} />);

    await fireEvent.press(screen.getByRole('button'));

    expect(onPress).toHaveBeenCalledWith(createAnimal());
  });

  it('shows the status badge with a textual label', async () => {
    const screen = await render(<AnimalCard animal={createAnimal()} onPress={() => undefined} />);

    expect(screen.getByText('Disponible para adopción')).toBeTruthy();
  });

  it('shows the profile photo when the animal has a profilePhotoMediaId', async () => {
    mockUseAnimalPhoto.mockReturnValue({ data: 'https://cdn.test/luna.jpg' });
    const animal = {
      ...createAnimal(),
      profilePhotoMediaId: '6ba7b814-9dad-11d1-80b4-00c04fd430c8',
    };
    const screen = await render(<AnimalCard animal={animal} onPress={() => undefined} />);

    expect(mockUseAnimalPhoto).toHaveBeenCalledWith(animal.profilePhotoMediaId);
    expect(screen.getByTestId('app-avatar-image')).toBeTruthy();
  });

  it('falls back to initials when the animal has no profile photo', async () => {
    const screen = await render(<AnimalCard animal={createAnimal()} onPress={() => undefined} />);

    expect(screen.getByLabelText('Foto de Luna')).toHaveTextContent('LU');
    expect(screen.queryByTestId('app-avatar-image')).toBeNull();
  });
});
