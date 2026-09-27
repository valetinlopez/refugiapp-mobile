# ADR-0008: Normalización de fechas de animal a `date-only` en la frontera

- Estado: aceptado
- Fecha: 2026-09-27

## Contexto

El QA reportó que al editar la ficha de un animal y guardar, la fecha de ingreso y la de nacimiento quedaban en blanco en el detalle y volvían vacías al reabrir la edición, pese a que la operación parecía exitosa.

El backend declara `intakeDate` y `birthDate` con `format: date` en `AnimalResponseDto`, pero los campos son `Date`/`Date | null` y no existe `ClassSerializerInterceptor` ni `@Transform` de fecha que los serialice como `YYYY-MM-DD`; `JSON.stringify` los emite como ISO datetime (`2026-01-10T00:00:00.000Z`).

El frontend asumía `YYYY-MM-DD` en tres puntos:

1. `formatDateMedium`/`formatDateShort` (`src/components/patterns/dateFormat.ts`) solo parsea `YYYY-MM-DD`; un ISO produce `''`, por eso el detalle quedaba en blanco.
2. `DateTimeField` (`parseValue`) no podía leer el valor precargado y el picker abría en la fecha de hoy; la etiqueta quedaba vacía con el botón "Quitar fecha" visible.
3. `toUpdateAnimalRequest` comparaba el ISO inicial contra el `YYYY-MM-DD` del formulario, generando PATCHes espurios o comparaciones inválidas.

Las demás fechas de la app (eventos, registros médicos, tareas) usan `format: date-time` y se presentan con `formatDateTime`, por lo que no se veían afectadas.

## Alternativas consideradas

1. Pedir al backend que serialice `intakeDate`/`birthDate` como `YYYY-MM-DD` (corregir la fuente). Más correcto en origen, pero exige release del backend, coordinación entre repos y no protege al cliente ante caches o respuestas ya emitidas con ISO.
2. Normalizar en el cliente en la frontera de red (`toAnimalView`) y en los mappers de edición. Inmediato, aislado a la feature y hace al cliente tolerante al formato real del servidor.

Se eligió la alternativa 2 porque el contrato OpenAPI declara `format: date` y el cliente ya tiene una frontera explícita (`toAnimalView`) para normalizar respuestas; además las escrituras usan `YYYY-MM-DD`, que es el valor que el backend espera.

## Decisión

- Crear `toDateOnly(value)` en `src/features/animals/utils/toDateOnly.ts`: conserva `YYYY-MM-DD`, recorta un ISO datetime a su parte de fecha y devuelve `null` ante valores vacíos o inválidos (validando además que sea una fecha de calendario real).
- Normalizar en la frontera con `toAnimalView` (`intakeDate` y `birthDate`), en `toUpdateAnimalFormValues` (defaults del formulario) y al comparar en `toUpdateAnimalRequest`.
- Mantener la validación `birthDate <= intakeDate` intacta: ambos lados ya llegan normalizados.

## Consecuencias positivas

- El detalle muestra las fechas con `formatDateMedium` y la edición precarga los valores elegidos; se resuelve el bug sin tocar backend.
- El punto único de normalización cubre listado, detalle, respuestas de escritura y cache de TanStack Query.
- El PATCH diferencial vuelve a ser determinista: un ISO en el inicial no genera no-op ni comparaciones rotas.

## Costes y riesgos

- Es una solución de cliente tolerante al formato real; si el backend corrige la serialización a `date-only`, la normalización sigue siendo un no-op (invarianza preservada).
- `toDateOnly` depende del patrón `YYYY-MM-DD` del ISO estándar; si el backend emitiera otro formato, la frontera degradaría a `null`/vacío en vez de fallar.

## Criterios de revisión

- Si el backend pasa a serializar `YYYY-MM-DD` (y el snapshot OpenAPI refleja `format: date` real), el ADR puede archivarse como resuelto sin cambios de cliente.
- Toda fecha futura de la feature `animals` debe pasar por `toDateOnly` en la frontera, no normalizarse en componentes ni en `dateFormat`.
