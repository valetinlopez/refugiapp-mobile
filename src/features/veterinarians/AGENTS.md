# Reglas para `veterinarians`

## Responsabilidad

- Gestiona el listado, detalle, alta, edición y desactivación de veterinarios según permisos.
- En el alta puede crear y vincular el usuario de acceso del veterinario (rol `veterinarian`) mediante `createUser`, sin tipear IDs manuales.
- No gestiona usuarios internos (pertenecen a `users`) ni la selección de veterinario del formulario clínico (pertenece a `medical-records`).

## Contratos

- `POST /veterinarians`: alta para `admin` y `shelter_manager`. Requiere `firstName`, `lastName` y `licenseNumber` (único). `email`, `phone`, `notes` y `createUser` son opcionales; `userId` existe en el contrato pero la UI no lo ofrece (ver ADR-0010).
- `createUser` acepta `email` (opcional; default: el email del perfil del veterinario), `password` (requerido, mínimo 12 caracteres), `firstName` y `lastName` (opcionales; default: los del veterinario). El backend crea o reutiliza el usuario de forma atómica y lo vincula.
- `userId` y `createUser` son mutuamente excluyentes en `POST /veterinarians` (`400 VET_USER_PAYLOAD_CONFLICT`); el mapper nunca los envía juntos.
- `GET /veterinarians`: listado paginado para los tres roles. Filtros `page`, `limit`, `name`, `licenseNumber` e `isActive`; orden determinista `lastName ASC, firstName ASC, id ASC`.
- `GET /veterinarians/:id`: detalle para los tres roles.
- `PATCH /veterinarians/:id`: edición parcial para `admin` y `shelter_manager`; omitir un campo lo conserva, `null` limpia `email`, `phone` y `notes`. La edición no modifica el vínculo de usuario.
- `POST /veterinarians/:id/deactivate`: desactivación lógica (conserva el historial clínico vinculado) para `admin` y `shelter_manager`.
- No existe `activate`: la reactivación queda pendiente del backend y la UI solo expone un botón deshabilitado con explicación.
- `VeterinarianResponseDto` incluye `user` (`UserResponseDto` sin `passwordHash`) o `null`; el detalle y el listado presentan `user.email` y rol, nunca el UUID crudo.
- Códigos de conflicto del backend: `LICENSE_NUMBER_ALREADY_EXISTS` (409), `EMAIL_ALREADY_EXISTS` (409), `USER_ALREADY_LINKED_TO_VETERINARIAN` (409), `VET_USER_PAYLOAD_CONFLICT` (400) y `VET_CREATE_USER_EMAIL_REQUIRED` (400); traducir a mensajes accionables sin exponer detalles internos.
- Los tipos de red derivan de `openapi/mobile.openapi.json`.

## Permisos

- Escritura (crear, editar, desactivar): `admin` y `shelter_manager` (`canManageVets`).
- Lectura (listado y detalle): los tres roles.
- El usuario auto-creado siempre recibe el rol `veterinarian` (regla del backend); la UI nunca ofrece roles de escritura.
- La interfaz oculta acciones no disponibles para el rol, pero el backend vuelve a validar; un `403` se maneja de forma segura.

## Datos e invariantes

- IDs: UUID. El formulario nunca pide un UUID de usuario a mano; el vínculo se resuelve con `createUser` (email + contraseña).
- `licenseNumber` es único: el alta y la edición deben traducir el 409 a un mensaje claro.
- Al crear usuario, debe existir al menos un email (del usuario o del perfil del veterinario); la validación local lo exige y el backend responde `400 VET_CREATE_USER_EMAIL_REQUIRED` si falta.
- La contraseña inicial solo vive en memoria del formulario; nunca se registra, persiste ni se muestra.
- La desactivación no borra: conserva la vinculación histórica desde `medical_records`.
- Reactivación: pendiente de backend; el botón queda deshabilitado con hint accesible, nunca se invoca un endpoint inexistente.

## Estructura

