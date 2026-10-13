# ADR-0020: Baja segura admin-only con doble confirmación (RFG-185)

- Estado: aceptado
- Fecha: 2026-10-13
- Trazabilidad: RFG-185, RFG-186, RFG-187, RFG-188, épica RFG-133, Sprint 22

## Contexto

El reporte de QA del 13-oct (punto 3) pide eliminar `Usuario`, `Veterinario` y `Animal`
desde el móvil con UX segura y control por rol. Es el ticket de mayor riesgo porque
toca tres dominios con reglas de integridad distintas:

- `DELETE /users/{id}`: baja lógica (`isActive=false` + `deletedAt`), bloquea con
  `409 LAST_ADMIN_FORBIDDEN` si es el último administrador activo.
- `DELETE /veterinarians/{id}`: borrado físico solo sin historial; con filas en
  `medical_records` responde `409 VETERINARIAN_HAS_HISTORY` sin borrar nada.
- `DELETE /animals/{id}`: baja lógica (`deletedAt`, libera la foto a huérfana);
  bloquea con `409 ANIMAL_UNDER_TREATMENT`, `ANIMAL_HAS_PENDING_TASKS` y
  `ANIMAL_HAS_HISTORY` (clínica, gastos y adopciones, incluidas soft-deleted).

Los tres endpoints son solo `admin` (`403` para cualquier otro rol autenticado),
responden `204` sin body al éxito y `404` ante id inexistente o ya eliminado.
Cada baja registra `user.delete` / `veterinarian.delete` / `animal.delete` en
`audit_logs`, visible en la feature `audit` existente.

## Decisión

1. **Gate visual admin-only centralizado**: nueva capacidad `canDeleteProtected`
   (`true` solo para `admin`) en `src/application/authorization`, derivada de roles
   como el resto de la matriz. No se reutilizan `canManageVets` ni `canEditAnimal`
   porque `shelter_manager` escribe pero no debe borrar (el backend lo exige:
   usar el rol `admin`, no la capacidad de escritura). El backend revalida siempre.
2. **Doble confirmación con nombre + aceptación explícita**: primer `ConfirmDialog`
   `¿Eliminar a {nombre} permanentemente?` con consecuencia y aviso de auditoría,
   segundo diálogo con `Switch` `Entiendo que es permanente` que habilita
   `Eliminar definitivamente`. Cancelar en cualquier paso no deja efectos
   colaterales. La acción vive solo en el detalle (edición para usuarios),
   nunca en cards de listado.
3. **Sin optimistic updates**: como en `expenses` (`useDeleteExpense`), al éxito se
   elimina la query de detalle y se invalidan listados por prefijo conservando el
   orden determinista del backend; toast accesible + `navigateBack(fallback)`.
4. **Errores traducidos por código, sin tecnicismos ni UUIDs**: cada feature expone
   `toDeleteXErrorMessage` sobre `toApiErrorMessage` (`403/404/409` + códigos
   `LAST_ADMIN_FORBIDDEN`, `VETERINARIAN_HAS_HISTORY`, `ANIMAL_*`).
5. **Pérdida reactiva de capacidad**: si `canDeleteProtected` se pierde con un
   diálogo abierto, el diálogo se cierra y la mutación se bloquea (patrón D31).
6. **Auditoría**: se reutiliza el listado/detalle de `audit` (acciones
   `user.delete`, `veterinarian.delete`, `animal.delete` y recursos `user`,
   `veterinarian`, `animal` con labels en español); los diálogos aclaran que la
   baja queda auditada.

## Alternativas consideradas

- **Reutilizar `canManageUsers` como proxy de admin**: descartado por semántica
  confusa en animales/veterinarios; una capacidad explícita documenta la
  intención y sobrevive si la matriz cambia.
- **Un diálogo compartido en `src/components`**: descartado por ahora; cada
  feature posee su `XDeleteDialog` con copy de dominio (patrón existente:
  `UserStatusDialog`, `DeactivateVeterinarianDialog`). Si aparece un cuarto
  dominio se evalúa extraer el patrón.
- **Pedir escribir el nombre para confirmar**: descartado por fricción y errores
  en móvil; el `Switch` explícito + doble paso ofrece seguridad equivalente con
  mejor accesibilidad.

## Consecuencias

- `openapi/mobile.openapi.json` sincronizado (44 paths) y tipos regenerados.
- Tres features con `api.remove`, `useDeleteX`, `toDeleteXErrorMessage`,
  `XDeleteDialog` y tests unit/RNTL/hook.
- `audit` presenta las tres acciones y los dos recursos nuevos en español.
