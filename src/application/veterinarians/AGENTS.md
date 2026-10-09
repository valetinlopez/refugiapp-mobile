# Reglas para `src/application/veterinarians`

## Responsabilidad

- Contrato de aplicación compartido para resolver nombres de veterinarios en listados sin request por fila y una entidad individual en pantallas de detalle.
- Centraliza lectura, orden, cache y fallback del directorio de veterinarios activos.
- No gestiona el alta, edición, desactivación ni el detalle de veterinarios; pertenecen a `src/features/veterinarians`. Tampoco gestiona el selector del formulario clínico, que pertenece a `src/features/medical-records`.

## Contratos

- `GET /veterinarians?page=1&limit=100&isActive=true`: primera página máxima permitida por OpenAPI, acotada a veterinarios activos. El contrato publica `page`/`limit`/`isActive`; el orden alfabético por `name` se aplica en el cliente con `localeCompare('es')` para que todos los consumidores coincidan.
- `GET /veterinarians/:id`: resolución individual para detalles que deben presentar también un veterinario inactivo, sin importar internals de la feature `veterinarians`.
- `VeterinarianDirectoryEntry` es el modelo de vista de la frontera: `{ id, name, licenseNumber }`.
- `resolveVeterinarianLabel(namesById, id)`: `null` → "Sin veterinario asignado"; id inactivo o fuera de la página cargada → "Veterinario no disponible". Nunca se devuelve un UUID crudo.

## Invariantes

- `page` y `limit` se mantienen dentro de los rangos documentados por OpenAPI (`limit` máx 100).
- Un listado de mil registros no dispara N+1: las tarjetas resuelven el nombre con `namesById`, una única lectura compartida.
- La query key `veterinarianDirectoryKeys.directory()` usa la raíz `['veterinarians']` para que las invalidaciones por prefijo de las mutaciones de `veterinarians` refresquen el directorio sin imports cruzados.
- El detalle usa `veterinarianDirectoryKeys.detail(id)` y no se ejecuta cuando el registro no tiene veterinario asignado.

## Estructura

- `veterinarianDirectoryApi.ts`: llamada HTTP y mapper a `VeterinarianDirectoryEntry`.
- `veterinarianDirectoryKeys.ts`: query keys de TanStack Query.
- `useVeterinarianDirectory.ts`: query del directorio y `namesById` derivado, más `resolveVeterinarianLabel`.
- `useVeterinarianDirectoryEntry.ts`: query habilitable de una entidad individual.
- `index.ts`: superficie pública.

## Testing

- Unit tests de la API con transporte falso: parámetros enviados (`page=1&limit=100&isActive=true`) y orden alfabético en cliente.
- Unit tests de `resolveVeterinarianLabel`: `null`, id presente e id fuera de la página.

## Estado

### Implementado

- Directorio compartido de veterinarios activos para resolver nombres en `medical-records` (historia clínica global) sin N+1.
- Resolución individual para el detalle clínico, incluida una referencia histórica a un veterinario inactivo.
- Fallback explícito para veterinarios inactivos o fuera de la página cargada.

### Pendiente o deuda conocida

- El directorio queda limitado a la primera página (100 veterinarios activos); un veterinario fuera de ese volumen degrada al fallback explícito en lugar de consultarse individualmente para no reintroducir N+1. La cadena del formulario clínico (`medical-records/api/veterinarianOptionsApi`) conserva su propia query porque devuelve opciones para un selector; unificar ambas fuentes queda como deuda si el contrato habilita un listado no paginado.
