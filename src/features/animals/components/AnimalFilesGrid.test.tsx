import { fireEvent, render } from '@testing-library/react-native';

import type { AnimalFile } from '../types';

import { AnimalFilesGrid, type AnimalFilesGridProps } from './AnimalFilesGrid';

function createFile(overrides: Partial<AnimalFile> = {}): AnimalFile {
  return {
    id: 'file-1',
    name: 'luna',
    secureUrl: 'https://res.cloudinary.com/demo/image/upload/luna.jpg',
    isImage: true,
    bytes: null,
    format: 'jpg',
    ...overrides,
  };
}

function renderGrid(overrides: Partial<AnimalFilesGridProps> = {}) {
  const props: AnimalFilesGridProps = {
    canDelete: true,
    files: [createFile()],
    hasNextPage: false,
    isError: false,
    isFetchingNextPage: false,
    isOffline: false,
    isPending: false,
    isRefreshing: false,
    onDelete: jest.fn(),
    onLoadMore: jest.fn(),
    onRefresh: jest.fn(),
    onRetry: jest.fn(),
    ...overrides,
  };
  return render(<AnimalFilesGrid {...props} />);
}

describe('AnimalFilesGrid', () => {
  it('renders images without a document glyph', async () => {
    const screen = await renderGrid();

    expect(screen.getByText('luna')).toBeTruthy();
    expect(screen.queryByText('PDF', { includeHiddenElements: true })).toBeNull();
  });

  it('renders a document glyph for PDF files', async () => {
    const pdf = createFile({
      id: 'file-2',
      name: 'estudio.pdf',
      isImage: false,
      format: 'pdf',
      secureUrl: 'https://res.cloudinary.com/demo/raw/upload/estudio.pdf',
    });
    const screen = await renderGrid({ files: [pdf] });

    expect(screen.getByText('PDF', { includeHiddenElements: true })).toBeTruthy();
    expect(screen.getByText('estudio.pdf')).toBeTruthy();
  });

  it('requires confirmation before deleting a file', async () => {
    const onDelete = jest.fn();
    const screen = await renderGrid({ onDelete });

    await fireEvent.press(screen.getByTestId('animal-file-remove-file-1'));
    expect(onDelete).not.toHaveBeenCalled();

    await fireEvent.press(screen.getByTestId('confirm-accept'));
    expect(onDelete).toHaveBeenCalledWith('file-1');
  });

  it('hides the remove action when the role cannot delete', async () => {
    const screen = await renderGrid({ canDelete: false });

    expect(screen.queryByTestId('animal-file-remove-file-1')).toBeNull();
  });

  it('shows an empty state when the animal has no files', async () => {
    const screen = await renderGrid({ files: [] });

    expect(screen.getByText('Sin archivos')).toBeTruthy();
  });

  it('distinguishes offline from server errors', async () => {
    const offline = await renderGrid({ isError: true, isOffline: true, files: [] });
    expect(offline.getByTestId('offline-state')).toBeTruthy();

    const server = await renderGrid({ isError: true, isOffline: false, files: [] });
    expect(server.getByText('No se pudieron cargar los archivos')).toBeTruthy();
  });

  it('offers to load more files when more pages are available', async () => {
    const onLoadMore = jest.fn();
    const screen = await renderGrid({ hasNextPage: true, onLoadMore });

    await fireEvent.press(screen.getByTestId('animal-files-load-more'));

    expect(onLoadMore).toHaveBeenCalledTimes(1);
  });
});
