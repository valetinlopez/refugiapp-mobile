# Arquitectura de Refugiapp Mobile

> Estado: vigente. Este documento describe el estado real del frontend móvil y separa explícitamente lo implementado de lo planificado.

## 1. Propósito

Este documento es la fuente de verdad para la arquitectura del frontend móvil de Refugiapp. Define:

- Las fronteras entre rutas, features, infraestructura y UI compartida.
- La dirección permitida de dependencias.
- La integración con la API de Refugiapp.
- Las reglas de seguridad, navegación, estado, testing y documentación.
- El estado implementado y la deuda conocida.

Los detalles visuales viven en `docs/design.md`. Los contratos del servidor y permisos viven en `../refugiapp/architecture.md` y en el OpenAPI del backend. Los `AGENTS.md` locales detallan reglas de cada área.

## 2. Contexto tecnológico

| Área                | Tecnología                               | Decisión                                                              |
| ------------------- | ---------------------------------------- | --------------------------------------------------------------------- |
| Runtime             | Node.js 22.13+                           | Mínimo requerido por Expo SDK 57                                      |
| Framework           | Expo SDK 57                              | Runtime y tooling móvil                                               |
| UI                  | React Native 0.86 + React 19.2           | Base multiplataforma                                                  |
| Lenguaje            | TypeScript estricto                      | `strict`, `noUncheckedIndexedAccess` y `exactOptionalPropertyTypes`   |
| Navegación          | Expo Router                              | Rutas basadas en archivos                                             |
| Red                 | Fetch                                    | Cliente HTTP tipado, normalización y refresh single-flight            |
| Estado servidor     | TanStack Query                           | Provider global conectado a red y AppState de React Native            |
| Persistencia segura | Expo Secure Store                        | Tokens JWT y datos secretos pequeños                                  |
| Diseño              | Tokens propios + Expo Symbols            | Sistema compartido documentado en `docs/design.md`                    |
| Formularios         | React Hook Form + Zod                    | Validación en español con esquemas puros testeables                   |
| Selector de fecha   | `@react-native-community/datetimepicker` | Selector nativo para `occurredAt` de registros médicos (ver ADR-0004) |
| Selección de media  | Expo ImagePicker + DocumentPicker        | Cámara, galería e importación de PDF (ver ADR-0005)                   |
| Testing             | Jest + React Native Testing Library      | Unit y component tests                                                |
| Calidad             | ESLint + Prettier + TypeScript           | Gates locales obligatorios                                            |

## 3. Principios arquitectónicos

### 3.1 Organización por feature

Cada capacidad de producto vive en `src/features/<feature>`. Una feature puede contener:

```text
feature/
  api/          # Funciones HTTP de la feature
  components/   # UI específica del dominio
  hooks/        # Orquestación de estado y casos de uso de UI
  types/        # Tipos de vista y aliases derivados del contrato generado
  utils/        # Transformaciones puras exclusivas de la feature, si hacen falta
  AGENTS.md     # Responsabilidad, contratos, permisos, invariantes y tests
```

No se crean carpetas vacías. La estructura crece cuando existe una responsabilidad real.

### 3.2 Rutas delgadas

`app/` es la capa de composición. Una ruta puede:

1. Leer parámetros de navegación.
2. Componer providers y componentes de una feature.
3. Definir opciones de navegación.
4. Resolver redirecciones de alto nivel según sesión o permisos.

Una ruta no debe contener llamadas directas a Axios, persistencia, transformaciones de dominio ni componentes visuales complejos reutilizables.

### 3.3 Infraestructura aislada

`src/core` centraliza integración con entorno y plataforma:

- `api`: cliente HTTP, headers transversales, normalización de errores y renovación de sesión.
- `config`: lectura y validación de variables de entorno.
- `storage`: adaptadores seguros de persistencia.

`core` no conoce componentes, pantallas ni reglas específicas de animales, gastos o tareas.

### 3.4 UI compartida sin dominio

