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
- `GET /media/:id`: lectura de un asset para mostrar la foto de perfil actual.
- `POST /animals/:animalId/events`: alta de evento general para `admin` y `shelter_manager`.
- `GET /animals/:animalId/events`: lectura para los tres roles.

No existe un `DELETE /animals/:id` documentado actualmente. No agregar o invocar endpoints sin confirmarlos en OpenAPI.

- `POST /media/upload` sin `ownerType`/`ownerId`: alta de foto huérfana para `admin`, `shelter_manager` y `veterinarian`; se vincula con `profilePhotoMediaId` al crear o editar el animal. Los huérfanos no vinculados se purgan por antigüedad.

## Datos e invariantes

- Estados: `admitted`, `under_treatment`, `available_for_adoption`, `adopted`, `deceased`.
- IDs: UUID.
- La fecha de nacimiento no puede ser posterior al ingreso.
- La foto se referencia mediante `profilePhotoMediaId`; no enviar URLs arbitrarias como contrato de creación o edición.
- Transiciones válidas decididas por el backend (matriz en `utils/animalTransitions.ts`):
  - `admitted` → `under_treatment | available_for_adoption | deceased`
  - `under_treatment` → `admitted | available_for_adoption | deceased`
  - `available_for_adoption` → `under_treatment | adopted | deceased`
  - `adopted` y `deceased` son terminales.
- La UI anticipa las transiciones para usabilidad, pero el backend sigue siendo autoridad final; manejar `409`.
- `adopted` y `deceased` son terminales.
- Los eventos manuales permitidos son `general_note`, `behavior_note` y `transfer`; los eventos de sistema no se crean desde UI.
- `PATCH /animals/:id` no cambia `status`; el cambio de estado usa `PATCH /animals/:id/status`.

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

- `api/`: endpoints de animals (alta, detalle, edición, cambio de estado) y media (alta huérfana y lectura).
- `hooks/`: `animalKeys`, `useAnimal`, `useCreateAnimal`, `useUpdateAnimal`, `useChangeAnimalStatus`, `useAnimalPhoto` e invalidaciones; listado cuando tenga UI.
- `components/`: formulario compartido de perfil (alta/edición), selector de foto de perfil, selector de estado con confirmación y modal de consecuencia.
- `types/`: modelos de vista y aliases derivados de OpenAPI.
- `utils/`: esquemas Zod, mappers al DTO, matriz de transiciones y traducción de errores de backend.
- Los componentes reutilizables sin dominio permanecen en `src/components`.

## Estrategia de escritura

- No se usan optimistic updates: `useUpdateAnimal` y `useChangeAnimalStatus` invalidan queries y, al volver del detalle, la pantalla refetchea la fuente de verdad.
- `useUpdateAnimal` sube una foto huérfana solo si el usuario eligió una; si el `PATCH` falla después de subir, borra el asset huérfano best-effort.
- `PATCH /animals/:id/status` crea un evento `status_change` trazable; la UI explica la consecuencia antes de confirmar y reserva el tono danger para estados terminales.

## Testing

- Unit tests para mappers, filtros, matriz de transiciones y presentación de estados.
- Hook tests para paginación, invalidación y errores 404/409/403.
- Component tests para capacidades por rol, confirmación de estado y estados de feedback.
- E2E del flujo principal cuando el producto defina su alcance.

## Estado

### Implementado

- Tipos de red derivados de `openapi/mobile.openapi.json` (`CreateAnimalDto`, `UpdateAnimalDto`, `ChangeAnimalStatusDto`, `AnimalResponseDto`, `PaginatedAnimalsResponseDto`, `MediaAssetResponseDto`) con modelo de vista `Animal` y mapper `toAnimalView`.
- Alta de animales (`POST /animals`) para `admin` y `shelter_manager` mediante `useCreateAnimal`.
- Edición de ficha (`PATCH /animals/:id`) para `admin` y `shelter_manager` mediante `useUpdateAnimal`, sin tocar `status`.
- Cambio de estado (`PATCH /animals/:id/status`) para `admin` y `shelter_manager` mediante `useChangeAnimalStatus`, con matriz de transiciones local y confirmación de consecuencia.
- Subida de foto de perfil como asset huérfano (`POST /media/upload` multipart) y vinculación con `profilePhotoMediaId` al crear o editar; limpieza best-effort del huérfano si la escritura falla después de subir.
- Lectura de asset (`GET /media/:id`) para mostrar la foto actual en detalle y edición (`useAnimalPhoto`).
- Detalle `app/(app)/animals/[id].tsx` (los tres roles) con edición y cambio de estado solo para `admin`/`shelter_manager`.
- Edición `app/(app)/animals/[id]/edit.tsx` con guard visual por rol y formulario compartido `AnimalProfileForm` (modos create/edit).
- Formulario con React Hook Form + Zod, mensajes en español y validación cruzada `birthDate <= intakeDate`.
- Confirmación de cambio de estado con `StatusConfirmDialog` (modal del sistema de diseño, sin `Alert` nativo).
- Traducción de errores de backend a mensajes claros (`toCreateAnimalErrorMessage`, `toUpdateAnimalErrorMessage`, `toChangeStatusErrorMessage`).
- Unit tests (matriz de transiciones, esquemas, mappers, mensajes), integración multipart con transporte falso y component tests con RNTL.

### Deuda conocida

- El listado tiene cliente con tipos reconciliados pero sin UI ni hooks de query; el detalle se alcanza por deep link o navegación directa.
- Falta E2E en dispositivo para alta, edición y cambio de estado (éxito, validación y error 403).