- `api/`: `veterinariansApi` (listado, detalle, alta, edición y desactivación).
- `components/`: `VeterinariansScreen`, `VeterinarianCard`, `VeterinarianDetail`, `VeterinarianForm`, `DeactivateVeterinarianDialog` y la sección de gestión de la pestaña "Más" (`ManagementSection`, `ManagementCard`).
- `VeterinarianForm` recibe `mode` (`create` | `edit`): solo en `create` expone el toggle "Crear usuario de acceso" con email y contraseña del usuario; en `edit` no ofrece vínculo.
- `ManagementSection` compone la sección "Gestión" del tab "Más" y enlaza rutas de administración por capacidades: veterinarios (todos los roles), usuarios (`canManageUsers`) y auditoría (`canReadAudit`). No ejecuta red ni importa internals de otras features; la ruta le inyecta las capacidades.
- `hooks/`: keys, listado infinito, detalle y mutations.
- `types.ts`: aliases derivados del contrato generado.
- `utils/`: esquema Zod, mappers create/edit (PATCH diferencial + `createUser`) y presentación/errores.

## Estrategia de escritura

- Sin optimistic updates: `useCreateVeterinarian`, `useUpdateVeterinarian` y `useDeactivateVeterinarian` invalidan `veterinarianKeys.all` (prefijo) tras éxito, lo que también refresca las opciones de veterinario activas del formulario clínico (`['veterinarians', 'options']`, prefijo compartido por valor, sin imports cruzados).
- El alta envía `createUser` solo cuando el toggle está activo; omite `userId` siempre.
- La edición usa PATCH diferencial: omite campos intactos y envía `null` para limpiar `email`, `phone` y `notes`; no toca `userId` ni `createUser`.
- La desactivación se confirma con `ConfirmDialog` del sistema de diseño (via `DeactivateVeterinarianDialog`); ninguna acción destructiva se ejecuta sin confirmación.

## UI y accesibilidad

- Mantener visibles matrícula y estado sin depender solo del color (`AppBadge` con texto).
- El toggle de creación de usuario usa `Switch` de RN con `accessibilityLabel`/`accessibilityHint`; el label del campo de contraseña indica el mínimo de 12 caracteres.
- Área táctil mínima de 44 × 44 y labels accesibles en botones.
- El detalle muestra `user.email` y rol legible; nunca un UUID.
- La reactivación deshabilitada comunica la causa con `accessibilityHint` y texto visible.

## Testing

- Unit tests de validación (requeridos, límites, email opcional, contraseña mínima 12, email presente al crear usuario).
- Unit tests de mappers create/edit (PATCH diferencial: omit vs null; `createUser` presente solo con toggle activo; sin `userId`).
- Unit tests de traducción de errores (409 matrícula, 409 email, 409 usuario vinculado, 400 `VET_*`, 403, 404, fallback seguro).
- Component tests RNTL: listado, detalle con/sin `user`, alta con y sin creación de usuario, edición sin sección de usuario, desactivación con confirmación, permisos por rol y reactivación deshabilitada.
- Hook tests de invalidación tras cada mutación.

## Estado

### Implementado

- Contrato OpenAPI móvil con `createUser` (`CreateVeterinarianUserDto`) y `user` en `VeterinarianResponseDto`; tipos generados.
- Formulario de alta sin UUID manual: toggle accesible "Crear usuario de acceso" con email y contraseña inicial, validación local espejo (contraseña ≥ 12, email presente).
- Mappers create/edit coherentes: `createUser` solo en alta, PATCH diferencial sin `userId`.
- Traducción de `EMAIL_ALREADY_EXISTS`, `VET_USER_PAYLOAD_CONFLICT` y `VET_CREATE_USER_EMAIL_REQUIRED`.
- Detalle y listado presentan el vínculo desde `user.email` y rol (ADR-0010).
- Guard visual por capacidad `canManageVets` para escritura; lectura para los tres roles.
- Reactivación deshabilitada con hint accesible y visible (pendiente de backend).

### Pendiente o deuda conocida

- Reactivación: requiere endpoint `POST /veterinarians/:id/activate` del backend para habilitar el botón.
- El listado de gestión no expone búsqueda por `licenseNumber` en UI; el API sí lo soporta.
- `ManagementSection` coordina destinos de tres dominios (veterinarios, usuarios, auditoría) dentro de la feature `veterinarians`. Si la sección "Gestión" agrega más entradas o un rol distinto necesita otra coordinación, extraerla a una frontera de `src/application` o a un patrón compartido de `src/components`, no ampliar su responsabilidad aquí.
- Vincular un usuario existente (selector de `GET /users`) queda fuera de alcance: el endpoint es exclusivo de `admin` y rompería para `shelter_manager` (ver ADR-0010).
