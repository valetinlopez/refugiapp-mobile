# Reglas para `src/features`

## Responsabilidad

- Agrupa capacidades de producto por dominio del backend.
- Cada feature encapsula acceso HTTP, orquestación y UI específica.

## Estructura

Una feature agrega solo las carpetas necesarias:

```text
<feature>/
  api/
  components/
  hooks/
  types/
  utils/
  AGENTS.md
```

`app/` compone features; las rutas no absorben su lógica.

## Dependencias

- Una feature puede importar `src/core`, `src/components`, `src/theme` y contratos generados.
- No importar internals de otra feature.
- Si dos features necesitan coordinación, resolverla desde la ruta o crear una frontera de aplicación explícita y documentada.
- No mover código a shared por anticipación; exigir reutilización real y semántica común.

## API y tipos

- Todos los endpoints se verifican contra OpenAPI y arquitectura del backend.
- Los tipos HTTP se generan o derivan del contrato; los modelos de vista pueden ser locales.
- Separar mapeo de DTO, lógica de query y renderizado.
- Centralizar keys e invalidaciones de TanStack Query dentro de la feature.

## Permisos

- Documentar permisos por rol en el `AGENTS.md` local.
- La feature adapta acciones visibles al rol, pero nunca reemplaza la validación del backend.

## Estado y errores

- Exponer loading, empty, error y offline cuando correspondan.
- No guardar respuestas remotas completas en estado global duplicado.
- Traducir códigos de aplicación a mensajes seguros y accionables.

## Testing

- Unit tests para mappers e invariantes.
- Hook/integration tests para queries, mutations e invalidaciones.
- Component tests para permisos y estados de UI.
- E2E solo para flujos críticos.

## Documentación

- Toda feature nueva requiere `AGENTS.md` desde la plantilla de `docs/templates`.
- Actualizar el archivo local en el mismo cambio que modifique contrato, responsabilidad, permisos o deuda conocida.
