# Reglas para `medical-records`

## Responsabilidad

- Gestiona los registros médicos (consultas, vacunas, desparasitaciones, cirugías, resultados de laboratorio, tratamientos y otros) y la evolución clínica del animal.
- Permite crear y editar registros según permisos, incluidos adjuntos clínicos vinculados por media.
- No gestiona la ficha general del animal, los eventos generales ni las tareas de cuidado; pertenecen a `animals` y `care-tasks`.

## Contratos

- `POST /medical-records`: crea un registro con `animalId`, `recordType`, `title`, `occurredAt`, `veterinarianId` opcional, `diagnosis`/`treatment`/`notes` opcionales y `attachmentMediaIds` (máx 10).
- `GET /animals/:animalId/medical-records`: evolución clínica paginada con filtros `recordType`, `from`, `to` y orden `occurredAt DESC, id DESC`.
- `GET /medical-records/:id`: detalle de un registro.
- `PATCH /medical-records/:id`: edición parcial. Solo se cambian los campos enviados:
  - `recordType`, `title`, `occurredAt`: omitir conserva el valor.
  - `veterinarianId`: omitir conserva; `null` desvincula al veterinario.
  - `diagnosis`, `treatment`, `notes`: omitir conserva; `null` o cadena vacía limpia el campo.
  - No acepta `attachmentMediaIds`; los adjuntos en edición se suben directo con `ownerType=medical_record` y `ownerId` del registro.
- `POST /media/upload` con `ownerType=medical_record` + `ownerId`: adjunto clínico vinculado directo (para edición).
- `GET /media?ownerType=medical_record&ownerId=:id`: listado de adjuntos de un registro.
- `DELETE /media/:id`: baja de un adjunto.
- `GET /medical-records/:id/changes`: historial de cambios paginado con `page`, `limit`, `changeType` (`update | soft_delete | restore`), `changedByUserId` (UUID), `from` y `to`; orden determinista `changedAt DESC, id DESC` sin reordenar en cliente. Cada ítem expone `changeType`, `changedFields`, `previousValues` (valores anteriores por campo) y `changedAt`. El contrato serializa `changedByUserId` como `object | null` aunque en runtime sea `string | null`; el mapper lo normaliza. `from > to` responde 400 con `INVALID_DATE_RANGE`. El historial permanece legible para registros soft-deleted.
- `GET /veterinarians`: opciones de veterinario (solo activos para el selector). En create/edit el form no se bloquea por esta query: si falla o vuelve vacía se muestra un estado recuperable con reintento y se permite guardar sin veterinario.
- `recordType` válido: `consultation | vaccination | deworming | surgery | lab_result | treatment | other`.
- Ventana de `occurredAt`: `intakeDate <= occurredAt <= now + 60 s`. El límite inferior se calcula como inicio de día local del `intakeDate`; el límite superior del picker usa la misma tolerancia de skew de reloj.
- Códigos de validación del backend: `OCCURRED_AT_IN_FUTURE` y `OCCURRED_AT_BEFORE_INTAKE` (400/422) se traducen a mensajes específicos en español.
- Los tipos de red derivan de `openapi/mobile.openapi.json`.

## Permisos

- Solo `admin` y `veterinarian` pueden leer, crear y editar la evolución clínica.
- `shelter_manager` no ve acciones clínicas; un 403 del servidor debe manejarse de forma segura.
- El backend registra al actor autenticado en `medical_record_changes` al editar; no hay `createdByUserId` en el registro.

## Estructura

- `api/`: `medicalRecordsApi`, `medicalRecordChangesApi` (historial de cambios), `clinicalAttachmentsApi` (upload/lista/borrado) y `veterinarianOptionsApi`.
- `components/`: `MedicalRecordForm` (modos create/edit), `ClinicalAttachmentPicker`, `ClinicalHistory`, `MedicalRecordChangeCard` y `MedicalRecordChangesScreen`.
- `hooks/`: keys, queries, mutations e invalidaciones de la evolución clínica; `useMedicalRecordChanges` con paginación infinita.
- `utils/`: esquemas Zod, mapper de diff PATCH, presentación (incluida `medicalRecordChangePresentation` para labels, valores y filtros del historial) y errores.
- `types.ts`: modelos de vista y aliases del contrato generado.

## Seguridad y privacidad

- Nunca registrar payloads clínicos, tokens ni datos personales del veterinario en logs o errores visibles.
- Los valores anteriores del historial (`previousValues`) se formatean de forma defensiva: nulos, textos largos y estructuras no rompen el layout ni se filtran en errores.
- La cache de registros clínicos se limpia junto con el resto de TanStack Query al cerrar sesión.

## Testing

