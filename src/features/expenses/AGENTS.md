# Reglas para `expenses`

## Responsabilidad

- Gestiona gastos asociados a animales y sus comprobantes.
- No gestiona la ficha del animal ni las métricas del dashboard.

## Contratos

- `POST /expenses`: crea un gasto con `animalId`, `category`, `amountCents`, `currency`, `description`, `incurredAt` y `ticketMediaId` opcional.
- `GET /expenses`: listado global paginado con filtros `page`, `limit`, `animalId`, `category` y rango `from`/`to` (ISO `date-time`). `total` es el conteo paginado del servidor; no existe un total monetario global.
- `GET /expenses/:id`: detalle de un gasto; devuelve `ExpenseResponseDto` y responde `404` si no existe o fue dado de baja. Lectura para los tres roles. Además de los campos del listado expone `createdAt`, `updatedAt` y `createdByUserId` (UUID nullable, sin nombre legible); la UI nunca muestra el UUID crudo y solo rotula "Registrado por" cuando el gasto pertenece al usuario actual.
- `GET /media/:id`: resuelve el comprobante del detalle (`secureUrl`, `resourceType`, `format` y `bytes` opcionales). El nombre de archivo se deriva de `format`; no se inventa metadata ausente.
- `DELETE /expenses/:id`: baja lógica (`deletedAt`) con `204` sin body; solo `admin` y `shelter_manager`. `404` si no existe o ya estaba dado de baja.
- `GET /animals/:animalId/expenses`: lectura paginada por animal (hoy solo primera página de 20 en su detalle).
- `POST /media/upload` sin owner crea el comprobante huérfano; `POST /expenses` lo vincula mediante `ticketMediaId`.
- Categorías: `food | medicine | veterinary | supplies | transport | other`.
- `amountCents` es un entero no negativo y la moneda enviada por esta UI es `ARS`.
- La UI captura el importe en unidades de pesos (`amountUnits`) y lo convierte a `amountCents` con `parseArsUnitsToCents` (sin aritmética de punto flotante); la moneda se presenta como `ARS` fijo no-editable.
- `incurredAt` se captura como fecha y hora locales (`DateTimeField` `mode="datetime"`) y se serializa a ISO en el mapper.
- `ticketMediaId` es opcional: el formulario puede enviarse sin comprobante y `toCreateExpenseRequest` omite el campo.
- Los tipos de red derivan de `openapi/mobile.openapi.json`.

## Permisos

- Los tres roles tienen lectura del listado global, del detalle (`GET /expenses/:id`) y del detalle por animal.
- `admin` y `shelter_manager` pueden crear gastos y darlos de baja (`DELETE /expenses/:id`); `veterinarian` no ve las acciones de alta ni de borrado.
- El backend vuelve a validar los permisos; el guard visual no lo reemplaza.

## Estructura y seguridad

- `api/`: gastos (alta, detalle `getById`, listado global, listado por animal y baja `remove`) y subida/borrado del comprobante.
- `components/`: formulario con selectores por `BottomSheet` (`ExpenseForm`, `ExpensePickerFields`, `ExpenseAnimalAvatar`), selector de comprobante (`ExpenseReceiptPicker`), pantalla compositora `CreateExpenseScreen`, listado global (`ExpensesOverviewScreen`, `ExpenseOverviewCard`, `ExpenseFilterSheets`) y detalle (`ExpenseDetailScreen`, `ExpenseDetail`, `ExpenseReceiptCard`).
- `hooks/`: alta (`useCreateExpense` con comprobante opcional), `useInfiniteExpenses` (paginación global + `flattenExpensePages`), `useAnimalExpenses`, detalle (`useExpense`, `useExpenseAnimal`, `useExpenseReceiptAsset`), baja (`useDeleteExpense`), invalidaciones, `expenseKeys` y `useExpenseAnimals` (delega las opciones de animales en `src/application/animals`).
- `utils/`: esquema Zod (`amountUnits` + `incurredAt` datetime), conversión pura a centavos (`expenseAmount`), mapper del request, presentación (`expensePresentation`), importes (`expenseTotals`), filtros de fecha (`expenseFilters`), comprobante (`expenseReceipt`: tamaño `es-AR`, etiqueta de recurso, nombre derivado de `format` y validación de URL https) y `expenseErrorMessages` (`toCreateExpenseErrorMessage`, `toExpenseDetailErrorMessage` y `toDeleteExpenseErrorMessage` traducen 400/422, 403, 404, 409, cancelación de subida y red/timeout a español rioplatense, delegando el fallback en `toApiErrorMessage` de `core/api`).
- No registrar importes, comprobantes, tokens ni payloads financieros en logs.
- Si el alta falla después de subir media, borrar el asset huérfano best-effort (limpieza silenciosa; no es una acción iniciada por el usuario y no requiere confirmación).

