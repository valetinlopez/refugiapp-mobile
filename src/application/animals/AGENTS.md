# Reglas para `src/application/animals`

## Responsabilidad

- Contrato de aplicación compartido para las opciones mínimas de animales (`{ id, name }`) que usan los formularios de varias features (actualmente `care-tasks` y `expenses`).
- Centraliza lectura, orden, cache y error del listado de opciones y del fallback a un animal único.
- No gestiona la ficha completa del animal, el detalle ni las métricas del dashboard; pertenecen a `src/features/animals`.

## Contratos

- `GET /animals` con `page=1&limit=100`: lista la primera página máxima permitida por OpenAPI. El contrato no publica `sortBy`/`sortOrder`; el backend ordena `createdAt ASC, id ASC`. El orden alfabético por `name` se aplica en el cliente con `localeCompare('es')`.
- `GET /animals/:id`: fallback a un animal único cuando llega un `animalId` UUID válido por params y el listado falla o no lo contiene.
- `AnimalOption` es el modelo de vista de la frontera: `{ id, name }`.
- El error se normaliza con `toAnimalOptionsErrorMessage`: mensajes accionables por causa (red, 400/422, 403, 404) sin exponer payloads, tokens ni `requestId`.

## Invariantes

- `page` y `limit` se mantienen dentro de los rangos documentados por OpenAPI (`limit` máx 100).
- Un `animalId` que no sea UUID no dispara la query de fallback.
- La query de listado comparte cache entre features (`animalOptionsKeys.list()`); el detalle usa `animalOptionsKeys.detail(id)`.

## Estructura

- `animalOptionsApi.ts`: llamadas HTTP y mapper a `AnimalOption`.
- `animalOptionsKeys.ts`: query keys de TanStack Query.
- `useAnimalOptions.ts`: query del listado.
- `useAnimalOption.ts`: query de un animal único, habilitable por `enabled`.
- `useAnimalOptionsWithFallback.ts`: hook compuesto que expone `{ data, errorMessage, isError, isFallback, isPending, refetch }` para abrir un formulario con o sin listado.
- `toAnimalOptionsErrorMessage.ts`: traducción segura de errores.

## Testing

- Unit tests de la API con transporte falso: parámetros enviados (sin `sortBy`/`sortOrder`), orden alfabético y mapeo de `GET /animals/:id`.
- Hook tests: listado exitoso, fallback cuando falla la lista, fallback a animal único precargado, error mapeado sin `animalId`, y no-fetch del fallback cuando la lista alcanza.

## Estado

### Implementado

- Contrato compartido de opciones de animales para los formularios de `care-tasks` y `expenses`.
- Lectura `GET /animals?page=1&limit=100` sin parámetros no documentados, con orden alfabético en cliente.
- Fallback `GET /animals/:id` ante `animalId` UUID válido cuando el listado falla o no contiene al animal.
- Mensajes de error accionables por causa y reintento funcional (vuelve a pedir el listado y, cuando corresponde, el fallback por animal único).
- `isPending` solo se expone en `true` mientras no hay datos (`data === undefined`); una query de fallback deshabilitada no mantiene el loader activo.

### Pendiente o deuda conocida

- El listado sigue limitado a la primera página (100 ítems); si un refugio supera ese volumen, las opciones serán parciales y el fallback por detalle es el único camino para animales fuera de la primera página.
