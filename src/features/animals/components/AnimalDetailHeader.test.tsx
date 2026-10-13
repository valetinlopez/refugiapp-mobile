import { fireEvent, render } from '@testing-library/react-native';

import type { Animal } from '@/features/animals/types';

import { AnimalDetailHeader } from './AnimalDetailHeader';

const animal: Pick<Animal, 'breed' | 'name' | 'species' | 'status'> = {
  breed: 'Mestiza de pelo largo',
  name: 'Luna con un nombre muy largo que debe envolver',
  species: 'Perra',
  status: 'under_treatment',
};

describe('AnimalDetailHeader', () => {
  it('presents the full identity and textual status without truncating the name', async () => {
    const screen = await render(<AnimalDetailHeader animal={animal} photoUri={null} />);

    expect(screen.getByRole('header')).toHaveTextContent(animal.name);
    expect(screen.getByRole('header')).not.toHaveProp('numberOfLines');
    expect(screen.getByText('Perra · Mestiza de pelo largo')).toBeTruthy();
    expect(screen.getByText('En tratamiento')).toBeTruthy();
    expect(screen.getByTestId('animal-detail-identity')).toHaveStyle({ minWidth: 128 });
    expect(screen.getByTestId('animal-detail-layout')).toHaveStyle({
      justifyContent: 'center',
    });
    expect(
      screen.getByLabelText(`${animal.name}. Perra · Mestiza de pelo largo. Estado: En tratamiento`)
    ).toHaveProp(
      'accessibilityLabel',
      `${animal.name}. Perra · Mestiza de pelo largo. Estado: En tratamiento`
    );
  });

  it('announces a missing photo and falls back to initials', async () => {
    const screen = await render(<AnimalDetailHeader animal={animal} photoUri={null} />);

    expect(screen.getByLabelText(`Sin foto de ${animal.name}`)).toHaveTextContent('LU');
    expect(screen.queryByTestId('app-avatar-image')).toBeNull();
  });

  it('shows the animal photo when it is available', async () => {
    const screen = await render(
      <AnimalDetailHeader animal={animal} photoUri="https://cdn.test/luna.jpg" />
    );

    expect(screen.getByLabelText(`Foto de ${animal.name}`)).toBeTruthy();
    expect(screen.getByTestId('app-avatar-image')).toBeTruthy();
  });

  it('offers a fullscreen preview trigger when a handler is provided', async () => {
    const onPreviewPhoto = jest.fn();
    const screen = await render(
      <AnimalDetailHeader
        animal={animal}
        onPreviewPhoto={onPreviewPhoto}
        photoUri="https://cdn.test/luna.jpg"
      />
    );

    await fireEvent.press(screen.getByTestId('animal-photo-preview-trigger'));
    expect(onPreviewPhoto).toHaveBeenCalledTimes(1);
  });

  it('hides the preview trigger without a photo or handler', async () => {
    const withoutPhoto = await render(<AnimalDetailHeader animal={animal} photoUri={null} />);
    expect(withoutPhoto.queryByTestId('animal-photo-preview-trigger')).toBeNull();

    const withoutHandler = await render(
      <AnimalDetailHeader animal={animal} photoUri="https://cdn.test/luna.jpg" />
    );
    expect(withoutHandler.queryByTestId('animal-photo-preview-trigger')).toBeNull();
  });
});
