# Reglas para `notifications`

## Responsabilidad

- Gestiona permisos de notificaciones push, registro/rotación/baja del dispositivo del usuario autenticado, preferencias de aviso y navegación al tocar una notificación.
- No administra tareas ni decide sus reglas: solo navega a la tarea referenciada por el push.
- No contiene lógica de sesión; se conecta a la sesión desde `app/` a través de un puente explícito.

## Contratos

El contrato backend es RFG-127 (`../refugiapp/docs/push-notifications.md`); los tipos de red derivan de `openapi/mobile.openapi.json` (`RegisterDeviceDto`, `DeviceSubscriptionResponseDto`, `NotificationPreferenceResponseDto`, `UpdatePreferencesDto`).

- `POST /notifications/devices`: alta/rotación del token Expo del usuario autenticado. Body `expoPushToken`, `platform` (`ios`/`android`), `timezone`, `appVersion?`. Idempotente por hash; si el token pertenecía a otro usuario se reasigna. Errores `400 INVALID_PUSH_TOKEN`, `400 INVALID_TIMEZONE`.
- `GET /notifications/devices/me`: dispositivos activos propios; la respuesta solo expone `tokenSuffix` (últimos 6), nunca el token en claro.
- `DELETE /notifications/devices/:id`: baja lógica de un dispositivo propio; se invoca en el cierre de sesión.
- `GET/PUT /notifications/preferences/me`: `overdueEnabled`, `upcomingEnabled`, `upcomingWindowMinutes` (5..1440, default 60), `quietStart/quietEnd` (`HH:mm`, juntos o nulos) y `timezone` IANA. Errores `INVALID_UPCOMING_WINDOW`, `INVALID_QUIET_HOURS`.
- `GET /notifications/deliveries`: solo diagnóstico de backend; no se consume en móvil.
- El payload del push incluye `data.careTaskId` (UUID) y `kind`/`dedupKey`; solo el UUID de la tarea se usa para navegar.

## Permisos

- Los tres roles autenticados pueden registrar su dispositivo y editar sus preferencias.
- El backend asocia el dispositivo siempre al usuario autenticado; la autorización visual no reemplaza esa validación.

## Estructura

- `api/`: `notificationsApi` (devices y preferences).
- `components/`: `NotificationsSection` (sección de "Más"), `NotificationPermissionCard` y `NotificationPreferencesSection`.
- `hooks/`: `notificationKeys`, `usePushPermission`, `usePushRegistration`, `useNotificationPreferences`, `useUpdateNotificationPreferences`, `useNotificationPreferencesForm` y `useNotificationObserver`.
- `utils/`: adaptador `PushProvider` (proveedor y detección de dispositivo), `pushProvider`, `preferenceValidation`, `notificationErrorMessages`, `notificationNavigation`, `registeredDevice` y `timezone`.
- `types.ts`: aliases derivados del contrato generado, estados normalizados de permiso y registro, y mapper de preferencias.

## Seguridad y privacidad

- El token Expo no se registra en logs, no se incluye en query keys ni en mensajes; el estado de registro vive solo en memoria (`registeredDevice`).
- Nunca se navega con un `careTaskId` que no sea UUID válido; un payload malformado se descarta.
- Un fallo de red no duplica registros: el backend es idempotente por hash y el registro se omite si el token del usuario ya está registrado en la sesión.
- La baja del dispositivo se ejecuta como limpieza best-effort del cierre de sesión, antes de limpiar los tokens, y nunca bloquea el logout local.

## Integración

- `app/(app)/_layout.tsx` compone `NotificationsWiring`: habilita el registro según la sesión, monta el observador de navegación y registra la baja del dispositivo en `registerSignOutHandler` de `useSession`. Es el único punto de coordinación entre `auth` y `notifications`; ninguna feature importa internals de la otra.
- `NotificationsSection` se compone desde la ruta `app/(app)/(tabs)/more.tsx` sin que la ruta conozca la lógica de registro.

