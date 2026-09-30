import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';

import { tokenStorage } from '@/core/storage';

import { authApi } from '../api/authApi';
import { SessionProvider } from '../session/SessionProvider';
import type { User, UserRole } from '../types';
import { AccountScreen } from './AccountScreen';

const EMAIL = 'member@refugiapp.local';

function createUser(roles: UserRole[]): User {
  return {
    email: EMAIL,
    id: '52f45f39-c7b5-4a1a-aa37-ed0fdf203c91',
    roles,
  };
}

async function renderAccount() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <AccountScreen />
      </SessionProvider>
    </QueryClientProvider>
  );
}

describe('AccountScreen', () => {
  beforeEach(() => {
    jest.spyOn(tokenStorage, 'getTokens').mockResolvedValue({
      accessToken: 'stored-access',
      refreshToken: 'stored-refresh',
    });
    jest.spyOn(tokenStorage, 'getRefreshToken').mockResolvedValue('stored-refresh');
    jest.spyOn(tokenStorage, 'setTokens').mockResolvedValue(undefined);
    jest.spyOn(tokenStorage, 'clearTokens').mockResolvedValue(undefined);
    jest.spyOn(authApi, 'getCurrentUser').mockResolvedValue(createUser(['admin', 'veterinarian']));
    jest.spyOn(authApi, 'logout').mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('shows the account identity with Spanish role labels', async () => {
    const screen = await renderAccount();

    await waitFor(() => expect(screen.getByText(EMAIL)).toBeTruthy());
    expect(screen.getByText('Administrador · Veterinario')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Cerrar sesión' })).toBeTruthy();
  });

  it('renders the slot before the Cuenta section heading', async () => {
    const screen = await render(
      <QueryClientProvider
        client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
      >
        <SessionProvider>
          <AccountScreen heading="Más">
            <Text>Gestión</Text>
          </AccountScreen>
        </SessionProvider>
      </QueryClientProvider>
    );

    await waitFor(() => expect(screen.getByText('Gestión')).toBeTruthy());
    expect(screen.getByText('Cuenta')).toBeTruthy();
    expect(screen.getByText('Cuenta').props.children).not.toBeNull();
  });

  it('confirms sign out and closes the local session', async () => {
    const screen = await renderAccount();
    await waitFor(() => expect(screen.getByText(EMAIL)).toBeTruthy());

    await fireEvent.press(screen.getByRole('button', { name: 'Cerrar sesión' }));
    expect(screen.getByText('¿Querés cerrar sesión?')).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: 'Confirmar cierre de sesión' }));

    await waitFor(() => expect(authApi.logout).toHaveBeenCalledWith('stored-refresh'));
    expect(tokenStorage.clearTokens).toHaveBeenCalled();
  });
});
