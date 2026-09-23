import { fireEvent, render, waitFor } from '@testing-library/react-native';

import { ClinicalAttachmentPicker } from './ClinicalAttachmentPicker';

const MOCK_ASSET = {
  uri: 'file:///photo.jpg',
  fileName: 'photo.jpg',
  mimeType: 'image/jpeg',
  fileSize: 1024,
};

jest.mock('expo-document-picker', () => ({
  getDocumentAsync: jest.fn(async () => ({ canceled: true })),
}));

jest.mock('expo-image-picker', () => ({
  MediaTypeOptions: { Images: 'Images' },
  requestCameraPermissionsAsync: jest.fn(async () => ({ granted: true })),
  requestMediaLibraryPermissionsAsync: jest.fn(async () => ({ granted: true })),
  launchCameraAsync: jest.fn(async () => ({ canceled: true })),
  launchImageLibraryAsync: jest.fn(async () => ({ canceled: true })),
}));

const documentPicker = jest.requireMock('expo-document-picker');
const imagePicker = jest.requireMock('expo-image-picker');

describe('ClinicalAttachmentPicker', () => {
  beforeEach(() => jest.clearAllMocks());

  it('picks an image from the gallery', async () => {
    const onChange = jest.fn();
    imagePicker.launchImageLibraryAsync.mockResolvedValue({
      canceled: false,
      assets: [MOCK_ASSET],
    });
    const screen = await render(
      <ClinicalAttachmentPicker onChange={onChange} onRemoveExisting={jest.fn()} value={[]} />
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Elegir imagen' }));

    await waitFor(() =>
      expect(onChange).toHaveBeenCalledWith([
        { uri: 'file:///photo.jpg', name: 'photo.jpg', mimeType: 'image/jpeg', size: 1024 },
      ])
    );
  });

  it('picks a PDF document', async () => {
    const onChange = jest.fn();
    documentPicker.getDocumentAsync.mockResolvedValue({
      canceled: false,
      assets: [
        { uri: 'file:///report.pdf', name: 'report.pdf', mimeType: 'application/pdf', size: 2048 },
      ],
    });
    const screen = await render(
      <ClinicalAttachmentPicker onChange={onChange} onRemoveExisting={jest.fn()} value={[]} />
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Elegir PDF' }));

    await waitFor(() =>
      expect(onChange).toHaveBeenCalledWith([
        {
          uri: 'file:///report.pdf',
          name: 'report.pdf',
          mimeType: 'application/pdf',
          size: 2048,
        },
      ])
    );
  });

  it('explains denied camera permission', async () => {
    imagePicker.requestCameraPermissionsAsync.mockResolvedValue({ granted: false });
    const screen = await render(
      <ClinicalAttachmentPicker onChange={jest.fn()} onRemoveExisting={jest.fn()} value={[]} />
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Tomar foto' }));

    expect(
      await screen.findByText('Necesitamos acceso a la cámara para fotografiar el documento.')
    ).toBeTruthy();
  });

  it('rejects a file larger than 10 MB', async () => {
    imagePicker.launchImageLibraryAsync.mockResolvedValue({
      canceled: false,
      assets: [{ ...MOCK_ASSET, fileSize: 11 * 1024 * 1024 }],
    });
    const screen = await render(
      <ClinicalAttachmentPicker onChange={jest.fn()} onRemoveExisting={jest.fn()} value={[]} />
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Elegir imagen' }));

    expect(
      await screen.findByText('Un archivo supera los 10 MB. Elegí archivos más livianos.')
    ).toBeTruthy();
  });

  it('disables every source when the attachment limit is reached', async () => {
    const value = Array.from({ length: 10 }, (_, index) => ({
      uri: `file:///f${index}.jpg`,
      name: `f${index}.jpg`,
      mimeType: 'image/jpeg',
    }));
    const screen = await render(
      <ClinicalAttachmentPicker onChange={jest.fn()} onRemoveExisting={jest.fn()} value={value} />
    );

    for (const name of ['Tomar foto', 'Elegir imagen', 'Elegir PDF']) {
      expect(screen.getByRole('button', { name })).toBeDisabled();
    }
  });

  it('allows removing an existing attachment', async () => {
    const onRemoveExisting = jest.fn();
    const screen = await render(
      <ClinicalAttachmentPicker
        existing={[{ id: 'media-1', name: 'rx.jpg', secureUrl: 'https://cdn.test/rx.jpg' }]}
        onChange={() => undefined}
        onRemoveExisting={onRemoveExisting}
        value={[]}
      />
    );

    await fireEvent.press(screen.getByLabelText('Quitar rx.jpg'));
    expect(onRemoveExisting).toHaveBeenCalledWith('media-1');
  });
});
