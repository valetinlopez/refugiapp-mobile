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
- `GET /veterinarians`: opciones de veterinario (solo activos para el selector).
- `recordType` válido: `consultation | vaccination | deworming | surgery | lab_result | treatment | other`.
- Los tipos de red derivan de `openapi/mobile.openapi.json`.

## Permisos

- Solo `admin` y `veterinarian` pueden leer, crear y editar la evolución clínica.
- `shelter_manager` no ve acciones clínicas; un 403 del servidor debe manejarse de forma segura.
- El backend registra al actor autenticado en `medical_record_changes` al editar; no hay `createdByUserId` en el registro.

## Estructura

- `api/`: `medicalRecordsApi`, `clinicalAttachmentsApi` (upload/lista/borrado) y `veterinarianOptionsApi`.
- `components/`: `MedicalRecordForm` (modos create/edit), `ClinicalAttachmentPicker` y `ClinicalHistory`.
- `hooks/`: keys, queries, mutations e invalidaciones de la evolución clínica.
- `utils/`: esquemas Zod, mapper de diff PATCH, presentación y errores.
- `types.ts`: modelos de vista y aliases del contrato generado.

## Seguridad y privacidad

- Nunca registrar payloads clínicos, tokens ni datos personales del veterinario en logs o errores visibles.
- La cache de registros clínicos se limpia junto con el resto de TanStack Query al cerrar sesión.

## Testing

- Unit tests para validación y diff PATCH (omit vs null, trim a null).
- Component tests RNTL para crear, editar, adjuntos y error 403.
- Hook tests para invalidación de la evolución clínica tras mutación.

## Estado

### Implementado

- Snapshot OpenAPI móvil ampliado con medical-records, veterinarians y media por owner; tipos generados.
- `MedicalRecordForm` create/edit con React Hook Form + Zod en español y diff PATCH.
- Adjuntos clínicos: subida huérfana en creación (limpieza best-effort si falla el POST) y subida directa en edición.
- `ClinicalHistory` para presentar la evolución clínica por animal.
- Invalidación de `medicalRecordKeys.listByAnimal(animalId)` tras crear o editar.
- Guards visuales para `admin` y `veterinarian`.

### Pendiente o deuda conocida

- `occurredAt` se captura con `@react-native-community/datetimepicker`; falta validar el selector en dispositivos iOS/Android reales.
- La evolución clínica se presenta con una página de 20 ítems; no hay paginación UI visible.
