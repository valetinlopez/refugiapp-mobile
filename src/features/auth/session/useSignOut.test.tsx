import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { Button, Text, View } from 'react-native';

import { tokenStorage } from '@/core/storage';

import { authApi } from '../api/authApi';
import type { User, UserRole } from '../types';
import { SessionProvider, useSession } from './SessionProvider';
import { useSignOut } from './useSignOut';

function createUser(roles: UserRole[]): User {
  return {
    email: 'member@refugiapp.local',
    id: '52f45f39-c7b5-4a1a-aa37-ed0fdf203c91',
    roles,
  };
}

function SignOutHarness() {
  const { status } = useSession();
  const { errorMessage, isSigningOut, signOut } = useSignOut();
  return (
    <View>
      <Text testID="status">{status}</Text>
      <Text testID="signingOut">{isSigningOut ? 'true' : 'false'}</Text>
      <Text testID="error">{errorMessage ?? ''}</Text>
      <Button title="Sign out" onPress={() => void signOut()} />
    </View>
  );
}

async function renderHarness() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <SignOutHarness />
      </SessionProvider>
    </QueryClientProvider>
  );
}

describe('useSignOut', () => {
  beforeEach(() => {
    jest.spyOn(tokenStorage, 'getTokens').mockResolvedValue({
      accessToken: 'stored-access',
      refreshToken: 'stored-refresh',
    });
    jest.spyOn(tokenStorage, 'getRefreshToken').mockResolvedValue('stored-refresh');
    jest.spyOn(tokenStorage, 'setTokens').mockResolvedValue(undefined);
    jest.spyOn(tokenStorage, 'clearTokens').mockResolvedValue(undefined);
    jest.spyOn(authApi, 'getCurrentUser').mockResolvedValue(createUser(['admin']));
    jest.spyOn(authApi, 'logout').mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('closes the local session when the remote logout succeeds', async () => {
    const screen = await renderHarness();
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('authenticated'));

    await fireEvent.press(screen.getByText('Sign out'));

    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('unauthenticated'));
    expect(authApi.logout).toHaveBeenCalledWith('stored-refresh');
    expect(tokenStorage.clearTokens).toHaveBeenCalled();
  });

  it('still closes the local session when the remote logout fails offline', async () => {
    jest.mocked(authApi.logout).mockRejectedValue(new Error('offline'));
    const screen = await renderHarness();
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('authenticated'));

    await fireEvent.press(screen.getByText('Sign out'));

    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('unauthenticated'));
    expect(tokenStorage.clearTokens).toHaveBeenCalled();
    expect(screen.getByTestId('error')).toHaveTextContent('');
  });

  it('reports a safe message when local cleanup itself fails', async () => {
    jest.mocked(tokenStorage.clearTokens).mockRejectedValue(new Error('storage failure'));
    const screen = await renderHarness();
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('authenticated'));

    await fireEvent.press(screen.getByText('Sign out'));

    await waitFor(() =>
      expect(screen.getByTestId('error')).toHaveTextContent(
        'No pudimos cerrar la sesión. Revisá tu conexión e intentá de nuevo.'
      )
    );
  });

  it('locks double taps while signing out', async () => {
    let resolveLogout: (() => void) | undefined;
    jest.mocked(authApi.logout).mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveLogout = resolve;
        })
    );
    const screen = await renderHarness();
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('authenticated'));

    await fireEvent.press(screen.getByText('Sign out'));

    await waitFor(() => expect(screen.getByTestId('signingOut')).toHaveTextContent('true'));
    expect(authApi.logout).toHaveBeenCalledTimes(1);

    resolveLogout?.();
    await waitFor(() => expect(screen.getByTestId('signingOut')).toHaveTextContent('false'));
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('unauthenticated'));
  });
});
