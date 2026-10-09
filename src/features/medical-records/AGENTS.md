# Reglas para `medical-records`

## Responsabilidad

- Gestiona los registros médicos (consultas, vacunas, desparasitaciones, cirugías, resultados de laboratorio, tratamientos y otros) y la evolución clínica del animal.
- Permite crear y editar registros según permisos, incluidos adjuntos clínicos vinculados por media.
- No gestiona la ficha general del animal, los eventos generales ni las tareas de cuidado; pertenecen a `animals` y `care-tasks`.

## Contratos

- `POST /medical-records`: crea un registro con `animalId`, `recordType`, `title`, `occurredAt`, `veterinarianId` opcional, `diagnosis`/`treatment`/`notes` opcionales y `attachmentMediaIds` (máx 10).
- `GET /medical-records`: historia clínica global paginada con filtros `page`, `limit` (1–100, default 20), `recordType`, `from` y `to` (ISO `date-time`) y orden determinista `occurredAt DESC, id DESC`. El contrato **no acepta `animalId` ni `veterinarianId`**: el filtro por animal es una decisión de UI sobre las páginas cargadas (`filterRecordsByAnimal`), nunca un query param.
- `GET /animals/:animalId/medical-records`: evolución clínica paginada con filtros `recordType`, `from`, `to` y orden `occurredAt DESC, id DESC`.
- `GET /animals/:id`: solo para resolver el `intakeDate` del animal elegido en el alta global (ventana de `occurredAt`). Se lee una vez por selección y se normaliza a `YYYY-MM-DD` con `toDateOnly` de `src/core/validation`; no es un request por fila.
- `GET /medical-records/:id`: detalle de un registro.
- `PATCH /medical-records/:id`: edición parcial. Solo se cambian los campos enviados:
  - `recordType`, `title`, `occurredAt`: omitir conserva el valor.
  - `veterinarianId`: omitir conserva; `null` desvincula al veterinario.
  - `diagnosis`, `treatment`, `notes`: omitir conserva; `null` o cadena vacía limpia el campo.
  - No acepta `attachmentMediaIds`; los adjuntos en edición se suben directo con `ownerType=medical_record` y `ownerId` del registro.
- `POST /media/upload` con `ownerType=medical_record` + `ownerId`: adjunto clínico vinculado directo (para edición).
- `GET /media?ownerType=medical_record&ownerId=:id`: listado de adjuntos de un registro.
- `DELETE /media/:id`: baja de un adjunto.
- `GET /medical-records/:id/changes`: historial de cambios paginado con `page`, `limit`, `changeType` (`update | soft_delete | restore`), `changedByUserId` (UUID), `from` y `to`; orden determinista `changedAt DESC, id DESC` sin reordenar en cliente. Cada ítem expone `changeType`, `changedFields`, `previousValues` (valores anteriores por campo), `changedAt` y `changedBy: { id, firstName, lastName } | null` (nombre legible; sin email por privacidad; `null` para eventos de sistema o usuario eliminado). El contrato serializa `changedByUserId` como `object | null` aunque en runtime sea `string | null`; el mapper lo normaliza y deriva `changedBy` (displayName/initials) y `changedByFallbackId`. `from > to` responde 400 con `INVALID_DATE_RANGE`. El historial permanece legible para registros soft-deleted.
- `GET /veterinarians`: opciones de veterinario (solo activos para el selector). En create/edit el form no se bloquea por esta query: si falla o vuelve vacía se muestra un estado recuperable con reintento y se permite guardar sin veterinario.
- `recordType` válido: `consultation | vaccination | deworming | surgery | lab_result | treatment | other`.
- Ventana de `occurredAt`: `intakeDate <= occurredAt <= now + 60 s`. El límite inferior se calcula como inicio de día local del `intakeDate`; el límite superior del picker usa la misma tolerancia de skew de reloj. La utilidad pura vive en `src/core/validation` (`localDayStartMs`/`localDayStart` + `OCCURRED_AT_FUTURE_TOLERANCE_MS`); `utils/occurredAtWindow.ts` es un re-export de compatibilidad compartido con `animals`.
- Códigos de validación del backend: `OCCURRED_AT_IN_FUTURE` y `OCCURRED_AT_BEFORE_INTAKE` (400/422) se traducen a mensajes específicos en español.
- Los tipos de red derivan de `openapi/mobile.openapi.json`.

## Permisos

- Solo `admin` y `veterinarian` pueden leer, crear y editar la evolución clínica y la historia clínica global; `shelter_manager` recibe `403` del servidor.
- El destino "Historia clínica" de la sección Gestión se filtra por `canReadClinicalRecords` (`src/application/management`), y la ruta repite el guard para deep links: sin capacidad muestra "Sin permiso" sin montar la query.
- Un `403` del servidor debe manejarse de forma segura (`toGlobalMedicalRecordsErrorMessage`).
- El backend registra al actor autenticado en `medical_record_changes` al editar; no hay `createdByUserId` en el registro.

## Estructura

