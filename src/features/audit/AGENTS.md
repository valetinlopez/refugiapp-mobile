# Reglas para `audit`

## Responsabilidad

- Consulta paginada y detalle del registro de auditoría para administradores.
- Filtros por acción y rango de fechas soportados por el backend.
- Presentación segura de actor, acción, recurso, fecha y metadata sanitizada.

## Contratos

- `GET /audit-logs`: listado paginado con `page`, `limit`, `action`, `resourceType`, `resourceId`, `actorUserId`, `from` y `to`.
- `GET /audit-logs/:id`: detalle por UUID.
- `AuditLogResponseDto` expone `actor: { id, firstName, lastName, email } | null` (humano legible; `null` para eventos de sistema o actor eliminado) además de `actorUserId` (aditivo). Los tipos de red derivan de `openapi/mobile.openapi.json`.
- El modelo de vista normaliza: `actor` a `AuditActorView { id, displayName, initials, email }`, `actorUserId` a `actorFallbackId` para fallback durante rollout, y `resourceId` a `string | null`.
- Enums versionados (28 `action`, 7 `resourceType`) con diccionarios en español rioplatense (`auditActionLabel`, `auditResourceTypeLabel`) y tono semántico de badge (`auditActionTone`: `danger` para acceso denegado y fallos de sesión/recuperación). Ningún código crudo (`user.create`, `auth_session`) se presenta en la UI.
- El filtro de actor es un input UUID validado con `isUuid`; un valor inválido se descarta sin bloquear la aplicación (misma semántica que el historial médico).

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

- Listado paginado, filtros por acción, tipo de recurso, actor (UUID) y rango de fechas, detalle y acceso exclusivo para administradores. Fin de paginación explícito ("No hay más eventos").
- Presentación del actor por nombre (`actor`) con fallback a UUID (`actorUserId`) durante rollout y "Sistema" cuando ambos son `null`; email solo en detalle. Fecha relativa + absoluta en listas y detalle (RFG-129).
- Diccionarios en español de acción y recurso; sin códigos crudos visibles en UI (RFG-131).
