import { fireEvent, render, waitFor } from '@testing-library/react-native';
import type { RefObject } from 'react';
import { Platform, type ScrollView } from 'react-native';

import type { Animal } from '../types';

import { AnimalProfileForm } from './AnimalProfileForm';

jest.mock('expo-image-picker', () => ({
  MediaTypeOptions: { Images: 'Images' },
  launchImageLibraryAsync: jest.fn(),
  requestMediaLibraryPermissionsAsync: jest.fn(),
}));

jest.mock('@react-native-community/datetimepicker', () => {
  const React = jest.requireActual<typeof import('react')>('react');
  const { Pressable, Text } = jest.requireActual<typeof import('react-native')>('react-native');
  const MockPicker = ({ onChange }: { onChange(event: { type: string }, date?: Date): void }) =>
    React.createElement(
      Pressable,
      {
        accessibilityLabel: 'selector de fecha',
        onPress: () => onChange({ type: 'set' }, new Date(2026, 1, 1, 12)),
      },
      React.createElement(Text, null, 'selector')
    );
  return { __esModule: true, default: MockPicker };
});

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
    expect(screen.getByRole('button', { name: /Fecha de ingreso:/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Fecha de nacimiento:/ })).toBeTruthy();
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
    const animal = createAnimal();
    const screen = await render(
      <AnimalProfileForm mode="edit" animal={animal} currentPhotoUri={null} onSubmit={onSubmit} />
    );

    await fireEvent.changeText(screen.getByLabelText('Nombre'), 'Luna Editada');
    await fireEvent.press(screen.getByRole('button', { name: 'Guardar cambios' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        initial: animal,
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

  it('scrolls to the first invalid field without submitting', async () => {
    const platform = jest.replaceProperty(Platform, 'OS', 'web');
    const onSubmit = jest.fn();
    const scrollTo = jest.fn();
    const scrollRef = {
      current: { scrollTo },
    } as unknown as RefObject<ScrollView>;
    const screen = await render(
      <AnimalProfileForm
        mode="edit"
        animal={createAnimal()}
        currentPhotoUri={null}
        onSubmit={onSubmit}
        scrollRef={scrollRef}
      />
    );

    await fireEvent.changeText(screen.getByLabelText('Fecha de nacimiento'), '2026-02-01');
    await fireEvent.press(screen.getByRole('button', { name: 'Guardar cambios' }));

    expect(
      await screen.findByText(
        'La fecha de nacimiento no puede ser posterior a la fecha de ingreso.'
      )
    ).toBeTruthy();
    expect(scrollTo).toHaveBeenCalledWith(
      expect.objectContaining({ animated: true, y: expect.any(Number) })
    );
    expect(onSubmit).not.toHaveBeenCalled();
    platform.restore();
  });

  it('shows a distinct photo error with retry and save-without-photo actions', async () => {
    const onSubmit = jest.fn();
    const screen = await render(
      <AnimalProfileForm
        mode="edit"
        animal={createAnimal()}
        currentPhotoUri={null}
        onSubmit={onSubmit}
        photoErrorMessage="La foto no es válida. Elige una imagen de hasta 10 MB e inténtalo de nuevo."
      />
    );

    expect(
      screen.getByText(
        'La foto no es válida. Elige una imagen de hasta 10 MB e inténtalo de nuevo.'
      )
    ).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: 'Reintentar' }));
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ photo: null }));
    });
    expect(onSubmit.mock.calls[0]?.[0]).not.toHaveProperty('skipPhoto');

    onSubmit.mockClear();
    await fireEvent.press(screen.getByRole('button', { name: 'Guardar sin foto' }));
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ skipPhoto: true }));
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

    await fireEvent.press(screen.getByRole('button', { name: /Fecha de nacimiento:/ }));
    await fireEvent.press(screen.getByLabelText('selector de fecha'));
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
