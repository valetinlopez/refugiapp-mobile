# Reglas para `care-tasks`

## Responsabilidad

- Gestiona el listado global y por animal de tareas de cuidado.
- Permite crear, editar, completar y cancelar tareas según permisos.
- No gestiona datos clínicos ocurridos ni eventos históricos del animal.

## Contratos

- `GET /care-tasks` lista tareas con paginación y filtros `animalId` y `status`.
- `GET /care-tasks/:id` obtiene una tarea.
- `POST /care-tasks` crea una tarea para un animal.
- `PATCH /care-tasks/:id` edita `title`, `description` y `dueAt` sin cambiar estado.
- `POST /care-tasks/:id/complete` y `POST /care-tasks/:id/cancel` cambian una tarea `pending`.
- Los tipos de red derivan de `openapi/mobile.openapi.json`.
- Estados persistidos: `pending`, `completed`, `cancelled`.
- El contrato vigente no contiene `type` ni un responsable asignable. `createdByUserId` lo toma el backend del JWT.

## Permisos

- Los tres roles autenticados pueden listar y consultar tareas.
- Solo `admin` y `shelter_manager` pueden crear, editar, completar y cancelar.
- Los guards visuales no sustituyen la autorización del backend.

## Estructura

- `api/`: tareas (el listado de opciones de animales delega en `src/application/animals`).
- `components/`: formulario, tarjetas y confirmaciones.
- `hooks/`: queries, mutations, `useCareTaskAnimals` (delega las opciones de animales en `src/application/animals`) e invalidaciones.
- `utils/`: validación, mapeo y presentación.
- `types.ts`: modelos de vista y aliases del contrato generado.

## Seguridad y privacidad

- No registrar payloads, JWT ni datos personales del creador.
- La cache de tareas se limpia junto con el resto de TanStack Query al cerrar sesión.

## Testing

- Unit tests para validación y derivación de estados visuales.
- Component tests RNTL para crear, editar, confirmar acciones y mostrar errores.
- Hook tests para invalidaciones de tareas y dashboard.

## Estado

### Implementado

- Listado global con filtro por animal, filtro por estado persistido (`pending`, `completed`, `cancelled`) y recarga manual.
- Listado embebido en el detalle del animal con completar/cancelar inline, confirmación e invalidación de queries después de la respuesta del backend (sin actualización optimista).
- El listado embebido ofrece `Nueva tarea` a roles de escritura, abre `/care-tasks/new?animalId=` con el animal precargado y conserva el detalle/pestaña Tareas como fallback contextual.
- Ruta principal `app/(app)/(tabs)/care-tasks.tsx` (tab visible "Cuidados", etiqueta renombrada en el layout; la ruta `care-tasks` no cambia); la ruta legacy `/inbox` redirige a `/care-tasks`.
- Detalle de tarea `app/(app)/care-tasks/[id]/index.tsx` (lectura para los tres roles, acciones inline según `canEditAnimal` mediante `CareTaskCard`), destino seguro de la navegación por notificación push (RFG-126).
- Alta y edición mediante formularios validados.
- `dueAt` opcional mediante selector nativo compartido; si se informa debe ser futuro, con fallback textual web.
- Confirmaciones para completar y cancelar tareas pendientes mediante `CareTaskActionDialog`, que envuelve el `ConfirmDialog` compartido del sistema de diseño (danger para cancelar, primary para completar).
- Invalidación de las queries de tareas y dashboard después de cada mutación.
- Piloto de reintento offline (RFG-87): `useCompleteCareTask`/`useCancelCareTask` aceptan una `MutationRetryQueue` opcional de `src/core/network`; ante un fallo de red encolan la transición (`care-task-complete:<id>`, `care-task-cancel:<id>`) en lugar de perderla, y `AnimalCareTasks` muestra "Cambios pendientes de envío" con `testID="care-tasks-pending"`. La cola reintenta con backoff al reconectar; solo acepta estas transiciones marcadas `safeToRetry`.
- Guards visuales de escritura para `admin` y `shelter_manager`.
- El selector de animal usa el contrato compartido `src/application/animals`: `GET /animals?page=1&limit=100` sin sort en el request (orden alfabético en cliente) y fallback a `GET /animals/:id` cuando llega un `animalId` UUID válido y el listado falla o no lo contiene; el error se traduce por causa y el reintento funciona.
- Mensaje de solo lectura explicativo para roles sin permisos de escritura en el listado; no se muestran botones que responderían 403.
- Estados finales (`completed`, `cancelled`) presentados con icono, texto y tono, sin acciones disponibles.
- Bloqueo de acciones por fila durante una mutación (`pendingActionId`), no global; el resto de la lista permanece interactiva.
- Rediseño del listado global D18 (RFG-151): `CareTasksOverviewScreen` mantiene la ruta del tab delgada, presenta contadores de `pending`/`completed`/`cancelled` mediante tres queries independientes `limit=1` que comparten `animalId`, y pagina la lista seleccionada con `useInfiniteQuery` en páginas de 20. El selector de animal se aplica tanto a la lista como a los tres contadores.
- Las tarjetas globales navegan al detalle y derivan `Vencida` cuando `dueAt < now` y `Próxima` cuando vence dentro de las siguientes 24 horas. Ambas son presentaciones con icono y texto; nunca se envían ni persisten como estados. La lista distingue carga, vacío, error, offline, reintento incremental y fin de paginación.

### Pendiente o deuda conocida

- El backend debe incorporar `type` y asignación de responsable antes de exponerlos en el formulario móvil.
- E2E `login → dashboard → detalle → completar tarea` por rol cubierto con Maestro (`maestro/*.yaml`; selectores `task-list`, `task-complete`, `task-cancel`, `confirm-dialog`). Sin binarios en E2E.
