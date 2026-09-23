import { fireEvent, render, waitFor } from '@testing-library/react-native';

import { ClinicalAttachmentPicker } from './ClinicalAttachmentPicker';

const MOCK_ASSET = {
  uri: 'file:///photo.jpg',
  name: 'photo.jpg',
  mimeType: 'image/jpeg',
  fileSize: 1024,
};

jest.mock('expo-image-picker', () => {
  let permissionGranted = true;
  let nextResult = { canceled: true };
  return {
    MediaTypeOptions: { Images: 'Images' },
    requestMediaLibraryPermissionsAsync: jest.fn(async () => ({ granted: permissionGranted })),
    launchImageLibraryAsync: jest.fn(async () => nextResult),
    __setPermissionGranted(value: boolean) {
      permissionGranted = value;
    },
    __setResult(result: { canceled: boolean; assets?: unknown[] }) {
      nextResult = result;
    },
  };
});

const expoImagePicker = jest.requireMock('expo-image-picker');

describe('ClinicalAttachmentPicker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    expoImagePicker.__setPermissionGranted(true);
    expoImagePicker.__setResult({ canceled: true });
  });

  it('picks an image and reports it to the parent', async () => {
    const onChange = jest.fn();
    expoImagePicker.__setResult({ canceled: false, assets: [MOCK_ASSET] });
    const screen = await render(
      <ClinicalAttachmentPicker onChange={onChange} onRemoveExisting={jest.fn()} value={[]} />
    );

    await fireEvent.press(screen.getByLabelText('Adjuntar archivo'));

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith([
        { uri: 'file:///photo.jpg', name: 'photo.jpg', mimeType: 'image/jpeg', size: 1024 },
      ]);
    });
  });

  it('rejects a file larger than 10 MB', async () => {
    const onChange = jest.fn();
    expoImagePicker.__setResult({
      canceled: false,
      assets: [{ ...MOCK_ASSET, fileSize: 11 * 1024 * 1024 }],
    });
    const screen = await render(
      <ClinicalAttachmentPicker onChange={onChange} onRemoveExisting={jest.fn()} value={[]} />
    );

    await fireEvent.press(screen.getByLabelText('Adjuntar archivo'));

    expect(
      await screen.findByText('Un archivo supera los 10 MB. Elige archivos más livianos.')
    ).toBeTruthy();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('disables the button when the attachment limit is reached', async () => {
    const onChange = jest.fn();
    const value = Array.from({ length: 10 }, (_, index) => ({
      uri: `file:///f${index}.jpg`,
      name: `f${index}.jpg`,
      mimeType: 'image/jpeg',
    }));
    const screen = await render(
      <ClinicalAttachmentPicker onChange={onChange} onRemoveExisting={jest.fn()} value={value} />
    );

    expect(screen.getByLabelText('Adjuntar otro archivo')).toBeDisabled();
    await fireEvent.press(screen.getByLabelText('Adjuntar otro archivo'));
    expect(onChange).not.toHaveBeenCalled();
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
