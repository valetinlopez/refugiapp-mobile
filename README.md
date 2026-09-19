# Refugiapp Mobile

Aplicacion movil de Refugiapp construida con **Expo (SDK 57) + React Native + TypeScript estricto** y **Expo Router** como sistema de navegacion basado en archivos.

Este modulo es el frontend movil que consume la API del backend Refugiapp bajo el prefijo `/api/v1`. La referencia de arquitectura y contratos esta en `architecture.md` del backend (`@backend-architecture`).

## Requisitos

- Node.js >= 20.18.1 (alineado con el backend)
- npm >= 10
- Cuenta de Expo y la app **Expo Go** instalada en el dispositivo o emulador
- (Opcional) Backend Refugiapp corriendo localmente en el puerto `3000` para development

## Instalacion

```bash
npm ci
```

Los ficheros `.env.*` reales no se versionan (solo se publica `.env.example` como plantilla). Crear los ficheros locales de cada ambiente copiando la plantilla y ajustando valores:

```bash
cp .env.example .env.development   # ambiente development (default)
cp .env.example .env.staging
cp .env.example .env.production
```

> Ajustar `EXPO_PUBLIC_API_URL` en cada fichero segun la tabla de ambientes. En `.env.staging` y `.env.production` la URL debe ser https y apuntar al backend real.

## Ambientes

La app soporta tres ambientes configurables: `development`, `staging` y `production`. Cada ambiente define su propia URL de API, nombre visible, scheme de deep-linking y bundle identifier.

| Ambiente     | Script                 | API URL                                  | Bundle identifier               | Scheme                 | Nombre visible     |
| ------------ | ---------------------- | ---------------------------------------- | ------------------------------- | ---------------------- | ------------------ |
| development  | `npm run start:development` | `http://localhost:3000/api/v1` (ver nota) | `app.refugiapp.mobile.dev`      | `refugiappmobile-dev` | Refugiapp (Dev)    |
| staging      | `npm run start:staging`     | `https://staging-api.refugiapp.app/api/v1` | `app.refugiapp.mobile.staging`  | `refugiappmobile-staging` | Refugiapp (Staging) |
| production   | `npm run start:production`  | `https://api.refugiapp.app/api/v1`        | `app.refugiapp.mobile`          | `refugiappmobile`    | Refugiapp          |

> **Nota sobre development y la URL local:** en `development`, si no se define `EXPO_PUBLIC_API_URL`, la URL se resuelve automaticamente en `src/core/config/env.ts`:
>
> - iOS simulador / web: `http://localhost:3000/api/v1`
> - Android emulador: `http://10.0.2.2:3000/api/v1`
>
> Para un **dispositivo fisico** (Expo Go), apuntar a la IP de LAN de la maquina creando `.env.local` (no se versiona):
>
> ```bash
> EXPO_PUBLIC_API_URL=http://192.168.1.50:3000/api/v1
> ```

### Configuracion por ambiente

Los valores se cargan con `dotenv-cli` al arrancar y se inyectan en el bundle mediante el prefijo `EXPO_PUBLIC_` (Metro). `app.config.ts` lee `EXPO_PUBLIC_ENV` para derivar el bundle identifier, scheme y nombre de cada ambiente.

| Variable                 | Obligatoria | Descripcion                                                                  |
| ------------------------ | ----------- | ---------------------------------------------------------------------------- |
| `EXPO_PUBLIC_ENV`        | Si          | `development` \| `staging` \| `production`. Default: `development`            |
| `EXPO_PUBLIC_API_URL`    | Si*         | URL base de la API. Debe terminar en `/api/v1`; https en staging/production. |

\* En `development` puede omitirse (usa el fallback local). En `staging` y `production` es obligatoria.

Las variables se validan al arranque con **zod** en `src/core/config/env.ts`. Un valor invalido detiene la app con un error claro (fail-fast).

## Arranque

```bash
npm start            # equivale a npm run start:development
npm run start:development
npm run start:staging
npm run start:production
```

Al ejecutar `npm start` se levanta el Metro bundler. Escanear el QR con **Expo Go** (Android) o la camara (iOS) para abrir la app en el ambiente development.

Otras variantes:

```bash
npm run android     # development + emulador Android
npm run ios         # development + simulador iOS
npm run web         # development + web
```

## Scripts

| Script              | Descripcion                                              |
| ------------------- | -------------------------------------------------------- |
| `npm start`         | Arranca Expo en el ambiente development                  |
| `npm run start:development` | Arranca Expo en development                              |
| `npm run start:staging`     | Arranca Expo en staging                                  |
| `npm run start:production`  | Arranca Expo en production                               |
| `npm run android`   | Arranca en Android emulator (development)                |
| `npm run ios`       | Arranca en iOS simulator (development)                   |
| `npm run web`       | Arranca en navegador (development)                       |
| `npm run typecheck` | `tsc --noEmit` (TypeScript estricto)                     |
| `npm run lint`      | ESLint con `eslint-config-expo`, sin warnings permitidos |
| `npm run lint:fix`  | Corrige problemas de lint automaticamente                |
| `npm test`          | Jest (unit tests)                                        |
| `npm run test:watch`| Jest en modo watch                                       |

## Estructura del proyecto

```text
app/                    # Rutas de Expo Router (navegacion por archivos)
app.config.ts           # Config dinamica por ambiente (nombre, scheme, bundle id, extra)
src/
  components/           # Componentes de UI compartidos
  constants/            # Constantes (colores, etc.)
  core/
    api/                # Cliente HTTP (axios) con interceptor JWT
    config/             # Variables de ambiente tipadas y validadas (zod)
    storage/            # Token storage seguro (expo-secure-store)
  features/             # Features del dominio (auth, animals, ...)
    <feature>/
      api/              # Llamadas a la API
      components/       # Componentes de la feature
      hooks/            # Hooks de la feature
      types/            # Tipos derivados del openapi.json del backend
  shared/               # Componentes/utilities reutilizables entre features
```

Convenciones de arquitectura y seguridad: ver `AGENTS.md` (JWT en secure storage, IDs UUID, montos en centavos, API bajo `/api/v1`, codigo en ingles / docs en espanol).

## Testing

- Unit tests para logica de negocio y config (`src/core/config/env.test.ts`, `src/core/api/client.test.ts`).
- Component tests con React Native Testing Library (tooling ya configurado en `jest.config.js`).
- E2E solo para flujos criticos (login, flujo principal).

## Troubleshooting

- **Puerto 8081 ocupado:** Expo ofrece elegir otro puerto al arrancar. Si se usa otro puerto, Metro no inicia.
- **Cambios de `.env` no reflejados:** las variables `EXPO_PUBLIC_` se inyectan en el bundle; recargar la app completa (shake > Reload) o reiniciar Metro con `npx expo start -c` (clear cache).
- **Android emulator no alcanza localhost:** en development el host se reescribe a `10.0.2.2` automaticamente.
- **Dispositivo fisico no conecta a la API local:** crear `.env.local` con la IP de LAN de la maquina (ver tabla de ambientes).
- **Error de validacion de ambiente:** revisar `EXPO_PUBLIC_ENV` y `EXPO_PUBLIC_API_URL` en el `.env` correspondiente; el mensaje de error indica la variable y el valor esperado.