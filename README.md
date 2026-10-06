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

| Ambiente    | Script                      | API URL                                   | Bundle identifier              | Scheme                    | Nombre visible      |
| ----------- | --------------------------- | ----------------------------------------- | ------------------------------ | ------------------------- | ------------------- |
| development | `npm run start:development` | `http://localhost:3000/api/v1` (ver nota) | `app.refugiapp.mobile.dev`     | `refugiappmobile-dev`     | Refugiapp (Dev)     |
| staging     | `npm run start:staging`     | Variable EAS `preview` / `.env.staging`   | `app.refugiapp.mobile.staging` | `refugiappmobile-staging` | Refugiapp (Staging) |
| production  | `npm run start:production`  | `https://api.refugiapp.app/api/v1`        | `app.refugiapp.mobile`         | `refugiappmobile`         | Refugiapp           |

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

| Variable                     | Obligatoria | Descripcion                                                                   |
| ---------------------------- | ----------- | ----------------------------------------------------------------------------- |
| `EXPO_PUBLIC_ENV`            | Si          | `development` \| `staging` \| `production`. Default: `development`            |
| `EXPO_PUBLIC_API_URL`        | Si*         | URL base de la API. Debe terminar en `/api/v1`; https en staging/production.  |
| `EXPO_PUBLIC_API_TIMEOUT_MS` | No          | Timeout del cliente HTTP en milisegundos. Default: `10000`.                   |
| `EXPO_PUBLIC_EAS_PROJECT_ID` | No**        | EAS project id requerido por `expo-notifications` para el token Expo de push. |

\* En `development` puede omitirse (usa el fallback local). En `staging` y `production` es obligatoria.

\*\* Sin `EXPO_PUBLIC_EAS_PROJECT_ID` la app degrada a "notificaciones no disponibles"; el resto de la app sigue funcionando. Se obtiene con `eas init` o desde el dashboard de Expo y se inyecta en `app.config.ts` (`extra.eas.projectId`).

Las variables se validan al arranque con **zod** en `src/core/config/env.ts`. Un valor invalido detiene la app con un error claro (fail-fast).

Las variables `EXPO_PUBLIC_*` se incluyen en texto plano en el bundle cliente: contienen configuración pública, nunca secretos, tokens ni credenciales. Para builds internos, `EXPO_PUBLIC_ENV` y `EXPO_PUBLIC_API_URL` se administran en el ambiente EAS `preview`; la URL no se fija en el repositorio para evitar publicar un host incorrecto.

### Recuperación de contraseña (deep link)

El email de recuperación lo genera el backend con un `PASSWORD_RESET_URL` configurado por ambiente. Ese valor debe ser el **scheme de la app** seguido de `reset-password` (la app agrega el parámetro `token` al abrirlo):

| Ambiente    | `PASSWORD_RESET_URL`                       |
| ----------- | ------------------------------------------ |
| development | `refugiappmobile-dev://reset-password`     |
| staging     | `refugiappmobile-staging://reset-password` |
| production  | `refugiappmobile://reset-password`         |

La ruta `reset-password` captura el token del deep link una única vez, lo elimina de la URL/historial y lo conserva solo en memoria hasta confirmar o abandonar el flujo; nunca se persiste ni se registra. La verificación manual de este flujo exige un sink/buzón de notificaciones en staging y que el backend publique `PASSWORD_RESET_URL` con el scheme correspondiente.

### Notificaciones push

La feature `notifications` (RFG-126) usa `expo-notifications` y el contrato backend de RFG-127. Requiere un build de desarrollo o interno (no Expo Go en Android desde SDK 53) y un dispositivo físico para validar; el simulador no recibe push.

- Configurar `EXPO_PUBLIC_EAS_PROJECT_ID` en el ambiente correspondiente. Sin él la app muestra "notificaciones no disponibles" y no registra el dispositivo.
- La sección "Notificaciones" del tab "Más" permite activar el permiso y editar preferencias (tareas vencidas, próximas, antelación de 5 a 1440 minutos y horas silenciosas).
- El token Expo se registra al iniciar sesión y se da de baja en el cierre de sesión (best-effort); nunca se registra en logs ni se persiste en claro.
- Tocar una notificación con `data.careTaskId` válido abre el detalle de la tarea (`app/(app)/care-tasks/[id]`).

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

