import * as SecureStore from 'expo-secure-store';

import { tokenStorage } from './tokenStorage';

jest.mock('expo-secure-store', () => ({
  deleteItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  isAvailableAsync: jest.fn(),
  setItemAsync: jest.fn(),
}));

const getItemMock = SecureStore.getItemAsync as jest.MockedFunction<
  typeof SecureStore.getItemAsync
>;
const setItemMock = SecureStore.setItemAsync as jest.MockedFunction<
  typeof SecureStore.setItemAsync
>;
const isAvailableMock = SecureStore.isAvailableAsync as jest.MockedFunction<
  typeof SecureStore.isAvailableAsync
>;

describe('tokenStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    isAvailableMock.mockResolvedValue(true);
  });

  it('persists the rotated token pair in one atomic secure-store write', async () => {
    await tokenStorage.setTokens('access-token', 'refresh-token');

    expect(setItemMock).toHaveBeenCalledTimes(1);
    expect(setItemMock).toHaveBeenCalledWith(
      'authTokenPair',
      JSON.stringify({ accessToken: 'access-token', refreshToken: 'refresh-token' })
    );
  });

  it('rejects an incomplete stored pair', async () => {
    getItemMock
      .mockResolvedValueOnce(JSON.stringify({ accessToken: 'only-access' }))
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);

    await expect(tokenStorage.getTokens()).resolves.toBeNull();
  });

  it('uses volatile memory without persisting tokens when SecureStore is unavailable on web', async () => {
    isAvailableMock.mockResolvedValue(false);

    await tokenStorage.setTokens('web-access', 'web-refresh');

    await expect(tokenStorage.getTokens()).resolves.toEqual({
      accessToken: 'web-access',
      refreshToken: 'web-refresh',
    });
    expect(setItemMock).not.toHaveBeenCalled();

    await tokenStorage.clearTokens();
    await expect(tokenStorage.getTokens()).resolves.toBeNull();
  });
});
