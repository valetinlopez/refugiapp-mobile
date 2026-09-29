# Reglas para `auth`

## Responsabilidad

- Gestiona entrada, renovación, cierre y recuperación local de sesión.
- Expone estado de autenticación y roles a navegación y features.
- No administra usuarios ni perfiles veterinarios; esas capacidades pertenecen a futuras features separadas.

## Contrato del backend

- `POST /auth/login`: autenticación pública con email y password.
- `POST /auth/refresh`: rota la sesión usando refresh token.
- `POST /auth/logout`: revoca la sesión actual de forma idempotente.
- Los roles válidos son `admin`, `shelter_manager` y `veterinarian`.
- El payload JWT distingue `tokenType=access|refresh`; el refresh incluye `jti`.

Verificar OpenAPI antes de modificar payloads. La arquitectura actual del backend no documenta self-registration público.

## Seguridad

- Guardar access y refresh tokens exclusivamente mediante `src/core/storage`.
- Nunca exponer tokens, passwords o headers de autorización en logs, errores, analytics o route params.
- Ante refresh revocado, vencido o inválido, limpiar tokens y cache sensible antes de volver a login.
- Evitar múltiples refresh concurrentes.
- La contraseña existe solo durante la interacción y el request; no persistirla.

## Estructura objetivo

- `api/`: login, refresh y logout.
- `session/`: context, reducer, bootstrap, acciones de sesión y `useSignOut`.
- `components/`: formulario, feedback y pantalla de cuenta (`AccountScreen`, `AccountMenuButton`, `AccountHeaderRow`, `AccountSignOutSheet`).
- `types/`: modelos de vista y aliases derivados de OpenAPI.
- `utils/`: presentación de roles en español (`roleLabels`); los valores de dominio permanecen en inglés.

Las rutas de `app/(auth)` se limitan a composición y navegación. La pantalla de cuenta es la superficie donde auth expone identidad y cierre de sesión; se compone desde el tab `account`.

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
- Formulario de login accesible y rutas protegidas.
- Acceso de cuenta desde toda el área autenticada: tab "Cuenta" (`app/(app)/(tabs)/account.tsx` con `AccountScreen`) y atajo `AccountMenuButton` (44 × 44, `accessibilityLabel` "Abrir menú de cuenta") en Inicio y en la fila de retorno de las pantallas stack (`AccountHeaderRow` = `AppHeaderBack` + botón de cuenta).
- Pantalla de cuenta con identidad (correo y roles presentados en español con `roleLabels`) y acción "Cerrar sesión".
- `AccountSignOutSheet`: confirmación nativa antes de salir (modal con scrim y tokens del sistema), estado de carga que bloquea el cierre y error seguro en español sin exponer tokens ni payloads.
- `useSignOut` en `session/`: envuelve `SessionProvider.signOut()`, evita doble tap, expone `isSigningOut` y `errorMessage` seguro; el cierre local (Secure Store + cache de TanStack Query) siempre se ejecuta, incluso offline o con refresh inválido, porque `signOut` del provider es best-effort y el cierre local está en su `finally`.

### Deuda conocida

- No existe self-registration público porque el backend no publica ese contrato.
- Falta E2E en dispositivo para login, recuperación y logout.
