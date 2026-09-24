# Refugiapp Mobile

Aplicacion movil de Refugiapp construida con **Expo (SDK 57) + React Native + TypeScript estricto** y **Expo Router** como sistema de navegacion basado en archivos.

Este modulo es el frontend movil que consume la API del backend Refugiapp bajo el prefijo `/api/v1`. La referencia de arquitectura y contratos esta en `architecture.md` del backend (`@backend-architecture`).

## Documentación viva

- [`architecture.md`](architecture.md): arquitectura, fronteras, dependencias y estado real del móvil.
- [`docs/README.md`](docs/README.md): índice de documentación.
- [`docs/documentation-governance.md`](docs/documentation-governance.md): matriz que indica qué documentos actualizar con cada cambio.
- [`docs/design.md`](docs/design.md): sistema visual y accesibilidad.
- [`docs/decisions/`](docs/decisions/): decisiones de arquitectura y sus trade-offs.
- `AGENTS.md`: reglas globales; cada frontera y feature agrega reglas locales junto a su código.

La documentación se actualiza en el mismo cambio que modifica responsabilidades, contratos, permisos, estructura o decisiones técnicas. Una feature nueva debe incluir su propio `AGENTS.md`.

## Requisitos

- Node.js >= 22.13.0 (mínimo requerido por Expo SDK 57; el backend admite Node.js 20+)
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

| Ambiente    | Script                      | API URL                                    | Bundle identifier              | Scheme                    | Nombre visible      |
| ----------- | --------------------------- | ------------------------------------------ | ------------------------------ | ------------------------- | ------------------- |
| development | `npm run start:development` | `http://localhost:3000/api/v1` (ver nota)  | `app.refugiapp.mobile.dev`     | `refugiappmobile-dev`     | Refugiapp (Dev)     |
| staging     | `npm run start:staging`     | `https://staging-api.refugiapp.app/api/v1` | `app.refugiapp.mobile.staging` | `refugiappmobile-staging` | Refugiapp (Staging) |
| production  | `npm run start:production`  | `https://api.refugiapp.app/api/v1`         | `app.refugiapp.mobile`         | `refugiappmobile`         | Refugiapp           |

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
>
> Alternativa sin editar ficheros: `npm run start:lan` detecta la IP LAN de la maquina en cada arranque y la inyecta (sirve igual en casa y en la oficina). Un `EXPO_PUBLIC_API_URL` explicito en el shell tiene prioridad sobre la deteccion automatica.
>
> En `development` el validador acepta `http` para `localhost`, `127.0.0.1`, `10.0.2.2` e IPs privadas LAN (RFC1918: `10.x.x.x`, `172.16-31.x.x`, `192.168.x.x`). El backend debe escuchar en todas las interfaces (no solo `127.0.0.1`) y el firewall debe permitir el puerto entrante.

### Configuracion por ambiente

Los valores se cargan con `dotenv-cli` al arrancar y se inyectan en el bundle mediante el prefijo `EXPO_PUBLIC_` (Metro). `app.config.ts` lee `EXPO_PUBLIC_ENV` para derivar el bundle identifier, scheme y nombre de cada ambiente.

| Variable                     | Obligatoria | Descripcion                                                                  |
| ---------------------------- | ----------- | ---------------------------------------------------------------------------- |
| `EXPO_PUBLIC_ENV`            | Si          | `development` \| `staging` \| `production`. Default: `development`           |
| `EXPO_PUBLIC_API_URL`        | Si*         | URL base de la API. Debe terminar en `/api/v1`; https en staging/production. |
| `EXPO_PUBLIC_API_TIMEOUT_MS` | No          | Timeout del cliente HTTP en milisegundos. Default: `10000`.                  |

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

Los permisos nativos de cámara y galería se configuran mediante el plugin de `expo-image-picker`. Al cambiar esos textos o dependencias nativas se necesita una nueva compilación; una actualización OTA no modifica los permisos declarados en el binario.

Otras variantes:

```bash
npm run android     # development + emulador Android
npm run ios         # development + simulador iOS
npm run web         # development + web
```

