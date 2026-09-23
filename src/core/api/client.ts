import { config } from '@/core/config';
import { tokenStorage, type TokenPair } from '@/core/storage';

import { ApiError, createResponseError, normalizeTransportError } from './errors';
import { createRequestId } from './requestId';

const IDEMPOTENT_METHODS = new Set(['GET', 'HEAD', 'OPTIONS', 'PUT', 'DELETE']);
const RETRYABLE_STATUS_CODES = new Set([500, 502, 503, 504]);

export interface HttpTransportResponse {
  readonly headers: { get(name: string): string | null };
  readonly ok: boolean;
  readonly status: number;
  text(): Promise<string>;
}

export interface HttpTransportOptions {
  onUploadProgress?(progress: number): void;
}

export type HttpTransport = (
  url: string,
  init: RequestInit,
  options?: HttpTransportOptions
) => Promise<HttpTransportResponse>;

export interface HttpResponse<T> {
  data: T;
  headers: HttpTransportResponse['headers'];
  requestId: string;
  status: number;
}

export interface HttpRequestOptions {
  auth?: boolean;
  headers?: Record<string, string>;
  onUploadProgress?(progress: number): void;
  params?: Record<string, boolean | number | string | null | undefined>;
  retry?: number;
  signal?: AbortSignal;
  timeoutMs?: number;
}

export interface TokenStorageAdapter {
  clearTokens(): Promise<void>;
  getTokens(): Promise<TokenPair | null>;
  setTokens(accessToken: string, refreshToken: string): Promise<void>;
}

interface HttpClientOptions {
  baseUrl: string;
  defaultRetries?: number;
  timeoutMs: number;
  tokenStore: TokenStorageAdapter;
  transport?: HttpTransport;
}

type SessionInvalidatedHandler = () => void | Promise<void>;

function defaultTransport(
  url: string,
  init: RequestInit,
  options?: HttpTransportOptions
): Promise<HttpTransportResponse> {
  if (options?.onUploadProgress !== undefined) {
    return xhrTransport(url, init, options.onUploadProgress);
  }
  return fetch(url, init);
}

function xhrTransport(
  url: string,
  init: RequestInit,
  onUploadProgress: (progress: number) => void
): Promise<HttpTransportResponse> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open(init.method ?? 'GET', url);
    new Headers(init.headers).forEach((value, key) => request.setRequestHeader(key, value));
    request.upload.onprogress = ({ lengthComputable, loaded, total }) => {
      if (lengthComputable && total > 0) {
        onUploadProgress(Math.min(1, loaded / total));
      }
    };
    request.onload = () => {
      onUploadProgress(1);
      const headers = new Headers();
      for (const line of request
        .getAllResponseHeaders()
        .trim()
        .split(/[\r\n]+/)) {
        const separator = line.indexOf(':');
        if (separator > 0) {
          headers.append(line.slice(0, separator).trim(), line.slice(separator + 1).trim());
        }
      }
      resolve({
        headers,
        ok: request.status >= 200 && request.status < 300,
        status: request.status,
        text: async () => request.responseText,
      });
    };
    request.onerror = () => reject(new Error('Upload request failed'));
    request.onabort = () => reject(new Error('Upload request aborted'));
    init.signal?.addEventListener('abort', () => request.abort(), { once: true });
    request.send((init.body as XMLHttpRequestBodyInit | null | undefined) ?? null);
  });
}

function isFormData(body: unknown): body is FormData {
  return typeof FormData !== 'undefined' && body instanceof FormData;
}

function buildUrl(baseUrl: string, path: string, params?: HttpRequestOptions['params']): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(`${baseUrl}${normalizedPath}`);

  for (const [key, value] of Object.entries(params ?? {})) {
    if (value !== null && value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  }

  return url.toString();
}

