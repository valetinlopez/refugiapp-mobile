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
- `hooks/`: bootstrap de sesión, mutations y estado derivado.
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

- Funciones iniciales de login, refresh y logout.
- Secure storage de access y refresh token en `core`.
- Rutas placeholder de login y registro.

### Deuda conocida

- `types.ts` declara roles `vet`, `caregiver` y `volunteer`, incompatibles con el backend.
- `register` y `RegisterRequest` son scaffolding sin endpoint confirmado.
- La pantalla de login aún no ejecuta el flujo real.
- No existe provider/hook de sesión ni protección de rutas.
- Antes de ampliar la feature, generar tipos desde OpenAPI y resolver estas divergencias.