## Compartir con otros dispositivos (tunnel)

Hay dos caminos independientes y es facil confundirlos:

| Camino                   | Que lo resuelve                                     | Cuándo falla                                     |
| ------------------------ | --------------------------------------------------- | ------------------------------------------------ |
| Teléfono → Metro (JS)    | `expo start --tunnel` (ngrok, dominio `exp.direct`) | Red aislada/corporativa que no deja conexion LAN |
| Teléfono → API (`:3000`) | IP LAN o un túnel del backend                       | Otra red, o IP de `.env.local` desactualizada    |

`--tunnel` **solo** publica Metro: cada teléfono igual debe alcanzar la API por su cuenta.

```bash
npm run start:tunnel   # Metro por túnel + API según .env.* / .env.local (simulador o misma LAN)
npm run start:lan      # Metro directo + API por IP LAN detectada automaticamente
npm run start:share    # Metro por túnel + API por IP LAN detectada (misma WiFi, red aislada)
```

Para personas en **otra red** (internet), además hay que publicar el backend. Ejemplos:

```bash
# En ../refugiapp (una terminal)
cloudflared tunnel --url http://localhost:3000   # o: ngrok http 3000
```

Luego, en `.env.local` del móvil:

```bash
EXPO_PUBLIC_API_URL=https://<tunel-publico>/api/v1
```

y reiniciar con `npx expo start --clear` (la URL se inlinea en el bundle). Al ser https, pasa el validador de `development`.

Notas:

- Requiere `@expo/ngrok` (devDependency) para el túnel de Metro; Expo usa su propio authtoken, no hace falta cuenta ngrok.
- La URL pública del backend cambia a cada arranque con túneles gratuitos: actualizar `.env.local` y reiniciar con `--clear`.
- Compartir el QR expone tu backend a internet mientras el túnel esté abierto: sesiones cortas y cerrarlo al terminar.
- Túnel de Metro es más lento que LAN; si falla en Windows, revisar que el antivirus no haya en cuarentena el binario de ngrok (`https://status.ngrok.com`).

## Scripts

| Script                      | Descripcion                                              |
| --------------------------- | -------------------------------------------------------- |
| `npm start`                 | Arranca Expo en el ambiente development                  |
| `npm run start:development` | Arranca Expo en development                              |
| `npm run start:staging`     | Arranca Expo en staging                                  |
| `npm run start:production`  | Arranca Expo en production                               |
| `npm run start:tunnel`      | Arranca Expo con Metro por túnel ngrok (development)     |
| `npm run start:lan`         | Arranca Expo con la API resuelta a la IP LAN detectada   |
| `npm run start:share`       | Arranca Expo con túnel ngrok + API por IP LAN detectada  |
| `npm run android`           | Arranca en Android emulator (development)                |
| `npm run ios`               | Arranca en iOS simulator (development)                   |
| `npm run web`               | Arranca en navegador (development)                       |
| `npm run api:generate`      | Regenera tipos de auth desde el snapshot OpenAPI         |
| `npm run typecheck`         | `tsc --noEmit` (TypeScript estricto)                     |
| `npm run lint`              | ESLint con `eslint-config-expo`, sin warnings permitidos |
| `npm run lint:fix`          | Corrige problemas de lint automaticamente                |
| `npm test`                  | Jest (unit tests)                                        |
| `npm run test:watch`        | Jest en modo watch                                       |
| `npm run ci`                | Ejecuta localmente todos los gates del CI móvil          |

## Estructura del proyecto

```text
app/                    # Rutas de Expo Router (navegacion por archivos)
app.config.ts           # Config dinamica por ambiente (nombre, scheme, bundle id, extra)
src/
  components/           # Componentes de UI compartidos
  constants/            # Constantes (colores, etc.)
  core/
    api/                # Cliente Fetch, errores, correlation ID y OpenAPI generado
    config/             # Variables de ambiente tipadas y validadas (zod)
    query/              # QueryClient y lifecycle de conectividad/AppState
    storage/            # Token storage seguro (expo-secure-store)
  features/             # Features del dominio (auth, animals, ...)
    <feature>/
      api/              # Llamadas a la API
      components/       # Componentes de la feature
      hooks/            # Hooks de la feature
      types/            # Tipos derivados del openapi.json del backend
  shared/               # Componentes/utilities reutilizables entre features
```

