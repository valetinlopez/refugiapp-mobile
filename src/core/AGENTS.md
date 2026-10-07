# Reglas para `src/core`

## Responsabilidad

- Contiene infraestructura transversal independiente de features.
- Centraliza cliente HTTP, configuración validada, storage seguro y adaptadores de plataforma.
- Ofrece contratos estables a las features sin conocer UI ni dominio de producto.

## Dependencias

- Puede depender de Expo, React Native y librerías de infraestructura.
- No puede importar desde `app`, `src/features`, `src/components` ni `src/theme`.
- No debe contener nombres o reglas específicas de animals, expenses, care-tasks u otra feature.

## API

- `apiClient` usa una base URL que ya contiene `/api/v1`; las features usan paths relativos como `/animals`.
- Centralizar headers, timeouts, autenticación, normalización técnica de errores y correlation IDs cuando se incorporen.
- `errors.ts` normaliza estados HTTP (400, 401, 403, 404, 409, 422, 429, 500, 502-504) a mensajes accionables en español rioplatense y diferencia red (`NETWORK_ERROR`) de timeout (`REQUEST_TIMEOUT`). `toApiErrorMessage` es el fallback seguro para errores desconocidos y nunca interpola payloads, tokens ni `requestId`; las features lo usan como base y lo especializan por código/dominio.
- No registrar headers de autorización, tokens ni payloads sensibles.
- Evitar loops o múltiples refresh simultáneos; cualquier cambio del flujo requiere tests de concurrencia y fallo.

## Validación

- `src/core/validation` centraliza validadores puros transversales sin dominio (p. ej. `isUuid`).
- Las rutas y `src/application` consumen `isUuid` desde aquí en lugar de duplicar el patrón por feature; los `utils/uuid.ts` de features existentes re-exportan este validador.

## Media

- `src/core/media/optimizeCloudinaryImageUrl` agrega transformaciones `f_auto`, `q_auto`, crop y dimensiones de contexto solo a URLs HTTPS de imágenes Cloudinary. Conserva query/fragment y deja intactos otros hosts o recursos `raw`.

## Red y reintentos

- `src/core/network` centraliza diagnóstico de conectividad y reintentos de escritura sin dominio.
- `useConnectivityStatus` se suscribe a `onlineManager`, que ya recibe NetInfo desde `QueryProvider`; las features lo usan para presentar estado online/offline sin duplicar listeners nativos.
- `isNetworkError` distingue fallos de transporte (`NETWORK_ERROR`, `REQUEST_TIMEOUT`) de respuestas del servidor; las features lo usan para elegir `OfflineState` en lugar de `ErrorState` y auth para no invalidar la sesión sin red.
- `MutationRetryQueue` es una cola FIFO acotada, pura y sin timers: backoff exponencial con jitter y tope, intentos máximos, dedupe por clave y rechazo de mutaciones no marcadas `safeToRetry` (un POST sin clave de idempotencia nunca se re-ejecuta). El reintento lo dispara la reconexión (`useMutationRetryQueue`, vía `onlineManager`) o un reintento manual; no hay timers en segundo plano.
- Un fallo de transporte durante `POST /auth/refresh` conserva los tokens y propaga el error de red; solo un `401` con código del servidor invalida la sesión.

## Storage

- Tokens solo mediante el adaptador de `storage`; nunca AsyncStorage.
- En web, el adaptador usa `sessionStorage` para sobrevivir recargas dentro de la misma pestaña; no usar `localStorage` ni compartir tokens entre pestañas.
- Las claves de storage se definen una vez y no se duplican en features.
- Limpiar sesión y cache sensible cuando refresh/logout fallen definitivamente.

## Configuración

- Toda variable nueva se declara en `.env.example`, se valida en `config` y se documenta en `README.md`.
- `EXPO_PUBLIC_API_URL` puede inyectarse desde `scripts/start-dev.mjs` (`npm run start:lan` / `start:share`): prioridad shell > `.env.local` > autodetección de IP LAN; lo inyectado como variable de proceso tiene prioridad sobre los ficheros `.env` en Expo. `node scripts/start-dev.mjs --print-api-url` muestra la URL resuelta sin arrancar Metro (diagnóstico).
- En Expo Go, `npm run start:share` sirve el bundle por `https` (túnel `exp.direct`): la API también debe ser `https` (túnel del backend). Una API `http` por IP LAN se bloquea en iOS/Expo Go (contenido mixto/ATS) y el cliente la reporta como `NETWORK_ERROR` (`errors.ts`), aunque Safari del mismo teléfono sí abra la URL.
- No leer `process.env` fuera de configuración, salvo `app.config.ts` o scripts justificados.
- Staging y production requieren HTTPS.

## Testing

- Tests unitarios para parsing de entorno, selección de host, storage y comportamiento de interceptores.
- Mockear el límite externo; no depender de una API real en unit tests.

## Estado implementado

- Cliente Fetch tipado con `x-request-id`, timeout, multipart y errores normalizados.
- Las subidas multipart con `onUploadProgress` usan el adaptador XHR del cliente y aceptan `AbortSignal`; no fijar manualmente el boundary de `FormData`.
- Reintentos limitados a métodos idempotentes.
- Refresh single-flight con invalidación de sesión y reintento único.
- Ante `REFRESH_TOKEN_CONCURRENT_USE` (401 benigno de rotación concurrente dentro de la ventana de gracia) el cliente adopta el par ganador ya persistido en storage sin invalidar la sesión; si no hay ganador persistido, invalida sesión. El resto de los fallos de refresh (`REFRESH_TOKEN_EXPIRED`, `REFRESH_REUSE_DETECTED`, `INVALID_REFRESH_TOKEN`) siempre limpian sesión. `invalidateSession` propaga un mensaje seguro (nunca tokens) al handler de sesión.
- Par de tokens persistido atómicamente mediante una única entrada de Secure Store en Android/iOS y una entrada de `sessionStorage` por pestaña en web.
- TanStack Query conectado a NetInfo y AppState.
- Adapter HTTP falso inyectable en desarrollo y tests.
- `isNetworkError`, `MutationRetryQueue` y `useMutationRetryQueue` con unit tests de diagnóstico, backoff, dedupe y descarte tras agotar intentos.
