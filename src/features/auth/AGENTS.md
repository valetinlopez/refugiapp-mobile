# Reglas para `auth`

## Responsabilidad

- Gestiona entrada, renovación, cierre y recuperación local de sesión.
- Expone estado de autenticación y roles a navegación y features.
- No administra usuarios ni perfiles veterinarios; esas capacidades pertenecen a futuras features separadas.

## Contrato del backend

- `POST /auth/login`: autenticación pública con email y password.
- `POST /auth/refresh`: rota la sesión usando refresh token.
- `POST /auth/logout`: revoca la sesión actual de forma idempotente.
- `POST /auth/change-password`: cambia la contraseña del usuario autenticado (Bearer) con `currentPassword` y `newPassword` (mínimo 12 caracteres); responde `204` y revoca todos los refresh tokens activos.
- `POST /auth/password-recovery/request`: solicitud pública de recuperación por email; responde siempre `202` con el mismo mensaje genérico para cuentas existentes, inexistentes o inactivas.
- `POST /auth/password-recovery/confirm`: pública, consume el token opaco de un solo uso con `newPassword` (mínimo 12); responde `204` y revoca todos los refresh tokens activos.
- Códigos de recuperación: `PASSWORD_RESET_TOKEN_EXPIRED`, `PASSWORD_RESET_TOKEN_ALREADY_USED` e `INVALID_PASSWORD_RESET_TOKEN` (400); `INVALID_CURRENT_PASSWORD` (401); rate limit `429`.
- Los roles válidos son `admin`, `shelter_manager` y `veterinarian`.
- El payload JWT distingue `tokenType=access|refresh`; el refresh incluye `jti`.

Verificar OpenAPI antes de modificar payloads. La arquitectura actual del backend no documenta self-registration público.

## Seguridad

- Guardar access y refresh tokens exclusivamente mediante `src/core/storage`.
- Nunca exponer tokens, passwords o headers de autorización en logs, errores, analytics o route params.
- Ante refresh revocado, vencido o inválido, limpiar tokens y cache sensible antes de volver a login.
- Evitar múltiples refresh concurrentes.
- La contraseña existe solo durante la interacción y el request; no persistirla.
- El token de recuperación es opaco, de un solo uso y sensible: capturarlo una única vez desde los params del deep link, eliminarlo de la URL/historial/estado de navegación y conservarlo solo en memoria hasta confirmar o abandonar el flujo. Nunca persistirlo en SecureStore, AsyncStorage, TanStack Query, analytics, breadcrumbs, logs, errores o crash reports.
- El token de recuperación no debe aparecer en query keys, nombres de variables logueables ni mensajes visibles.
- No revelar si el email pertenece a una cuenta: el contenido y la navegación posteriores al `202` son idénticos para todos los casos.
- Un `INVALID_CURRENT_PASSWORD` no cierra la sesión local; solo el cambio exitoso o la recuperación confirmada limpian tokens y cache (el backend ya revocó los refresh tokens).

## Estructura objetivo

- `api/`: login, refresh, logout, cambio de contraseña y recuperación (request/confirm).
- `session/`: context, reducer, bootstrap, acciones de sesión, `useSignOut` y el registro genérico de limpieza de cierre de sesión (`registerSignOutHandler`).
- `components/`: formulario, feedback y pantalla de cuenta (`AccountScreen`, `AccountMenuButton`, `AccountHeaderRow`, `AccountSignOutSheet`); formularios de contraseña (`RequestPasswordResetForm`, `ResetPasswordForm`, `ChangePasswordForm`), el campo compartido `PasswordField` (toggle mostrar/ocultar) y el medidor de fortaleza `PasswordStrengthMeter`.
- `hooks/`: cooldown de reenvío de recuperación (`useResendCooldown`).
- `types/`: modelos de vista y aliases derivados de OpenAPI.
- `utils/`: presentación de roles en español (`roleLabels`), validación pura de contraseñas (`passwordValidation`), traducción de errores (`passwordErrorMessages`); los valores de dominio permanecen en inglés.

Las rutas de `app/(auth)` se limitan a composición y navegación. La pantalla de cuenta es la superficie donde auth expone identidad y cierre de sesión; se compone desde el tab `more` con un slot `children` opcional para contenido de gestión.

`AccountMenuButton` y `AccountHeaderRow` son parte de la superficie pública de cuenta de auth (análoga a `useSession`): las rutas de `app` las componen y otras features pueden importar `AccountMenuButton` para exponer el atajo de cuenta (hoy `dashboard` lo usa en el encabezado de Inicio). Este es un límite documentado; no importar otros internals de auth desde otras features.