`src/components` contiene primitivas, feedback, navegación y patrones reutilizables. `src/theme` contiene tokens y el provider visual. Estas capas no importan `src/features` ni realizan llamadas de red.

Un patrón puede representar una estructura recurrente —por ejemplo, una fila de tarea—, pero la traducción desde un DTO de API debe ocurrir en la feature que consume el patrón.

## 4. Dirección de dependencias

```text
app
 ├─> features
 ├─> components
 ├─> theme
 └─> core (solo bootstrap/configuración transversal)

features
 ├─> core
 ├─> components
 ├─> theme
 └─> contratos API generados

components ─> theme
theme ─> React Native
core ─> librerías de infraestructura
```

Reglas:

- `core`, `components` y `theme` nunca importan features.
- Una feature no importa archivos internos de otra feature.
- `app` no exporta lógica reutilizable hacia `src`.
- Los aliases `@/*` apuntan a `src/*` y `@app/*` a `app/*`.
- Los ciclos de dependencias no están permitidos.

## 5. Estructura actual

```text
app/
  (auth)/                  # Rutas públicas de autenticación
  (app)/
    (tabs)/                # Área autenticada con navegación inferior
  _layout.tsx              # Providers y stack raíz
  design-system.tsx        # Catálogo interno
src/
  components/
    primitives/
    feedback/
    navigation/
    patterns/
  core/
    api/
    config/
    query/
    storage/
  features/
    auth/                    # API, formulario y estado global de sesión
    animals/
    care-tasks/              # Listado, formulario y transiciones de tareas
    medical-records/         # Registros clínicos y evolución clínica
  theme/
  types/
docs/
  design.md
  documentation-governance.md
  decisions/
  templates/
```

Cada frontera relevante contiene un `AGENTS.md`. La regla efectiva para un archivo es la combinación del `AGENTS.md` raíz y el más cercano en su árbol.

## 6. Navegación

Expo Router es la fuente de verdad de navegación:

- `(auth)` agrupa pantallas públicas.
- `(app)` agrupa el área autenticada.
- `(tabs)` define la navegación principal.
- `design-system` es una ruta interna de validación visual; no es una pantalla de producción.
- `_layout.tsx` raíz carga fuentes, safe areas, tema, QueryClient y sesión global.
- `Stack.Protected` expone `(auth)` solo sin sesión y `(app)` solo con una sesión validada.
- El splash permanece visible hasta resolver fuentes y restauración de sesión, evitando mostrar una ruta incorrecta durante el bootstrap.

## 7. Integración con la API

### 7.1 Base URL

`src/core/config/env.ts` valida el ambiente y una URL absoluta que termina en `/api/v1`. HTTP solo se permite para hosts locales en development; staging y production requieren HTTPS.

### 7.2 Cliente HTTP

`src/core/api/client.ts` implementa un cliente basado en `fetch`. Adjunta el access token, genera `x-request-id`, aplica timeout configurable, reintenta solo métodos idempotentes, conserva `FormData` sin fijar manualmente el boundary y normaliza errores técnicos a español. Las subidas multipart que solicitan progreso usan `XMLHttpRequest` como transporte acotado para publicar avance y permitir cancelación mediante `AbortSignal`, sin cambiar el contrato del cliente para el resto de las solicitudes.

Ante respuestas `401`, todas las solicitudes concurrentes comparten una única renovación. El nuevo par se guarda en una sola escritura de Secure Store y cada solicitud original se reintenta una sola vez. Si la renovación falla, se limpian tokens y cache de Query antes de volver a login.

Las features exponen funciones HTTP en su carpeta `api`. Los componentes y rutas no llaman al cliente directamente.

### 7.3 Contratos

El snapshot `openapi/mobile.openapi.json` refleja los endpoints de auth, perfil, alta y gestión de animales, eventos generales, tareas de cuidado, registros médicos, veterinarios y media consumidos actualmente. `npm run api:generate` produce `src/core/api/generated/openapi.ts`; el CI verifica que el resultado esté versionado y actualizado. El flujo es:

