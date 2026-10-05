# ADR-0014: Notificaciones push con Expo Push Service

- Estado: aceptado
- Fecha: 2026-10-05

## Contexto

RFG-126 implementa la parte móvil de las notificaciones de tareas vencidas del backend RFG-127. El backend publica un contrato estable (`POST/GET/DELETE /notifications/devices*`, `GET/PUT /notifications/preferences/me`) que persiste dispositivos Expo por usuario y delega el envío en un cron externo desduplicado. El móvil debe solicitar permiso, registrar el token vigente, editar preferencias y abrir la tarea correspondiente al tocar la notificación, sin exponer el token en logs ni datos.

## Alternativas consideradas

1. **Expo Push Service mediante `expo-notifications`** (elegida): el backend ya integra el endpoint de Expo (`EXPO_PUSH_URL`) y persiste `expoPushToken`; el cliente obtiene el token con `getExpoPushTokenAsync({ projectId })`.
2. **FCM/APNs directos** con `@react-native-firebase/messaging`: requiere tokens nativos por plataforma, configuración nativa adicional y un adaptador backend distinto al ya implementado.
3. **No registrar el dispositivo** y depender de la preferencia del usuario: incumple el criterio de asociar el token al usuario y eliminar/desasociar en logout.

## Decisión

- Usar `expo-notifications` (`~57.0.21`) detrás de un adaptador `PushProvider` en `src/features/notifications/utils/pushProvider.ts`, inyectable en hooks y tests.
- Solicitar permiso con contexto; estados normalizados `granted | denied | blocked | unavailable`, con acción para abrir los ajustes del sistema cuando está bloqueado.
- Registrar/rotar el token Expo ligado a la sesión con `usePushRegistration`; el `deviceId` del registro vive solo en memoria y se usa para `DELETE /notifications/devices/:id` durante el cierre de sesión.
- Coordinar `auth` y `notifications` desde `app/(app)/_layout.tsx` mediante `NotificationsWiring`, sin imports cruzados entre features. `SessionProvider` expone `registerSignOutHandler` como hook genérico de ciclo de sesión.
- Editar preferencias en la sección "Más" y navegar con `data.careTaskId` validado como UUID hacia `app/(app)/care-tasks/[id]/index.tsx`.
- Ampliar `DateTimeField` con `mode="time"` para las horas silenciosas, reutilizando selector nativo y fallback web.

## Consecuencias positivas

- El contrato del backend existente se consume sin cambios adicionales y sin duplicar registros (idempotencia por hash + dedupe en memoria).
- `auth` y `notifications` permanecen desacopladas; la coordinación es visible y testeable en `app/`.
- La app degrada a "no disponible" sin fallar cuando no hay dispositivo físico, permiso o `EAS projectId`.

## Costes y riesgos

- `expo-notifications` no funciona en web ni en Expo Go Android (SDK 53+): requiere build de desarrollo/staging y dispositivos físicos para validar.
- La baja del dispositivo depende de la sesión en curso (el `deviceId` no se persiste); el backend reasigna y desactiva tokens rechazados, evitando duplicados.
- Requiere configurar `EXPO_PUBLIC_EAS_PROJECT_ID`; sin él no hay token Expo.

## Criterios de revisión

- Si el backend cambia a FCM/APNs directos o el contrato de devices/preferencias cambia de forma incompatible.
- Si se necesita persistir el `deviceId` para desasociar tras reinicios sin re-registro, evaluar almacenamiento seguro.
- Si se incorporan notificaciones en web o background tasks con `expo-task-manager`.
