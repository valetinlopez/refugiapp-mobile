import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, waitFor, type RenderResult } from '@testing-library/react-native';
import type { ReactElement } from 'react';

import * as ImagePicker from 'expo-image-picker';

import { speciesApi } from '../api/speciesApi';

import { AnimalCreateForm } from './AnimalCreateForm';

jest.mock('../api/speciesApi', () => ({
  speciesApi: {
    getBreeds: jest.fn(),
    getSpecies: jest.fn(),
  },
}));

const SPECIES = [
  { id: 'species-dog', slug: 'dog', labelEs: 'Perro' },
  { id: 'species-other', slug: 'other', labelEs: 'Otro' },
];

const DOG_BREEDS = [
  { id: 'breed-mestizo', speciesId: 'species-dog', slug: 'mestizo', labelEs: 'Mestizo' },
  { id: 'breed-other', speciesId: 'species-dog', slug: 'other', labelEs: 'Otra' },
];

let mockPickedDate = new Date(2026, 0, 10, 12);

jest.mock('@react-native-community/datetimepicker', () => {
  const React = jest.requireActual<typeof import('react')>('react');
  const { Pressable, Text } = jest.requireActual<typeof import('react-native')>('react-native');
  const MockPicker = ({ onChange }: { onChange(event: { type: string }, date?: Date): void }) =>
    React.createElement(
      Pressable,
      {
        accessibilityLabel: 'selector de fecha',
        onPress: () => onChange({ type: 'set' }, mockPickedDate),
      },
      React.createElement(Text, null, 'selector')
    );
  return { __esModule: true, default: MockPicker };
});

jest.mock('expo-image-picker', () => ({
  MediaTypeOptions: { Images: 'Images' },
  launchCameraAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
  requestCameraPermissionsAsync: jest.fn(),
  requestMediaLibraryPermissionsAsync: jest.fn(),
}));

const mockRequestPermissions = ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock;
const mockLaunchLibrary = ImagePicker.launchImageLibraryAsync as jest.Mock;

