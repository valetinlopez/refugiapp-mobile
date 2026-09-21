import { fireEvent, render, waitFor } from '@testing-library/react-native';

import type { Animal } from '../types';

import { AnimalProfileForm } from './AnimalProfileForm';

jest.mock('expo-image-picker', () => ({
  MediaTypeOptions: { Images: 'Images' },
  launchImageLibraryAsync: jest.fn(),
  requestMediaLibraryPermissionsAsync: jest.fn(),
}));

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

describe('AnimalProfileForm edit mode', () => {
  it('prefills the form from the animal', async () => {
    const onSubmit = jest.fn();
    const screen = await render(
      <AnimalProfileForm
        mode="edit"
        animal={createAnimal()}
        currentPhotoUri="https://cloudinary.test/profile-photo.jpg"
        onSubmit={onSubmit}
      />
    );

    expect(screen.getByLabelText('Nombre').props.value).toBe('Luna');
    expect(screen.getByLabelText('Especie').props.value).toBe('dog');
    expect(screen.getByLabelText('Raza').props.value).toBe('Mestizo');
    expect(screen.getByLabelText('Fecha de ingreso').props.value).toBe('2026-01-10');
    expect(screen.getByLabelText('Fecha de nacimiento').props.value).toBe('2025-06-01');
    expect(screen.getByRole('radio', { name: 'Hembra' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Guardar cambios' })).toBeTruthy();
  });

  it('shows the current photo and the submit button label for editing', async () => {
    const screen = await render(
      <AnimalProfileForm
        mode="edit"
        animal={createAnimal()}
        currentPhotoUri="https://cloudinary.test/profile-photo.jpg"
        onSubmit={() => undefined}
      />
    );

    expect(screen.getByLabelText('Foto de perfil actual')).toBeTruthy();
  });

  it('submits the edited values without touching status', async () => {
    const onSubmit = jest.fn();
    const screen = await render(
      <AnimalProfileForm
        mode="edit"
        animal={createAnimal()}
        currentPhotoUri={null}
        onSubmit={onSubmit}
      />
    );

    await fireEvent.changeText(screen.getByLabelText('Nombre'), 'Luna Editada');
    await fireEvent.press(screen.getByRole('button', { name: 'Guardar cambios' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        form: {
          name: 'Luna Editada',
          species: 'dog',
          breed: 'Mestizo',
          sex: 'female',
          intakeDate: '2026-01-10',
          birthDate: '2025-06-01',
        },
        photo: null,
      });
    });
  });

  it('rejects a birth date after the intake date', async () => {
    const onSubmit = jest.fn();
    const screen = await render(
      <AnimalProfileForm
        mode="edit"
        animal={createAnimal()}
        currentPhotoUri={null}
        onSubmit={onSubmit}
      />
    );

    await fireEvent.changeText(screen.getByLabelText('Fecha de nacimiento'), '2026-02-01');
    await fireEvent.press(screen.getByRole('button', { name: 'Guardar cambios' }));

    expect(
      await screen.findByText(
        'La fecha de nacimiento no puede ser posterior a la fecha de ingreso.'
      )
    ).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('displays translated backend errors (e.g. 403)', async () => {
    const screen = await render(
      <AnimalProfileForm
        mode="edit"
        animal={createAnimal()}
        currentPhotoUri={null}
        errorMessage="Tu rol no tiene permiso para editar animales."
        onSubmit={() => undefined}
      />
    );

    expect(screen.getByText('Tu rol no tiene permiso para editar animales.')).toBeTruthy();
  });
});
