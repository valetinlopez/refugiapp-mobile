import { renderHook, waitFor } from '@testing-library/react-native';

import { useNotificationObserver } from './useNotificationObserver';

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));

jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  getLastNotificationResponse: jest.fn(),
  clearLastNotificationResponse: jest.fn(),
  addNotificationResponseReceivedListener: jest.fn(),
}));

const Notifications = jest.requireMock('expo-notifications') as {
  addNotificationResponseReceivedListener: jest.Mock;
  clearLastNotificationResponse: jest.Mock;
  getLastNotificationResponse: jest.Mock;
};
const { router } = jest.requireMock('expo-router') as { router: { push: jest.Mock } };

const CARE_TASK_ID = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

function responseWith(data: Record<string, unknown>) {
  return { notification: { request: { content: { data } } } };
}

describe('useNotificationObserver', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Notifications.addNotificationResponseReceivedListener.mockReturnValue({ remove: jest.fn() });
  });

  it('navigates to the care task for a cold-start response', async () => {
    Notifications.getLastNotificationResponse.mockReturnValue(
      responseWith({ careTaskId: CARE_TASK_ID })
    );

    await renderHook(() => useNotificationObserver());

    await waitFor(() =>
      expect(router.push).toHaveBeenCalledWith({
        pathname: '/care-tasks/[id]',
        params: { id: CARE_TASK_ID },
      })
    );
    expect(Notifications.clearLastNotificationResponse).toHaveBeenCalled();
  });

  it('does not navigate for a malformed payload', async () => {
    Notifications.getLastNotificationResponse.mockReturnValue(responseWith({ careTaskId: 'nope' }));

    await renderHook(() => useNotificationObserver());

    expect(router.push).not.toHaveBeenCalled();
  });

  it('navigates when a notification is tapped while running', async () => {
    Notifications.getLastNotificationResponse.mockReturnValue(null);
    let listener: ((response: unknown) => void) | undefined;
    Notifications.addNotificationResponseReceivedListener.mockImplementation((callback) => {
      listener = callback;
      return { remove: jest.fn() };
    });

    await renderHook(() => useNotificationObserver());
    listener?.(responseWith({ careTaskId: CARE_TASK_ID }));

    await waitFor(() => expect(router.push).toHaveBeenCalledTimes(1));
  });
});
