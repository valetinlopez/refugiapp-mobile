import * as SecureStore from 'expo-secure-store';

const TOKEN_PAIR_KEY = 'authTokenPair';
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
      return volatileTokenPair;
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
      volatileTokenPair = pair;
      return;
    }
    await SecureStore.setItemAsync(TOKEN_PAIR_KEY, JSON.stringify(pair));
  },

  async clearTokens(): Promise<void> {
    volatileTokenPair = null;
    if (!(await SecureStore.isAvailableAsync())) {
      return;
    }
    await Promise.all([
      SecureStore.deleteItemAsync(TOKEN_PAIR_KEY),
      SecureStore.deleteItemAsync(LEGACY_ACCESS_TOKEN_KEY),
      SecureStore.deleteItemAsync(LEGACY_REFRESH_TOKEN_KEY),
    ]);
  },
};
