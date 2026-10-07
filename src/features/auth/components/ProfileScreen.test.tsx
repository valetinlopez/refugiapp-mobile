import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

import { formatDateMedium } from '@/components/patterns';
import { tokenStorage } from '@/core/storage';

import { authApi } from '../api/authApi';
import { SessionProvider } from '../session/SessionProvider';
import type { User, UserRole } from '../types';
import { ProfileScreen } from './ProfileScreen';

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));
jest.mock('./AccountHeaderRow', () => ({ AccountHeaderRow: () => null }));

const USER: User = {
  id: '52f45f39-c7b5-4a1a-aa37-ed0fdf203c91',
  email: 'andres@refugiapp.org',
  firstName: 'Andrés',
  lastName: 'Borrego',
  roles: ['shelter_manager'],
  isActive: true,
  createdAt: '2026-09-07T15:00:00.000Z',
  updatedAt: '2026-09-21T15:00:00.000Z',
};

const { router } = jest.requireMock('expo-router') as { router: { push: jest.Mock } };

const ALL_PERMISSION_LABELS = [
  'Gestionar animales',
  'Consultar historias clínicas',
  'Gestionar usuarios internos',
  'Gestionar gastos',
  'Gestionar veterinarios',
  'Gestionar adopciones',
  'Consultar auditoría',
] as const;

const ROLE_PERMISSION_MATRIX = [
  { role: 'admin', visible: ALL_PERMISSION_LABELS },
  {
    role: 'shelter_manager',
    visible: [
      'Gestionar animales',
      'Gestionar gastos',
      'Gestionar veterinarios',
      'Gestionar adopciones',
    ],
  },
  { role: 'veterinarian', visible: ['Consultar historias clínicas'] },
] as const satisfies readonly { role: UserRole; visible: readonly string[] }[];

async function renderProfile() {
  return render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      <SessionProvider>
        <ProfileScreen />
      </SessionProvider>
    </QueryClientProvider>
  );
}

describe('ProfileScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(tokenStorage, 'getTokens').mockResolvedValue({
      accessToken: 'stored-access',
      refreshToken: 'stored-refresh',
    });
    jest.spyOn(tokenStorage, 'getRefreshToken').mockResolvedValue('stored-refresh');
    jest.spyOn(tokenStorage, 'clearTokens').mockResolvedValue(undefined);
    jest.spyOn(authApi, 'getCurrentUser').mockResolvedValue(USER);
    jest.spyOn(authApi, 'logout').mockResolvedValue(undefined);
  });

  afterEach(() => jest.restoreAllMocks());

  it('shows localized identity, status, dates, roles and effective permissions', async () => {
    const screen = await renderProfile();

    await waitFor(() => expect(screen.getByText('Andrés Borrego')).toBeTruthy());
    expect(screen.getAllByText(USER.email).length).toBeGreaterThan(0);
    expect(screen.getByText('Activo')).toBeTruthy();
    expect(screen.getByText('Encargado de refugio')).toBeTruthy();
    expect(screen.getByText(formatDateMedium(USER.createdAt))).toBeTruthy();
    expect(screen.getByText(formatDateMedium(USER.updatedAt))).toBeTruthy();
    expect(screen.getByText('Gestionar animales')).toBeTruthy();
    expect(screen.getByText('Gestionar gastos')).toBeTruthy();
    expect(screen.getByText('Gestionar veterinarios')).toBeTruthy();
    expect(screen.getByText('Gestionar adopciones')).toBeTruthy();
    expect(screen.queryByText('canManageExpenses')).toBeNull();
    expect(screen.queryByText(USER.id)).toBeNull();
    expect(screen.queryByText('Gestionar usuarios internos')).toBeNull();
  });

  it.each(ROLE_PERMISSION_MATRIX)(
    'shows only effective permissions for $role',
    async ({ role, visible }) => {
      jest.mocked(authApi.getCurrentUser).mockResolvedValue({ ...USER, roles: [role] });
      const screen = await renderProfile();
      const visibleLabels = new Set<string>(visible);

      await waitFor(() => expect(screen.getByTestId('profile-screen')).toBeTruthy());
      visible.forEach((label) => expect(screen.getByText(label)).toBeTruthy());
      ALL_PERMISSION_LABELS.filter((label) => !visibleLabels.has(label)).forEach((label) =>
        expect(screen.queryByText(label)).toBeNull()
      );
    }
  );

  it('opens the existing authenticated password change flow', async () => {
    const screen = await renderProfile();
    await waitFor(() => expect(screen.getByText('Andrés Borrego')).toBeTruthy());

    await fireEvent.press(screen.getByRole('button', { name: 'Cambiar contraseña' }));

    expect(router.push).toHaveBeenCalledWith('/account/change-password');
  });

  it('requires confirmation before signing out', async () => {
    const screen = await renderProfile();
    await waitFor(() => expect(screen.getByText('Andrés Borrego')).toBeTruthy());

    await fireEvent.press(screen.getByRole('button', { name: 'Cerrar sesión' }));
    expect(screen.getByText('¿Querés cerrar sesión?')).toBeTruthy();
    expect(authApi.logout).not.toHaveBeenCalled();

    await fireEvent.press(screen.getByRole('button', { name: 'Confirmar cierre de sesión' }));

    await waitFor(() => expect(authApi.logout).toHaveBeenCalledWith('stored-refresh'));
    expect(tokenStorage.clearTokens).toHaveBeenCalled();
  });
});