```text
openapi.json del backend
  -> generación de tipos versionada/reproducible
  -> cliente o aliases de red
  -> mapper de feature
  -> modelo de vista
  -> componente
```

Los tipos de auth, alta de animales y media derivan del archivo generado. El modelo de vista `Animal` de la feature se mapea desde el DTO generado y normaliza nulos.

### 7.4 Errores

La infraestructura debe normalizar errores técnicos a una forma segura. Las features traducen códigos de aplicación a mensajes y acciones de UI. Nunca se muestra al usuario un stack trace, token, URL sensible o payload clínico completo.

## 8. Estado y flujo de datos

- TanStack Query es responsable de cache, deduplicación, reintentos controlados e invalidaciones de datos remotos.
- Las queries reintentan una vez; las mutations no se reintentan automáticamente.
- `NetInfo` alimenta `onlineManager` y `AppState` alimenta `focusManager`, habilitando refetch al reconectar o volver al foreground.
- Estado efímero de formulario o presentación permanece local cuando no necesita compartirse.
- No duplicar respuestas completas del servidor en un store global.
- Las derivaciones visuales se calculan de forma pura y testeable; por ejemplo, `overdue` no se persiste.
- Las actualizaciones optimistas solo se incorporan cuando exista una estrategia explícita de rollback.

Las features nuevas deben definir sus query keys e invalidaciones dentro de su propia frontera.

## 9. Autenticación y autorización

Roles válidos:

- `admin`
- `shelter_manager`
- `veterinarian`

Los access y refresh tokens se almacenan juntos con Expo Secure Store en Android/iOS. En web, donde Secure Store no existe, el adaptador usa `sessionStorage`: la sesión sobrevive recargas en la misma pestaña y se elimina al cerrar esa pestaña. Nunca se usa `localStorage` ni AsyncStorage para tokens. La aplicación no debe inferir permisos únicamente desde la presencia de un botón: el backend sigue siendo autoridad final.

El contrato actual del backend implementa login, refresh, logout y `GET /users/me`. No se expone registro público mientras el backend no publique ese endpoint.

El flujo implementado de sesión es:

```text
inicio
  -> leer el par de tokens de Secure Store
  -> validar el perfil con GET /users/me
  -> renovar una sola vez si el access token venció
  -> área autenticada o login
  -> ante logout o refresh inválido, limpiar tokens y cache sensible
```

## 10. Dominios y permisos relevantes

La matriz completa vive en la arquitectura del backend. Para el frontend:

- Los tres roles pueden consultar animales.
- Solo `admin` y `shelter_manager` crean o editan la ficha general y cambian estado.
- Solo `admin` y `veterinarian` acceden a la evolución clínica; `shelter_manager` no ve acciones clínicas.
- `admin` y `veterinarian` crean y editan registros médicos con adjuntos clínicos (`ownerType=medical_record`); el backend valida siempre con 403 para `shelter_manager`.
- Los tres roles consultan tareas; solo `admin` y `shelter_manager` pueden crearlas, editarlas, completarlas o cancelarlas.
- `shelter_manager` no recibe actividad clínica reciente en dashboard.
- Solo `admin` consulta auditoría y administra usuarios.

La UI por rol se deriva de esta matriz y debe actualizarse cuando cambie el backend.

## 11. Datos e invariantes

- IDs principales: UUID.
- Fechas de API: strings ISO 8601; parsear en el límite y formatear para la locale de UI.
- Dinero: enteros `amountCents`; no usar flotantes para lógica monetaria.
- Animal: `admitted | under_treatment | available_for_adoption | adopted | deceased`.
- Registro médico: `recordType` ∈ `consultation | vaccination | deworming | surgery | lab_result | treatment | other`.
- `occurredAt` de un registro médico no puede ser anterior al `intakeDate` del animal ni futura.
- Tarea persistida: `pending | completed | cancelled`.
- `overdue`: tarea `pending` con `dueAt < now`.
- `upcoming`: tarea `pending` dentro de la ventana definida por producto.
- El contrato actual de tareas no expone un campo `type`; no se infieren categorías desde el título o la descripción.
- En presentación de tareas pendientes, `overdue` y `upcoming` son estados derivados y nunca se persisten.

