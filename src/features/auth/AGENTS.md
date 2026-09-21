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
- `session/`: context, reducer, bootstrap y acciones de sesión.
- `components/`: formulario y feedback específicos de auth.
- `types/`: modelos de vista y aliases derivados de OpenAPI.

Las rutas de `app/(auth)` se limitan a composición y navegación.

## Permisos

- Auth identifica roles; no contiene la matriz completa de autorización de cada dominio.
- Las features consultan capacidades derivadas desde una API de sesión estable.
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

### Deuda conocida

- No existe self-registration público porque el backend no publica ese contrato.
- Falta E2E en dispositivo para login, recuperación y logout.