function renderForm(ui: ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

async function fillRequiredFields(screen: RenderResult) {
  await fireEvent.changeText(screen.getByLabelText('Nombre'), 'Luna');
  await fireEvent.press(await screen.findByRole('radio', { name: 'Perro' }));
  mockPickedDate = new Date(2026, 0, 10, 12);
  await fireEvent.press(screen.getByLabelText('Elegir fecha de ingreso'));
  await fireEvent.press(screen.getByLabelText('selector de fecha'));
}

describe('AnimalCreateForm', () => {
  beforeEach(() => {
    jest.mocked(speciesApi.getSpecies).mockResolvedValue(SPECIES);
    jest.mocked(speciesApi.getBreeds).mockResolvedValue(DOG_BREEDS);
    mockRequestPermissions.mockResolvedValue({ granted: true });
    mockLaunchLibrary.mockResolvedValue({ canceled: true, assets: [] });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders every ticket field with accessible labels', async () => {
    const screen = await renderForm(<AnimalCreateForm onSubmit={() => undefined} />);

    for (const label of [
      'Nombre',
      'Especie',
      'Raza',
      'Sexo',
      'Estado',
      'Fecha de ingreso',
      'Fecha de nacimiento',
      'Foto de perfil',
    ]) {
      expect(screen.getByText(label)).toBeTruthy();
    }
    expect(screen.getByRole('button', { name: 'Dar de alta' })).toBeTruthy();
    expect(screen.getByRole('radio', { name: 'Desconocido' })).toBeTruthy();
    expect(screen.getByRole('radio', { name: 'Ingresado' })).toBeTruthy();
  });

  it('shows Spanish validation errors without submitting', async () => {
    const onSubmit = jest.fn();
    const screen = await renderForm(<AnimalCreateForm onSubmit={onSubmit} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Dar de alta' }));

    expect(await screen.findByText('El nombre es obligatorio.')).toBeTruthy();
    expect(screen.getByText('La especie es obligatoria.')).toBeTruthy();
    expect(screen.getByText('La fecha de ingreso es obligatoria.')).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits valid data with backend defaults and no photo', async () => {
    const onSubmit = jest.fn();
    const screen = await renderForm(<AnimalCreateForm onSubmit={onSubmit} />);
    await fillRequiredFields(screen);

    await fireEvent.press(screen.getByRole('button', { name: 'Dar de alta' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        name: 'Luna',
        species: 'dog',
        breed: undefined,
        sex: 'unknown',
        status: 'admitted',
        intakeDate: '2026-01-10',
        birthDate: undefined,
        photo: null,
      });
    });
  });

  it('submits the selected sex and status', async () => {
    const onSubmit = jest.fn();
    const screen = await renderForm(<AnimalCreateForm onSubmit={onSubmit} />);
    await fillRequiredFields(screen);
    await fireEvent.press(screen.getByRole('radio', { name: 'Hembra' }));
    await fireEvent.press(screen.getByRole('radio', { name: 'Disponible para adopción' }));

    await fireEvent.press(screen.getByRole('button', { name: 'Dar de alta' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ sex: 'female', status: 'available_for_adoption' })
      );
    });
  });

  it('rejects a birth date after the intake date', async () => {
    const onSubmit = jest.fn();
    const screen = await renderForm(<AnimalCreateForm onSubmit={onSubmit} />);
    await fillRequiredFields(screen);
    mockPickedDate = new Date(2026, 1, 1, 12);
    await fireEvent.press(screen.getByLabelText('Elegir fecha de nacimiento'));
    await fireEvent.press(screen.getByLabelText('selector de fecha'));

    await fireEvent.press(screen.getByRole('button', { name: 'Dar de alta' }));

    expect(
      await screen.findByText(
        'La fecha de nacimiento no puede ser posterior a la fecha de ingreso.'
      )
    ).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('displays translated backend errors', async () => {
    const screen = await renderForm(
      <AnimalCreateForm
        errorMessage="Tu rol no tiene permiso para dar de alta animales."
        onSubmit={() => undefined}
      />
    );

    expect(screen.getByText('Tu rol no tiene permiso para dar de alta animales.')).toBeTruthy();
  });

  it('picks a profile photo and includes it in the payload', async () => {
    mockLaunchLibrary.mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file:///photo.jpg', mimeType: 'image/jpeg', fileSize: 1024 }],
    });
    const onSubmit = jest.fn();
    const screen = await renderForm(<AnimalCreateForm onSubmit={onSubmit} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Elegir de galería' }));

    expect(await screen.findByLabelText('Foto de perfil seleccionada para photo.jpg')).toBeTruthy();

    await fillRequiredFields(screen);
    await fireEvent.press(screen.getByRole('button', { name: 'Dar de alta' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          photo: expect.objectContaining({
            uri: 'file:///photo.jpg',
            name: 'photo.jpg',
            mimeType: 'image/jpeg',
          }),
        })
      );
    });
  });

  it('removes the selected photo', async () => {
    mockLaunchLibrary.mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file:///photo.jpg', mimeType: 'image/jpeg', fileSize: 1024 }],
    });
    const screen = await renderForm(<AnimalCreateForm onSubmit={() => undefined} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Elegir de galería' }));
    await screen.findByLabelText('Foto de perfil seleccionada para photo.jpg');
    await fireEvent.press(screen.getByRole('button', { name: 'Quitar' }));

    expect(screen.getByLabelText('Sin foto de perfil')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Elegir de galería' })).toBeTruthy();
  });

  it('explains denied photo permissions in Spanish', async () => {
    mockRequestPermissions.mockResolvedValue({ granted: false });
    const screen = await renderForm(<AnimalCreateForm onSubmit={() => undefined} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Elegir de galería' }));

    expect(
      await screen.findByText('Necesitamos acceso a tus fotos para elegir la foto de perfil.')
    ).toBeTruthy();
  });

  it('rejects oversized photos in Spanish', async () => {
    mockLaunchLibrary.mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file:///huge.jpg', mimeType: 'image/jpeg', fileSize: 11 * 1024 * 1024 }],
    });
    const screen = await renderForm(<AnimalCreateForm onSubmit={() => undefined} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Elegir de galería' }));

    expect(
      await screen.findByText('La foto supera los 10 MB. Elegí una imagen más liviana.')
    ).toBeTruthy();
  });
});
