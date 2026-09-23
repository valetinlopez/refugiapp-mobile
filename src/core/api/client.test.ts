import type { TokenPair } from '@/core/storage';

import { createHttpClient, type TokenStorageAdapter } from './client';
import { ApiError } from './errors';
import { createFakeHttpTransport } from './testing/fakeHttpTransport';

function createTokenStore(initial: TokenPair | null = null): TokenStorageAdapter & {
  clearTokens: jest.MockedFunction<() => Promise<void>>;
  setTokens: jest.MockedFunction<(access: string, refresh: string) => Promise<void>>;
} {
  let current = initial;
  return {
    clearTokens: jest.fn(async () => {
      current = null;
    }),
    getTokens: jest.fn(async () => current),
    setTokens: jest.fn(async (accessToken, refreshToken) => {
      current = { accessToken, refreshToken };
    }),
  };
}

describe('HttpClient', () => {
  it('adds Authorization and a UUID x-request-id to every request', async () => {
    const tokenStore = createTokenStore({ accessToken: 'access', refreshToken: 'refresh' });
    let capturedHeaders: Record<string, string> = {};
    const client = createHttpClient({
      baseUrl: 'https://api.test/api/v1',
      timeoutMs: 1000,
      tokenStore,
      transport: createFakeHttpTransport({
        'GET /api/v1/animals': ({ headers }) => {
          capturedHeaders = headers;
          return { body: [] };
        },
      }),
    });

    await client.get('/animals');

    expect(capturedHeaders.Authorization).toBe('Bearer access');
    expect(capturedHeaders['x-request-id']).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
    );
  });

  it('retries idempotent requests once but never retries POST', async () => {
    let getCalls = 0;
    let postCalls = 0;
    const client = createHttpClient({
      baseUrl: 'https://api.test/api/v1',
      timeoutMs: 1000,
      tokenStore: createTokenStore(),
      transport: createFakeHttpTransport({
        'GET /api/v1/animals': () => {
          getCalls += 1;
          return getCalls === 1 ? { status: 500 } : { body: [] };
        },
        'POST /api/v1/animals': () => {
          postCalls += 1;
          return { status: 500 };
        },
      }),
    });

    await expect(client.get('/animals')).resolves.toMatchObject({ status: 200 });
    await expect(client.post('/animals', { name: 'Luna' })).rejects.toBeInstanceOf(ApiError);
    expect(getCalls).toBe(2);
    expect(postCalls).toBe(1);
  });

  it('lets fetch set the multipart boundary', async () => {
    let capturedHeaders: Record<string, string> = {};
    const client = createHttpClient({
      baseUrl: 'https://api.test/api/v1',
      timeoutMs: 1000,
      tokenStore: createTokenStore(),
      transport: createFakeHttpTransport({
        'POST /api/v1/media/upload': ({ headers }) => {
          capturedHeaders = headers;
          return { body: { id: 'asset-id' } };
        },
      }),
    });

    await client.post('/media/upload', new FormData());

    expect(capturedHeaders['Content-Type']).toBeUndefined();
  });

  it('forwards multipart progress without changing the form boundary', async () => {
    const onUploadProgress = jest.fn();
    const client = createHttpClient({
      baseUrl: 'https://api.test/api/v1',
      timeoutMs: 1000,
      tokenStore: createTokenStore(),
      transport: async (_url, init, options) => {
        expect(new Headers(init.headers).has('Content-Type')).toBe(false);
        options?.onUploadProgress?.(0.5);
        return {
          headers: new Headers(),
          ok: true,
          status: 201,
          text: async () => JSON.stringify({ id: 'asset-id' }),
        };
      },
    });

    await client.post('/media/upload', new FormData(), { onUploadProgress });

    expect(onUploadProgress).toHaveBeenCalledWith(0.5);
  });

  it('shares one refresh across concurrent 401 responses and retries each request once', async () => {
    const tokenStore = createTokenStore({
      accessToken: 'expired-access',
      refreshToken: 'valid-refresh',
    });
    let animalCalls = 0;
    let refreshCalls = 0;
    let releaseUnauthorizedRequests: (() => void) | undefined;
    const bothUnauthorized = new Promise<void>((resolve) => {
      releaseUnauthorizedRequests = resolve;
    });

    const client = createHttpClient({
      baseUrl: 'https://api.test/api/v1',
      timeoutMs: 1000,
      tokenStore,
      transport: createFakeHttpTransport({
        'GET /api/v1/animals': ({ headers }) => {
          animalCalls += 1;
          if (animalCalls === 2) {
            releaseUnauthorizedRequests?.();
          }
          return headers.Authorization === 'Bearer fresh-access'
            ? { body: [] }
            : { body: { code: 'UNAUTHORIZED' }, status: 401 };
        },
        'POST /api/v1/auth/refresh': async () => {
          refreshCalls += 1;
          await bothUnauthorized;
          return {
            body: {
              accessToken: 'fresh-access',
              expiresIn: '1d',
              refreshExpiresIn: '30d',
              refreshToken: 'fresh-refresh',
              tokenType: 'Bearer',
            },
          };
        },
      }),
    });

    await Promise.all([client.get('/animals'), client.get('/animals')]);

    expect(refreshCalls).toBe(1);
    expect(animalCalls).toBe(4);
    expect(tokenStore.setTokens).toHaveBeenCalledTimes(1);
    expect(tokenStore.setTokens).toHaveBeenCalledWith('fresh-access', 'fresh-refresh');
  });

  it('clears the device session and notifies the app when refresh fails', async () => {
    const tokenStore = createTokenStore({ accessToken: 'expired', refreshToken: 'revoked' });
    const invalidated = jest.fn();
    const client = createHttpClient({
      baseUrl: 'https://api.test/api/v1',
      timeoutMs: 1000,
      tokenStore,
      transport: createFakeHttpTransport({
        'GET /api/v1/users/me': () => ({ status: 401 }),
        'POST /api/v1/auth/refresh': () => ({ status: 401 }),
      }),
    });
    client.setSessionInvalidatedHandler(invalidated);

    await expect(client.get('/users/me')).rejects.toBeInstanceOf(ApiError);

    expect(tokenStore.clearTokens).toHaveBeenCalledTimes(1);
    expect(invalidated).toHaveBeenCalledTimes(1);
  });
});
