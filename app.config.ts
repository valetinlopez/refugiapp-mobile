import type { ConfigContext, ExpoConfig } from 'expo/config';

const APP_VARIANTS = {
  development: {
    name: 'Refugiapp (Dev)',
    scheme: 'refugiappmobile-dev',
    bundleIdentifier: 'app.refugiapp.mobile.dev',
    packageName: 'app.refugiapp.mobile.dev',
  },
  staging: {
    name: 'Refugiapp (Staging)',
    scheme: 'refugiappmobile-staging',
    bundleIdentifier: 'app.refugiapp.mobile.staging',
    packageName: 'app.refugiapp.mobile.staging',
  },
  production: {
    name: 'Refugiapp',
    scheme: 'refugiappmobile',
    bundleIdentifier: 'app.refugiapp.mobile',
    packageName: 'app.refugiapp.mobile',
  },
} as const;

type AppVariant = keyof typeof APP_VARIANTS;

function resolveVariant(raw: string | undefined): AppVariant {
  if (raw === undefined) {
    return 'development';
  }
  if (raw in APP_VARIANTS) {
    return raw as AppVariant;
  }
  throw new Error(
    `Invalid EXPO_PUBLIC_ENV "${raw}". Expected one of: ${Object.keys(APP_VARIANTS).join(', ')}.`
  );
}

export default ({ config }: ConfigContext): ExpoConfig => {
  const variant = resolveVariant(process.env.EXPO_PUBLIC_ENV);
  const app = APP_VARIANTS[variant];

  return {
    ...config,
    name: app.name,
    slug: config.slug ?? 'refugiapp-mobile',
    scheme: app.scheme,
    ios: {
      ...config.ios,
      bundleIdentifier: app.bundleIdentifier,
      supportsTablet: true,
    },
    android: {
      ...config.android,
      package: app.packageName,
      predictiveBackGestureEnabled: false,
    },
    extra: {
      ...config.extra,
      environment: variant,
      apiUrl: process.env.EXPO_PUBLIC_API_URL ?? '',
    },
  };
};
