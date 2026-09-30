import { fireEvent, render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { useDashboardAnimalPhoto } from '@/features/dashboard/hooks/useDashboardAnimalPhoto';
import type { DashboardAnimal } from '@/features/dashboard/types';

import { DashboardAnimalRow } from './DashboardAnimalRow';

jest.mock('@/features/dashboard/hooks/useDashboardAnimalPhoto', () => ({
  useDashboardAnimalPhoto: jest.fn(),
}));

const mockUseDashboardAnimalPhoto = useDashboardAnimalPhoto as jest.Mock;

const ANIMAL_ID = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

function createAnimal(overrides: Partial<DashboardAnimal> = {}): DashboardAnimal {
  return {
    id: ANIMAL_ID,
    name: 'Flavia Azzara',
    species: 'Perra',
    status: 'under_treatment',
    profilePhotoMediaId: null,
    ...overrides,
  };
}

describe('DashboardAnimalRow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseDashboardAnimalPhoto.mockReturnValue({
      data: undefined,
      isError: false,
      isPending: false,
    });
  });

  it('truncates long names and species to one line without overflow', async () => {
    const screen = await render(
      <DashboardAnimalRow
        animal={createAnimal({ name: 'Quiquiriqui de los Milagros', species: 'Saco salchicha' })}
        onPress={jest.fn()}
      />
    );

    const name = screen.getByText('Quiquiriqui de los Milagros');
    const species = screen.getByText('Saco salchicha');

    expect(name.props.numberOfLines).toBe(1);
    expect(name.props.ellipsizeMode).toBe('tail');
    expect(species.props.numberOfLines).toBe(1);
    expect(species.props.ellipsizeMode).toBe('tail');
  });

  it('keeps the status badge stable: zero flex shrink and a single line', async () => {
    const screen = await render(
      <DashboardAnimalRow
        animal={createAnimal({ status: 'available_for_adoption' })}
        onPress={jest.fn()}
      />
    );

    const badge = screen.getByLabelText('Disponible para adopción');
    const badgeText = screen.getByText('Disponible para adopción');

    expect(badgeText.props.numberOfLines).toBe(1);

    const badgeWrapStyle = StyleSheet.flatten(badge.parent?.props.style);
    expect(badgeWrapStyle).toMatchObject({ flexShrink: 0 });
  });

  it('exposes the full name, species and status through the accessibility label', async () => {
    const screen = await render(<DashboardAnimalRow animal={createAnimal()} onPress={jest.fn()} />);

    expect(
      screen.getByRole('button', { name: 'Flavia Azzara, Perra, En tratamiento' })
    ).toBeTruthy();
  });

  it('navigates to the animal detail when pressed', async () => {
    const onPress = jest.fn();
    const animal = createAnimal();
    const screen = await render(<DashboardAnimalRow animal={animal} onPress={onPress} />);

    fireEvent.press(screen.getByRole('button', { name: /Flavia Azzara/ }));

    expect(onPress).toHaveBeenCalledWith(animal);
  });

  it('falls back to initials and does not fetch when the animal has no photo', async () => {
    const screen = await render(
      <DashboardAnimalRow
        animal={createAnimal({ profilePhotoMediaId: null })}
        onPress={jest.fn()}
      />
    );

    expect(screen.getByLabelText('Foto de Flavia Azzara')).toHaveTextContent('FL');
    expect(screen.queryByTestId('app-avatar-image')).toBeNull();
    expect(mockUseDashboardAnimalPhoto).toHaveBeenCalledWith(null);
  });

  it('renders the photo when the animal has a media id', async () => {
    mockUseDashboardAnimalPhoto.mockReturnValue({
      data: 'https://cdn.test/flavia.jpg',
      isError: false,
      isPending: false,
    });
    const screen = await render(
      <DashboardAnimalRow
        animal={createAnimal({ profilePhotoMediaId: 'media-id' })}
        onPress={jest.fn()}
      />
    );

    expect(screen.getByTestId('app-avatar-image')).toBeTruthy();
    expect(mockUseDashboardAnimalPhoto).toHaveBeenCalledWith('media-id');
  });
});
