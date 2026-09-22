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

- `api/`: tareas y opciones mínimas de animales para el formulario.
- `components/`: formulario, tarjetas y confirmaciones.
- `hooks/`: queries, mutations e invalidaciones.
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
- Ruta principal `app/(app)/(tabs)/care-tasks.tsx` (tab "Tareas"); la ruta legacy `/inbox` redirige a `/care-tasks`.
- Alta y edición mediante formularios validados.
- Confirmaciones para completar y cancelar tareas pendientes.
- Invalidación de las queries de tareas y dashboard después de cada mutación.
- Guards visuales de escritura para `admin` y `shelter_manager`.

### Pendiente o deuda conocida

- El backend debe incorporar `type` y asignación de responsable antes de exponerlos en el formulario móvil.
- La fecha `dueAt` se ingresa como texto ISO sin selector nativo; usar `DateTimePicker` cuando se integre la mejora de media/formularios.
