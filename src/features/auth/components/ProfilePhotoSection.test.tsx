import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import type { PermissionResponse, PermissionStatus } from 'expo-image-picker';
import * as ImagePicker from 'expo-image-picker';
import { Linking } from 'react-native';

import { tokenStorage } from '@/core/storage';

import { authApi } from '../api/authApi';
import { profileApi } from '../api/profileApi';
import { SessionProvider } from '../session/SessionProvider';
import type { User } from '../types';
import { ProfilePhotoSection } from './ProfilePhotoSection';

jest.mock('expo-image-picker', () => ({
  MediaTypeOptions: { Images: 'Images' },
  launchCameraAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
  requestCameraPermissionsAsync: jest.fn(),
  requestMediaLibraryPermissionsAsync: jest.fn(),
}));

const requestLibrary = ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock<
  Promise<PermissionResponse>
>;
const launchLibrary = ImagePicker.launchImageLibraryAsync as jest.Mock;

const USER_ID = '52f45f39-c7b5-4a1a-aa37-ed0fdf203c91';
const MEDIA_ID = '7fa85f64-5717-4562-b3fc-2c963f66afa6';

function createUser(overrides: Partial<User> = {}): User {
  return {
    createdAt: '2026-09-07T15:00:00.000Z',
    email: 'andres@refugiapp.org',
    firstName: 'Andrés',
    id: USER_ID,
    isActive: true,
    lastName: 'Borrego',
    profilePhotoMediaId: null,
    roles: ['shelter_manager'],
    updatedAt: '2026-09-21T15:00:00.000Z',
    ...overrides,
  };
}

function permission(status: 'granted' | 'denied', canAskAgain: boolean): PermissionResponse {
  return {
    canAskAgain,
    expires: 'never',
    granted: status === 'granted',
    status: status as PermissionStatus,
  };
}

function pickedAsset() {
  return {
    canceled: false as const,
    assets: [
      {
        fileName: 'avatar.jpg',
        fileSize: 120_000,
        mimeType: 'image/jpeg',
        uri: 'file:///avatar.jpg',
      },
    ],
  };
}

async function renderSection(user: User) {
  jest.spyOn(tokenStorage, 'getTokens').mockResolvedValue({
    accessToken: 'stored-access',
    refreshToken: 'stored-refresh',
  });
  jest.spyOn(authApi, 'getCurrentUser').mockResolvedValue(user);
  const getAvatar = jest
    .spyOn(profileApi, 'getAvatarAsset')
    .mockResolvedValue({ id: MEDIA_ID, secureUrl: 'https://cloudinary.test/avatar.jpg' });

  const screen = await render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      <SessionProvider>
        <ProfilePhotoSection user={user} />
      </SessionProvider>
    </QueryClientProvider>
  );
  await waitFor(() => expect(screen.getByTestId('profile-photo-section')).toBeTruthy());
  return { getAvatar, screen };
}

describe('ProfilePhotoSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('shows initials fallback when the user has no photo and never fetches media', async () => {
    const { getAvatar, screen } = await renderSection(createUser());

    expect(screen.getByLabelText('Iniciales de Andrés Borrego')).toBeTruthy();
    expect(getAvatar).not.toHaveBeenCalled();
  });

  it('shows the remote photo label once the avatar asset resolves', async () => {
    const { screen } = await renderSection(createUser({ profilePhotoMediaId: MEDIA_ID }));

    await waitFor(() =>
      expect(screen.getByLabelText('Foto de perfil de Andrés Borrego')).toBeTruthy()
    );
  });

  it('explains a deniable gallery permission and allows retrying', async () => {
    requestLibrary.mockResolvedValueOnce(permission('denied', true));
    const { screen } = await renderSection(createUser());

    await fireEvent.press(screen.getByRole('button', { name: 'Cambiar foto' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Elegir de galería' }));

    expect(
      await screen.findByText('Necesitamos acceso a tus fotos para elegir tu foto de perfil.')
    ).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Abrir ajustes' })).toBeNull();
  });

  it('offers device settings when the gallery permission is permanently blocked', async () => {
    const openSettings = jest.spyOn(Linking, 'openSettings').mockResolvedValueOnce(undefined);
    requestLibrary.mockResolvedValueOnce(permission('denied', false));
    const { screen } = await renderSection(createUser());

    await fireEvent.press(screen.getByRole('button', { name: 'Cambiar foto' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Elegir de galería' }));

    expect(
      await screen.findByText(
        'El acceso a tus fotos está bloqueado. Habilitalo en los ajustes del dispositivo para elegir una imagen.'
      )
    ).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: 'Abrir ajustes' }));
    expect(openSettings).toHaveBeenCalled();
  });

  it('confirms a picked photo, links it and refreshes the session', async () => {
    requestLibrary.mockResolvedValueOnce(permission('granted', true));
    launchLibrary.mockResolvedValueOnce(pickedAsset());
    const upload = jest
      .spyOn(profileApi, 'uploadOrphanAvatar')
      .mockResolvedValue({ id: MEDIA_ID, secureUrl: 'https://cloudinary.test/avatar.jpg' });
    const update = jest
      .spyOn(profileApi, 'updatePhoto')
      .mockResolvedValue(createUser({ profilePhotoMediaId: MEDIA_ID }));
    const { screen } = await renderSection(createUser());
    const getCurrentUser = jest.mocked(authApi.getCurrentUser);
    getCurrentUser.mockResolvedValueOnce(createUser({ profilePhotoMediaId: MEDIA_ID }));

    await fireEvent.press(screen.getByRole('button', { name: 'Cambiar foto' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Elegir de galería' }));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Confirmar foto' })).toBeTruthy()
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Confirmar foto' }));

    await waitFor(() => expect(upload).toHaveBeenCalledTimes(1));
    expect(update).toHaveBeenCalledWith(USER_ID, MEDIA_ID);
    await waitFor(() => expect(screen.getByText('Foto de perfil actualizada.')).toBeTruthy());
  });

  it('asks for confirmation before removing the current photo', async () => {
    const update = jest
      .spyOn(profileApi, 'updatePhoto')
      .mockResolvedValue(createUser({ profilePhotoMediaId: null }));
    const { screen } = await renderSection(createUser({ profilePhotoMediaId: MEDIA_ID }));

    await waitFor(() =>
      expect(screen.getByLabelText('Foto de perfil de Andrés Borrego')).toBeTruthy()
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Quitar' }));

    expect(screen.getByText('Quitar foto de perfil')).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: 'Quitar foto' }));

    await waitFor(() => expect(update).toHaveBeenCalledWith(USER_ID, null));
  });
});
