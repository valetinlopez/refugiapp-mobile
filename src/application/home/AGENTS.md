# Reglas para `src/application/home`

## Responsabilidad

- Frontera de aplicación compartida que coordina el resumen de solo lectura de Inicio (D36 / RFG-169).
- Centraliza lectura, orden, cache y derivación de las tareas de cuidado pendientes y del conteo de gastos que el dashboard no puede resolver por sí solo sin importar internals de otras features.
- No implementa UI ni presentación; expone estados derivados y datos mínimos para que `dashboard` los componga.

## Contratos

- `GET /care-tasks?page=1&limit=1&status=pending`: conteo exacto de cuidados pendientes leyendo `total`.
- `GET /care-tasks?page=1&limit=10&status=pending`: página best-effort usada para derivar prioridades. No promete el próximo vencimiento global.
- `GET /expenses?page=1&limit=1`: conteo de registros de gastos (no es un total monetario; el contrato no publica agregación).
- Los tipos de red derivan de `openapi/mobile.openapi.json` (`PaginatedCareTasksResponseDto`, `PaginatedExpensesResponseDto`).
- `overdue`, `upcoming` y `pending` son estados derivados de presentación; nunca se persisten ni se envían.
- La ventana de `upcoming` es de 24 horas, la misma que usa la feature `care-tasks`.

## Invariantes

- `page`/`limit` se mantienen dentro de los rangos documentados por OpenAPI.
- Un `total` inesperado (no numérico, negativo o infinito) se normaliza a `0`; nunca se renderiza `NaN`.
- Las prioridades se ordenan por urgencia sobre el conjunto cargado (vencidas primero, sin fecha al final) con desempate determinista por `id`; no se reordena una colección paginada completa.
- La resolución de nombres y fotos de animales delega en `src/application/animals`; no se agrega un request por fila.

## Estructura

- `homeKeys.ts`: query keys de TanStack Query (`['home']` como prefijo invalidable).
- `homeApi.ts`: llamadas HTTP y mapeo a `HomePriorityTask`.
- `homePriorities.ts`: derivación pura de estado y orden (`buildHomePriorities`, `resolveHomePriorityState`, `formatHomePriorityTime`).
- `useHomeSummary.ts`: hook compuesto `{ pendingCareTaskCount, priorities, expenseCount, … , refetch }`.
- `toHomeErrorMessage.ts`: traducción segura de errores.

## Dependencias

- Puede importar `src/core`, contratos API generados y `src/application/animals`.
- No puede importar `src/features`, `src/components` ni `src/theme`; por eso los iconos y tonos de presentación viven en la feature `dashboard`, no aquí.

## Testing

- Unit tests de `homeApi` con transporte falso: parámetros enviados, mapeo mínimo y normalización de `total`.
- Unit tests de `homePriorities`: derivación de estados, orden por urgencia, desempate y formato de hora.

## Estado

### Implementado

- Contrato read-only del resumen de Inicio: conteo exacto de pendientes, página de prioridades y conteo de gastos.
- Derivación pura de prioridades con estados `overdue`/`upcoming`/`pending` y orden por urgencia sobre el conjunto cargado.
- Query keys con prefijo `['home']` para invalidación por valor desde otras features sin imports cruzados.

### Pendiente o deuda conocida

- El conteo de gastos es un total de registros, no un agregado monetario (el contrato no lo publica).
- Las prioridades se limitan a la primera página de pendientes; un refugio con más volumen puede no ver su próxima tarea en Inicio. Queda documentado como best-effort.