async function parseResponseBody(response: HttpTransportResponse): Promise<unknown> {
  if (response.status === 204) {
    return undefined;
  }

  const text = await response.text();
  if (text.length === 0) {
    return undefined;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function toRequestBody(body: unknown): BodyInit | undefined {
  if (body === undefined) {
    return undefined;
  }
  if (isFormData(body) || typeof body === 'string') {
    return body;
  }
  return JSON.stringify(body);
}

export class HttpClient {
  private readonly baseUrl: string;
  private readonly defaultRetries: number;
  private readonly timeoutMs: number;
  private readonly tokenStore: TokenStorageAdapter;
  private readonly transport: HttpTransport;
  private refreshPromise: Promise<string> | null = null;
  private sessionInvalidatedHandler: SessionInvalidatedHandler | null = null;

  constructor(options: HttpClientOptions) {
    this.baseUrl = options.baseUrl;
    this.defaultRetries = options.defaultRetries ?? 1;
    this.timeoutMs = options.timeoutMs;
    this.tokenStore = options.tokenStore;
    this.transport = options.transport ?? defaultTransport;
  }

  setSessionInvalidatedHandler(handler: SessionInvalidatedHandler | null): () => void {
    this.sessionInvalidatedHandler = handler;
    return () => {
      if (this.sessionInvalidatedHandler === handler) {
        this.sessionInvalidatedHandler = null;
      }
    };
  }

  get<T>(path: string, options?: HttpRequestOptions): Promise<HttpResponse<T>> {
    return this.request<T>('GET', path, undefined, options);
  }

  post<T>(path: string, body?: unknown, options?: HttpRequestOptions): Promise<HttpResponse<T>> {
    return this.request<T>('POST', path, body, options);
  }

  put<T>(path: string, body?: unknown, options?: HttpRequestOptions): Promise<HttpResponse<T>> {
    return this.request<T>('PUT', path, body, options);
  }

  patch<T>(path: string, body?: unknown, options?: HttpRequestOptions): Promise<HttpResponse<T>> {
    return this.request<T>('PATCH', path, body, options);
  }

  delete<T>(path: string, options?: HttpRequestOptions): Promise<HttpResponse<T>> {
    return this.request<T>('DELETE', path, undefined, options);
  }

  async request<T>(
    method: string,
    path: string,
    body?: unknown,
    options: HttpRequestOptions = {}
  ): Promise<HttpResponse<T>> {
    const upperMethod = method.toUpperCase();
    const requestId = createRequestId();
    const retryLimit = IDEMPOTENT_METHODS.has(upperMethod)
      ? Math.max(0, options.retry ?? this.defaultRetries)
      : 0;
    let retryCount = 0;
    let refreshAttempted = false;

    while (true) {
      let response: HttpTransportResponse;
      try {
        response = await this.send(upperMethod, path, body, options, requestId);
      } catch (error) {
        if (retryCount < retryLimit) {
          retryCount += 1;
          continue;
        }
        throw normalizeTransportError(error, requestId);
      }

      if (response.status === 401 && options.auth !== false && !refreshAttempted) {
        refreshAttempted = true;
        await this.refreshAccessToken();
        continue;
      }

      if (RETRYABLE_STATUS_CODES.has(response.status) && retryCount < retryLimit) {
        retryCount += 1;
        continue;
      }

      const data = await parseResponseBody(response);
      if (!response.ok) {
        throw createResponseError(response.status, data, response.headers, requestId);
      }

      return {
        data: data as T,
        headers: response.headers,
        requestId,
        status: response.status,
      };
    }
  }

  private async send(
    method: string,
    path: string,
    body: unknown,
    options: HttpRequestOptions,
    requestId: string
  ): Promise<HttpTransportResponse> {
    const tokenPair = options.auth === false ? null : await this.tokenStore.getTokens();
    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...options.headers,
      'x-request-id': requestId,
    };
    if (tokenPair !== null) {
      headers.Authorization = `Bearer ${tokenPair.accessToken}`;
    }
    if (body !== undefined && !isFormData(body)) {
      headers['Content-Type'] = headers['Content-Type'] ?? 'application/json';
    }

    const requestBody = toRequestBody(body);
    const controller = new AbortController();
    const abortFromCaller = () => controller.abort();
    options.signal?.addEventListener('abort', abortFromCaller, { once: true });
    if (options.signal?.aborted === true) {
      controller.abort();
    }
    const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? this.timeoutMs);
    const init: RequestInit = {
      headers,
      method,
      signal: controller.signal,
    };
    if (requestBody !== undefined) {
      init.body = requestBody;
    }

    try {
      return await this.transport(buildUrl(this.baseUrl, path, options.params), init, {
        ...(options.onUploadProgress !== undefined
          ? { onUploadProgress: options.onUploadProgress }
          : {}),
      });
    } finally {
      clearTimeout(timeout);
      options.signal?.removeEventListener('abort', abortFromCaller);
    }
  }

  private refreshAccessToken(): Promise<string> {
    this.refreshPromise ??= this.performRefresh().finally(() => {
      this.refreshPromise = null;
    });
    return this.refreshPromise;
  }

  private async performRefresh(): Promise<string> {
    const tokenPair = await this.tokenStore.getTokens();
    if (tokenPair === null) {
      await this.invalidateSession();
      throw new ApiError({
        code: 'SESSION_EXPIRED',
        message: 'Tu sesión venció. Inicia sesión nuevamente.',
        requestId: createRequestId(),
        status: 401,
      });
    }

    const requestId = createRequestId();
    try {
      const response = await this.send(
        'POST',
        '/auth/refresh',
        { refreshToken: tokenPair.refreshToken },
        { auth: false, retry: 0 },
        requestId
      );
      const data = await parseResponseBody(response);
      if (!response.ok) {
        throw createResponseError(response.status, data, response.headers, requestId);
      }
      if (
        typeof data !== 'object' ||
        data === null ||
        !('accessToken' in data) ||
        !('refreshToken' in data) ||
        typeof data.accessToken !== 'string' ||
        typeof data.refreshToken !== 'string'
      ) {
        throw new Error('Invalid refresh response');
      }

      await this.tokenStore.setTokens(data.accessToken, data.refreshToken);
      return data.accessToken;
    } catch (error) {
      await this.invalidateSession();
      if (error instanceof ApiError) {
        throw error;
      }
      throw normalizeTransportError(error, requestId);
    }
  }

  private async invalidateSession(): Promise<void> {
    await this.tokenStore.clearTokens();
    await this.sessionInvalidatedHandler?.();
  }
}

export function createHttpClient(options: HttpClientOptions): HttpClient {
  return new HttpClient(options);
}

export const apiClient = createHttpClient({
  baseUrl: config.apiBaseUrl,
  timeoutMs: config.apiTimeoutMs,
  tokenStore: tokenStorage,
});
