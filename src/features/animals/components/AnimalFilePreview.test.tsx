import { fireEvent, render } from '@testing-library/react-native';

import type { AnimalFile } from '../types';

import { AnimalFilePreview } from './AnimalFilePreview';

function imageFile(): AnimalFile {
  return {
    id: 'file-1',
    name: 'luna.jpg',
    secureUrl: 'https://res.cloudinary.com/demo/image/upload/luna.jpg',
    isImage: true,
    bytes: 2048,
    format: 'jpg',
  };
}

function pdfFile(): AnimalFile {
  return {
    id: 'file-2',
    name: 'estudio.pdf',
    secureUrl: 'https://res.cloudinary.com/demo/raw/upload/estudio.pdf',
    isImage: false,
    bytes: null,
    format: 'pdf',
  };
}

describe('AnimalFilePreview', () => {
  it('renders the image preview with an accessible label', async () => {
    const screen = await render(
      <AnimalFilePreview
        canDelete={false}
        file={imageFile()}
        onClose={jest.fn()}
        onRequestDelete={jest.fn()}
        visible
      />
    );

    expect(screen.getByTestId('animal-file-preview')).toBeTruthy();
    expect(screen.getByTestId('animal-file-preview-image')).toBeTruthy();
    expect(screen.getByLabelText('Vista previa de luna.jpg')).toBeTruthy();
    expect(screen.queryByTestId('animal-file-preview-open')).toBeNull();
  });

  it('offers a safe external open for PDFs', async () => {
    const openExternal = jest.fn();
    const screen = await render(
      <AnimalFilePreview
        canDelete={false}
        file={pdfFile()}
        onClose={jest.fn()}
        onRequestDelete={jest.fn()}
        openExternal={openExternal}
        visible
      />
    );

    expect(screen.getByText('PDF')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('animal-file-preview-open'));
    expect(openExternal).toHaveBeenCalledWith(pdfFile());
  });

  it('forwards deletion instead of executing it', async () => {
    const onRequestDelete = jest.fn();
    const screen = await render(
      <AnimalFilePreview
        canDelete
        file={imageFile()}
        onClose={jest.fn()}
        onRequestDelete={onRequestDelete}
        visible
      />
    );

    await fireEvent.press(screen.getByTestId('animal-file-preview-delete'));
    expect(onRequestDelete).toHaveBeenCalledWith('file-1');
  });

  it('hides deletion without permission but keeps the preview', async () => {
    const screen = await render(
      <AnimalFilePreview
        canDelete={false}
        file={imageFile()}
        onClose={jest.fn()}
        onRequestDelete={jest.fn()}
        visible
      />
    );

    expect(screen.queryByTestId('animal-file-preview-delete')).toBeNull();
    expect(screen.getByTestId('animal-file-preview-image')).toBeTruthy();
  });

  it('closes from the close action and the backdrop', async () => {
    const onClose = jest.fn();
    const screen = await render(
      <AnimalFilePreview
        canDelete={false}
        file={imageFile()}
        onClose={onClose}
        onRequestDelete={jest.fn()}
        visible
      />
    );

    await fireEvent.press(screen.getByTestId('animal-file-preview-close'));
    await fireEvent.press(screen.getByTestId('animal-file-preview-backdrop'));
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
