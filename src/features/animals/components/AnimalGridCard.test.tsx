import { fireEvent, render } from '@testing-library/react-native';

import { useAnimalPhoto } from '../hooks/useAnimalPhoto';
import type { Animal } from '../types';
import { AnimalGridCard } from './AnimalGridCard';

jest.mock('../hooks/useAnimalPhoto', () => ({
  useAnimalPhoto: jest.fn(),
}));

const mockUseAnimalPhoto = useAnimalPhoto as jest.Mock;

function createAnimal(overrides: Partial<Animal> = {}): Animal {
  return {
    id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    name: 'Luna',
    species: 'cat',
    breed: 'Mestiza',
    sex: 'female',
    status: 'under_treatment',
    intakeDate: '2026-01-10',
    birthDate: null,
    profilePhotoMediaId: null,
    ...overrides,
  };
}

describe('AnimalGridCard', () => {
  beforeEach(() => {
    mockUseAnimalPhoto.mockReturnValue({ data: undefined, isError: false, isPending: false });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('announces identity and status as a single button', async () => {
    const screen = await render(
      <AnimalGridCard animal={createAnimal()} onPress={() => undefined} />
    );

    expect(screen.getByLabelText('Luna, cat, Mestiza, En tratamiento')).toBeTruthy();
    expect(screen.getByRole('button')).toBeTruthy();
  });

  it('shows name, species with breed and a textual status badge', async () => {
    const screen = await render(
      <AnimalGridCard animal={createAnimal()} onPress={() => undefined} />
    );

    expect(screen.getByText('Luna')).toBeTruthy();
    expect(screen.getByText('cat · Mestiza')).toBeTruthy();
    expect(screen.getByText('En tratamiento')).toBeTruthy();
  });

  it('omits the breed separator when the breed is absent', async () => {
    const screen = await render(
      <AnimalGridCard animal={createAnimal({ breed: null })} onPress={() => undefined} />
    );

    expect(screen.getByText('cat')).toBeTruthy();
    expect(screen.getByLabelText('Luna, cat, En tratamiento')).toBeTruthy();
  });

  it('calls onPress with the animal when pressed', async () => {
    const onPress = jest.fn();
    const animal = createAnimal();
    const screen = await render(<AnimalGridCard animal={animal} onPress={onPress} />);

    await fireEvent.press(screen.getByRole('button'));

    expect(onPress).toHaveBeenCalledWith(animal);
  });

  it('shows the optimized profile photo when available', async () => {
    mockUseAnimalPhoto.mockReturnValue({ data: 'https://cdn.test/luna.jpg' });
    const animal = createAnimal({
      profilePhotoMediaId: '6ba7b814-9dad-11d1-80b4-00c04fd430c8',
    });
    const screen = await render(<AnimalGridCard animal={animal} onPress={() => undefined} />);

    expect(mockUseAnimalPhoto).toHaveBeenCalledWith(animal.profilePhotoMediaId);
    expect(screen.getByTestId('animal-grid-card-image')).toBeTruthy();
  });

  it('falls back to initials without a profile photo', async () => {
    const screen = await render(
      <AnimalGridCard animal={createAnimal()} onPress={() => undefined} />
    );

    expect(screen.getByLabelText('Sin foto de Luna')).toHaveTextContent('LU');
    expect(screen.queryByTestId('animal-grid-card-image')).toBeNull();
  });

  it('tolerates long names without hiding critical data', async () => {
    const screen = await render(
      <AnimalGridCard
        animal={createAnimal({
          breed: 'Una raza con un nombre extremadamente largo para envolver',
          name: 'Un nombre de animal extremadamente largo para envolver',
        })}
        onPress={() => undefined}
      />
    );

    expect(screen.getByText('Un nombre de animal extremadamente largo para envolver')).toBeTruthy();
    expect(screen.getByText('En tratamiento')).toBeTruthy();
  });
});
