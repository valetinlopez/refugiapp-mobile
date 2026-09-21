import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { Button, Text, View } from 'react-native';

import { tokenStorage } from '@/core/storage';

import { authApi } from '../api/authApi';
import type { User, UserRole } from '../types';
import { SessionProvider, useSession } from './SessionProvider';

function createUser(roles: UserRole[]): User {
  return {
    email: 'member@refugiapp.local',
    id: '52f45f39-c7b5-4a1a-aa37-ed0fdf203c91',
    roles,
  };
}

function SessionHarness() {
  const { signIn, signOut, status, user } = useSession();
  return (
    <View>
      <Text testID="status">{status}</Text>
      <Text testID="roles">{user?.roles.join(',') ?? ''}</Text>
      <Button
        title="Sign in"
        onPress={() =>
          void signIn({
            email: 'member@refugiapp.local',
            password: 'secure-password',
          })
        }
      />
      <Button title="Sign out" onPress={() => void signOut()} />
    </View>
  );
}

async function renderSession() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <SessionHarness />
      </SessionProvider>
    </QueryClientProvider>
  );
}

describe('SessionProvider', () => {
  beforeEach(() => {
    jest.spyOn(tokenStorage, 'getTokens').mockResolvedValue(null);
    jest.spyOn(tokenStorage, 'getRefreshToken').mockResolvedValue(null);
    jest.spyOn(tokenStorage, 'setTokens').mockResolvedValue(undefined);
    jest.spyOn(tokenStorage, 'clearTokens').mockResolvedValue(undefined);
    jest.spyOn(authApi, 'login').mockResolvedValue({
      accessToken: 'access-token',
      expiresIn: '1d',
      refreshExpiresIn: '30d',
      refreshToken: 'refresh-token',
      tokenType: 'Bearer',
    });
    jest.spyOn(authApi, 'logout').mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it.each<UserRole>(['admin', 'shelter_manager', 'veterinarian'])(
    'logs in a user with the %s role',
    async (role) => {
      jest.spyOn(authApi, 'getCurrentUser').mockResolvedValue(createUser([role]));
      const screen = await renderSession();
      await waitFor(() =>
        expect(screen.getByTestId('status')).toHaveTextContent('unauthenticated')
      );

      await fireEvent.press(screen.getByText('Sign in'));

      await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('authenticated'));
      expect(screen.getByTestId('roles')).toHaveTextContent(role);
      expect(tokenStorage.setTokens).toHaveBeenCalledWith('access-token', 'refresh-token');
    }
  );

  it('restores a valid stored session', async () => {
    const user = createUser(['admin']);
    jest.mocked(tokenStorage.getTokens).mockResolvedValue({
      accessToken: 'stored-access',
      refreshToken: 'stored-refresh',
    });
    jest.spyOn(authApi, 'getCurrentUser').mockResolvedValue(user);

    const screen = await renderSession();

    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('authenticated'));
    expect(screen.getByTestId('roles')).toHaveTextContent('admin');
  });

  it('clears an invalid stored session', async () => {
    jest.mocked(tokenStorage.getTokens).mockResolvedValue({
      accessToken: 'invalid-access',
      refreshToken: 'invalid-refresh',
    });
    jest.spyOn(authApi, 'getCurrentUser').mockRejectedValue(new Error('unauthorized'));

    const screen = await renderSession();

    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('unauthenticated'));
    expect(tokenStorage.clearTokens).toHaveBeenCalled();
  });

  it('always clears the device session when logout is offline', async () => {
    jest.mocked(tokenStorage.getTokens).mockResolvedValue({
      accessToken: 'stored-access',
      refreshToken: 'stored-refresh',
    });
    jest.mocked(tokenStorage.getRefreshToken).mockResolvedValue('stored-refresh');
    jest.spyOn(authApi, 'getCurrentUser').mockResolvedValue(createUser(['veterinarian']));
    jest.mocked(authApi.logout).mockRejectedValue(new Error('offline'));
    const screen = await renderSession();
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('authenticated'));

    await fireEvent.press(screen.getByText('Sign out'));

    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('unauthenticated'));
    expect(tokenStorage.clearTokens).toHaveBeenCalled();
  });
});