### Receta de demo fuera de tu WiFi (compañero, profesor, etc.)

Para que alguien en **otra red** use tu app con Expo Go necesitas **dos túneles**
abiertos a la vez en tu PC (el de Metro no publica la API). Sin el túnel del
backend, el QR carga pero el login falla con
"No pudimos conectar con el servicio" (la mezcla `https` → `http` LAN la
bloquea iOS/Expo Go; en Safari del teléfono la URL sí abre, en la app no).

Terminal 1 — backend:

```bash
cd ../refugiapp
npm run start:dev
```

Terminal 2 — túnel del backend (sin instalación previa):

```bash
npx --yes cloudflared tunnel --url http://localhost:3000
# o: ngrok http 3000
```

Copiar la URL pública, por ejemplo `https://abc123.trycloudflare.com`.

Terminal 3 — móvil apuntando al túnel:

```bash
# En .env.local del móvil (ver plantilla comentada en el propio fichero):
EXPO_PUBLIC_API_URL=https://abc123.trycloudflare.com/api/v1
npm run start:share -- --clear
```

Verificar que el log muestre
`[start-dev] EXPO_PUBLIC_API_URL explicita (.env.local): https://...` (un valor
explícito tiene prioridad sobre la autodetección LAN). El `--clear` es
obligatorio: las variables `EXPO_PUBLIC_` se inlinenan en el bundle.
Ante cualquier duda de qué URL usará la app:
`node scripts/start-dev.mjs --print-api-url`.

Compartir el **QR `exp.direct`** de la terminal 3. Quien lo escanee solo
necesita Expo Go, internet y un usuario de prueba (no hay registro público).
Tu PC debe quedar encendida con las 3 terminales durante toda la demo.

Notas:

- Requiere `@expo/ngrok` (devDependency) para el túnel de Metro; Expo usa su propio authtoken, no hace falta cuenta ngrok.
- La URL pública del backend cambia a cada arranque con túneles gratuitos: actualizar `.env.local` y reiniciar con `--clear`.
- Compartir el QR expone tu backend a internet mientras el túnel esté abierto: sesiones cortas y cerrarlo al terminar.
- Túnel de Metro es más lento que LAN; si falla en Windows, revisar que el antivirus no haya en cuarentena el binario de ngrok (`https://status.ngrok.com`).
- Para una URL estable que no cambie (p. ej. entrega al profesor), desplegar el backend en staging con `https` fija en vez de usar túneles.

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
| `npm run assets:brand`      | Regenera los WebP/PNG de marca desde los SVG maestros    |
| `npm run release:export`    | Exporta bundles nativos/web para verificar una release   |
| `npm run release:scan`      | Busca patrones de secretos en `dist/release`             |
| `npm run release:verify`    | Exporta y escanea el bundle cliente                      |
| `npm run typecheck`         | `tsc --noEmit` (TypeScript estricto)                     |
| `npm run lint`              | ESLint con `eslint-config-expo`, sin warnings permitidos |
| `npm run lint:fix`          | Corrige problemas de lint automaticamente                |
| `npm test`                  | Jest (unit tests)                                        |
| `npm run test:watch`        | Jest en modo watch                                       |
| `npm run ci`                | Ejecuta localmente todos los gates del CI móvil          |
| `npm run e2e`               | Maestro: todas las suites por rol (staging con seeds)    |
| `npm run e2e:admin`         | Maestro: flow de `admin`                                 |
| `npm run e2e:roles`         | Maestro: `admin` + `shelter_manager` + `veterinarian`    |

## Builds internos y publicación

`eas.json` define el perfil `staging` para distribución interna: genera un APK instalable en Android y un build ad hoc para dispositivos iOS registrados. El perfil usa el ambiente EAS `preview`, la variante `staging` y numeración nativa automática remota; `app.json` mantiene la versión visible `1.0.0` y los números nativos iniciales.

