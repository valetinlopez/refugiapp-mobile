import { fireEvent, render, waitFor } from '@testing-library/react-native';
import type { PermissionResponse, PermissionStatus } from 'expo-image-picker';
import * as ImagePicker from 'expo-image-picker';
import { Linking } from 'react-native';

import { ProfilePhotoPicker } from './ProfilePhotoPicker';

jest.mock('expo-image-picker', () => ({
  MediaTypeOptions: { Images: 'Images' },
  launchImageLibraryAsync: jest.fn(),
  requestCameraPermissionsAsync: jest.fn(),
  requestMediaLibraryPermissionsAsync: jest.fn(),
}));

const requestMediaLibrary = ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock<
  Promise<PermissionResponse>
>;
const launchImageLibrary = ImagePicker.launchImageLibraryAsync as jest.Mock;

function permissionResponse(
  status: 'granted' | 'denied',
  canAskAgain: boolean
): PermissionResponse {
  return {
    status: status as PermissionStatus,
    granted: status === 'granted',
    canAskAgain,
    expires: 'never',
  };
}

describe('ProfilePhotoPicker', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('explains a deniable permission and allows retrying without opening settings', async () => {
    requestMediaLibrary.mockResolvedValueOnce(permissionResponse('denied', true));

    const screen = await render(<ProfilePhotoPicker onChange={() => undefined} value={null} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Elegir de galería' }));

    expect(
      await screen.findByText('Necesitamos acceso a tus fotos para elegir la foto de perfil.')
    ).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Abrir ajustes' })).toBeNull();
  });

  it('offers opening device settings when the permission is permanently blocked', async () => {
    const openSettingsSpy = jest.spyOn(Linking, 'openSettings').mockResolvedValueOnce();
    requestMediaLibrary.mockResolvedValueOnce(permissionResponse('denied', false));

    const screen = await render(<ProfilePhotoPicker onChange={() => undefined} value={null} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Elegir de galería' }));

    expect(
      await screen.findByText(
        'El acceso a tus fotos está bloqueado. Habilitalo en los ajustes del dispositivo para elegir una imagen.'
      )
    ).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: 'Abrir ajustes' }));
    expect(openSettingsSpy).toHaveBeenCalledTimes(1);
  });

  it('infers mime type and normalizes the file name when the picker omits metadata', async () => {
    requestMediaLibrary.mockResolvedValueOnce(permissionResponse('granted', true));
    launchImageLibrary.mockResolvedValueOnce({
      canceled: false,
      assets: [{ uri: 'file:///cache/IMG_001', width: 100, height: 100 }],
    });

    const onChange = jest.fn();
    const screen = await render(<ProfilePhotoPicker onChange={onChange} value={null} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Elegir de galería' }));

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith({
        uri: 'file:///cache/IMG_001',
        name: 'IMG_001.jpg',
        mimeType: 'image/jpeg',
      });
    });
  });

  it('reports a file over the 10 MB limit without selecting it', async () => {
    requestMediaLibrary.mockResolvedValueOnce(permissionResponse('granted', true));
    launchImageLibrary.mockResolvedValueOnce({
      canceled: false,
      assets: [
        {
          uri: 'file:///cache/huge.jpg',
          fileName: 'huge.jpg',
          mimeType: 'image/jpeg',
          fileSize: 11 * 1024 * 1024,
          width: 100,
          height: 100,
        },
      ],
    });

    const onChange = jest.fn();
    const screen = await render(<ProfilePhotoPicker onChange={onChange} value={null} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Elegir de galería' }));

    expect(
      await screen.findByText('La foto supera los 10 MB. Elegí una imagen más liviana.')
    ).toBeTruthy();
    expect(onChange).not.toHaveBeenCalled();
  });
});
