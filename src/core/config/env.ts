import { Platform } from 'react-native';
import { z } from 'zod';

export const APP_ENVIRONMENTS = ['development', 'staging', 'production'] as const;
export type AppEnvironment = (typeof APP_ENVIRONMENTS)[number];

const APP_VERSION = '1.0.0';
const APP_NAME = 'Refugiapp Mobile';

const API_BASE_PATH = '/api/v1';

const DEV_API_URLS: Record<'android' | 'default', string> = {
  android: 'http://10.0.2.2:3000/api/v1',
  default: 'http://localhost:3000/api/v1',
};

const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '10.0.2.2']);

const environmentSchema = z.enum(APP_ENVIRONMENTS);

function parseEnvironment(value: string | undefined): AppEnvironment {
  const result = environmentSchema.safeParse(value ?? 'development');
  if (!result.success) {
    throw new Error(
      `Invalid EXPO_PUBLIC_ENV "${value ?? ''}". Expected one of: ${APP_ENVIRONMENTS.join(
        ', '
      )}.`
    );
  }
  return result.data;
}

function validateApiUrlFormat(
  value: string,
  environment: AppEnvironment
): string | undefined {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return `must be a valid absolute URL, received "${value}"`;
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return `must use http or https, received "${url.protocol}"`;
  }
  if (url.protocol === 'http:' && environment !== 'development') {
    return `http is only allowed in development; use https for ${environment}`;
  }
  if (url.protocol === 'http:' && !LOCAL_HOSTNAMES.has(url.hostname)) {
    return `http is only allowed for local hosts (localhost, 127.0.0.1, 10.0.2.2); received "${value}"`;
  }

  const basePath = url.pathname.endsWith('/')
    ? url.pathname.slice(0, -1)
    : url.pathname;
  if (basePath !== API_BASE_PATH) {
    return `must point to the API base path "${API_BASE_PATH}", received "${url.pathname}"`;
  }

  return undefined;
}

function toAndroidEmulatorUrl(value: string): string {
  const url = new URL(value);
  if (LOCAL_HOSTNAMES.has(url.hostname)) {
    url.hostname = '10.0.2.2';
  }
  return url.toString();
}

function parseApiUrl(
  environment: AppEnvironment,
  value: string | undefined
): string {
  if (value === undefined || value.trim() === '') {
    if (environment === 'development') {
      const fallback =
        DEV_API_URLS[Platform.OS === 'android' ? 'android' : 'default'];
      const error = validateApiUrlFormat(fallback, environment);
      if (error !== undefined) {
        throw new Error(`Invalid development API URL: ${error}`);
      }
      return fallback;
    }
    throw new Error(`EXPO_PUBLIC_API_URL is required for environment "${environment}"`);
  }

  const trimmed = value.trim();
  const error = validateApiUrlFormat(trimmed, environment);
  if (error !== undefined) {
    throw new Error(`Invalid EXPO_PUBLIC_API_URL: ${error}`);
  }

  if (
    environment === 'development' &&
    Platform.OS === 'android' &&
    trimmed.startsWith('http://')
  ) {
    return toAndroidEmulatorUrl(trimmed);
  }

  return trimmed;
}

const environment = parseEnvironment(process.env.EXPO_PUBLIC_ENV);
const apiBaseUrl = parseApiUrl(environment, process.env.EXPO_PUBLIC_API_URL);

export const config = {
  apiBaseUrl,
  environment,
  appName: APP_NAME,
  appVersion: APP_VERSION,
  isDevelopment: environment === 'development',
  isStaging: environment === 'staging',
  isProduction: environment === 'production',
} as const;

export type AppConfig = typeof config;