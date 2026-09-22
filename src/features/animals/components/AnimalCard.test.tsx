import { fireEvent, render } from '@testing-library/react-native';

import type { Animal } from '../types';
import { AnimalCard } from './AnimalCard';

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
});
