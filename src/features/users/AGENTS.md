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

- Confirmar la desactivacion antes de ejecutar la mutacion.
- Mantener visibles el rol y el estado de cada cuenta sin depender solo del color.
- Cubrir validacion del formulario y los flujos de listado, alta, activacion, desactivacion y falta de permisos.
- Cubrir el contrato HTTP y la invalidacion de la lista despues de cada mutacion.
