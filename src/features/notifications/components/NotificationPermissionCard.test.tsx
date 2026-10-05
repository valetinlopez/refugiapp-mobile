import { fireEvent, render } from '@testing-library/react-native';
import { Linking } from 'react-native';

import { NotificationPermissionCard } from './NotificationPermissionCard';

describe('NotificationPermissionCard', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('asks for permission when denied', async () => {
    const onRequest = jest.fn();
    const screen = await render(
      <NotificationPermissionCard
        isRequesting={false}
        onRequest={onRequest}
        permissionState="denied"
      />
    );

    expect(screen.getByText('Activá las notificaciones')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('notifications-request'));
    expect(onRequest).toHaveBeenCalledTimes(1);
  });

  it('opens system settings when blocked', async () => {
    const openSettings = jest.spyOn(Linking, 'openSettings').mockResolvedValue(undefined);
    const screen = await render(
      <NotificationPermissionCard
        isRequesting={false}
        onRequest={jest.fn()}
        permissionState="blocked"
      />
    );

    expect(screen.getByText('Notificaciones bloqueadas')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('notifications-open-settings'));
    expect(openSettings).toHaveBeenCalledTimes(1);
  });

  it('confirms when permission is granted', async () => {
    const screen = await render(
      <NotificationPermissionCard
        isRequesting={false}
        onRequest={jest.fn()}
        permissionState="granted"
      />
    );

    expect(screen.getByText('Notificaciones activadas')).toBeTruthy();
    expect(screen.queryByTestId('notifications-request')).toBeNull();
  });

  it('explains when push is unavailable', async () => {
    const screen = await render(
      <NotificationPermissionCard
        isRequesting={false}
        onRequest={jest.fn()}
        permissionState="unavailable"
      />
    );

    expect(screen.getByText('Notificaciones no disponibles')).toBeTruthy();
  });
});