- `api/`: `medicalRecordsApi`, `medicalRecordChangesApi` (historial de cambios), `clinicalAttachmentsApi` (upload/lista/borrado), `veterinarianOptionsApi` y `animalIntakeApi` (resolución diferida del `intakeDate` del animal elegido en el alta global).
- `components/`: `MedicalRecordForm` (modos create/edit; el create es el rediseño D26 con `AnimalRecordField`, `ClinicalRecordTypeField`, `VeterinarianRecordField` y `AnimalOptionAvatar`), `CreateMedicalRecordScreen` (compositora del alta global), `ClinicalAttachmentPicker`, `ClinicalHistory`, `MedicalRecordChangeCard`, `MedicalRecordChangesScreen`, y la historia clínica global (`MedicalRecordsOverviewScreen`, `MedicalRecordOverviewCard`, `MedicalRecordFilterSheets`).
- `hooks/`: keys, queries, mutations e invalidaciones de la evolución clínica; `useMedicalRecordAnimals` (opciones mínimas vía `application/animals`), `useAnimalIntake` (intake diferido por selección), `useMedicalRecordChanges` con paginación infinita y `useInfiniteMedicalRecords`/`flattenMedicalRecordPages` para la historia global.
- `utils/`: esquemas Zod, mapper de diff PATCH, presentación (incluida `medicalRecordChangePresentation` para labels, valores y filtros del historial), filtros globales (`globalClinicalFilters`) y errores.
- `types.ts`: modelos de vista y aliases del contrato generado.

## Historia clínica global (RFG-158 / D25)

- Los nombres de animal y veterinario se resuelven best-effort desde caches compartidas sin request por fila: `src/application/animals` (con fallback a `GET /animals/:id` para un `animalId` UUID) y `src/application/veterinarians` (directorio activo; `null` → "Sin veterinario asignado", id inactivo/fuera de página → "Veterinario no disponible"; nunca UUID crudo).
- El filtro de tipo y el rango de fechas viajan al servidor; el filtro de animal filtra en cliente `filterRecordsByAnimal` sobre las páginas cargadas y la UI lo comunica explícitamente junto al contador paginado `total`, sin rotular un total global inexistente.
- El FAB de alta de la historia clínica global está siempre visible con `canReadClinicalRecords` y abre la ruta global `/medical-records/new` (con `animalId` precargado cuando hay animal filtrado); el alta contextual por animal reutiliza la misma pantalla.
- Alta global (D26/RFG-159): ruta delgada `app/(app)/medical-records/new.tsx` (guard `canReadClinicalRecords`, `animalId` opcional validado como UUID) y contextual `app/(app)/animals/[id]/medical-records/new.tsx`, ambas componen `CreateMedicalRecordScreen`. El formulario rediseñado agrupa cards `Datos del registro` (animal, veterinario opcional, tipo, título con contador y fecha), `Información clínica` y `Adjuntos` (contador `x/10`), con footer `Cancelar`/`Guardar registro`. El animal se elige por `BottomSheet` con búsqueda sobre las opciones de `application/animals`; al cambiarlo se limpia `occurredAt` y se resuelve su `intakeDate` con `useAnimalIntake` para la ventana. El veterinario sigue siendo opcional y no bloqueante.

## Seguridad y privacidad

- Nunca registrar payloads clínicos, tokens ni datos personales del veterinario en logs o errores visibles.
- `changedBy` nunca incluye email; si el contrato lo expusiera en el futuro, la UI no debe presentarlo.
- Los valores anteriores del historial (`previousValues`) se formatean de forma defensiva: nulos, textos largos y estructuras no rompen el layout ni se filtran en errores.
- La cache de registros clínicos se limpia junto con el resto de TanStack Query al cerrar sesión.

## Testing

