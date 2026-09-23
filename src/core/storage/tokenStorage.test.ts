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
  const sessionStorageValues = new Map<string, string>();
  const sessionStorageMock: Storage = {
    clear: jest.fn(() => sessionStorageValues.clear()),
    getItem: jest.fn((key: string) => sessionStorageValues.get(key) ?? null),
    key: jest.fn((index: number) => [...sessionStorageValues.keys()][index] ?? null),
    get length() {
      return sessionStorageValues.size;
    },
    removeItem: jest.fn((key: string) => sessionStorageValues.delete(key)),
    setItem: jest.fn((key: string, value: string) => sessionStorageValues.set(key, value)),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorageValues.clear();
    Object.defineProperty(globalThis, 'sessionStorage', {
      configurable: true,
      value: sessionStorageMock,
    });
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

  it('keeps web tokens in session storage so a page reload can restore them', async () => {
    isAvailableMock.mockResolvedValue(false);

    await tokenStorage.setTokens('web-access', 'web-refresh');

    await expect(tokenStorage.getTokens()).resolves.toEqual({
      accessToken: 'web-access',
      refreshToken: 'web-refresh',
    });
    expect(setItemMock).not.toHaveBeenCalled();
    expect(sessionStorageMock.setItem).toHaveBeenCalledWith(
      'refugiapp.authTokenPair',
      JSON.stringify({ accessToken: 'web-access', refreshToken: 'web-refresh' })
    );

    await tokenStorage.clearTokens();
    await expect(tokenStorage.getTokens()).resolves.toBeNull();
    expect(sessionStorageMock.removeItem).toHaveBeenCalledWith('refugiapp.authTokenPair');
  });

  it('rejects malformed web session data', async () => {
    isAvailableMock.mockResolvedValue(false);
    sessionStorageValues.set('refugiapp.authTokenPair', '{"accessToken":"missing-refresh"}');

    await expect(tokenStorage.getTokens()).resolves.toBeNull();
  });
});