- Unit tests para validación y diff PATCH (omit vs null, trim a null).
- Unit tests para la ventana de `occurredAt`: inicio de día local, offsets de zona horaria y tolerancia futura.
- Unit tests del historial: paginación (`getNextPageParam` sin duplicados ni saltos), orden del servidor preservado, formateo seguro de valores (nulos, extensos, estructurados), labels de campos, filtros y rango inválido.
- Component tests RNTL para crear, editar, adjuntos, estados de veterinarios, error 403, historial (carga, vacío, error, reintento, filtros) y accesibilidad.
- Hook tests para invalidación de la evolución clínica tras mutación.

## Estado

### Implementado

- Snapshot OpenAPI móvil ampliado con medical-records, veterinarians y media por owner; tipos generados.
- `MedicalRecordForm` create/edit con React Hook Form + Zod en español y diff PATCH.
- Ventana de `occurredAt` corregida: comparación por instante (UTC) contra el inicio de día local de `intakeDate` y tolerancia de +60 s en el límite futuro; el picker respeta los mismos límites.
- El formulario clínico no se bloquea por `GET /veterinarians`: estados de carga, error y vacío con reintento, y guardado posible sin veterinario.
- Mensajes específicos para `OCCURRED_AT_IN_FUTURE` y `OCCURRED_AT_BEFORE_INTAKE`.
- Adjuntos clínicos desde cámara, galería o selector de PDF: JPEG, PNG, WebP y PDF de hasta 10 MB; subida huérfana en creación (limpieza best-effort al cancelar o fallar el POST) y subida directa en edición, con progreso y cancelación.
- Quitar un adjunto ya subido en edición requiere confirmación (`ConfirmDialog` del sistema de diseño): el borrado real (`DELETE /media/:id`) ocurre al guardar; la limpieza huérfana automática post-fallo es silenciosa por no ser iniciada por el usuario.
- Los mensajes de error de registro clínico usan voseo rioplatense y delegan el fallback genérico en `toApiErrorMessage` de `core/api`.
- `ClinicalHistory` para presentar la evolución clínica por animal.
- `ClinicalHistory` permite filtrar por los 7 tipos de `recordType` y por período: todo, últimos 30/90 días o rango personalizado con `DateTimeField` (`from`/`to` enviados al backend como ISO local, inicio y fin del día). Un rango personalizado incompleto o con `from > to` no dispara consulta: muestra mensaje en español.
- `buildClinicalHistoryFilters`/`getCustomRangeError` en `utils/clinicalHistoryFilters.ts`: construcción pura y testeable de los filtros de evolución clínica.
- El listado renderiza el orden del servidor (`occurredAt DESC, id DESC`) sin reordenar en cliente.
- Invalidación de `medicalRecordKeys.listByAnimal(animalId)` tras crear o editar.
- Guards visuales para `admin` y `veterinarian`: un deep link `tab=clinical` para `shelter_manager` muestra acceso restringido sin montar `ClinicalHistory` ni ejecutar la query clínica.
- Historial de cambios de un registro médico (RFG-124, contrato RFG-96): ruta `app/(app)/animals/[id]/medical-records/[recordId]/changes.tsx` accesible desde el botón "Ver historial" de cada tarjeta en `ClinicalHistory`, restringida por `canReadClinicalRecords` (un deep link para `shelter_manager` muestra acceso restringido sin montar la pantalla ni ejecutar la query). La pantalla consume `GET /medical-records/:id/changes` con `useInfiniteQuery` (páginas de 20, orden determinista del servidor, fin de paginación, pull-to-refresh y estados loading/empty/error/offline con reintento). Filtros completos: tipo de operación (chips), actor por UUID (`isUuid` valida; un valor no UUID se descarta) y rango de fechas con `DateTimeField` (rango incompleto o `from > to` no dispara query y muestra mensaje en español). Cada tarjeta presenta operación, fecha/hora, actor (UUID o "Usuario del sistema") y las diferencias campo por campo con `previousValues` formateado de forma segura.
- Los datos clínicos solo viven en la cache en memoria de TanStack Query (sin persistencia a disco); se limpian al cerrar sesión.

### Pendiente o deuda conocida

- `occurredAt` se captura con `@react-native-community/datetimepicker`; falta validar el selector en dispositivos iOS/Android reales.
- La evolución clínica se presenta con una página de 20 ítems; no hay paginación UI visible.
- El historial de cambios expone `changedByUserId` (UUID), no el nombre del actor; se presenta el identificador disponible hasta que el backend lo amplíe.
- E2E de creación clínica y negativa por rol cubierto con Maestro (`maestro/admin.yaml`, `veterinarian.yaml`, `clinical-denied.yaml`; selector `clinical-history`; `shelter_manager` nunca monta la query clínica).
