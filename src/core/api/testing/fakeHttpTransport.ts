import type { HttpTransport, HttpTransportResponse } from '../client';

export interface FakeHttpRequest {
  body: BodyInit | null | undefined;
  headers: Record<string, string>;
  method: string;
  url: URL;
}

export interface FakeHttpResponse {
  body?: unknown;
  headers?: Record<string, string>;
  status?: number;
}

export type FakeHttpHandler = (
  request: FakeHttpRequest
) => FakeHttpResponse | Promise<FakeHttpResponse>;

export type FakeHttpRoutes = Record<string, FakeHttpHandler>;

function responseFromFake(response: FakeHttpResponse): HttpTransportResponse {
  const status = response.status ?? 200;
  const headers = new Map(
    Object.entries(response.headers ?? {}).map(([key, value]) => [key.toLowerCase(), value])
  );

  return {
    headers: { get: (name) => headers.get(name.toLowerCase()) ?? null },
    ok: status >= 200 && status < 300,
    status,
    text: async () => (response.body === undefined ? '' : JSON.stringify(response.body)),
  };
}

export function createFakeHttpTransport(routes: FakeHttpRoutes): HttpTransport {
  return async (rawUrl, init) => {
    const url = new URL(rawUrl);
    const method = (init.method ?? 'GET').toUpperCase();
    const route = routes[`${method} ${url.pathname}`];
    if (route === undefined) {
      return responseFromFake({
        body: { code: 'FAKE_ROUTE_NOT_FOUND' },
        status: 404,
      });
    }

    return responseFromFake(
      await route({
        body: init.body,
        headers: init.headers as Record<string, string>,
        method,
        url,
      })
    );
  };
}
