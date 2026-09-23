import { fireEvent, render, waitFor, type RenderResult } from '@testing-library/react-native';

import * as ImagePicker from 'expo-image-picker';

import { AnimalCreateForm } from './AnimalCreateForm';

jest.mock('expo-image-picker', () => ({
  MediaTypeOptions: { Images: 'Images' },
  launchCameraAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
  requestCameraPermissionsAsync: jest.fn(),
  requestMediaLibraryPermissionsAsync: jest.fn(),
}));

const mockRequestPermissions = ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock;
const mockLaunchLibrary = ImagePicker.launchImageLibraryAsync as jest.Mock;

async function fillRequiredFields(screen: RenderResult) {
  await fireEvent.changeText(screen.getByLabelText('Nombre'), 'Luna');
  await fireEvent.changeText(screen.getByLabelText('Especie'), 'dog');
  await fireEvent.changeText(screen.getByLabelText('Fecha de ingreso'), '2026-01-10');
}

describe('AnimalCreateForm', () => {
  beforeEach(() => {
    mockRequestPermissions.mockResolvedValue({ granted: true });
    mockLaunchLibrary.mockResolvedValue({ canceled: true, assets: [] });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders every ticket field with accessible labels', async () => {
    const screen = await render(<AnimalCreateForm onSubmit={() => undefined} />);

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
    const screen = await render(<AnimalCreateForm onSubmit={onSubmit} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Dar de alta' }));

    expect(await screen.findByText('El nombre es obligatorio.')).toBeTruthy();
    expect(screen.getByText('La especie es obligatoria.')).toBeTruthy();
    expect(screen.getByText('La fecha de ingreso es obligatoria.')).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits valid data with backend defaults and no photo', async () => {
    const onSubmit = jest.fn();
    const screen = await render(<AnimalCreateForm onSubmit={onSubmit} />);
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
    const screen = await render(<AnimalCreateForm onSubmit={onSubmit} />);
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
    const screen = await render(<AnimalCreateForm onSubmit={onSubmit} />);
    await fillRequiredFields(screen);
    await fireEvent.changeText(screen.getByLabelText('Fecha de nacimiento'), '2026-02-01');

    await fireEvent.press(screen.getByRole('button', { name: 'Dar de alta' }));

    expect(
      await screen.findByText(
        'La fecha de nacimiento no puede ser posterior a la fecha de ingreso.'
      )
    ).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('displays translated backend errors', async () => {
    const screen = await render(
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
    const screen = await render(<AnimalCreateForm onSubmit={onSubmit} />);

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
    const screen = await render(<AnimalCreateForm onSubmit={() => undefined} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Elegir de galería' }));
    await screen.findByLabelText('Foto de perfil seleccionada para photo.jpg');
    await fireEvent.press(screen.getByRole('button', { name: 'Quitar' }));

    expect(screen.getByLabelText('Sin foto de perfil')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Elegir de galería' })).toBeTruthy();
  });

  it('explains denied photo permissions in Spanish', async () => {
    mockRequestPermissions.mockResolvedValue({ granted: false });
    const screen = await render(<AnimalCreateForm onSubmit={() => undefined} />);

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
    const screen = await render(<AnimalCreateForm onSubmit={() => undefined} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Elegir de galería' }));

    expect(
      await screen.findByText('La foto supera los 10 MB. Elegí una imagen más liviana.')
    ).toBeTruthy();
  });
});
