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
- `hooks/`: opciones de animales, alta e invalidaciones.
- `utils/`: esquema Zod y mapper del request.
- No registrar importes, comprobantes, tokens ni payloads financieros en logs.
- Si el alta falla después de subir media, borrar el asset huérfano best-effort.

## Testing

- Unit tests de importes y del multipart.
- Component test RNTL del formulario.
- Hook test de invalidación de gastos y dashboard.

## Estado

### Implementado

- Alta de gasto con comprobante obligatorio, progreso/cancelación de subida y selección de animal.
- Guard visual por rol e invalidación de gastos y dashboard.

### Pendiente o deuda conocida

- El listado visual de gastos no forma parte de este ticket; las query keys quedan preparadas para su consumo.
