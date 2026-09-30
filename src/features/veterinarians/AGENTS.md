# Reglas para `veterinarians`

## Responsabilidad

- Gestiona el listado, detalle, alta, edición y desactivación de veterinarios según permisos.
- No gestiona usuarios internos (pertenecen a `users`) ni la selección de veterinario del formulario clínico (pertenece a `medical-records`).

## Contratos

- `POST /veterinarians`: alta para `admin` y `shelter_manager`. Requiere `firstName`, `lastName` y `licenseNumber` (único). `email`, `phone`, `userId` y `notes` son opcionales.
- `GET /veterinarians`: listado paginado para los tres roles. Filtros `page`, `limit`, `name`, `licenseNumber` e `isActive`; orden determinista `lastName ASC, firstName ASC, id ASC`.
- `GET /veterinarians/:id`: detalle para los tres roles.
- `PATCH /veterinarians/:id`: edición parcial para `admin` y `shelter_manager`; omitir un campo lo conserva, `null` limpia `email`, `phone`, `userId` y `notes`.
- `POST /veterinarians/:id/deactivate`: desactivación lógica (conserva el historial clínico vinculado) para `admin` y `shelter_manager`.
- No existe `activate`: la reactivación queda pendiente del backend y la UI solo expone un botón deshabilitado con explicación.
- Códigos de conflicto del backend: `LICENSE_NUMBER_ALREADY_EXISTS` (409) y `USER_ALREADY_LINKED_TO_VETERINARIAN` (409); traducir a mensajes accionables sin exponer detalles internos.
- Los tipos de red derivan de `openapi/mobile.openapi.json`.

## Permisos

- Escritura (crear, editar, desactivar): `admin` y `shelter_manager` (`canManageVets`).
- Lectura (listado y detalle): los tres roles.
- La interfaz oculta acciones no disponibles para el rol, pero el backend vuelve a validar; un `403` se maneja de forma segura.

## Datos e invariantes

- IDs: UUID. `userId` es opcional y único cuando existe; se valida con `isUuid` de `src/core/validation`.
- `licenseNumber` es único: el alta y la edición deben traducir el 409 a un mensaje claro.
- La desactivación no borra: conserva la vinculación histórica desde `medical_records`.
- Reactivación: pendiente de backend; el botón queda deshabilitado con hint accesible, nunca se invoca un endpoint inexistente.

## Estructura

- `api/`: `veterinariansApi` (listado, detalle, alta, edición y desactivación).
- `components/`: `VeterinariansScreen`, `VeterinarianCard`, `VeterinarianDetail`, `VeterinarianForm` y `DeactivateVeterinarianDialog`.
- `hooks/`: keys, listado infinito, detalle y mutations.
- `types.ts`: aliases derivados del contrato generado.
- `utils/`: esquema Zod, mappers create/edit (PATCH diferencial) y presentación/errores.

## Estrategia de escritura

- Sin optimistic updates: `useCreateVeterinarian`, `useUpdateVeterinarian` y `useDeactivateVeterinarian` invalidan `veterinarianKeys.all` (prefijo) tras éxito, lo que también refresca las opciones de veterinario activas del formulario clínico (`['veterinarians', 'options']`, prefijo compartido por valor, sin imports cruzados).
- La edición usa PATCH diferencial: omite campos intactos y envía `null` para limpiar `email`, `phone`, `userId` y `notes`.
- La desactivación se confirma con `ConfirmDialog` del sistema de diseño (via `DeactivateVeterinarianDialog`); ninguna acción destructiva se ejecuta sin confirmación.

## UI y accesibilidad

- Mantener visibles matrícula y estado sin depender solo del color (`AppBadge` con texto).
- Área táctil mínima de 44 × 44 y labels accesibles en botones.
- La reactivación deshabilitada comunica la causa con `accessibilityHint` y texto visible.

## Testing

- Unit tests de validación (requeridos, límites, email/UUID opcionales).
- Unit tests de mappers create/edit (PATCH diferencial: omit vs null).
- Unit tests de traducción de errores (409 matrícula, 409 usuario vinculado, 403, 404, fallback seguro).
- Component tests RNTL: listado, detalle, alta, edición, desactivación con confirmación, permisos por rol y reactivación deshabilitada.
- Hook tests de invalidación tras cada mutación.

## Estado

### Implementado

- Contrato OpenAPI móvil ampliado con `POST /veterinarians`, `GET /veterinarians/:id`, `PATCH /veterinarians/:id` y `POST /veterinarians/:id/deactivate`; tipos generados (`CreateVeterinarianDto`, `UpdateVeterinarianDto`).
- Feature `veterinarians` con listado paginado infinito, detalle, alta, edición y desactivación.
- Guard visual por capacidad `canManageVets` para escritura; lectura para los tres roles.
- Reactivación deshabilitada con hint accesible y visible (pendiente de backend).

### Pendiente o deuda conocida

- Reactivación: requiere endpoint `POST /veterinarians/:id/activate` del backend para habilitar el botón.
- El listado de gestión no expone búsqueda por `licenseNumber` en UI; el API sí lo soporta.