- Unit tests para validación y diff PATCH (omit vs null, trim a null).
- Unit tests para la ventana de `occurredAt`: inicio de día local, offsets de zona horaria y tolerancia futura.
- Unit tests del historial: paginación (`getNextPageParam` sin duplicados ni saltos), orden del servidor preservado, formateo seguro de valores (nulos, extensos, estructurados), labels de campos, filtros y rango inválido.
- Unit tests de la historia global: `toClinicalDateFilterIso` (día local inclusivo), presets, `filterRecordsByAnimal` y `flattenMedicalRecordPages`.
- Component tests RNTL para crear, editar, adjuntos, estados de veterinarios, error 403, historial (carga, vacío, error, reintento, filtros), listado global (filtros tipo/fechas/animal cliente, fallback de nombres, paginación y accesibilidad) y accesibilidad.
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
- Historial de cambios de un registro médico (RFG-124, contrato RFG-96): ruta `app/(app)/animals/[id]/medical-records/[recordId]/changes.tsx` accesible desde el botón "Ver historial" de cada tarjeta en `ClinicalHistory`, restringida por `canReadClinicalRecords` (un deep link para `shelter_manager` muestra acceso restringido sin montar la pantalla ni ejecutar la query). La pantalla consume `GET /medical-records/:id/changes` con `useInfiniteQuery` (páginas de 20, orden determinista del servidor, fin de paginación con aviso "No hay más cambios", pull-to-refresh y estados loading/empty/error/offline con reintento). Filtros completos: tipo de operación (chips), actor por UUID (input con label "Usuario que realizó el cambio (UUID)", placeholder con ejemplo `123e4567-…`; `isUuid` valida, un valor no UUID se descarta) y rango de fechas con `DateTimeField` (rango incompleto o `from > to` no dispara query y muestra mensaje en español). Cada tarjeta presenta operación, actor por nombre con fecha relativa + absoluta (`changedBy`, RFG-129), y las diferencias campo por campo con `previousValues` formateado de forma segura (el contrato no expone valores nuevos, solo anteriores).
- Presentación del actor del historial (RFG-129): `changedBy` (nombre e iniciales vía `ActorRow`), con fallback a UUID durante rollout y "Usuario del sistema" cuando actor y fallback son `null`.
- Los datos clínicos solo viven en la cache en memoria de TanStack Query (sin persistencia a disco); se limpian al cerrar sesión.
- Historia clínica global (RFG-158 / D25): ruta delgada `app/(app)/medical-records/index.tsx` (guard `canReadClinicalRecords` + `AccountHeaderRow` con `fallbackHref='/more'`) que compone `MedicalRecordsOverviewScreen`. `useInfiniteMedicalRecords` pagina `GET /medical-records` en páginas de 20 con deduplicación por UUID y orden del servidor sin reordenar. Tres filtros en `BottomSheet`: animal (cliente sobre páginas cargadas, con aviso explícito), tipo (7 valores) y fechas (presets + rango con `DateTimeField`, día local inclusivo, `from > to` no dispara query). Nombres best-effort desde `src/application/animals` y `src/application/veterinarians` con fallback explícito ("Animal no disponible", "Sin veterinario asignado"/"Veterinario no disponible") y nunca un UUID crudo; foto de animal resuelta con `useAnimalOptionPhoto` (cache por media ID, sin fetch para filas sin foto). Destino "Historia clínica" en `src/application/management` filtrado por `canReadClinicalRecords` (visible `admin`/`veterinarian`, oculto `shelter_manager`) y FAB de alta contextual a `/animals/[id]/medical-records/new` solo cuando hay animal seleccionado (el alta global es RFG-159). Estados loading/vacío/error/offline con reintento, paginación incremental, pull-to-refresh y `testID` `clinical-global-list`/`clinical-load-more`/`clinical-end-of-list`/`clinical-*-filter`/`clinical-global-create`.
- Alta global (D26/RFG-159): ruta delgada `app/(app)/medical-records/new.tsx` que valida el `animalId` opcional, repite el guard `canReadClinicalRecords` y compone `AccountHeaderRow` + `CreateMedicalRecordScreen`; la ruta contextual `app/(app)/animals/[id]/medical-records/new.tsx` reutiliza la misma pantalla preseleccionando el animal. El formulario rediseñado (`MedicalRecordForm` create) usa cards y `SectionHeader`, selector de animal por `BottomSheet` con búsqueda (`AnimalRecordField`) sobre `application/animals`, tipo por `ClinicalRecordTypeField`, veterinario opcional con limpieza (`VeterinarianRecordField`, estados loading/error/empty no bloqueantes), título con contador `x/160` y banner de la regla de fecha, e información clínica opcional sobre `AppCard`; el conteo `x / 10 archivos` y el tope de adjuntos siguen en `ClinicalAttachmentPicker`. Al cambiar el animal se limpia `occurredAt` y `useAnimalIntake` resuelve el `intakeDate` (una lectura diferida por selección, sin request por fila) para la ventana del picker y el esquema. El FAB global queda siempre visible con capacidad y navega a `/medical-records/new`. `testID` `clinical-record-submit`/`clinical-record-cancel`/`clinical-animal-field`/`clinical-type-field`/`clinical-veterinarian-field`.

### Pendiente o deuda conocida

- `occurredAt` se captura con `@react-native-community/datetimepicker`; falta validar el selector en dispositivos iOS/Android reales.
- La evolución clínica se presenta con una página de 20 ítems; no hay paginación UI visible.
- El filtro de animal de la historia clínica global es best-effort sobre las páginas cargadas porque el contrato global no publica `animalId`; si el backend lo incorpora, reemplaza el filtro cliente.
- E2E de creación clínica y negativa por rol cubierto con Maestro (`maestro/admin.yaml`, `veterinarian.yaml`, `clinical-denied.yaml`; selector `clinical-history`; `shelter_manager` nunca monta la query clínica).
- E2E del flujo de historial de cambios cubierto con Maestro (RFG-132, `maestro/medical-history.yaml`): registro → historial → paginación → actor por nombre y diff campo a campo con etiquetas en español. Selectores `clinical-record-history-button`, `history-filter-*` y `history-end-of-list`; `FilterChip` acepta `testID`.