## Permisos

- Auth identifica roles; no contiene la matriz completa de autorización de cada dominio.
- `useCapabilities` deriva la matriz central desde la sesión y `useAuthorizedNavigation` filtra registros declarativos con `requiredCapability`; ambos son superficie pública estable de auth.
- El backend vuelve a validar toda operación protegida.

## Testing

- Unit tests para transiciones de sesión y limpieza segura.
- Integration tests para login, refresh exitoso, refresh fallido y logout.
- Component tests para validación, loading y error sin filtrar detalles internos.
- E2E para login, restauración de sesión y logout.

## Estado

### Implementado

- Login real contra backend y validación posterior mediante `GET /users/me`.
- Roles `admin`, `shelter_manager` y `veterinarian` derivados del OpenAPI parcial.
- Secure storage atómico del par de tokens en `core`.
- Refresh single-flight y limpieza central ante sesión inválida.
- Session Context/reducer, restauración sin parpadeo y logout best-effort.
- Mensaje claro de sesión vencida: ante refresh inválido/vencido el estado `unauthenticated` lleva un `notice` (p. ej. "Tu sesión venció. Iniciá sesión nuevamente.") que la pantalla de login muestra al ser redirigida; no se filtran tokens ni payloads. El `notice` se limpia al volver a autenticar.
- Restauración diferida sin red: si `GET /users/me` falla con `NETWORK_ERROR`/`REQUEST_TIMEOUT` durante el bootstrap o el refresh pierde conectividad a mitad de camino, los tokens se conservan y la sesión cae a `unauthenticated` sin `notice`; al recuperar red, la próxima validación autentica sin re-login. Solo un fallo de refresh con respuesta del servidor (`401` con código) limpia tokens.
- Formulario de login accesible y rutas protegidas.
- Acceso de cuenta desde toda el área autenticada: tab "Más" (`app/(app)/(tabs)/more.tsx` con `AccountScreen`) y atajo `AccountMenuButton` (44 × 44, `accessibilityLabel` "Abrir menú de cuenta") en Inicio y en la fila de retorno de las pantallas stack (`AccountHeaderRow` = `AppHeaderBack` + botón de cuenta). `AccountScreen` acepta un slot `children` (renderizado entre el encabezado y la identidad) y props `heading`/`subtitle`; la ruta del tab lo usa para componer la sección "Gestión".
- Pantalla de cuenta con identidad (correo y roles presentados en español con `roleLabels`) y acción "Cerrar sesión".
- `AccountSignOutSheet`: confirmación nativa antes de salir (modal con scrim y tokens del sistema), estado de carga que bloquea el cierre y error seguro en español sin exponer tokens ni payloads.
- `useSignOut` en `session/`: envuelve `SessionProvider.signOut()`, evita doble tap, expone `isSigningOut` y `errorMessage` seguro; el cierre local (Secure Store + cache de TanStack Query) siempre se ejecuta, incluso offline o con refresh inválido, porque `signOut` del provider es best-effort y el cierre local está en su `finally`.
- `endSession` en `SessionProvider`: cierre local de sesión (Secure Store + cache) con `notice` opcional; se usa tras un cambio de contraseña o recuperación exitosos para volver al login con aviso de éxito sin llamar a logout del backend (ya revocó los refresh tokens).
- `registerSignOutHandler` en `SessionProvider`: registro genérico de limpiezas best-effort que se ejecutan antes de limpiar tokens (p. ej. la baja del dispositivo push de `notifications`). Auth no conoce a sus consumidores; `app/(app)/_layout.tsx` conecta el handler. Un fallo de un handler nunca bloquea el cierre local.
- Cambio de contraseña autenticado: ruta `app/(app)/account/change-password` con `AccountHeaderRow` y `fallbackHref='/more'`, entrada "Cambiar contraseña" en `AccountScreen` (visible para los tres roles, acción sobre la propia cuenta) y formulario `ChangePasswordForm` (actual + nueva + confirmación, mínimo 12). `INVALID_CURRENT_PASSWORD` muestra error específico sin cerrar la sesión; el éxito limpia tokens y cache y redirige al login con aviso.
- Recuperación pública: link "Olvidé mi contraseña" en el login, ruta `app/(auth)/forgot-password` que tras el `202` muestra siempre la misma confirmación genérica (indistinguible para cuentas existentes, inexistentes o inactivas), y ruta `app/(auth)/reset-password` que captura el token del deep link una única vez, lo elimina de la URL/historial y lo conserva solo en memoria hasta confirmar o abandonar. Tokens vencidos, reutilizados o inválidos muestran estados diferenciados con acción para solicitar un enlace nuevo; tras confirmar, vuelve al login con aviso de éxito y no reenvía la mutación al reabrir o retroceder.
- Validación local de contraseñas en `utils/passwordValidation`: email normalizado, mínimo 12 caracteres y coincidencia de confirmación, antes de enviar. Niveles de fortaleza derivados solo de longitud (`weak`/`medium`/`strong`) y TTL de recuperación (`PASSWORD_RESET_LINK_TTL_MINUTES = 30`, espejo del default del backend; no expuesto en OpenAPI y overridable por `PASSWORD_RESET_TOKEN_TTL_MS`).
- Traducción de errores de contraseña en `utils/passwordErrorMessages`: `INVALID_CURRENT_PASSWORD`, `PASSWORD_RESET_TOKEN_EXPIRED`, `PASSWORD_RESET_TOKEN_ALREADY_USED`, `INVALID_PASSWORD_RESET_TOKEN`, validación `400`, rate limit `429` y fallback seguro en `toApiErrorMessage`; `isPasswordResetTokenError` permite distinguir estados de token en la UI.
- Pulido UX de recuperación (RFG-130): toggle mostrar/ocultar en `PasswordField` (área táctil 44 × 44, `hitSlop` 8, labels "Mostrar/Ocultar contraseña" y `testID` por campo) aplicado a login, reset y change; `textContentType` (`password` para actual, `newPassword` para nueva/confirmación) además del `autoComplete` previo para gestores de contraseñas; medidor de fortaleza `PasswordStrengthMeter` (segmentos 1–3 + label Débil/Media/Fuerte con texto y color, nunca color aislado, `accessibilityLiveRegion="polite"` y label accesible) integrado en reset y change; confirmación de solicitud con guía de spam y TTL ("vence en 30 minutos"); reenvío con cooldown de 60 s (`useResendCooldown`) que deshabilita el botón con cuenta regresiva para no chocar con el rate limit LOGIN (5/min); el `429` muestra espera explícita ("Llegaste al límite de intentos (5 por minuto). Esperá 60 segundos..."). Se conserva el `202` genérico idéntico en cada reenvío (anti-enumeración), el token solo en memoria y la diferenciación de tokens vencidos/reutilizados/inválidos.

