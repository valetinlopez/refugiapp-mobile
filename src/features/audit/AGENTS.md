# Reglas para `audit`

## Responsabilidad

- Consulta paginada y detalle del registro de auditoría para administradores.
- Filtros por acción y rango de fechas soportados por el backend.
- Presentación segura de actor, acción, recurso, fecha y metadata sanitizada.

## Contratos

- `GET /audit-logs`: listado paginado con `page`, `limit`, `action`, `from` y `to`.
- `GET /audit-logs/:id`: detalle por UUID.
- `AuditLogResponseDto` expone `actor: { id, firstName, lastName, email } | null` (humano legible; `null` para eventos de sistema o actor eliminado) además de `actorUserId` (aditivo). Los tipos de red derivan de `openapi/mobile.openapi.json`.
- El modelo de vista normaliza: `actor` a `AuditActorView { id, displayName, initials, email }`, `actorUserId` a `actorFallbackId` para fallback durante rollout, y `resourceId` a `string | null`.

## Permisos

- Solo `admin` puede navegar y consultar auditoría (`canReadAudit`).
- La protección visual no reemplaza los guards del backend.

## Seguridad y privacidad

- Nunca mostrar ni registrar claves o valores asociados a passwords, tokens, secretos, autorización o credenciales.
- La UI vuelve a sanitizar `metadata` aunque el backend ya lo haga.
- El nombre y email del actor viven solo en la cache en memoria de TanStack Query (limpiada al cerrar sesión); nunca se persisten ni se incluyen en logs, errores o query keys.
- El email del actor se presenta únicamente en el detalle; la lista muestra nombre y fecha relativa.

## Testing

- Cubrir API, mappers de actor (completo, nulo, fallback UUID), filtros, sanitización, listado, detalle y acceso restringido.

## Estado

### Implementado

- Listado paginado, filtros, detalle y acceso exclusivo para administradores.
- Presentación del actor por nombre (`actor`) con fallback a UUID (`actorUserId`) durante rollout y "Sistema" cuando ambos son `null`; email solo en detalle. Fecha relativa + absoluta en listas y detalle (RFG-129).
