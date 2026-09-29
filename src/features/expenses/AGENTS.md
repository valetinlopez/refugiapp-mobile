# Reglas para `expenses`

## Responsabilidad

- Gestiona gastos asociados a animales y sus comprobantes.
- No gestiona la ficha del animal ni las métricas del dashboard.

## Contratos

- `POST /expenses`: crea un gasto con `animalId`, `category`, `amountCents`, `currency`, `description`, `incurredAt` y `ticketMediaId` opcional.
- `GET /expenses` y `GET /animals/:animalId/expenses`: lectura paginada para los tres roles.
- `POST /media/upload` sin owner crea el comprobante huérfano; `POST /expenses` lo vincula mediante `ticketMediaId`.
- Categorías: `food | medicine | veterinary | supplies | transport | other`.
- `amountCents` es un entero no negativo y la moneda enviada por esta UI es `ARS`.
- Los tipos de red derivan de `openapi/mobile.openapi.json`.

## Permisos

- `admin` y `shelter_manager` pueden crear gastos.
- `veterinarian` tiene acceso de lectura y no ve la acción de alta.
- El backend vuelve a validar los permisos; el guard visual no lo reemplaza.

## Estructura y seguridad

- `api/`: gastos y subida/borrado del comprobante.
- `components/`: formulario y selector de comprobante.
- `hooks/`: alta, invalidaciones y `useExpenseAnimals` (delega las opciones de animales en `src/application/animals`).
- `utils/`: esquema Zod, mapper del request y `expenseErrorMessages` (`toCreateExpenseErrorMessage` traduce 400/422, 403, 404, 409, cancelación de subida y red/timeout a español rioplatense, delegando el fallback en `toApiErrorMessage` de `core/api`).
- No registrar importes, comprobantes, tokens ni payloads financieros en logs.
- Si el alta falla después de subir media, borrar el asset huérfano best-effort (limpieza silenciosa; no es una acción iniciada por el usuario y no requiere confirmación).

## Testing

- Unit tests de importes y del multipart.
- Component test RNTL del formulario.
- Hook test de invalidación de gastos y dashboard.

## Estado

### Implementado

- Alta de gasto con comprobante obligatorio, progreso/cancelación de subida y selección de animal.
- `incurredAt` se captura como fecha de calendario local mediante `DateTimeField`; el valor inicial usa el día local y se transforma a ISO solo en el mapper del request.
- Guard visual por rol e invalidación de gastos y dashboard.
- El selector de animal usa el contrato compartido `src/application/animals`: `GET /animals?page=1&limit=100` sin sort en el request (orden alfabético en cliente) y fallback a `GET /animals/:id` cuando llega un `animalId` UUID válido y el listado falla o no lo contiene; el error se traduce por causa y el reintento funciona.
- Listado de gastos por animal en su detalle, con importe `amountCents` formateado en ARS, categoría, fecha, estados de carga/vacío/error y miniatura del comprobante cuando el contrato devuelve un UUID válido.
- El listado por animal ofrece `Registrar gasto` a roles de escritura con `animalId` precargado. Como el backend no expone `PATCH /expenses/:id`, informa que la edición no está disponible y no muestra una acción rota; `veterinarian` conserva una vista de solo lectura.
- Errores del alta traducidos con `toCreateExpenseErrorMessage` (validación, permisos, recurso ausente, comprobante vinculado, cancelación de subida y red/timeout), sin exponer payloads ni tokens.

### Pendiente o deuda conocida

- El listado por animal muestra la primera página de 20 gastos; todavía no expone paginación incremental.
