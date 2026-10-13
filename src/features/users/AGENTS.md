# Reglas para `users`

## Responsabilidad

- Gestiona el listado, alta, edicion, activacion, desactivacion y baja de usuarios internos.
- Esta feature es exclusiva del rol `admin`; la interfaz oculta el acceso y el backend vuelve a validar permisos.
- La edicion no incluye contrasena.

## Datos y seguridad

- Los contratos se derivan de `openapi/mobile.openapi.json`.
- `GET /users` devuelve una pagina determinista para `admin`, incluye cuentas activas e inactivas, usa defaults `page=1` y `limit=20`, y admite un maximo de 100 elementos por pagina.
- `PATCH /users/:id` edita `firstName`, `lastName`, `email` y `roles` para `admin`. No existe `GET /users/:id`: la pantalla de edicion resuelve el usuario desde la cache del listado (`useUser`) y valida el `id` con `isUuid`.
- `DELETE /users/:id` da de baja (baja logica `isActive=false` + `deletedAt`, como `POST deactivate`) solo para `admin` (`canDeleteProtected`); `204` sin body, `404` inexistente o ya eliminado, `403` sin rol, `409 LAST_ADMIN_FORBIDDEN` si es el ultimo administrador activo. Registra `user.delete` en auditoria.
- Nunca conservar, registrar ni volver a mostrar la password inicial despues del envio.
- El alta envia `roles` como arreglo no vacio limitado a `admin`, `shelter_manager` y `veterinarian`; la seleccion multiple refleja exactamente el contrato OpenAPI.
- Normalizar el email antes de enviarlo y traducir conflictos `EMAIL_ALREADY_EXISTS` sin exponer detalles internos.
- Traducir `LAST_ADMIN_FORBIDDEN` (409), `EMPTY_UPDATE_PAYLOAD`/`INVALID_PAYLOAD` (400), 403 y 404 con mensajes accionables sin exponer detalles internos.
- La baja usa `toDeleteUserErrorMessage` (403/404/409 + `LAST_ADMIN_FORBIDDEN` con guia de asignar otro admin primero) sobre el fallback seguro de `core/api`.
- Invalidar las consultas de usuarios despues de crear, editar, activar, desactivar o eliminar.

## UI y testing

- El alta D06-04 se implementa en `CreateUserScreen`: organiza datos personales, acceso inicial y roles en cards, informa password minima de 12 caracteres y exige `ConfirmDialog` antes de ejecutar `POST /users`. Los errores de red, email duplicado, validacion y permisos deben distinguirse con texto accesible.
- En web, los inputs del alta usan `testID` con prefijo `create-user-`; `app/+html.tsx` lo consume para neutralizar el fondo celeste de `-webkit-autofill` y aplicar el foco semantico `focus`, sin desactivar autofill.
- Confirmar la desactivacion antes de ejecutar la mutacion con `ConfirmDialog` compartido (via `UserStatusDialog`), explicando la consecuencia y bloqueando ambas acciones durante `submitting`.
- La baja (`UserDeleteDialog`) vive solo en la edicion (detalle) con `canDeleteProtected`: primer `ConfirmDialog` con el nombre (`¿Eliminar a {nombre} permanentemente?`) y segundo dialogo con `Switch` `Entiendo que es permanente` que habilita `Eliminar definitivamente`. Cancelar no deja efectos; el exito anuncia `Usuario eliminado.` y vuelve al listado. La perdida de capacidad cierra el dialogo y bloquea la mutacion.
- Confirmar el cambio de rol en edicion con `ConfirmDialog` (`variant="primary"`), explicando que queda auditado y puede rechazarse si es el ultimo administrador; los cambios solo de perfil se guardan sin confirmacion.
- La edicion usa `UserForm` en modo `edit` (sin campo de contrasena, precargado desde el usuario) con mapper diferencial `toUpdateUserPayload`: solo envia campos cambiados y bloquea el guardado sin cambios para evitar `EMPTY_UPDATE_PAYLOAD`.
- La card de usuario usa el patron de tarjeta de contenido: nombre y email truncados a una linea con elipsis, columna de texto `flex: 1` + `minWidth: 0`, badge de estado con icono y texto (`check`/`close`, `flexShrink: 0`) y accion de estado contenida (`secondary` para desactivar, `primary` para activar); nunca una accion `danger` a lo ancho como CTA dominante. La accion `Editar` es `ghost` secundaria y solo se renderiza con `onEdit`.
- El `accessibilityLabel` de la card y de cada texto truncado conserva el valor completo (nombre, email, roles y estado).
- Mantener visibles el rol y el estado de cada cuenta sin depender solo del color.
- El header del listado envuelve sin solaparse en pantallas estrechas (`minWidth: 0` en el titulo, `flexShrink: 0` en el boton) y la lista reserva `paddingBottom` con `insets.bottom` para que la ultima card no quede tapada por la navegacion o el safe area.
- Cubrir validacion del formulario y los flujos de listado, alta, edicion, activacion, desactivacion, baja (doble confirmacion, aceptacion explicita, `LAST_ADMIN_FORBIDDEN` sin UUIDs) y falta de permisos.
- Cubrir los deep links `/users`, `/users/new` y `/users/:id/edit` para los tres roles. Solo `admin` monta contenido; `shelter_manager` y `veterinarian` reciben el estado accesible “Sin permiso”. El rerender tras perder `canManageUsers` debe desmontar el contenido protegido.
- Cubrir el contrato HTTP y la invalidacion de la lista despues de cada mutacion.
