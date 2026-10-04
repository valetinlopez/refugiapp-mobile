# ADR-0010: Alta conjunta Veterinario-Usuario con `createUser`

- Estado: aceptado
- Fecha: 2026-09-30

## Contexto

El reporte de QA 30/09 señaló que el formulario de alta de veterinario pedía un `ID de usuario vinculado` como UUID tipeado a mano. Ese flujo tenía tres riesgos: UUID inválido, email duplicado entre `users` y `veterinarians`, y conflictos `409` sin guía para el usuario.

El producto pidió que crear un veterinario cree (o vincule) su usuario con rol `veterinarian`, y que los usuarios con ese rol aparezcan como veterinarios. La relación debe resolverse sin obligar al operador a conocer IDs internos.

El backend incorporó la opción A del ticket RFG-119 en la misma rama: `POST /veterinarians` acepta un payload anidado `createUser` y resuelve la creación/vinculación de forma atómica en una transacción. `VeterinarianResponseDto` ahora expone el objeto `user` vinculado (sin `passwordHash`).

## Alternativas consideradas

1. **Opción A — alta atómica en backend (`createUser`).** El servidor crea el `User` con rol `veterinarian` y lo vincula en una transacción (o reutiliza un usuario no vinculado cuyo email coincida). Es la elegida por el backend.
2. **Opción B — orquestación móvil compensatoria.** El cliente llama `POST /users` y luego `POST /veterinarians { userId }`, con rollback manual. Deja estados intermedios si falla el segundo paso y duplica lógica transaccional en el cliente.
3. **Opción C — selector de usuarios existentes.** Reemplazar el UUID por un selector de `GET /users` filtrado en cliente. Requería un `GET /users` que hoy es exclusivo de `admin`, lo que dejaría a `shelter_manager` con un 403 sorpresivo al intentar vincular.

## Decisión

- **Eliminar el campo UUID manual** del formulario de veterinario (`userId` ya no se tipea).
- En alta (`mode: create`), el formulario ofrece un toggle accesible **"Crear usuario de acceso"** que habilita email y contraseña inicial (mínimo 12 caracteres). Si el email del usuario no se completa, el cliente omite el campo y el backend usa el email del perfil del veterinario; la validación local exige que exista al menos uno.
- El mapper `toCreateVeterinarianRequest` construye `createUser` solo cuando el toggle está activo; nunca envía `userId` y `createUser` juntos (el backend responde `400 VET_USER_PAYLOAD_CONFLICT` si ocurriera).
- En edición (`mode: edit`) **no** se ofrece creación de usuario: `createUser` solo aplica al alta. El PATCH diferencial ya no toca `userId`.
- El detalle y el listado presentan el vínculo desde `veterinarian.user.email` (+ rol), nunca el UUID crudo.
- Los códigos de error nuevos (`EMAIL_ALREADY_EXISTS`, `VET_USER_PAYLOAD_CONFLICT`, `VET_CREATE_USER_EMAIL_REQUIRED`) se traducen a español rioplatense accionable en `toVeterinarianErrorMessage`, delegando el fallback genérico al core.

## Consecuencias positivas

- El operador ya no conoce UUIDs; el vínculo se resuelve con email y contraseña.
- La validación local (contraseña ≥ 12 y email presente) evita viajes de ida y vuelta por 400/409 evitables.
- El detalle/listado muestran el vínculo de forma legible y accesible, sin exponer identificadores internos.
- La escritura se mantiene para `admin` y `shelter_manager` (`canManageVets`); los tres roles leen.

## Costes y riesgos

- El backend es la única fuente de verdad del vínculo; el cliente solo envía `createUser`. Si el backend cambia el contrato (p. ej. elimina `createUser`), el snapshot `openapi/mobile.openapi.json` debe sincronizarse y el formulario degradar a "sin vínculo".
- Reutilizar un usuario existente por email puede otorgar el rol `veterinarian` a una cuenta ya activa; el backend lo audita (`user.role_assign`). El cliente no distingue entre creación y reutilización salvo que el mensaje de éxito lo requiera en el futuro.
- La contraseña inicial solo vive en memoria del formulario; nunca se registra ni se persiste.

## Criterios de revisión

- El backend expuso la reactivación como `POST /veterinarians/:id/reactivate` (RFG-93) y el móvil la habilitó (RFG-123): el detalle de un veterinario inactivo muestra el botón con confirmación y revisa el copy de la consecuencia.
- Si el contrato futuro permite vincular un usuario existente para `shelter_manager` (un `GET /users` no exclusivo de `admin`), evaluar un selector de usuarios como complemento de `createUser`.
- Si el backend cambia el payload de `createUser` (p. ej. requiere `firstName`/`lastName` explícitos), actualizar el esquema Zod y el mapper en el mismo cambio que el snapshot.
