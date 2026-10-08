# Reglas para `animals`

## Responsabilidad

- Gestiona la ficha general del animal, listado, detalle, alta, edición y cambio de estado según permisos.
- Registra eventos generales no clínicos y mantiene la cache del historial coherente.
- No contiene diagnósticos, tratamientos ni vacunas ocurridas; pertenecen a `medical-records`.
- No gestiona tareas futuras; pertenecen a `care-tasks`.
- No gestiona adoptantes ni postulaciones; la ruta de detalle compone la feature `adoptions`, que coordina la aprobación confirmada con la invalidación de la ficha del animal.

## Contrato del backend

- `GET /animals` y `GET /animals/:id`: lectura para los tres roles autenticados.
- `POST /animals`: alta para `admin` y `shelter_manager`.
- `PATCH /animals/:id`: edición de ficha para `admin` y `shelter_manager`; no cambia estado.
- `PATCH /animals/:id/status`: cambio de estado trazable para `admin` y `shelter_manager`.
- `GET /media/:id`: lectura de un asset para mostrar la foto de perfil actual.
- `POST /animals/:animalId/events`: alta de evento general para `admin` y `shelter_manager`.
- `GET /animals/:animalId/events`: lectura para los tres roles.
- `GET /media?ownerType=animal&ownerId=:animalId`: listado paginado de archivos del animal y PDFs, lectura para los tres roles.
- `POST /media/upload` con `ownerType=animal` + `ownerId`: archivo vinculado directo al animal (imágenes JPEG/PNG/WebP y PDF); no hay paso huérfano para Archivos (D17/RFG-150).
- `DELETE /media/:id`: borrado de un archivo del animal. `admin` y `shelter_manager` borran cualquier asset; `veterinarian` solo huérfanos propios o adjuntos clínicos, por lo que un `403` ante un archivo del animal es un estado esperado (D17/RFG-150).

No existe un `DELETE /animals/:id` documentado actualmente. No agregar o invocar endpoints sin confirmarlos en OpenAPI.

- `POST /media/upload` sin `ownerType`/`ownerId`: alta de foto huérfana para `admin`, `shelter_manager` y `veterinarian`; se vincula con `profilePhotoMediaId` al crear o editar el animal. Los huérfanos no vinculados se purgan por antigüedad.

## Datos e invariantes

- Estados: `admitted`, `under_treatment`, `available_for_adoption`, `adopted`, `deceased`.
- IDs: UUID.
- La fecha de nacimiento no puede ser posterior al ingreso.
- Las fechas de red `intakeDate` y `birthDate` llegan como ISO datetime (el backend declara `format: date` pero serializa `Date`). Se normalizan a `YYYY-MM-DD` en la frontera con `toDateOnly` (`toAnimalView`); los mappers de edición comparan y envían siempre `YYYY-MM-DD` y los formateadores `dateFormat` nunca reciben ISO crudo.
- La foto se referencia mediante `profilePhotoMediaId`; no enviar URLs arbitrarias como contrato de creación o edición.
- Transiciones válidas decididas por el backend (matriz en `utils/animalTransitions.ts`):
  - `admitted` → `under_treatment | available_for_adoption | deceased`
  - `under_treatment` → `admitted | available_for_adoption | deceased`
  - `available_for_adoption` → `under_treatment | adopted | deceased`
  - `adopted` y `deceased` son terminales.
- La UI anticipa las transiciones para usabilidad, pero el backend sigue siendo autoridad final; manejar `409`.
- `adopted` y `deceased` son terminales; la UI los confirma con un segundo diálogo destructivo y no como transición directa.
- `ChangeAnimalStatusDto.occurredAt` es opcional: vacío delega la hora actual al backend; cuando se informa usa `DateTimeField` y la tolerancia de skew futuro de 60 segundos (ver ADR-0007) mediante `isValidStatusChangeOccurredAt`.
- Los eventos manuales permitidos son `general_note`, `behavior_note` y `transfer`; los eventos de sistema no se crean desde UI.
- `occurredAt` de eventos manuales es opcional: vacío delega la hora actual al backend; cuando se informa usa `DateTimeField`, ISO con offset local, ventana `intakeDate` (inicio de día local) ≤ `occurredAt` ≤ `now + 60 s` de skew futuro. La ventana pura vive en `src/core/validation` (`localDayStartMs`, `OCCURRED_AT_FUTURE_TOLERANCE_MS`) y la comparte `medical-records`.
- `PATCH /animals/:id` no cambia `status`; el cambio de estado usa `PATCH /animals/:id/status`.

