import { fireEvent, render, waitFor } from '@testing-library/react-native';

import { AppAvatar } from './AppAvatar';

describe('AppAvatar', () => {
  it('shows initials when no source is provided', async () => {
    const screen = await render(
      <AppAvatar accessibilityLabel="Foto de Luna" initials="LU" size="md" />
    );

    expect(screen.getByLabelText('Foto de Luna')).toHaveTextContent('LU');
    expect(screen.queryByTestId('app-avatar-image')).toBeNull();
  });

  it('renders the image when a source is provided', async () => {
    const screen = await render(
      <AppAvatar
        accessibilityLabel="Foto de Luna"
        initials="LU"
        source={{ uri: 'https://cdn.test/luna.jpg' }}
      />
    );

    expect(screen.getByTestId('app-avatar-image')).toBeTruthy();
  });

  it('falls back to initials when the image fails to load', async () => {
    const screen = await render(
      <AppAvatar
        accessibilityLabel="Foto de Luna"
        initials="LU"
        source={{ uri: 'https://cdn.test/rotto.jpg' }}
      />
    );

    fireEvent(screen.getByTestId('app-avatar-image'), 'error');

    await waitFor(() => {
      expect(screen.queryByTestId('app-avatar-image')).toBeNull();
    });
    expect(screen.getByLabelText('Foto de Luna')).toHaveTextContent('LU');
  });
});
