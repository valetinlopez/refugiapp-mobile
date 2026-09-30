# Reglas para `users`

## Responsabilidad

- Gestiona el listado, alta, activacion y desactivacion de usuarios internos.
- Esta feature es exclusiva del rol `admin`; la interfaz oculta el acceso y el backend vuelve a validar permisos.

## Datos y seguridad

- Los contratos se derivan de `openapi/mobile.openapi.json`.
- `GET /users` devuelve una pagina determinista para `admin`, incluye cuentas activas e inactivas, usa defaults `page=1` y `limit=20`, y admite un maximo de 100 elementos por pagina.
- Nunca conservar, registrar ni volver a mostrar la password inicial despues del envio.
- Normalizar el email antes de enviarlo y traducir conflictos `EMAIL_ALREADY_EXISTS` sin exponer detalles internos.
- Invalidar las consultas de usuarios despues de crear, activar o desactivar.

## UI y testing

- Confirmar la desactivacion antes de ejecutar la mutacion con `ConfirmDialog` compartido (via `UserStatusDialog`), explicando la consecuencia y bloqueando ambas acciones durante `submitting`.
- La card de usuario usa el patron de tarjeta de contenido: nombre y email truncados a una linea con elipsis, columna de texto `flex: 1` + `minWidth: 0`, badge de estado con icono y texto (`check`/`close`, `flexShrink: 0`) y accion de estado contenida (`secondary` para desactivar, `primary` para activar); nunca una accion `danger` a lo ancho como CTA dominante.
- El `accessibilityLabel` de la card y de cada texto truncado conserva el valor completo (nombre, email, roles y estado).
- Mantener visibles el rol y el estado de cada cuenta sin depender solo del color.
- El header del listado envuelve sin solaparse en pantallas estrechas (`minWidth: 0` en el titulo, `flexShrink: 0` en el boton) y la lista reserva `paddingBottom` con `insets.bottom` para que la ultima card no quede tapada por la navegacion o el safe area.
- Cubrir validacion del formulario y los flujos de listado, alta, activacion, desactivacion y falta de permisos.
- Cubrir el contrato HTTP y la invalidacion de la lista despues de cada mutacion.
