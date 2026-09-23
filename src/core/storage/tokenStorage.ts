import * as SecureStore from 'expo-secure-store';

const TOKEN_PAIR_KEY = 'authTokenPair';
const WEB_TOKEN_PAIR_KEY = 'refugiapp.authTokenPair';
const LEGACY_ACCESS_TOKEN_KEY = 'accessToken';
const LEGACY_REFRESH_TOKEN_KEY = 'refreshToken';
let volatileTokenPair: TokenPair | null = null;

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

function parseTokenPair(value: string | null): TokenPair | null {
  if (value === null) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(value);
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'accessToken' in parsed &&
      'refreshToken' in parsed &&
      typeof parsed.accessToken === 'string' &&
      typeof parsed.refreshToken === 'string' &&
      parsed.accessToken.length > 0 &&
      parsed.refreshToken.length > 0
    ) {
      return {
        accessToken: parsed.accessToken,
        refreshToken: parsed.refreshToken,
      };
    }
  } catch {
    return null;
  }

  return null;
}

function getWebSessionStorage(): Storage | null {
  try {
    return typeof globalThis.sessionStorage === 'undefined' ? null : globalThis.sessionStorage;
  } catch {
    return null;
  }
}

function getWebTokens(): TokenPair | null {
  const storage = getWebSessionStorage();
  if (storage === null) return volatileTokenPair;

  try {
    return parseTokenPair(storage.getItem(WEB_TOKEN_PAIR_KEY));
  } catch {
    return volatileTokenPair;
  }
}

function setWebTokens(pair: TokenPair): void {
  volatileTokenPair = pair;
  try {
    getWebSessionStorage()?.setItem(WEB_TOKEN_PAIR_KEY, JSON.stringify(pair));
  } catch {
    // In-memory fallback keeps the current tab usable when browser storage is blocked.
  }
}

function clearWebTokens(): void {
  volatileTokenPair = null;
  try {
    getWebSessionStorage()?.removeItem(WEB_TOKEN_PAIR_KEY);
  } catch {
    // There is nothing else to clear when browser storage is blocked.
  }
}

async function migrateLegacyTokens(): Promise<TokenPair | null> {
  const [accessToken, refreshToken] = await Promise.all([
    SecureStore.getItemAsync(LEGACY_ACCESS_TOKEN_KEY),
    SecureStore.getItemAsync(LEGACY_REFRESH_TOKEN_KEY),
  ]);

  if (accessToken === null || refreshToken === null) {
    return null;
  }

  const pair = { accessToken, refreshToken };
  await SecureStore.setItemAsync(TOKEN_PAIR_KEY, JSON.stringify(pair));
  await Promise.all([
    SecureStore.deleteItemAsync(LEGACY_ACCESS_TOKEN_KEY),
    SecureStore.deleteItemAsync(LEGACY_REFRESH_TOKEN_KEY),
  ]);
  return pair;
}

export const tokenStorage = {
  async getTokens(): Promise<TokenPair | null> {
    if (!(await SecureStore.isAvailableAsync())) {
      return getWebTokens();
    }
    const storedPair = parseTokenPair(await SecureStore.getItemAsync(TOKEN_PAIR_KEY));
    return storedPair ?? migrateLegacyTokens();
  },

  async getAccessToken(): Promise<string | null> {
    return (await this.getTokens())?.accessToken ?? null;
  },

  async getRefreshToken(): Promise<string | null> {
    return (await this.getTokens())?.refreshToken ?? null;
  },

  async setTokens(accessToken: string, refreshToken: string): Promise<void> {
    const pair: TokenPair = { accessToken, refreshToken };
    if (!(await SecureStore.isAvailableAsync())) {
      setWebTokens(pair);
      return;
    }
    await SecureStore.setItemAsync(TOKEN_PAIR_KEY, JSON.stringify(pair));
  },

  async clearTokens(): Promise<void> {
    if (!(await SecureStore.isAvailableAsync())) {
      clearWebTokens();
      return;
    }
    volatileTokenPair = null;
    await Promise.all([
      SecureStore.deleteItemAsync(TOKEN_PAIR_KEY),
      SecureStore.deleteItemAsync(LEGACY_ACCESS_TOKEN_KEY),
      SecureStore.deleteItemAsync(LEGACY_REFRESH_TOKEN_KEY),
    ]);
  },
};
