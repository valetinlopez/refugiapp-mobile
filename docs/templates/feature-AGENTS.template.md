# Reglas para `<feature>`

## Responsabilidad

- Describir qué capacidad de producto pertenece a esta feature.
- Describir explícitamente qué responsabilidades no pertenecen aquí.

## Contratos

- Enumerar endpoints consumidos y enlazar al backend/OpenAPI.
- Enumerar enums e invariantes relevantes.
- Indicar que los tipos de red se derivan de OpenAPI.

## Permisos

- Documentar qué roles pueden ver y ejecutar cada acción.
- Aclarar diferencias entre autorización visual y autorización del servidor.

## Estructura

- `api/`: llamadas HTTP.
- `components/`: UI específica de la feature.
- `hooks/`: orquestación, queries y mutations.
- `types/`: modelos de vista y aliases derivados.

Eliminar de esta lista cualquier carpeta que la feature no necesite.

## Seguridad y privacidad

- Documentar datos sensibles y reglas de logs/cache.

## Testing

- Documentar unit, component, integration y E2E requeridos por el riesgo.

## Estado

### Implementado

- Enumerar únicamente comportamiento existente y validado.

### Pendiente o deuda conocida

- Enumerar divergencias o trabajo futuro sin presentarlo como disponible.
