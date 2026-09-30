# Reglas para `audit`

## Responsabilidad

- Consulta paginada y detalle del registro de auditoría para administradores.
- Filtros por acción y rango de fechas soportados por el backend.
- Presentación segura de actor, acción, recurso, fecha y metadata sanitizada.

## Contratos

- `GET /audit-logs`: listado paginado con `page`, `limit`, `action`, `from` y `to`.
- `GET /audit-logs/:id`: detalle por UUID.
- Los tipos de red derivan de `openapi/mobile.openapi.json`.

## Permisos

- Solo `admin` puede navegar y consultar auditoría (`canReadAudit`).
- La protección visual no reemplaza los guards del backend.

## Seguridad y privacidad

- Nunca mostrar ni registrar claves o valores asociados a passwords, tokens, secretos, autorización o credenciales.
- La UI vuelve a sanitizar `metadata` aunque el backend ya lo haga.

## Testing

- Cubrir API, filtros, sanitización, listado, detalle y acceso restringido.

## Estado

### Implementado

- Listado paginado, filtros, detalle y acceso exclusivo para administradores.

### Pendiente o deuda conocida

- El contrato expone `actorUserId`, no el nombre del actor; se presenta el identificador disponible.
