import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import type { PropsWithChildren } from 'react';

import { ApiError } from '@/core/api';

import { notificationsApi } from '../api/notificationsApi';
import type { NotificationPreferences } from '../types';

import { NotificationPreferencesSection } from './NotificationPreferencesSection';

jest.mock('@react-native-community/datetimepicker', () => {
  const React = jest.requireActual<typeof import('react')>('react');
  const { Text } = jest.requireActual<typeof import('react-native')>('react-native');
  return { __esModule: true, default: () => React.createElement(Text, null, 'picker') };
});

const PREFERENCES: NotificationPreferences = {
  overdueEnabled: true,
  upcomingEnabled: true,
  upcomingWindowMinutes: 60,
  quietStart: null,
  quietEnd: null,
  timezone: 'America/Argentina/Buenos_Aires',
};

describe('NotificationPreferencesSection', () => {
  let queryClient: QueryClient;

  function wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        mutations: { retry: false, gcTime: 0 },
        queries: { retry: false, gcTime: 0 },
      },
    });
    jest.spyOn(notificationsApi, 'getPreferences').mockResolvedValue(PREFERENCES);
    jest.spyOn(notificationsApi, 'updatePreferences').mockResolvedValue(PREFERENCES);
  });

  afterEach(() => {
    queryClient.clear();
    queryClient.unmount();
    jest.restoreAllMocks();
  });

  it('loads the persisted preferences', async () => {
    const screen = await render(<NotificationPreferencesSection />, { wrapper });
    expect(await screen.findByText('Tareas vencidas')).toBeTruthy();
    expect(screen.getByText('60 minutos antes')).toBeTruthy();
  });

  it('saves the edited preferences and clears quiet hours with null', async () => {
    const screen = await render(<NotificationPreferencesSection />, { wrapper });
    await screen.findByText('Tareas vencidas');

    await fireEvent(screen.getByTestId('preferences-overdue'), 'valueChange', false);
    await fireEvent.press(screen.getByTestId('preferences-save'));

    await waitFor(() =>
      expect(notificationsApi.updatePreferences).toHaveBeenCalledWith(
        expect.objectContaining({
          overdueEnabled: false,
          quietStart: null,
          quietEnd: null,
        })
      )
    );
  });

  it('sends quiet hours when the toggle is enabled', async () => {
    const screen = await render(<NotificationPreferencesSection />, { wrapper });
    await screen.findByText('Tareas vencidas');

    await fireEvent(screen.getByTestId('preferences-quiet'), 'valueChange', true);
    await fireEvent.press(screen.getByTestId('preferences-save'));

    await waitFor(() =>
      expect(notificationsApi.updatePreferences).toHaveBeenCalledWith(
        expect.objectContaining({ quietStart: '22:00', quietEnd: '07:00' })
      )
    );
  });

  it('shows an actionable server error instead of staying on the loading state', async () => {
    jest
      .spyOn(notificationsApi, 'getPreferences')
      .mockRejectedValue(
        new ApiError({ code: 'HTTP_500', message: 'server', requestId: 'r', status: 500 })
      );

    const screen = await render(<NotificationPreferencesSection />, { wrapper });

    await screen.findByText('No se pudieron cargar', undefined, { timeout: 3000 });
    expect(screen.getByText('Reintentar')).toBeTruthy();
    expect(screen.queryByText('Cargando preferencias')).toBeNull();
    expect(screen.queryByText('Tareas vencidas')).toBeNull();
  });

  it('shows the offline state when the request fails without connectivity', async () => {
    jest
      .spyOn(notificationsApi, 'getPreferences')
      .mockRejectedValue(
        new ApiError({ code: 'NETWORK_ERROR', message: 'offline', requestId: 'r', status: 0 })
      );

    const screen = await render(<NotificationPreferencesSection />, { wrapper });

    await screen.findByText('Sin conexión', undefined, { timeout: 3000 });
    expect(screen.getByText('Reintentar')).toBeTruthy();
    expect(screen.queryByText('Cargando preferencias')).toBeNull();
  });

  it('recovers when the retry succeeds', async () => {
    const getPreferences = jest
      .spyOn(notificationsApi, 'getPreferences')
      .mockRejectedValueOnce(
        new ApiError({ code: 'HTTP_500', message: 'server', requestId: 'r', status: 500 })
      )
      .mockRejectedValueOnce(
        new ApiError({ code: 'HTTP_500', message: 'server', requestId: 'r', status: 500 })
      )
      .mockResolvedValue(PREFERENCES);

    const screen = await render(<NotificationPreferencesSection />, { wrapper });
    await screen.findByText('No se pudieron cargar', undefined, { timeout: 3000 });

    await fireEvent.press(screen.getByText('Reintentar'));

    expect(await screen.findByText('Tareas vencidas', undefined, { timeout: 3000 })).toBeTruthy();
    expect(getPreferences).toHaveBeenCalled();
  });
});
