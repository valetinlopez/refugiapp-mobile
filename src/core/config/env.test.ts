type PlatformOs = 'ios' | 'android' | 'web';

const ENV_VAR_KEYS = ['EXPO_PUBLIC_ENV', 'EXPO_PUBLIC_API_URL'] as const;

function clearEnv(): void {
  for (const key of ENV_VAR_KEYS) {
    delete process.env[key];
  }
}

function setEnv(values: Record<string, string | undefined>): void {
  clearEnv();
  for (const [key, value] of Object.entries(values)) {
    if (value !== undefined) {
      process.env[key] = value;
    }
  }
}

function loadEnv(os: PlatformOs = 'ios'): typeof import('./env') {
  jest.resetModules();
  jest.doMock('react-native', () => ({
    Platform: { OS: os },
  }));
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- re-evaluates the module after resetModules
  return require('./env');
}

describe('src/core/config/env', () => {
  afterEach(() => {
    clearEnv();
    jest.resetModules();
    jest.dontMock('react-native');
  });

  describe('default development environment', () => {
    it('resolves development with a localhost API URL on iOS', () => {
      setEnv({});

      const { config } = loadEnv('ios');

      expect(config.environment).toBe('development');
      expect(config.isDevelopment).toBe(true);
      expect(config.apiBaseUrl).toBe('http://localhost:3000/api/v1');
    });

    it('resolves the Android emulator API URL on Android', () => {
      setEnv({});

      const { config } = loadEnv('android');

      expect(config.apiBaseUrl).toBe('http://10.0.2.2:3000/api/v1');
    });

    it('rewrites a localhost URL to the Android emulator host on Android', () => {
      setEnv({ EXPO_PUBLIC_API_URL: 'http://localhost:3000/api/v1' });

      const { config } = loadEnv('android');

      expect(config.apiBaseUrl).toBe('http://10.0.2.2:3000/api/v1');
    });
  });

  describe('explicit environments', () => {
    it('parses the staging URL over https', () => {
      setEnv({
        EXPO_PUBLIC_ENV: 'staging',
        EXPO_PUBLIC_API_URL: 'https://staging-api.refugiapp.app/api/v1',
      });

      const { config } = loadEnv();

      expect(config.environment).toBe('staging');
      expect(config.isStaging).toBe(true);
      expect(config.apiBaseUrl).toBe('https://staging-api.refugiapp.app/api/v1');
    });

    it('parses the production URL over https', () => {
      setEnv({
        EXPO_PUBLIC_ENV: 'production',
        EXPO_PUBLIC_API_URL: 'https://api.refugiapp.app/api/v1',
      });

      const { config } = loadEnv();

      expect(config.environment).toBe('production');
      expect(config.isProduction).toBe(true);
      expect(config.apiBaseUrl).toBe('https://api.refugiapp.app/api/v1');
    });
  });

  describe('validation', () => {
    it('rejects an unknown EXPO_PUBLIC_ENV', () => {
      setEnv({ EXPO_PUBLIC_ENV: 'prod' });

      expect(() => loadEnv()).toThrow(/Invalid EXPO_PUBLIC_ENV/);
    });

    it('requires EXPO_PUBLIC_API_URL outside development', () => {
      setEnv({ EXPO_PUBLIC_ENV: 'staging' });

      expect(() => loadEnv()).toThrow(/required for environment "staging"/);
    });

    it('rejects a malformed URL', () => {
      setEnv({
        EXPO_PUBLIC_ENV: 'development',
        EXPO_PUBLIC_API_URL: 'not-a-url',
      });

      expect(() => loadEnv()).toThrow(/valid absolute URL/);
    });

    it('rejects http outside development', () => {
      setEnv({
        EXPO_PUBLIC_ENV: 'staging',
        EXPO_PUBLIC_API_URL: 'http://api.refugiapp.app/api/v1',
      });

      expect(() => loadEnv()).toThrow(/http is only allowed in development/);
    });

    it('rejects http to a non-local host in development', () => {
      setEnv({
        EXPO_PUBLIC_ENV: 'development',
        EXPO_PUBLIC_API_URL: 'http://api.refugiapp.app/api/v1',
      });

      expect(() => loadEnv()).toThrow(/only allowed for local hosts/);
    });

    it('rejects a URL outside the /api/v1 base path', () => {
      setEnv({
        EXPO_PUBLIC_ENV: 'staging',
        EXPO_PUBLIC_API_URL: 'https://staging-api.refugiapp.app/v2',
      });

      expect(() => loadEnv()).toThrow(/\/api\/v1/);
    });
  });
});