La guía operativa completa —alta del proyecto, variables, builds, instalación, versionado, release notes y checklists— está en [`docs/release-runbook.md`](docs/release-runbook.md). Resumen:

```bash
npx eas-cli@latest login
npx eas-cli@latest init                         # solo si el proyecto aún no está vinculado
npx eas-cli@latest env:list --environment preview
npx eas-cli@latest build --platform android --profile staging
npx eas-cli@latest device:create                # registrar iPhone/iPad antes del build ad hoc
npx eas-cli@latest build --platform ios --profile staging
```

Antes de compilar, el ambiente `preview` debe contener `EXPO_PUBLIC_ENV=staging` y una `EXPO_PUBLIC_API_URL` HTTPS real que termine en `/api/v1`. No usar valores de ejemplo. Ejecutar la verificación local con las mismas variables:

```bash
npx eas-cli@latest env:exec --environment preview "npm run release:verify"
```

El checklist de seguridad exige confirmar SecureStore para tokens, ausencia de secretos en el bundle y el estado documentado de certificate pinning. Los builds solo se consideran listos después de instalar y completar el smoke test de la guía en ambos sistemas.

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
- E2E con Maestro para flujos criticos por rol (`maestro/`): `login → dashboard → detalle → completar tarea` para `admin`, `shelter_manager` y `veterinarian`, alta de animal y registro médico con permiso, negativa clínica de `shelter_manager` y sesión básica. Ver `maestro/README.md`; requiere staging con seeds y credenciales por entorno.

El límite HTTP es inyectable. `createFakeHttpTransport` permite definir rutas falsas para desarrollo aislado y tests sin depender de una API real.

En Android/iOS, el par de tokens se persiste exclusivamente con Expo SecureStore. En web, donde SecureStore no está disponible, se usa `sessionStorage`: la sesión sobrevive recargas en la misma pestaña y se elimina al cerrarla. Nunca se guardan tokens en `localStorage` o AsyncStorage.

## CI móvil

`.github/workflows/mobile-ci.yml` ejecuta instalación reproducible, generación de tipos OpenAPI, formato, lint, typecheck y tests unitarios/componentes con cobertura. `.github/workflows/mobile-e2e.yml` ejecuta las suites Maestro por rol sobre staging con seeds (secrets `STAGING_API_URL` y `E2E_*_*`, reporte JUnit y screenshots en fallo). Para bloquear merges, configurar en GitHub el check requerido `Mobile CI / lint, typecheck and tests` sobre `develop` y `master`.

## Troubleshooting

- **Puerto 8081 ocupado:** Expo ofrece elegir otro puerto al arrancar. Si se usa otro puerto, Metro no inicia.
- **Cambios de `.env` no reflejados:** las variables `EXPO_PUBLIC_` se inyectan en el bundle; recargar la app completa (shake > Reload) o reiniciar Metro con `npx expo start -c` (clear cache).
- **Android emulator no alcanza localhost:** en development el host se reescribe a `10.0.2.2` automaticamente.
- **Dispositivo fisico no conecta a la API local:** usar `npm run start:lan` (detecta la IP LAN) o crear `.env.local` con la IP de LAN de la maquina (ver tabla de ambientes), reiniciar con `npx expo start --clear` y comprobar que el backend escucha en todas las interfaces y el firewall permite el puerto.
- **El QR de tunnel no carga o se corta:** verificar que `@expo/ngrok` este instalado (`npm ci`), que haya salida a internet y que el antivirus no haya puesto en cuarentena el binario de ngrok; ver `https://status.ngrok.com`.
- **Los demas escanean el QR pero la app no conecta a la API:** el túnel solo publica Metro. Si estan en otra red, publicar el backend (`cloudflared tunnel --url http://localhost:3000`) y apuntar `EXPO_PUBLIC_API_URL` a esa URL https en `.env.local`, luego `npx expo start --clear`.
- **Error de validacion de ambiente:** revisar `EXPO_PUBLIC_ENV` y `EXPO_PUBLIC_API_URL` en el `.env` correspondiente; el mensaje de error indica la variable y el valor esperado.
