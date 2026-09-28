# ADR-0009: Frontera de aplicación compartida para opciones de animales

- Estado: aceptado
- Fecha: 2026-09-28

## Contexto

QA reportó (S09) que los flujos "Crear tarea" y "Registrar gasto" estaban bloqueados: ambas pantallas mostraban "No se pudo preparar el formulario / No pudimos cargar los animales" y **Reintentar** nunca desbloqueaba el formulario.

El diagnóstico mostró que `listAnimalOptions` de `care-tasks` y `expenses` enviaba `GET /animals` con `sortBy=name&sortOrder=ASC`. El OpenAPI (`openapi/mobile.openapi.json`) y el DTO real del backend (`list-animals.query.dto.ts`) solo documentan `page`, `limit`, `status`, `species`, `sex` y `name`. El backend usa `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })`, por lo que cualquier query param no declarado produce un `400` determinista: ambas pantallas fallaban igual y el reintento repetía el mismo error.

Además, la lógica de opciones de animales estaba duplicada entre las dos features (mismo endpoint, misma transformación, tipo `AnimalOption` repetido) y no existía un camino para abrir el formulario con un animal concreto cuando el listado fallaba.

## Alternativas consideradas

1. **Corregir en el sitio** (quitar los params no documentados) y mantener la duplicación por feature, agregando además un `getAnimalOption`/fallback duplicado en cada feature. Cambio mínimo, pero mantiene la duplicación de contrato, tipo, query key y lógica de fallback; la siguiente feature que necesite opciones volvería a copiarlas.
2. **Agregar `sortBy`/`sortOrder` al contrato del backend** y ordenar en servidor. Orden correcto en origen, pero exige release del backend, ampliación del snapshot OpenAPI y no resuelve el fallback de apertura por `animalId`.
3. **Crear `src/application/animals`** como frontera de aplicación explícita que centralice el contrato de opciones mínimas (`{ id, name }`), el fallback por `GET /animals/:id`, las query keys compartidas y la traducción de errores por causa. Ambas features delegan en ella y la cache de TanStack Query se comparte entre formularios.

Se eligió la alternativa 3: hay reutilización real (dos features consumen exactamente el mismo contrato), el `architecture.md` ya contempla "un módulo de aplicación explícito" para coordinación entre features, y deja un único punto de verdad para futuros consumidores.

## Decisión

- Crear `src/application/animals` con:
  - `animalOptionsApi.list`: `GET /animals?page=1&limit=100` (sin `sortBy`/`sortOrder`; orden alfabético por `name` en cliente con `localeCompare('es')`).
  - `animalOptionsApi.getById`: `GET /animals/:id` para el fallback a un animal único.
  - `animalOptionsKeys`: query keys compartidas (`list()` y `detail(id)`).
  - `useAnimalOptions`, `useAnimalOption` y `useAnimalOptionsWithFallback`: el hook compuesto expone `{ data, errorMessage, isError, isFallback, isPending, refetch }`, habilitando el fallback solo cuando el `animalId` es un UUID válido y el listado falla o no contiene al animal.
  - `toAnimalOptionsErrorMessage`: mensajes accionables por causa (red, 400/422, 403, 404) sin exponer payloads, tokens ni `requestId`.
- Migrar las features `care-tasks` y `expenses`: eliminar `listAnimalOptions` y el tipo `AnimalOption` local, delegar en `src/application/animals` y re-exportar `AnimalOption` desde sus `types.ts`.
- Centralizar `isUuid` en `src/core/validation` (las features conservan un re-export fino en `utils/uuid.ts` para no romper rutas existentes).
- Actualizar las rutas `expenses/new` y `care-tasks/new`: validar el `animalId` de params, mostrar el error traducido por causa y, cuando el listado falla pero existe fallback, abrir el formulario con ese animal y una nota informativa no bloqueante.

## Consecuencias positivas

- Se corrige el `400` de raíz y **Reintentar** vuelve a ser funcional.
- El formulario abre con el animal indicado por params aunque el listado falle (criterio S09).
- Desaparece la duplicación de contrato, tipo, query keys y lógica de fallback; la cache de opciones se comparte entre features.
- El error se comunica según la causa real, sin datos sensibles.

## Costes y riesgos

- `src/application` es una capa nueva: solo debe crecer cuando exista reutilización real o una frontera técnica clara (misma regla que para abstracciones compartidas).
- El listado de opciones queda limitado a la primera página (máx. 100). Un refugio con más animales tendrá opciones parciales y el animal fuera de la primera página solo será alcanzable por fallback de detalle.
- Las rutas importan `isUuid` desde `src/core/validation`; `app` ya importaba de `core` (config, query, api), por lo que no introduce un borde nuevo de dependencia.

## Criterios de revisión

- Si el backend agrega `sortBy`/`sortOrder` de forma documentada, `animalOptionsApi.list` puede delegar el orden al servidor y el sort en cliente queda como no-op.
- Toda feature nueva que necesite opciones mínimas de animales debe consumir `src/application/animals`, no re-implementar el listado.