## 12. Sistema de diseño

`src/theme` es la fuente ejecutable de color, tipografía, espacio, radios, tamaños y sombras. `docs/design.md` es la explicación humana. Ambos deben cambiar juntos.

Los componentes compartidos se dividen en:

- `primitives`: bloques atómicos.
- `feedback`: carga, vacío, error y offline.
- `navigation`: navegación reutilizable.
- `patterns`: composiciones sin acceso a red.

No se incorpora `react-native-svg` mientras las formas nativas y `expo-symbols` resuelvan el caso.

## 13. Testing

Pirámide prevista:

1. Unit tests para configuración, transformaciones, permisos derivados y hooks puros.
2. Component tests para interacción, accesibilidad y estados.
3. Integration tests para hooks de feature con red simulada en el límite HTTP.
4. E2E solo para login, recuperación de sesión y flujo principal.

Una feature nueva debe cubrir al menos lógica no trivial, estados de error y las restricciones de rol que representa.

## 14. Documentación viva

La documentación es parte de la definición de terminado. La jerarquía es:

1. Backend OpenAPI y `../refugiapp/architecture.md`: contrato del servidor.
2. `architecture.md`: fronteras y estado técnico del móvil.
3. `AGENTS.md` raíz: reglas globales de trabajo.
4. `AGENTS.md` locales: reglas específicas por área.
5. `docs/design.md`: sistema visual.
6. `docs/decisions/`: decisiones y trade-offs históricos.
7. `README.md`: entrada operativa para instalar y ejecutar.

La matriz de actualización está en `docs/documentation-governance.md`.

## 15. Flujo para agregar una feature

1. Confirmar endpoint, permisos y tipos en backend/OpenAPI.
2. Crear `src/features/<feature>/AGENTS.md` desde la plantilla.
3. Agregar solo las carpetas necesarias.
4. Implementar tipos de red derivados, API y mapper.
5. Implementar hooks y estados de UI.
6. Componer la pantalla desde `app/`.
7. Agregar tests proporcionales al riesgo.
8. Actualizar este documento si cambian fronteras o flujos.
9. Actualizar README, diseño o ADR según la matriz documental.
10. Ejecutar los gates de calidad.

## 16. Estado implementado

