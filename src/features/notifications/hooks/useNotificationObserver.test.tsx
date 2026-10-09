import { renderHook, waitFor } from '@testing-library/react-native';

import * as pushProviderUtils from '../utils/pushProvider';
import type { NotificationsModule } from '../utils/pushProvider';

import { useNotificationObserver } from './useNotificationObserver';

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));

jest.mock('expo-notifications', () => ({
  __esModule: true,
  setNotificationHandler: jest.fn(),
  getLastNotificationResponse: jest.fn(),
  clearLastNotificationResponse: jest.fn(),
  addNotificationResponseReceivedListener: jest.fn(),
}));

const fakeNotifications = jest.requireMock('expo-notifications') as unknown as {
  setNotificationHandler: jest.Mock;
  getLastNotificationResponse: jest.Mock;
  clearLastNotificationResponse: jest.Mock;
  addNotificationResponseReceivedListener: jest.Mock;
};
const { router } = jest.requireMock('expo-router') as { router: { push: jest.Mock } };
const loadModule = jest.fn(() =>
  Promise.resolve(fakeNotifications as unknown as NotificationsModule)
);
const CARE_TASK_ID = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

function responseWith(data: Record<string, unknown>) {
  return { notification: { request: { content: { data } } } };
}

describe('useNotificationObserver', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fakeNotifications.addNotificationResponseReceivedListener.mockReturnValue({
      remove: jest.fn(),
    });
  });

  it('navigates to the care task for a cold-start response', async () => {
    fakeNotifications.getLastNotificationResponse.mockReturnValue(
      responseWith({ careTaskId: CARE_TASK_ID })
    );

    await renderHook(() => useNotificationObserver(loadModule));

    await waitFor(() =>
      expect(router.push).toHaveBeenCalledWith({
        pathname: '/care-tasks/[id]',
        params: { id: CARE_TASK_ID },
      })
    );
    expect(fakeNotifications.clearLastNotificationResponse).toHaveBeenCalled();
  });

  it('does not navigate for a malformed payload', async () => {
    fakeNotifications.getLastNotificationResponse.mockReturnValue(
      responseWith({ careTaskId: 'nope' })
    );

    await renderHook(() => useNotificationObserver(loadModule));

    expect(router.push).not.toHaveBeenCalled();
  });

  it('navigates when a notification is tapped while running', async () => {
    fakeNotifications.getLastNotificationResponse.mockReturnValue(null);
    let listener: ((response: unknown) => void) | undefined;
    fakeNotifications.addNotificationResponseReceivedListener.mockImplementation((callback) => {
      listener = callback;
      return { remove: jest.fn() };
    });

    await renderHook(() => useNotificationObserver(loadModule));
    listener?.(responseWith({ careTaskId: CARE_TASK_ID }));

    await waitFor(() => expect(router.push).toHaveBeenCalledTimes(1));
  });

  it('never loads the push module inside Expo Go', async () => {
    const isExpoGo = jest.spyOn(pushProviderUtils, 'isExpoGo').mockReturnValue(true);
    try {
      await renderHook(() => useNotificationObserver(loadModule));

      expect(loadModule).not.toHaveBeenCalled();
      expect(fakeNotifications.setNotificationHandler).not.toHaveBeenCalled();
      expect(router.push).not.toHaveBeenCalled();
    } finally {
      isExpoGo.mockRestore();
    }
  });
});
