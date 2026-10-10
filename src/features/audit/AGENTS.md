# Reglas para `audit`

## Responsabilidad

- Consulta paginada y detalle del registro de auditoría para administradores.
- Filtros por acción, tipo e identificador de recurso, actor y rango de fechas soportados por el backend.
- Presentación segura de actor, acción, recurso, fecha y metadata sanitizada.

## Contratos

- `GET /audit-logs`: listado paginado con `page`, `limit`, `action`, `resourceType`, `resourceId`, `actorUserId`, `from` y `to`.
- `GET /audit-logs/:id`: detalle por UUID. La metadata es libre (p. ej. `access.denied` envía `{ method, path }`), por lo que el detalle presenta claves conocidas como filas legibles y el resto como JSON sanitizado colapsable.
- `AuditLogResponseDto` expone `actor: { id, firstName, lastName, email } | null` (humano legible; `null` para eventos de sistema o actor eliminado) además de `actorUserId` (aditivo). Los tipos de red derivan de `openapi/mobile.openapi.json`.
- El modelo de vista normaliza: `actor` a `AuditActorView { id, displayName, initials, email }`, `actorUserId` a `actorFallbackId` para fallback durante rollout, y `resourceId` a `string | null`.
- Enums versionados (31 `action`, 10 `resourceType`) con diccionarios en español rioplatense (`auditActionLabel`, `auditResourceTypeLabel`), incluidas las acciones y recursos de adoptantes, postulaciones y adopciones, y tono semántico de badge (`auditActionTone`: `danger` para acceso denegado y fallos de sesión/recuperación). Ningún código crudo (`user.create`, `auth_session`) se presenta en la UI.
- El filtro de actor es un input UUID validado con `isUuid`; un valor inválido se descarta sin bloquear la aplicación (misma semántica que el historial médico).

## Permisos

- Solo `admin` puede navegar y consultar auditoría (`canReadAudit`).
- La protección visual no reemplaza los guards del backend.

## Seguridad y privacidad

- Nunca mostrar ni registrar claves o valores asociados a passwords, tokens, secretos, autorización o credenciales.
- La UI vuelve a sanitizar `metadata` aunque el backend ya lo haga.
- El nombre y email del actor viven solo en la cache en memoria de TanStack Query (limpiada al cerrar sesión); nunca se persisten ni se incluyen en logs, errores o query keys.
- El email del actor se presenta únicamente en el detalle; la lista muestra nombre y fecha relativa.
- El listado nunca muestra `metadata`; el identificador del recurso se abrevia para contexto y el detalle conserva la sanitización defensiva.
- Los fallos de autenticación, renovación/recuperación y accesos denegados se señalan como “Riesgo alto” con texto, icono y color.

## Copiado de identificadores

- Los UUID de recurso/actor y las claves de metadata marcadas como copiables se copian con `expo-clipboard` a través de `useCopyAuditText` (nunca se toca el módulo nativo desde la UI).
- Copiar anuncia éxito a tecnologías asistivas (`AccessibilityInfo.announceForAccessibility`) y muestra feedback textual ("Copiado"/"No se pudo copiar") además del icono; un fallo de copiado anuncia un mensaje seguro y no rompe la pantalla.
- El botón `AuditCopyButton` mantiene un target de 44 × 44 con `hitSlop` y label accesible estable ("Copiar …").

## Testing

- Cubrir API, mappers de actor (completo, nulo, fallback UUID), filtros, sanitización, listado, detalle y acceso restringido.
- Cubrir las derivaciones de metadata (`buildAuditMetadataRows`, `formatAuditMetadataJson`), el copiado (éxito y fallo), los estados loading/offline/error y la pérdida de capacidad en la ruta de detalle.

## Estado

### Implementado

- Listado paginado, filtros por acción, tipo de recurso, actor (UUID) y rango de fechas, detalle y acceso exclusivo para administradores. Fin de paginación explícito ("No hay más eventos").
- Presentación del actor por nombre (`actor`) con fallback a UUID (`actorUserId`) durante rollout y "Sistema" cuando ambos son `null`; email solo en detalle. Fecha relativa + absoluta en listas y detalle (RFG-129).
- Diccionarios en español de acción y recurso; sin códigos crudos visibles en UI (RFG-131).
- E2E del flujo de auditoría cubierto con Maestro (RFG-132, `maestro/audit.yaml`): lista → detalle con actor por nombre → filtro por acción → resultados legibles sin códigos crudos. Selectores `audit-card`, `audit-detail`, `audit-filter-*` y `audit-end-of-list`; `FilterChip` acepta `testID`.
- Listado rediseñado (RFG-165) con jerarquía editorial, filtros compactos en sheets, filtro de `resourceId`, actores enriquecidos, señal accesible de riesgo y recuperación explícita de la paginación.
- Detalle rediseñado (D33/RFG-166): fondo de textura, `ScreenHeader` único `display`, badge "Solo administradores" y hero de evento (icono de recurso, acción, tipo, fecha y badge "Riesgo alto" con icono + texto para eventos sensibles). Card "Información del evento" con `MetadataRow`, UUID de recurso/actor copiables (`AuditCopyButton`) y `ActorRow` con email. Card "Metadatos" con filas legibles para valores escalares (labels en español para claves conocidas y humanizadas para el resto), copiado de claves identificadoras y disclosure "Mostrar/Ocultar datos sanitizados" con el JSON sanitizado completo (`accessibilityState.expanded`). Se conservan la sanitización defensiva, la presentación por nombre con fallback y los estados loading/offline/error con reintento; `testID`s estables `audit-copy-resource-id`, `audit-copy-actor-id`, `audit-metadata-json-toggle` para la regresión de RFG-167.