- Expo SDK 57, TypeScript estricto y Expo Router.
- Configuración validada para development, staging y production.
- Cliente Fetch tipado con correlation ID, timeout, reintentos idempotentes, multipart y errores normalizados.
- Storage seguro y atómico del par de access y refresh tokens.
- Refresh single-flight y reintento único de la solicitud original.
- Provider de sesión con restauración, login para los tres roles y logout best-effort.
- Rutas protegidas con Expo Router y splash coordinado con el bootstrap de sesión.
- TanStack Query conectado a NetInfo y AppState.
- Adapter HTTP falso inyectable para desarrollo y tests.
- Tipos de auth, animals y media generados desde el snapshot OpenAPI.
- Alta de animales con foto de perfil opcional: formulario React Hook Form + Zod en español, subida multipart huérfana, guard visual por rol y ruta `app/(app)/animals/new.tsx`.
- Detalle de animal en `app/(app)/animals/[id].tsx` visible para los tres roles, con foto actual vía `GET /media/:id`.
- Edición de ficha en `app/(app)/animals/[id]/edit.tsx` y cambio de estado desde el detalle, restringidos a `admin` y `shelter_manager`, con formulario compartido `AnimalProfileForm` (modos create/edit).
- Cambio de estado con matriz de transiciones local (`animalTransitions`), confirmación con modal que explica la consecuencia y sin optimistic updates: invalidación de queries como fuente de verdad.
- Alta de eventos generales del animal desde una ruta protegida por capacidad para `admin` y `shelter_manager`, con tipos manuales derivados de OpenAPI e invalidación de la query key del historial.
- Listado paginado de animales en `app/(app)/(tabs)/explore.tsx` (tab "Animales") con búsqueda por nombre, filtro por estado y navegación al detalle; disponible para los tres roles.
- Lectura y presentación del historial general en el detalle del animal (`GET /animals/:animalId/events`) para los tres roles, con invalidación coherente al crear eventos.
- Listado global de tareas (tab "Tareas", ruta `care-tasks`) y filtro por animal desde su detalle, con filtro por estado, formularios de alta y edición y confirmaciones para completar o cancelar; las mutaciones invalidan las queries de tareas y dashboard. La ruta legacy `/inbox` redirige a `/care-tasks`.
- Contratos de tareas derivados del snapshot OpenAPI y guards de escritura para `admin` y `shelter_manager`.
- Dependencias `react-hook-form`, `@hookform/resolvers` y `expo-image-picker` (ver ADR-0003).
- Captura de imágenes desde cámara o galería y selección de PDF mediante `expo-document-picker`; validación local espejo de MIME/tamaño del backend y subida multipart con progreso y cancelación (ver ADR-0005).
- Registros médicos y evolución clínica: feature `src/features/medical-records` con contrato derivado de OpenAPI (medical-records, veterinarians y media por owner), alta y edición con PATCH semántico (diff que omite campos intactos y envía `null` para limpiar), adjuntos clínicos multipart huérfanos en creación y directos al registro en edición, y selectores de veterinarios activos.
- Formulario clínico con React Hook Form + Zod en español, `@react-native-community/datetimepicker` para `occurredAt` (validado contra `intakeDate` y fecha actual) y mensajes de error seguros por código de backend.
- Rutas `app/(app)/animals/[id]/medical-records/new.tsx` y `app/(app)/animals/[id]/medical-records/[recordId]/edit.tsx`, y sección "Evolución clínica" en el detalle con `ClinicalHistory`; guards visuales para `admin` y `veterinarian`.
- Invalidación de la evolución clínica (`medicalRecordKeys.lists()`) tras crear o editar registros, sin optimistic updates.
- Sistema de diseño, componentes compartidos y catálogo interno.
- Tests unitarios y de componentes.
- CI móvil con generación de tipos, formato, lint, typecheck y tests RNTL.
- ESLint, Prettier, typecheck y export web verificados.
- Jerarquía de documentación y reglas locales por frontera.

## 17. Pendientes y deuda conocida

- Ampliar el snapshot OpenAPI y los tipos generados a medida que nuevas features consuman endpoints (cubiertos: auth, animals, eventos generales, tareas, registros médicos, veterinarios y media).
- El formulario de tareas no puede ofrecer `type` ni un responsable asignable hasta que el backend los incorpore al contrato. Hoy el backend registra al actor autenticado en `createdByUserId`.
- El historial general del animal se presenta con una sola página (20 ítems); falta paginación UI de historial.
- La evolución clínica se presenta con una sola página (20 ítems); falta paginación UI.
- Agregar tests E2E de flujos críticos, incluidos alta, edición y cambio de estado de animales y registro de consultas.
- Agregar un paso de typegen de Expo Router en Mobile CI: `npm run typecheck` exige `.expo/types`, que hoy solo se genera al arrancar el dev server o exportar.
- Configurar en GitHub la protección de `develop`/`master` para exigir el check `Mobile CI / lint, typecheck and tests` antes del merge.
- Validar el sistema visual y el selector de fecha nativo en dispositivos iOS y Android reales.

Los pendientes no se consideran implementados hasta que exista código, contrato y tests cuando corresponda.

## 18. Comandos de verificación

```bash
npm ci
npm run typecheck
npm run lint
npm run format:check
npm test -- --runInBand
npx expo export --platform web --output-dir dist
```