La estructura real usa actualmente `src/components/` para UI compartida. `src/shared/` queda reservado para utilidades no visuales cuando exista reutilización concreta; no se crean carpetas vacías por anticipación. Ver [`architecture.md`](architecture.md) para las reglas completas de dependencia.

Convenciones de arquitectura y seguridad: ver `AGENTS.md` (JWT en secure storage, IDs UUID, montos en centavos, API bajo `/api/v1`, codigo en ingles / docs en espanol).

## Sistema de diseño

La identidad visual, los tokens, las reglas de accesibilidad y la correspondencia con los estados del backend están documentados en [`docs/design.md`](docs/design.md). El catálogo interno se abre en la ruta `/design-system`; sirve para validar primitivas y patrones y no es todavía un dashboard de producción.

La implementación compartida vive en:

```text
src/theme/                  # Tokens y proveedor de tema
src/components/primitives/  # Texto, iconos, botones, tarjetas, badges y avatares
src/components/feedback/    # Carga, vacío, error y offline
src/components/navigation/  # Navegación inferior
src/components/patterns/    # Patrones compuestos, como filas de tareas
```

## Testing

- Unit tests para logica de negocio y config (`src/core/config/env.test.ts`, `src/core/api/client.test.ts`).
- Component tests con React Native Testing Library (tooling ya configurado en `jest.config.js`).
- E2E solo para flujos criticos (login, flujo principal).

El límite HTTP es inyectable. `createFakeHttpTransport` permite definir rutas falsas para desarrollo aislado y tests sin depender de una API real.

En Android/iOS, el par de tokens se persiste exclusivamente con Expo SecureStore. En web, donde SecureStore no está disponible, se usa `sessionStorage`: la sesión sobrevive recargas en la misma pestaña y se elimina al cerrarla. Nunca se guardan tokens en `localStorage` o AsyncStorage.

## CI móvil

`.github/workflows/mobile-ci.yml` ejecuta instalación reproducible, generación de tipos OpenAPI, formato, lint, typecheck y tests unitarios/componentes con cobertura. Para bloquear merges, configurar en GitHub el check requerido `Mobile CI / lint, typecheck and tests` sobre `develop` y `master`.

## Troubleshooting

- **Puerto 8081 ocupado:** Expo ofrece elegir otro puerto al arrancar. Si se usa otro puerto, Metro no inicia.
- **Cambios de `.env` no reflejados:** las variables `EXPO_PUBLIC_` se inyectan en el bundle; recargar la app completa (shake > Reload) o reiniciar Metro con `npx expo start -c` (clear cache).
- **Android emulator no alcanza localhost:** en development el host se reescribe a `10.0.2.2` automaticamente.
- **Dispositivo fisico no conecta a la API local:** usar `npm run start:lan` (detecta la IP LAN) o crear `.env.local` con la IP de LAN de la maquina (ver tabla de ambientes), reiniciar con `npx expo start --clear` y comprobar que el backend escucha en todas las interfaces y el firewall permite el puerto.
- **El QR de tunnel no carga o se corta:** verificar que `@expo/ngrok` este instalado (`npm ci`), que haya salida a internet y que el antivirus no haya puesto en cuarentena el binario de ngrok; ver `https://status.ngrok.com`.
- **Los demas escanean el QR pero la app no conecta a la API:** el túnel solo publica Metro. Si estan en otra red, publicar el backend (`cloudflared tunnel --url http://localhost:3000`) y apuntar `EXPO_PUBLIC_API_URL` a esa URL https en `.env.local`, luego `npx expo start --clear`.
- **Error de validacion de ambiente:** revisar `EXPO_PUBLIC_ENV` y `EXPO_PUBLIC_API_URL` en el `.env` correspondiente; el mensaje de error indica la variable y el valor esperado.