## Listado

- Paginación: `page >= 1`, `limit` entre 1 y 100; defaults 1 y 20.
- Filtros: `status`, `species`, `sex`, nombre parcial.
- Orden: `createdAt`, `intakeDate` o `name`; conservar el orden determinista del backend.
- TanStack Query administra cache e invalidación cuando se creen los hooks.

## Permisos de UI

- `admin`: lectura y escritura general.
- `shelter_manager`: lectura y escritura general.
- `veterinarian`: lectura; no mostrar alta, edición general ni cambio de estado como acciones disponibles.
- Archivos del animal: lectura para los tres roles desde `app/(app)/animals/[id]/files.tsx`; subida y borrado solo para `canEditAnimal` (`admin`/`shelter_manager`). `veterinarian` ve la galería de solo lectura sin acciones de subida ni borrado.
- Un 403 del servidor sigue siendo posible y debe manejarse de forma segura.

## Estructura objetivo

- `api/`: endpoints de animals (listado, alta, detalle, edición, cambio de estado y eventos generales), media (alta huérfana y lectura) y `animalFilesApi` (listado por owner `animal`, subida vinculada directa y borrado).
- `hooks/`: `animalKeys`, `useAnimals`, `useAnimal`, `useCreateAnimal`, `useUpdateAnimal`, `useChangeAnimalStatus`, `useCreateAnimalEvent`, `useAnimalHistory`, `useAnimalPhoto`, `useAnimalFiles` (paginación infinita), `useUploadAnimalFile` (progreso + cancelación) y `useDeleteAnimalFile`.
- `components/`: formulario compartido de perfil (alta/edición), formulario de evento general, selector de foto de perfil, selector de estado con sheet y confirmación (`AnimalStatusChanger`, `AnimalStatusSheet`, `StatusConfirmDialog`), tarjeta de listado (`AnimalCard` con avatar `AnimalCardAvatar`), sección de historial (`AnimalHistory`), selector de archivos (`AnimalFileUploader`), grid paginado de archivos (`AnimalFilesGrid`) y pantalla compositora (`AnimalFilesScreen`).
- `types/`: modelos de vista y aliases derivados de OpenAPI, incluidos `AnimalFile`/`PaginatedAnimalFiles` con `toAnimalFile`, `toPaginatedAnimalFiles` y `flattenAnimalFilesPages`.
- `utils/`: esquemas Zod, mappers al DTO, matriz de transiciones, presentación de eventos e historial y traducción de errores de backend.
- Los componentes reutilizables sin dominio permanecen en `src/components` (p. ej. `FilterChip`).

## Estrategia de escritura