### Deuda conocida

- No existe self-registration público porque el backend no publica ese contrato.
- E2E de recuperación completa (deep link por scheme de staging → captura y saneamiento → nueva contraseña → login) y de cambio autenticado quedan como verificación manual en dispositivo hasta que staging configure `PASSWORD_RESET_URL` con el deep link del scheme y disponga de un sink/buzón de notificaciones verificable; unit/component tests cubren la lógica mientras tanto. La verificación manual en staging incluye: solicitar recuperación desde el login, confirmar la guía de spam y el TTL, reenviar tras el cooldown de 60 s sin `429`, abrir el enlace del buzón (nunca loguear el token), capturar el token del deep link y confirmar la nueva contraseña, y verificar que un token vencido/reutilizado muestra su estado diferenciado con acción para pedir un enlace nuevo.
- La cache de TanStack Query vive solo en memoria: reabrir la app sin red muestra login (con tokens preservados), no datos. Persistir la cache en frío exigiría guardar datos clínicos en disco sin cifrar; queda como deuda explícita hasta evaluar storage cifrado.
- El backend no publica `POST /auth/logout` (ver `docs/frontend-login.md` del backend): el cierre de sesión móvil es local (Secure Store + cache) y el refresh token expira por TTL. Por eso hoy "cerrar sesión en un dispositivo no cierra la sesión en otro": cada login crea una familia de refresh tokens independiente y no hay revocación server-side. Cuando el backend implemente logout, deberá revocar solo el token/familia presentada y este AGENTS.md se actualizará.
- E2E en dispositivo para login, logout, expiración, restauración y offline cubierto con Maestro (`maestro/helpers/login.yaml`, `helpers/logout.yaml`, `session-expired.yaml`, `session-restore.yaml`, `offline.yaml`, `online-restore.yaml` más suites por rol; selectores `login-form`, `login-email`, `login-password`, `login-submit`, `account-logout`, `confirm-dialog`, `dashboard-screen`, `offline-state`, `users-list`). La rotación concurrente y el single-flight se cubren con unit tests del cliente HTTP (`src/core/api/client.test.ts`) y con los E2E de rotación del backend (Testcontainers), porque staging no expone TTL corto ni inyección de tokens vencidos.