## Testing

- Unit tests del proveedor (mapeo de permisos), validación de preferencias, navegación segura y traducción de errores.
- Hook tests del registro con un `PushProvider` falso y transporte HTTP falso: alta única, dedupe del mismo token y usuario, estado `unavailable` y error de token.
- Component tests RNTL de la tarjeta de permiso y de la sección de preferencias (carga, edición, guardado, error de servidor con reintento, fallo de transporte y recuperación al reintentar).
- Requiere verificación manual en dispositivos físicos Android/iOS: permitir/denegar/bloquear, logout y cambio de usuario, reinstalación, modo avión, horas silenciosas y apertura desde una notificación con la app en primer plano, en segundo plano y cerrada. Los simuladores no reciben push.

## Estado

### Implementado

- Permiso con contexto y estados `granted`/`denied`/`blocked`/`unavailable`; la app sigue siendo usable si se rechaza y ofrece abrir los ajustes del sistema cuando está bloqueado.
- Registro y rotación del token Expo ligados a la sesión (`usePushRegistration`), con dedupe en memoria y actualización al cambiar el token.
- Baja del dispositivo en el logout mediante `registerSignOutHandler` de la sesión (best-effort, antes de limpiar tokens).
- Preferencias de notificación en la sección "Más": un único encabezado "Notificaciones" (lo aporta `NotificationsSection`; la tarjeta de permiso y `NotificationPreferencesSection` no repiten título), con switches, antelación (5..1440) y horas silenciosas, validadas localmente y persistidas por `PUT`. La carga distingue `LoadingState` (sin datos), `ErrorState` con "Reintentar" (respuesta del servidor) y `OfflineState` (fallo de transporte vía `isNetworkError`); un fallo nunca deja el spinner indefinido y una recarga en segundo plano fallida no reemplaza el formulario ya cargado.
- Navegación segura al tocar una notificación (`useNotificationObserver`): cold start y app en ejecución, validando UUID y montado solo en el área autenticada. Incluye la ruta `app/(app)/care-tasks/[id]/index.tsx` de detalle de tarea.
- Carga perezosa de `expo-notifications`: `pushProvider` y `useNotificationObserver` importan el módulo con `import()` dinámico (cacheado, tolerante a fallos) y detectan Expo Go vía `Constants.executionEnvironment === ExecutionEnvironment.StoreClient`. En Expo Go (Android SDK 53+) el módulo lanza al evaluarse (`.fx` de auto-registro); `useNotificationObserver` hace short-circuit antes de cargar (cero `import()` y cero `ERROR warnOfExpoGoPushUsage`), el registro degrada por `isSupported` y las preferencias siguen funcionando porque son HTTP.
- `DateTimeField` ampliado con `mode="time"` para las horas silenciosas, usando los listeners no deprecados del picker (`onValueChange`/`onDismiss`).
- Estados de error seguros por código (`INVALID_PUSH_TOKEN`, `INVALID_TIMEZONE`, `INVALID_UPCOMING_WINDOW`, `INVALID_QUIET_HOURS`) con fallback en `toApiErrorMessage`.

### Pendiente o deuda conocida

- Requiere `EXPO_PUBLIC_EAS_PROJECT_ID` y un build de desarrollo/staging para obtener el token Expo; sin proyecto configurado la app muestra "no disponible" y no registra. Expo Go no admite push real (Android desde SDK 53; iOS limitado): en Expo Go el registro degrada a "no disponible" (import perezoso y a prueba de fallos), pero las preferencias siguen consultándose y guardándose porque son HTTP.
- La verificación E2E/manual de push en dispositivos físicos queda pendiente hasta contar con dispositivos y credenciales push del proveedor; los simuladores no sustituyen la prueba.
- No se persiste el `deviceId` en disco: la baja en logout depende del registro de la sesión en curso. El backend reasigna y desactiva tokens rechazados, por lo que no se generan duplicados.
