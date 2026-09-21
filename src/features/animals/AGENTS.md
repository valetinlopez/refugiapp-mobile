# Reglas para `animals`

## Responsabilidad

- Gestiona la ficha general del animal, listado, detalle, alta, edición y cambio de estado según permisos.
- Presenta historial general no clínico cuando se implemente.
- No contiene diagnósticos, tratamientos ni vacunas ocurridas; pertenecen a `medical-records`.
- No gestiona tareas futuras; pertenecen a `care-tasks`.

## Contrato del backend

- `GET /animals` y `GET /animals/:id`: lectura para los tres roles autenticados.
- `POST /animals`: alta para `admin` y `shelter_manager`.
- `PATCH /animals/:id`: edición de ficha para `admin` y `shelter_manager`; no cambia estado.
- `PATCH /animals/:id/status`: cambio de estado trazable para `admin` y `shelter_manager`.
- `POST /animals/:animalId/events`: alta de evento general para `admin` y `shelter_manager`.
- `GET /animals/:animalId/events`: lectura para los tres roles.

No existe un `DELETE /animals/:id` documentado actualmente. No agregar o invocar endpoints sin confirmarlos en OpenAPI.

- `POST /media/upload` sin `ownerType`/`ownerId`: alta de foto huérfana para `admin`, `shelter_manager` y `veterinarian`; se vincula con `profilePhotoMediaId` al crear el animal. Los huérfanos no vinculados se purgan por antigüedad.

## Datos e invariantes

- Estados: `admitted`, `under_treatment`, `available_for_adoption`, `adopted`, `deceased`.
- IDs: UUID.
- La fecha de nacimiento no puede ser posterior al ingreso.
- La foto se referencia mediante `profilePhotoMediaId`; no enviar URLs arbitrarias como contrato de creación.
- Las transiciones válidas las decide el backend. La UI puede anticiparlas para usabilidad, pero debe manejar `409`.
- `adopted` y `deceased` son terminales.
- Los eventos manuales permitidos son `general_note`, `behavior_note` y `transfer`; los eventos de sistema no se crean desde UI.

## Listado

- Paginación: `page >= 1`, `limit` entre 1 y 100; defaults 1 y 20.
- Filtros: `status`, `species`, `sex`, nombre parcial.
- Orden: `createdAt`, `intakeDate` o `name`; conservar el orden determinista del backend.
- TanStack Query administra cache e invalidación cuando se creen los hooks.

## Permisos de UI

- `admin`: lectura y escritura general.
- `shelter_manager`: lectura y escritura general.
- `veterinarian`: lectura; no mostrar alta, edición general ni cambio de estado como acciones disponibles.
- Un 403 del servidor sigue siendo posible y debe manejarse de forma segura.

## Estructura objetivo

- `api/`: endpoints de animals y media (alta huérfana).
- `hooks/`: `animalKeys`, `useCreateAnimal` e invalidaciones; listado y detalle cuando tengan UI.
- `components/`: formulario de alta y selector de foto de perfil.
- `types/`: modelos de vista y aliases derivados de OpenAPI.
- `utils/`: esquema Zod, mapper al DTO y traducción de errores de backend.
- Los componentes reutilizables sin dominio permanecen en `src/components`.

## Testing

- Unit tests para mappers, filtros y presentación de estados.
- Hook tests para paginación, invalidación y errores 404/409/403.
- Component tests para capacidades por rol y estados de feedback.
- E2E del flujo principal cuando el producto defina su alcance.

## Estado

### Implementado

- Tipos de red derivados de `openapi/mobile.openapi.json` (`CreateAnimalDto`, `AnimalResponseDto`, `PaginatedAnimalsResponseDto`, `MediaAssetResponseDto`) con modelo de vista `Animal` y mapper `toAnimalView`.
- Alta de animales (`POST /animals`) para `admin` y `shelter_manager` mediante `useCreateAnimal`.
- Subida de foto de perfil como asset huérfano (`POST /media/upload` multipart) y vinculación con `profilePhotoMediaId`; limpieza best-effort del huérfano si el alta falla después de subir.
- Formulario con React Hook Form + Zod, mensajes en español y validación cruzada `birthDate <= intakeDate`.
- Ruta `app/(app)/animals/new.tsx` con guard visual por rol y entrada desde la pestaña Animales.
- Traducción de errores de backend a mensajes claros (`toCreateAnimalErrorMessage`).
- Unit tests (esquema, mapper, mensajes), integración multipart con transporte falso y component tests con RNTL.

### Deuda conocida

- Listado y detalle tienen cliente con tipos reconciliados pero sin UI ni hooks de query; el siguiente flujo es el listado.
- Falta E2E en dispositivo para el alta (éxito, validación y error 403).
