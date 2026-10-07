import { onlineManager, QueryClient, QueryClientProvider } from '@tanstack/react-query';
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
    id: '52f45f39-c7b5-4a1a-aa37-ed0fdf203c91',
    email: EMAIL,
    firstName: 'Member',
    lastName: 'Refugiapp',
    roles,
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
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
    onlineManager.setOnline(true);
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
    onlineManager.setOnline(true);
    jest.restoreAllMocks();
  });

  it('shows the account identity with Spanish role labels', async () => {
    const screen = await renderAccount();

    await waitFor(() => expect(screen.getByText(EMAIL)).toBeTruthy());
    expect(screen.getByText('Member Refugiapp')).toBeTruthy();
    expect(screen.getByText('Administrador')).toBeTruthy();
    expect(screen.getByText('Veterinario')).toBeTruthy();
    expect(screen.getByText('En línea')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Cerrar sesión' })).toBeTruthy();
  });

  it('opens the detailed profile from the identity card', async () => {
    const onOpenProfile = jest.fn();
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const screen = await render(
      <QueryClientProvider client={queryClient}>
        <SessionProvider>
          <AccountScreen onOpenProfile={onOpenProfile} />
        </SessionProvider>
      </QueryClientProvider>
    );
    await waitFor(() => expect(screen.getByText(EMAIL)).toBeTruthy());

    fireEvent.press(screen.getByRole('button', { name: 'Abrir Mi perfil' }));

    expect(onOpenProfile).toHaveBeenCalledTimes(1);
  });

  it('renders management and notifications in the redesigned hierarchy', async () => {
    const screen = await render(
      <QueryClientProvider
        client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
      >
        <SessionProvider>
          <AccountScreen
            heading="Más"
            management={<Text>Gestión</Text>}
            notifications={<Text>Notificaciones</Text>}
          />
        </SessionProvider>
      </QueryClientProvider>
    );

    await waitFor(() => expect(screen.getByText('Gestión')).toBeTruthy());
    expect(screen.getByText('Aplicación')).toBeTruthy();
    expect(screen.getByText('Notificaciones')).toBeTruthy();
  });

  it('expands the application information accessibly', async () => {
    const screen = await renderAccount();
    await waitFor(() => expect(screen.getByText(EMAIL)).toBeTruthy());

    const about = screen.getByRole('button', { name: 'Acerca de Refugiapp' });
    expect(about.props.accessibilityState).toEqual({ expanded: false });

    await fireEvent.press(about);

    expect(screen.getByTestId('about-content')).toBeTruthy();
    expect(
      screen.getByRole('button', { name: 'Acerca de Refugiapp' }).props.accessibilityState
    ).toEqual({
      expanded: true,
    });
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
