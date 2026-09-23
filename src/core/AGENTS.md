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
- No registrar headers de autorización, tokens ni payloads sensibles.
- Evitar loops o múltiples refresh simultáneos; cualquier cambio del flujo requiere tests de concurrencia y fallo.

## Storage

- Tokens solo mediante el adaptador de `storage`; nunca AsyncStorage.
- En web, el adaptador usa `sessionStorage` para sobrevivir recargas dentro de la misma pestaña; no usar `localStorage` ni compartir tokens entre pestañas.
- Las claves de storage se definen una vez y no se duplican en features.
- Limpiar sesión y cache sensible cuando refresh/logout fallen definitivamente.

## Configuración

- Toda variable nueva se declara en `.env.example`, se valida en `config` y se documenta en `README.md`.
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
- Par de tokens persistido atómicamente mediante una única entrada de Secure Store en Android/iOS y una entrada de `sessionStorage` por pestaña en web.
- TanStack Query conectado a NetInfo y AppState.
- Adapter HTTP falso inyectable en desarrollo y tests.
