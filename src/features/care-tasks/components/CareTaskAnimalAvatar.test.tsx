import { render } from '@testing-library/react-native';

import { useAnimalOptionPhoto } from '@/application/animals';

import { CareTaskAnimalAvatar } from './CareTaskAnimalAvatar';

jest.mock('@/application/animals', () => ({
  useAnimalOptionPhoto: jest.fn(),
}));

const mockUseAnimalOptionPhoto = useAnimalOptionPhoto as jest.Mock;

describe('CareTaskAnimalAvatar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAnimalOptionPhoto.mockReturnValue({ data: undefined });
  });

  it('renders the resolved profile photo', async () => {
    mockUseAnimalOptionPhoto.mockReturnValue({ data: 'https://cdn.test/luna.jpg' });
    const screen = await render(
      <CareTaskAnimalAvatar name="Luna" profilePhotoMediaId="media-id" />
    );

    expect(mockUseAnimalOptionPhoto).toHaveBeenCalledWith('media-id');
    expect(screen.getByTestId('app-avatar-image')).toHaveProp('source', [
      { uri: 'https://cdn.test/luna.jpg' },
    ]);
    expect(screen.getByLabelText('Foto de Luna')).toBeTruthy();
  });

  it('falls back to initials when there is no profile photo', async () => {
    const screen = await render(<CareTaskAnimalAvatar name="Luna" profilePhotoMediaId={null} />);

    expect(mockUseAnimalOptionPhoto).toHaveBeenCalledWith(null);
    expect(screen.getByLabelText('Sin foto de Luna')).toBeTruthy();
    expect(screen.getByText('LU')).toBeTruthy();
  });
});
