# ADR-0019: Frontera compartida de directorio de veterinarios

- Estado: aceptado
- Fecha: 2026-10-08

## Contexto

La historia clínica global (RFG-158 / D25) lista `GET /medical-records` en la misma pantalla de referencia que `16-clinical-history-overview.jpeg`, donde cada tarjeta muestra el nombre del veterinario. El contrato `MedicalRecordResponseDto` solo publica `veterinarianId` (UUID nullable), sin nombre legible, y el criterio de aceptación exige que "no se realiza un request por fila" y que "veterinarios inactivos o fuera de cache muestran fallback explícito".

`src/features/medical-records` ya contaba con `veterinarianOptionsApi`/`useVeterinarianOptions` para el selector del formulario (`GET /veterinarians?page=1&limit=100&isActive=true`), pero esa query vive dentro de la feature y no es importable desde la historia global sin arrastrar internals. Además, las tarjetas futuras de los flujos clínicos pendientes (RFG-159 y RFG-160) y de veterinarios reutilizarían el mismo mapa id→nombre.

## Alternativas consideradas

1. **Reutilizar la query del formulario dentro de `medical-records`**: cero backends nuevos y cero requests por fila, pero la resolución de nombres quedaría atada a la implementación interna de una feature; cualquier otra feature o el futuro detalle clínico tendría que importar internals de `medical-records`, violando la dirección de dependencias.
2. **Resolver por detalle por fila (`GET /veterinarians/:id`)**: viola directamente el criterio "sin N+1" (un request por tarjeta) y no tiene fallback razonable para id inactivos.
3. **Crear `src/application/veterinarians`** como frontera de aplicación con el contrato mínimo del directorio activo (`{ id, name, licenseNumber }`), su query key y `resolveVeterinarianLabel`: lectura única compartida, sin per-fila, y reutilizable por RFG-159/160 y la feature de veterinarios.

Se eligió la alternativa 3, análoga a `src/application/animals` (ADR-0009): hay reutilización real inminente (historia global hoy; detalle y alta clínica mañana), `application` ya está previsto en `architecture.md` para esta coordinación entre features, y un mapa compartido elimina duplicación de contrato y de query key.

## Decisión

- Crear `src/application/veterinarians` con:
  - `veterinarianDirectoryApi.listActive`: `GET /veterinarians?page=1&limit=100&isActive=true`, orden alfabético en cliente con `localeCompare('es')`.
  - `veterinarianDirectoryKeys.directory()` con raíz `['veterinarians']`: las invalidaciones por prefijo de las mutaciones de la feature `veterinarians` refrescan el directorio sin imports cruzados.
  - `useVeterinarianDirectory`: query compartida (staleTime 5 min) y `namesById` derivado.
  - `resolveVeterinarianLabel`: `null` → "Sin veterinario asignado"; id inactivo o fuera de la página → "Veterinario no disponible"; nunca un UUID crudo.
- `MedicalRecordsOverviewScreen` consume el directorio para cada tarjeta; no hay ninguna consulta por fila.
- El formulario clínico conserva su `veterinarianOptionsApi` porque devuelve opciones para un selector; la unificación queda como deuda si el contrato habilita un listado no paginado.

## Consecuencias positivas

- Sin N+1: un solo listado compartido resuelve todos los nombres de veterinarios de la historia global.
- Fallback explícito y seguro para veterinarios inactivos o fuera de la primera página.
- Frontera reutilizable por RFG-159/160 sin duplicar contrato ni query key.

## Costes y riesgos

- El directorio queda limitado a la primera página (100 activos); un veterinario fuera de ese volumen degrada al fallback en lugar de consultarse para no reintroducir N+1.
- Convivirán dos queries del mismo endpoint (directorio compartido y opciones del formulario) hasta que se unifiquen; no es N+1, pero es una llamada adicional tolerada y documentada.

## Criterios de revisión

- Si el backend publica un listado de veterinarios no paginado o enriquece `MedicalRecordResponseDto` con un nombre legible, la frontera puede simplificarse y `resolveVeterinarianLabel` quedar como caso nulo.
- Toda feature o frontera que necesite resolver el nombre de un veterinario en un listado debe consumir `src/application/veterinarians`, no re-implementar el listado.
