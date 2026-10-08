import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { Linking } from 'react-native';

import { AnimalFileUploader } from './AnimalFileUploader';

jest.mock('expo-image-picker', () => ({
  MediaTypeOptions: { Images: 'Images' },
  launchCameraAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
  requestCameraPermissionsAsync: jest.fn(),
  requestMediaLibraryPermissionsAsync: jest.fn(),
}));

jest.mock('expo-document-picker', () => ({
  getDocumentAsync: jest.fn(),
}));

const mockImagePicker = ImagePicker as jest.Mocked<typeof ImagePicker>;
const mockDocumentPicker = DocumentPicker as jest.Mocked<typeof DocumentPicker>;

describe('AnimalFileUploader', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when the role cannot upload', async () => {
    const screen = await render(<AnimalFileUploader canUpload={false} onSelect={jest.fn()} />);

    expect(screen.queryByTestId('animal-files-add')).toBeNull();
  });

  it('emits the picked image with its normalized name', async () => {
    mockImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
      granted: true,
      canAskAgain: true,
    } as never);
    mockImagePicker.launchImageLibraryAsync.mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file:///photo', fileName: 'photo', mimeType: 'image/jpeg', fileSize: 100 }],
    } as never);
    const onSelect = jest.fn();
    const screen = await render(<AnimalFileUploader canUpload onSelect={onSelect} />);

    await fireEvent.press(screen.getByTestId('animal-files-add'));
    await fireEvent.press(screen.getByTestId('animal-files-add-gallery'));

    await waitFor(() =>
      expect(onSelect).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'photo.jpg', mimeType: 'image/jpeg' })
      )
    );
  });

  it('explains a denied permission and offers settings when blocked', async () => {
    mockImagePicker.requestCameraPermissionsAsync.mockResolvedValue({
      granted: false,
      canAskAgain: false,
    } as never);
    const openSettings = jest.spyOn(Linking, 'openSettings').mockResolvedValue(undefined);
    const screen = await render(<AnimalFileUploader canUpload onSelect={jest.fn()} />);

    await fireEvent.press(screen.getByTestId('animal-files-add'));
    await fireEvent.press(screen.getByTestId('animal-files-add-camera'));

    const openSettingsButton = await screen.findByRole('button', { name: 'Abrir ajustes' });
    await fireEvent.press(openSettingsButton);

    expect(openSettings).toHaveBeenCalledTimes(1);
  });

  it('rejects an unsupported document before uploading', async () => {
    mockDocumentPicker.getDocumentAsync.mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file:///notes.txt', name: 'notes.txt', mimeType: 'text/plain', size: 10 }],
    } as never);
    const onSelect = jest.fn();
    const screen = await render(<AnimalFileUploader canUpload onSelect={onSelect} />);

    await fireEvent.press(screen.getByTestId('animal-files-add'));
    await fireEvent.press(screen.getByTestId('animal-files-add-document'));

    await waitFor(() =>
      expect(
        screen.getByText('Solo podés subir imágenes JPEG, PNG o WebP y documentos PDF.')
      ).toBeTruthy()
    );
    expect(onSelect).not.toHaveBeenCalled();
  });
});