- No se usan optimistic updates: `useUpdateAnimal` y `useChangeAnimalStatus` invalidan queries y, al volver del detalle, la pantalla refetchea la fuente de verdad.
- `useCreateAnimal` hidrata `animalKeys.detail(id)` con la respuesta confirmada de `POST /animals` e invalida solo los listados; el detalle conserva una ventana corta de frescura para no repetir inmediatamente la lectura después del alta.
- `useUpdateAnimal` construye un PATCH diferencial desde el `Animal` inicial: omite los campos intactos, envía `null` para limpiar `breed`/`birthDate`, envía `profilePhotoMediaId: null` para quitar la foto actual y solo vincula un `mediaId` nuevo cuando se subió una foto; si no hay cambios ni foto, no llama a la red (no-op).
- `useUpdateAnimal` sube una foto huérfana solo si el usuario eligió una; si el `PATCH` falla después de subir, borra el asset huérfano best-effort.
- La subida de foto no bloquea el guardado: ante un error de foto (`phase: 'photo'`), el formulario conserva el borrador y ofrece reintentar o guardar sin foto (`skipPhoto`), que omite `profilePhotoMediaId` y conserva la foto actual.
- Los errores de subida de foto y de PATCH se distinguen en UI; los errores de validación Zod muestran mensaje en español y hacen scroll y foco al primer campo inválido.
- `PATCH /animals/:id/status` crea un evento `status_change` trazable; la UI explica la consecuencia antes de confirmar y reserva el tono danger para estados terminales. El selector es un `BottomSheet` (`src/components/feedback`, ADR-0018) con solo las transiciones válidas; los terminales encadenan un segundo `ConfirmDialog` `danger`.
- Archivos del animal: sin optimistic updates. `useUploadAnimalFile` sube directo con `ownerType=animal` + `ownerId` (elimina el paso huérfano), expone progreso 0..1 con `AbortController` para cancelar y `UploadCancelledError` cuando se cancela; al éxito invalida `animalKeys.files(animalId)`. `useDeleteAnimalFile` invalida la misma key tras el borrado confirmado con `ConfirmDialog`.
- `AnimalFilesScreen` filtra el `profilePhotoMediaId` vigente de la lista aplanada (`flattenAnimalFilesPages`), de modo que la foto de perfil nunca aparece duplicada en Archivos.
- Las imágenes se optimizan en cliente con `optimizeCloudinaryImageUrl` (Cloudinary `f_auto/q_auto/c_fill`); los PDF caen a un glifo de documento. La lista conserva el orden del servidor, keys UUID estables y `FlatList` virtualizada sin `map` en `ScrollView`.
- El error de subida distingue `UploadCancelledError` (cancelación silenciosa), mensajes por código y fallback genérico; el error de borrado traduce `403`/`404` y deja el resto al core. En ambos casos nunca se filtran payloads ni requestIds.

## Testing

- Unit tests para mappers, filtros, matriz de transiciones y presentación de estados.
- Hook tests para paginación, invalidación y errores 404/409/403.
- Component tests para capacidades por rol, confirmación de estado y estados de feedback.
- E2E del flujo principal cuando el producto defina su alcance.

## Estado

### Implementado

