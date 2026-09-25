import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import type { ReactElement, RefObject } from 'react';
import { Platform, type ScrollView } from 'react-native';

import { speciesApi } from '../api/speciesApi';
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

jest.mock('../api/speciesApi', () => ({
  speciesApi: {
    getBreeds: jest.fn(),
    getSpecies: jest.fn(),
  },
}));

const SPECIES = [
  { id: 'species-dog', slug: 'dog', labelEs: 'Perro' },
  { id: 'species-cat', slug: 'cat', labelEs: 'Gato' },
  { id: 'species-other', slug: 'other', labelEs: 'Otro' },
];

const DOG_BREEDS = [
  { id: 'breed-mestizo', speciesId: 'species-dog', slug: 'mestizo', labelEs: 'Mestizo' },
  { id: 'breed-other', speciesId: 'species-dog', slug: 'other', labelEs: 'Otra' },
];

const CAT_BREEDS = [
  { id: 'breed-siames', speciesId: 'species-cat', slug: 'siames', labelEs: 'Siamés' },
  { id: 'breed-other', speciesId: 'species-cat', slug: 'other', labelEs: 'Otra' },
];

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

function renderForm(ui: ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe('AnimalProfileForm edit mode', () => {
  beforeEach(() => {
    jest.mocked(speciesApi.getSpecies).mockResolvedValue(SPECIES);
    jest
      .mocked(speciesApi.getBreeds)
      .mockImplementation(async (speciesId) =>
        speciesId === 'species-dog' ? DOG_BREEDS : CAT_BREEDS
      );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('prefills the form from the animal and maps legacy values to the catalog', async () => {
    const onSubmit = jest.fn();
    const screen = await renderForm(
      <AnimalProfileForm
        mode="edit"
        animal={createAnimal()}
        currentPhotoUri="https://cloudinary.test/profile-photo.jpg"
        onSubmit={onSubmit}
      />
    );

    expect(screen.getByLabelText('Nombre').props.value).toBe('Luna');
    expect(await screen.findByRole('radio', { name: 'Perro' })).toBeTruthy();
    expect(
      (
        screen.getByRole('radio', { name: 'Perro' }).props.accessibilityState as {
          selected: boolean;
        }
      ).selected
    ).toBe(true);
    expect((await screen.findByLabelText('Raza (otra)')).props.value).toBe('Mestizo');
    expect(screen.getByRole('button', { name: /Fecha de ingreso:/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Fecha de nacimiento:/ })).toBeTruthy();
    expect(screen.getByRole('radio', { name: 'Hembra' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Guardar cambios' })).toBeTruthy();
  });

  it('shows the current photo and the submit button label for editing', async () => {
    const screen = await renderForm(
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
    const screen = await renderForm(
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
    const screen = await renderForm(
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
    const screen = await renderForm(
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
    const screen = await renderForm(
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
    const screen = await renderForm(
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

describe('AnimalProfileForm create mode with species catalog', () => {
  beforeEach(() => {
    jest.mocked(speciesApi.getSpecies).mockResolvedValue(SPECIES);
    jest
      .mocked(speciesApi.getBreeds)
      .mockImplementation(async (speciesId) =>
        speciesId === 'species-dog' ? DOG_BREEDS : CAT_BREEDS
      );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('loads dependent breeds when a species is selected', async () => {
    const onSubmit = jest.fn();
    const screen = await renderForm(<AnimalProfileForm mode="create" onSubmit={onSubmit} />);

    await fireEvent.press(await screen.findByRole('radio', { name: 'Perro' }));
    expect(await screen.findByRole('radio', { name: 'Mestizo' })).toBeTruthy();

    await fireEvent.press(screen.getByRole('radio', { name: 'Gato' }));
    expect(await screen.findByRole('radio', { name: 'Siamés' })).toBeTruthy();
    expect(screen.queryByRole('radio', { name: 'Mestizo' })).toBeNull();
  });

  it('resets the breed when the species changes', async () => {
    const onSubmit = jest.fn();
    const screen = await renderForm(<AnimalProfileForm mode="create" onSubmit={onSubmit} />);

    await fireEvent.press(await screen.findByRole('radio', { name: 'Perro' }));
    await fireEvent.press(await screen.findByRole('radio', { name: 'Mestizo' }));

    await fireEvent.press(screen.getByRole('radio', { name: 'Gato' }));
    expect(screen.queryByLabelText('Raza (otra)')).toBeNull();
  });

  it('allows a custom species via Otra and keeps the breed free text', async () => {
    const onSubmit = jest.fn();
    const screen = await renderForm(<AnimalProfileForm mode="create" onSubmit={onSubmit} />);

    await fireEvent.press(await screen.findByRole('radio', { name: 'Otra' }));
    await fireEvent.changeText(screen.getByLabelText('Especie (otra)'), 'Hamster');
    await fireEvent.changeText(screen.getByLabelText('Raza'), 'Sirio');
    await fireEvent.changeText(screen.getByLabelText('Nombre'), 'Luna');
    await fireEvent.press(screen.getByLabelText('Elegir fecha de ingreso'));
    await fireEvent.press(screen.getByLabelText('selector de fecha'));
    await fireEvent.press(screen.getByRole('button', { name: 'Dar de alta' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ species: 'Hamster', breed: 'Sirio' })
      );
    });
  });

  it('requires a custom species text when Otra is selected', async () => {
    const onSubmit = jest.fn();
    const screen = await renderForm(<AnimalProfileForm mode="create" onSubmit={onSubmit} />);

    await fireEvent.press(await screen.findByRole('radio', { name: 'Otra' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Dar de alta' }));

    expect(await screen.findByText('La especie es obligatoria.')).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('falls back to free text when the catalog fails to load', async () => {
    jest.mocked(speciesApi.getSpecies).mockRejectedValue({ status: 500 });
    const onSubmit = jest.fn();
    const screen = await renderForm(<AnimalProfileForm mode="create" onSubmit={onSubmit} />);

    expect(
      await screen.findByText('No se pudo cargar el catálogo', {}, { timeout: 5000 })
    ).toBeTruthy();
    await fireEvent.changeText(screen.getByLabelText('Especie (otra)'), 'Conejo');
    await fireEvent.changeText(screen.getByLabelText('Nombre'), 'Luna');
    await fireEvent.press(screen.getByLabelText('Elegir fecha de ingreso'));
    await fireEvent.press(screen.getByLabelText('selector de fecha'));
    await fireEvent.press(screen.getByRole('button', { name: 'Dar de alta' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ species: 'Conejo' }));
    });
  });
});
