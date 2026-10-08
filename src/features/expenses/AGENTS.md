# Reglas para `expenses`

## Responsabilidad

- Gestiona gastos asociados a animales y sus comprobantes.
- No gestiona la ficha del animal ni las métricas del dashboard.

## Contratos

- `POST /expenses`: crea un gasto con `animalId`, `category`, `amountCents`, `currency`, `description`, `incurredAt` y `ticketMediaId` opcional.
- `GET /expenses`: listado global paginado con filtros `page`, `limit`, `animalId`, `category` y rango `from`/`to` (ISO `date-time`). `total` es el conteo paginado del servidor; no existe un total monetario global.
- `GET /animals/:animalId/expenses`: lectura paginada por animal (hoy solo primera página de 20 en su detalle).
- `POST /media/upload` sin owner crea el comprobante huérfano; `POST /expenses` lo vincula mediante `ticketMediaId`.
- Categorías: `food | medicine | veterinary | supplies | transport | other`.
- `amountCents` es un entero no negativo y la moneda enviada por esta UI es `ARS`.
- Los tipos de red derivan de `openapi/mobile.openapi.json`.

## Permisos

- Los tres roles tienen lectura del listado global y del detalle por animal.
- `admin` y `shelter_manager` pueden crear gastos; `veterinarian` no ve la acción de alta.
- El backend vuelve a validar los permisos; el guard visual no lo reemplaza.

## Estructura y seguridad

- `api/`: gastos (alta, listado global y por animal) y subida/borrado del comprobante.
- `components/`: formulario, selector de comprobante, listado global (`ExpensesOverviewScreen`, `ExpenseOverviewCard`, `ExpenseFilterSheets`).
- `hooks/`: alta, `useInfiniteExpenses` (paginación global + `flattenExpensePages`), `useAnimalExpenses`, invalidaciones, `expenseKeys` y `useExpenseAnimals` (delega las opciones de animales en `src/application/animals`).
- `utils/`: esquema Zod, mapper del request, presentación (`expensePresentation`), importes (`expenseTotals`), filtros de fecha (`expenseFilters`) y `expenseErrorMessages` (`toCreateExpenseErrorMessage` traduce 400/422, 403, 404, 409, cancelación de subida y red/timeout a español rioplatense, delegando el fallback en `toApiErrorMessage` de `core/api`).
- No registrar importes, comprobantes, tokens ni payloads financieros en logs.
- Si el alta falla después de subir media, borrar el asset huérfano best-effort (limpieza silenciosa; no es una acción iniciada por el usuario y no requiere confirmación).

## Testing

- Unit tests de importes, filtros de fecha y del multipart.
- Component test RNTL del formulario y del listado global (estados, permisos, filtros y fallback de nombre).
- Hook tests de paginación global (`useInfiniteExpenses`), deduplicación e invalidación de gastos y dashboard.

## Estado

### Implementado

- Alta de gasto con comprobante obligatorio, progreso/cancelación de subida y selección de animal.
- `incurredAt` se captura como fecha de calendario local mediante `DateTimeField`; el valor inicial usa el día local y se transforma a ISO solo en el mapper del request.
- Guard visual por rol e invalidación de gastos y dashboard.
- El selector de animal usa el contrato compartido `src/application/animals`: `GET /animals?page=1&limit=100` sin sort en el request (orden alfabético en cliente) y fallback a `GET /animals/:id` cuando llega un `animalId` UUID válido y el listado falla o no lo contiene; el error se traduce por causa y el reintento funciona.
- Listado de gastos por animal en su detalle, con importe `amountCents` formateado en ARS, categoría, fecha, estados de carga/vacío/error y miniatura del comprobante cuando el contrato devuelve un UUID válido. La miniatura usa `expo-image`, caché memoria/disco y una transformación Cloudinary cuadrada de 400 px.
- El listado por animal ofrece `Registrar gasto` a roles de escritura con `animalId` precargado. Como el backend no expone `PATCH /expenses/:id`, informa que la edición no está disponible y no muestra una acción rota; `veterinarian` conserva una vista de solo lectura.
- Errores del alta traducidos con `toCreateExpenseErrorMessage` (validación, permisos, recurso ausente, comprobante vinculado, cancelación de subida y red/timeout), sin exponer payloads ni tokens.
- Listado global D21 (RFG-154): ruta delgada `app/(app)/expenses/index.tsx` (accesible desde "Más > Gestión" para los tres roles) que compone `ExpensesOverviewScreen`. `useInfiniteExpenses` pagina `GET /expenses` en páginas de 20 con deduplicación por UUID y sin reordenar; filtros por animal, categoría y rango de fechas (presets + rango simple con `DateTimeField`, día local inclusivo y validación `from ≤ to`). "Subtotal cargado" suma solo las páginas cargadas (`sumExpenseAmountCents`, enteros) y nunca se rotula como total global; el total de registros proviene del `total` paginado. Los nombres de animal se resuelven best-effort desde la cache compartida de `src/application/animals` con fallback explícito `Animal no disponible` (nunca UUID crudo). Estados loading/vacío/error/offline, pull-to-refresh, paginación incremental y FAB de alta solo con `canManageExpenses`.

### Pendiente o deuda conocida

- El listado por animal muestra la primera página de 20 gastos; todavía no expone paginación incremental.
- El detalle y el borrado de un gasto dependen de ampliar el snapshot OpenAPI móvil (`RFG-155`) y de la historia de detalle (`RFG-157`); por eso las tarjetas del listado global hoy no navegan a un detalle inexistente.