- Tipos de red derivados de `openapi/mobile.openapi.json` (`CreateAnimalDto`, `UpdateAnimalDto`, `ChangeAnimalStatusDto`, `AnimalResponseDto`, `PaginatedAnimalsResponseDto`, `MediaAssetResponseDto`) con modelo de vista `Animal` y mapper `toAnimalView`.
- Alta de animales (`POST /animals`) para `admin` y `shelter_manager` mediante `useCreateAnimal`.
- Edición de ficha (`PATCH /animals/:id`) para `admin` y `shelter_manager` mediante `useUpdateAnimal`, sin tocar `status`.
- Cambio de estado (`PATCH /animals/:id/status`) para `admin` y `shelter_manager` mediante `useChangeAnimalStatus`, con matriz de transiciones local, sheet de selección tipo `BottomSheet` (D14/RFG-147), `occurredAt` opcional validado con tolerancia de 60 s y confirmación destructiva adicional para estados terminales.
- Alta de eventos generales (`POST /animals/:animalId/events`) para `admin` y `shelter_manager`, limitada a `general_note`, `behavior_note` y `transfer`; el backend registra al actor autenticado y la mutation invalida `animalKeys.history(animalId)`.
- Rediseño del formulario Agregar evento (D15/RFG-148): card identidad `organic` (`AnimalEventIdentityCard`) con foto protagonista y badge fijo "Evento general"; selector de tipo como desplegable fiel a la referencia (`AnimalEventTypeField` = trigger + `BottomSheet` con radios de 44 × 44, `testID` `create-event-type-*`); formulario en card `elevated` con `SectionHeader`, descripción con contador `x/1000`, banner que explica la ventana de fecha con el nombre del animal, y footer Cancelar/Guardar con `testID` `create-event-cancel/submit`.
- Rediseño de la edición (D16/RFG-149): ruta delgada con `DecorativeBackground` y `ScreenHeader` único H1; formulario compartido agrupado en cards (`Foto de perfil`, `Datos principales`, `Fechas`) con `SegmentedControl` para sexo y ayuda de la regla `birthDate <= intakeDate`; indicador global "Cambios sin guardar" y "Modificado" por campo sucio (RHF `dirtyFields` + estado de foto), anunciados con texto y color. La foto ofrece "Cambiar foto" (trigger + `BottomSheet` de cámara/galería) y "Quitar": quitar la foto actual envía `profilePhotoMediaId: null` (contrato nullable) y elegir una nueva descarta ese estado. La salida con cambios pendientes (botón de retorno, `Descartar` o retroceso de Android) se confirma con `ConfirmDialog` mediante `useUnsavedChangesGuard` (`beforeRemove` + `gestureEnabled`); guardar con éxito hace bypass del guard. La ruta distingue offline (`OfflineState` con reintento) de error de servidor y conserva la diferenciación entre error de foto y de guardado.
- La fecha opcional de eventos generales usa el selector compartido `DateTimeField` con `minimumDate` = inicio de día local del `intakeDate` y `maximumDate` = `now + 60 s`, fallback textual web y ayuda explícita sobre el valor por defecto del backend. La validación local (`createAnimalEventSchema(intakeDate)`) rechaza antes del submit fechas anteriores al ingreso o futuras; el backend vuelve a validar.
- Subida de foto de perfil como asset huérfano (`POST /media/upload` multipart) y vinculación con `profilePhotoMediaId` al crear o editar; limpieza best-effort del huérfano si la escritura falla después de subir.
- La foto puede capturarse con cámara o elegirse desde galería; se aceptan JPEG, PNG y WebP de hasta 10 MB, con progreso y cancelación durante la subida.
- Permiso de cámara/galería denegado con explicación; si el permiso queda bloqueado permanentemente (`canAskAgain=false`), se ofrece abrir los ajustes del dispositivo con `Linking.openSettings`.
- Si el picker omite `mimeType` o `fileName`, se infiere el tipo desde la extensión y se normaliza el nombre (`resolveMediaMimeType` + `normalizeMediaFileName` en `src/core/media`); si falta `fileSize`, se sube igualmente y el backend sigue siendo autoridad de tamaño.
- Lectura de asset (`GET /media/:id`) para mostrar la foto actual en detalle y edición (`useAnimalPhoto`).
- Listado paginado (`GET /animals`) con filtros `status`, `species`, `sex` y nombre parcial mediante `useAnimals` (paginación infinita) y `AnimalCard`, con ruta `app/(app)/(tabs)/explore.tsx` para los tres roles. La búsqueda por nombre y la entrada libre de especie aplican debounce de 400 ms; la especie permanece abierta porque el contrato no publica un enum.
- Foto de perfil en el listado: `AnimalCardAvatar` consulta `useAnimalPhoto(profilePhotoMediaId)` por tarjeta con caché compartida por `animalKeys.media` (query deduplicada por `mediaId` y `staleTime` de 5 min), sin fetch cuando `profilePhotoMediaId` es `null`, y fallback a iniciales ante error de red o fallo de imagen (`AppAvatar`). `AppAvatar` solicita a Cloudinary una variante ajustada a píxeles físicos y usa caché memoria/disco de `expo-image`. La invalidación de `animalKeys.all` al crear o editar la ficha mantiene la foto coherente sin optimistic updates; el reemplazo de foto genera un `mediaId` nuevo que entra como query nueva.
- Lectura del historial general (`GET /animals/:animalId/events`) mediante `useAnimalHistory` con `useInfiniteQuery` (páginas de 20, filtro contractual `eventType`, orden del servidor sin reordenar y deduplicación por UUID). `AnimalHistory` usa `FlatList`, timeline con tipo/descripción/fecha, filtros accesibles, carga incremental por scroll/CTA, pull-to-refresh y estados loading/empty filtrado/error/offline/fin. “Agregar evento” solo se muestra con `canEditAnimal`; la invalidación posterior a crear conserva coherencia.
- Detalle `app/(app)/animals/[id].tsx` como centro funcional con cabecera adaptable (`AnimalDetailHeader`) y `tablist` horizontal desplazable para Resumen, Historial, Cuidados, Gastos y Evolución clínica. La cabecera usa foto protagonista redondeada con fallback a iniciales, nombre sin truncar y estado mediante texto+icono; al envolver centra la foto. La barra recorta las opciones al radio de su contenedor y solo la pestaña activa dibuja una pastilla. Conserva la pestaña activa localmente. La clínica solo aparece para `admin`/`veterinarian` y un deep link no autorizado muestra acceso restringido sin ejecutar la query clínica. El Resumen expone la entrada "Ver archivos" hacia `app/(app)/animals/[id]/files.tsx` para los tres roles.
- Archivos del animal (D17/RFG-150): ruta delgada `app/(app)/animals/[id]/files.tsx` que compone `AnimalFilesScreen` (lectura para los tres roles; subida y borrado solo con `canEditAnimal`). `AnimalFilesGrid` renderiza galería paginada `FlatList` de dos columnas con miniaturas Cloudinary optimizadas (fallback a glifo de documento para PDF), keys UUID, pull-to-refresh, carga incremental y estados loading/empty/offline/error; borra con `ConfirmDialog` (`danger`, nunca sin confirmación). `AnimalFileUploader` ofrece cámara, galería y PDF con permisos explicados, `Linking.openSettings` cuando el permiso queda bloqueado y validación espejo de MIME/tamaño; `useUploadAnimalFile` publica progreso textual accesible y cancelación, y `flattenAnimalFilesPages` excluye el `profilePhotoMediaId` vigente para no duplicar la foto de perfil.
- El detalle también compone la pestaña Adopción para los tres roles desde `src/features/adoptions`; la aprobación confirmada invalida `animalKeys.all` para reflejar el estado `adopted` sin actualización optimista.
- Edición `app/(app)/animals/[id]/edit.tsx` con guard visual por rol y formulario compartido `AnimalProfileForm` (modos create/edit).
- Formulario con React Hook Form + Zod, mensajes en español y validación cruzada `birthDate <= intakeDate`.
- PATCH diferencial en edición (`toUpdateAnimalRequest` + `hasPatchChanges`): omite campos intactos, envía `null` para limpiar `breed`/`birthDate` y no-op cuando no hay cambios.
- Normalización de fechas en la frontera: `toDateOnly` convierte el ISO datetime del backend a `YYYY-MM-DD` en `toAnimalView` (detalle, listado y respuestas de escritura) y en `toUpdateAnimalFormValues`/`toUpdateAnimalRequest`; las filas del detalle envuelven en pantallas estrechas (`flexWrap`) según `docs/design.md`.
- Errores de subida de foto y de guardado distinguidos en UI, con reintento y opción "Guardar sin foto"; errores Zod con scroll y foco al primer campo inválido.
- Selector de cambio de estado (`AnimalStatusChanger` + `AnimalStatusSheet`) sobre el patrón compartido `BottomSheet` con solo las transiciones válidas, estado actual con icono + texto, fecha opcional (`DateTimeField`) y doble confirmación para terminales con `StatusConfirmDialog` (envuelve `ConfirmDialog` sin `Alert` nativo; tono danger por `isTerminalStatus`).
- Traducción de errores de backend a mensajes claros (`toCreateAnimalErrorMessage`, `toUpdateAnimalErrorMessage`, `toChangeStatusErrorMessage`) en voseo rioplatense, con fallback genérico delegado en `toApiErrorMessage` de `core/api`.
- Unit tests (matriz de transiciones, esquemas, mappers, mensajes), integración multipart con transporte falso y component tests con RNTL.

### Deuda conocida

- E2E de alta de animal cubierto con Maestro por rol (`maestro/admin.yaml`, `shelter-manager.yaml`; selectores `animals-list`, `animal-card`). Falta E2E en dispositivo para edición, cambio de estado, registro de eventos generales y Archivos del animal (subida con progreso, borrado confirmado y negativa por rol) (éxito, validación y error 403).
