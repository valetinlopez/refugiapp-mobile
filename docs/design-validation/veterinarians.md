# Certificación de Veterinarios — D31 (RFG-164)

> Estado: implementado. Esta evidencia complementa la matriz general D06 y cubre las referencias 19, 20 y 21.

## Alcance

- Lista: `app/(app)/veterinarians/index.tsx`.
- Alta: `app/(app)/veterinarians/new.tsx`.
- Perfil y cambios de estado: `app/(app)/veterinarians/[id].tsx`.
- Edición protegida: `app/(app)/veterinarians/[id]/edit.tsx`.

## Matriz responsive

| Superficie | 320×568                                             | 390×844        | Tablet                    | Horizontal                  | Fuente 200 %                                    |
| ---------- | --------------------------------------------------- | -------------- | ------------------------- | --------------------------- | ----------------------------------------------- |
| Lista      | Contenido desplazable; filtros y acciones envuelven | Targets ≥44 pt | Lectura centrada a 760 pt | Sin altura fija             | Cards y estados crecen verticalmente            |
| Alta       | `ScrollView`; acciones envuelven                    | Inputs ≥48 pt  | Lectura centrada a 760 pt | Teclado no bloquea acciones | Switch alineado arriba y textos sin altura fija |
| Perfil     | `ScrollView`; cards envuelven                       | Targets ≥44 pt | Lectura centrada a 760 pt | Sin altura fija             | Identidad y usuario vinculado permiten wrap     |

La matriz se corrobora con las referencias `19-veterinarians-list.jpeg`, `20-veterinarian-new.jpeg` y `21-veterinarian-profile.jpeg`. Los tests estructurales congelan ancho máximo, wrap, targets y ausencia de alturas rígidas; el export de Expo confirma Android, iOS y web.

## Matriz de roles

| Flujo                  | `admin`                                | `shelter_manager`                      | `veterinarian`              |
| ---------------------- | -------------------------------------- | -------------------------------------- | --------------------------- |
| Consultar lista/perfil | Permitido                              | Permitido                              | Permitido                   |
| Crear/editar           | Permitido                              | Permitido                              | Bloqueado con “Sin permiso” |
| Desactivar/reactivar   | Permitido con confirmación             | Permitido con confirmación             | Acciones ocultas            |
| Pérdida de capacidad   | Cierra confirmación y bloquea mutación | Cierra confirmación y bloquea mutación | Mantiene lectura            |

## Conflictos y preservación

- `LICENSE_NUMBER_ALREADY_EXISTS` aparece junto a Matrícula.
- `EMAIL_ALREADY_EXISTS` y `USER_ALREADY_LINKED_TO_VETERINARIAN` aparecen junto al correo de acceso.
- El borrador permanece en memoria para corregir y reintentar.
- Desactivar/reactivar usa `POST /veterinarians/:id/deactivate|reactivate`; no usa `DELETE`.
- La invalidación se limita a `veterinarianKeys.all`; la caché de registros clínicos permanece intacta.
- La interfaz recuerda explícitamente que el historial clínico asociado se conserva.

## Evidencia automatizada

- `VeterinariansScreen.test.tsx`: lectura, filtros, estados, roles y ancho responsive.
- `VeterinarianForm.test.tsx`: validación, acciones con wrap, switch y targets.
- `CreateVeterinarianScreen.test.tsx`: conflictos de matrícula/email y borrador recuperable.
- `VeterinarianDetail.test.tsx`: identidad, usuario legible, wrap y acciones por estado/capacidad.
- `roles.test.tsx`: matriz de roles y pérdida reactiva de permisos.
- `edit.test.tsx`: la consulta protegida solo se habilita con `canManageVets`.
- `useVeterinarianMutations.test.tsx`: invalidación acotada y preservación de historia clínica cacheada.

## Recorrido manual

1. Ejecutar la app con cada rol de la matriz.
2. Repetir lista, alta y perfil en 320×568, 390×844, tablet y horizontal.
3. Activar el tamaño de fuente del sistema al 200 % y verificar desplazamiento sin solapes.
4. Forzar conflictos de matrícula y correo; corregir el campo sin volver a completar el formulario.
5. Abrir una confirmación y retirar `canManageVets`; comprobar que se cierre sin request.
6. Desactivar y reactivar un perfil con registros clínicos; comprobar que los registros sigan accesibles.