## Testing

- Unit tests de la conversión de unidades a centavos (`expenseAmount`), del esquema y mapper del request, de los filtros de fecha y del multipart.
- Client API tests (transporte falso) del listado, del detalle (`getById`, mapeo `ticketMediaId` nulo, `createdByUserId` nulo, `404` y `403`) y de la baja (`remove`, `204` sin body, `404` y `403`).
- Unit tests de los mensajes de error de alta, detalle y borrado.
- Unit tests del detalle: `toExpenseDetail`/`toExpenseReceipt` (centavos enteros, `format`/`bytes` a `null`), presentación del comprobante (tamaño `es-AR`, etiqueta de recurso, nombre derivado) y validación de URL https.
- Component test RNTL del formulario y del listado global (estados, permisos, filtros y fallback de nombre), y del detalle (`ExpenseDetail` + `ExpenseDetailScreen`: confirmación de borrado, permiso de solo lectura, estados loading/offline/error, comprobante vacío y apertura validada).
- Hook tests de paginación global (`useInfiniteExpenses`), deduplicación, detalle (`useExpense` con id vacío que no consulta) e invalidación de gastos y dashboard tras la baja (`useDeleteExpense`).

## Estado

### Implementado

- Alta de gasto con importe en unidades de pesos y conversión exacta a `amountCents` (`parseArsUnitsToCents`, sin floats), moneda `ARS` explícita y fija, fecha y hora (`DateTimeField` `datetime`), descripción con contador `x/1000` (divergencia `ux`; OpenAPI no publica `maxLength`), y comprobante realmente opcional (subir imagen o PDF, fotografiar o elegir de galería; cancelación y progreso de subida; `ticketMediaId` ausente no se envía).
- Rediseño D23 (RFG-156): `CreateExpenseScreen` (feature) con guard `canManageExpenses`, `DecorativeBackground`, eyebrow `Gastos` + `ScreenHeader` `display`, estados loading/error/offline/fallback/vacío con reintento, y anuncio accesible del resultado; la ruta `app/(app)/expenses/new.tsx` valida el UUID y compone `AccountHeaderRow` (`fallbackHref='/expenses'`) + la pantalla. Selector de animal por `BottomSheet` con búsqueda por nombre y foto cacheada (`useAnimalOptionPhoto`); selector de categoría por `BottomSheet` con las 6 categorías del contrato.
- `incurredAt` se captura como fecha y hora locales mediante `DateTimeField`; el valor inicial usa día y hora locales y se transforma a ISO solo en el mapper del request.
- Guard visual por rol e invalidación de gastos y dashboard.
- El selector de animal usa el contrato compartido `src/application/animals`: `GET /animals?page=1&limit=100` sin sort en el request (orden alfabético en cliente) y fallback a `GET /animals/:id` cuando llega un `animalId` UUID válido y el listado falla o no lo contiene; el error se traduce por causa y el reintento funciona.
- Listado de gastos por animal en su detalle, con importe `amountCents` formateado en ARS, categoría, fecha, estados de carga/vacío/error y miniatura del comprobante cuando el contrato devuelve un UUID válido. La miniatura usa `expo-image`, caché memoria/disco y una transformación Cloudinary cuadrada de 400 px.
- El listado por animal ofrece `Registrar gasto` a roles de escritura con `animalId` precargado. Como el backend no expone `PATCH /expenses/:id`, informa que la edición no está disponible y no muestra una acción rota; `veterinarian` conserva una vista de solo lectura.
- Errores del alta traducidos con `toCreateExpenseErrorMessage` (validación, permisos, recurso ausente, comprobante vinculado, cancelación de subida y red/timeout), sin exponer payloads ni tokens.
- Listado global D21 (RFG-154): ruta delgada `app/(app)/expenses/index.tsx` (accesible desde "Más > Gestión" para los tres roles) que compone `ExpensesOverviewScreen`. `useInfiniteExpenses` pagina `GET /expenses` en páginas de 20 con deduplicación por UUID y sin reordenar; filtros por animal, categoría y rango de fechas (presets + rango simple con `DateTimeField`, día local inclusivo y validación `from ≤ to`). "Subtotal cargado" suma solo las páginas cargadas (`sumExpenseAmountCents`, enteros) y nunca se rotula como total global; el total de registros proviene del `total` paginado. Los nombres de animal se resuelven best-effort desde la cache compartida de `src/application/animals` con fallback explícito `Animal no disponible` (nunca UUID crudo). Estados loading/vacío/error/offline, pull-to-refresh, paginación incremental y FAB de alta solo con `canManageExpenses`.
- Contrato D22 (RFG-155): el snapshot `openapi/mobile.openapi.json` incorpora `GET /expenses/{id}` y `DELETE /expenses/{id}` (ambos ya publicados por el backend) y los tipos generados siguen derivándose del snapshot sin tipos escritos a mano. `expensesApi` expone `getById` (mapea `ExpenseResponseDto` con `toExpense`, normaliza `ticketMediaId` nulo) y `remove` (`DELETE`, `204` sin body, sin mapper); `toExpenseDetailErrorMessage` y `toDeleteExpenseErrorMessage` traducen 403/404 y delegan el fallback en `toApiErrorMessage`. Sin hooks, query keys de detalle ni UI de detalle, que corresponden a RFG-157.
- Detalle y borrado D24 (RFG-157): ruta delgada `app/(app)/expenses/[id]/index.tsx` (valida el UUID y compone `AccountHeaderRow` con `fallbackHref='/expenses'`) sobre `ExpenseDetailScreen`. `useExpense` consulta `GET /expenses/:id` con su propia query key (`expenseKeys.detail`), `useExpenseAnimal` resuelve la identidad del animal desde `src/application/animals` y `useExpenseReceiptAsset` comparte la cache de `GET /media/:id` con `useExpenseReceipt` para derivar nombre, tipo y tamaño del comprobante. `ExpenseDetail` presenta importe formateado desde `amountCents`, badge de categoría/moneda, fechas `es-AR`, animal navegable a su ficha y comprobante con apertura segura (`https` validada con `Linking`, error anunciado sin romper la pantalla); la fila "Registrado por" solo aparece con un label seguro (nunca el UUID crudo). El borrado (`useDeleteExpense`, `DELETE /expenses/:id`) exige `ConfirmDialog`, no es optimista y, al confirmarse, elimina la query de detalle e invalida listados y dashboard antes de volver al origen con anuncio accesible. Estados loading/empty/error/offline/restricted y guard `canManageExpenses`; las tarjetas del listado global y del detalle del animal navegan al detalle.

### Pendiente o deuda conocida

- El listado por animal muestra la primera página de 20 gastos; todavía no expone paginación incremental.
- El nombre legible del actor (`createdByUserId`) y un código de animal correlativo no existen en el contrato; la UI los omite en lugar de inventarlos o mostrar UUIDs.
