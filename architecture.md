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

| Área                | Tecnología                               | Decisión                                                                                                                      |
| ------------------- | ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Runtime             | Node.js 22.13+                           | Mínimo requerido por Expo SDK 57                                                                                              |
| Framework           | Expo SDK 57                              | Runtime y tooling móvil                                                                                                       |
| UI                  | React Native 0.86 + React 19.2           | Base multiplataforma                                                                                                          |
| Lenguaje            | TypeScript estricto                      | `strict`, `noUncheckedIndexedAccess` y `exactOptionalPropertyTypes`                                                           |
| Navegación          | Expo Router                              | Rutas basadas en archivos                                                                                                     |
| Red                 | Fetch                                    | Cliente HTTP tipado, normalización y refresh single-flight                                                                    |
| Estado servidor     | TanStack Query                           | Provider global conectado a red y AppState de React Native                                                                    |
| Persistencia segura | Expo Secure Store                        | Tokens JWT y datos secretos pequeños                                                                                          |
| Diseño              | Tokens propios + Expo Symbols            | Sistema compartido documentado en `docs/design.md`                                                                            |
| Formas vectoriales  | `react-native-svg`                       | Solo el arco decorativo del `tabBar` inferior (ver ADR-0017); el resto de la UI no usa SVG                                    |
| Formularios         | React Hook Form + Zod                    | Validación en español con esquemas puros testeables                                                                           |
| Selector de fecha   | `@react-native-community/datetimepicker` | Patrón compartido para animales, tareas y registros médicos (ver ADR-0004)                                                    |
| Selección de media  | Expo ImagePicker + DocumentPicker        | Cámara, galería e importación de PDF (ver ADR-0005)                                                                           |
| Imágenes remotas    | Expo Image                               | Caché memoria/disco y media Cloudinary optimizada (ver ADR-0012)                                                              |
| Assets de marca     | SVG + sharp (dev) + WebP/PNG             | Hojas vectoriales propias; hero de stock licenciado (Pngtree); densidades `@Nx` resueltas por Metro (ver ADR-0015 y ADR-0016) |
| Push notifications  | Expo Notifications                       | Permisos, token Expo, preferencias y navegación por tap (ver ADR-0014)                                                        |
| Testing             | Jest + React Native Testing Library      | Unit y component tests                                                                                                        |
| Calidad             | ESLint + Prettier + TypeScript           | Gates locales obligatorios                                                                                                    |
| Distribución        | EAS Build                                | Builds internos de staging y versionado nativo remoto (ver ADR-0013)                                                          |

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

### 3.5 Fronteras de aplicación compartidas

`src/application` es la frontera explícita para coordinación entre features cuando existe reutilización real o una frontera técnica clara. No reemplaza a `core` (infraestructura) ni a `features` (dominio).

- `src/application/animals/` centraliza el contrato de opciones mínimas de animales (`{ id, name }`) que consumen los formularios de `care-tasks` y `expenses`: lectura `GET /animals?page=1&limit=100` (sin parámetros de orden no documentados; orden alfabético en cliente), fallback `GET /animals/:id` ante un `animalId` UUID válido cuando el listado falla o no lo contiene, query keys compartidas entre features y traducción de errores por causa.
- `src/application/management/` declara el registro ordenado de destinos de Gestión (`veterinarians`, `users`, `audit`), sus rutas y las capacidades requeridas. Filtra el registro mediante `src/application/authorization` sin importar UI ni Expo Router; la ruta `more` adapta los paths y la presentación al patrón compartido.
- Una feature puede importar `src/application`; `application` nunca importa features, componentes ni tema.

## 4. Dirección de dependencias

```text
app
 ├─> features
 ├─> components
 ├─> theme
 └─> core (solo bootstrap/configuración transversal y utilidades puras)

features
 ├─> application
 ├─> core
 ├─> components
 ├─> theme
 └─> contratos API generados

application
 ├─> core
 └─> contratos API generados

components ─> theme
theme ─> React Native
core ─> librerías de infraestructura
```

Reglas:

- `core`, `components` y `theme` nunca importan features.
- `application` nunca importa features, componentes ni tema.
- Una feature no importa archivos internos de otra feature.
- `app` no exporta lógica reutilizable hacia `src`.
- Los aliases `@/*` apuntan a `src/*` y `@app/*` a `app/*`.
- Los ciclos de dependencias no están permitidos.

## 5. Estructura actual

```text
app/
  (auth)/                  # Rutas públicas de autenticación (login, forgot-password, reset-password)
  (app)/
    (tabs)/                # Área autenticada con navegación inferior
    account/               # Cambio de contraseña autenticado
  _layout.tsx              # Providers y stack raíz
  design-system.tsx        # Catálogo interno
src/
  application/
    animals/               # Opciones de animales compartidas por care-tasks y expenses
    authorization/         # Registro central de capacidades y filtrado de destinos
    management/            # Destinos de Gestión y capacidades requeridas
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
    validation/            # Validadores puros transversales (isUuid)
  design-system/           # Arnés interno de validación visual D06 (casos, fixtures y checklist)
  features/
    auth/                    # API, formulario y estado global de sesión
    animals/
    adoptions/               # Adoptantes, postulaciones, aprobación e historial por animal
    care-tasks/              # Listado, formulario y transiciones de tareas
    dashboard/               # Panel de portada con totales, recientes y capacidades por rol
    expenses/                # Alta de gastos con comprobante y permisos por rol
    audit/                   # Consulta paginada y detalle de auditoría para admin
    medical-records/         # Registros clínicos y evolución clínica
    veterinarians/           # Listado, detalle, alta, edición y desactivación de veterinarios
    users/                   # Gestión de usuarios internos para admin
    notifications/           # Permisos, registro de dispositivo, preferencias y navegación push
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
- Las pantallas stack del área autenticada usan `headerShown: false` y componen `AppHeaderBack` como retorno persistente con un `fallbackHref` contextual; `navigateBack` centraliza `canGoBack ? back : replace`.
- El splash permanece visible hasta resolver fuentes y restauración de sesión, evitando mostrar una ruta incorrecta durante el bootstrap.
- Las pantallas pesadas exclusivas de administración (`users`) y auditoría cargan sus componentes principales con `React.lazy` y un fallback accesible. No se activa `asyncRoutes` global en Expo Router SDK 57 porque no ofrece code-splitting native de producción; el límite queda documentado en ADR-0012.

## 7. Integración con la API

### 7.1 Base URL

`src/core/config/env.ts` valida el ambiente y una URL absoluta que termina en `/api/v1`. HTTP solo se permite para hosts locales en development; staging y production requieren HTTPS.

### 7.2 Cliente HTTP

`src/core/api/client.ts` implementa un cliente basado en `fetch`. Adjunta el access token, genera `x-request-id`, aplica timeout configurable, reintenta solo métodos idempotentes, conserva `FormData` sin fijar manualmente el boundary y normaliza errores técnicos a español. Las subidas multipart que solicitan progreso usan `XMLHttpRequest` como transporte acotado para publicar avance y permitir cancelación mediante `AbortSignal`, sin cambiar el contrato del cliente para el resto de las solicitudes.

Ante respuestas `401`, todas las solicitudes concurrentes comparten una única renovación. El nuevo par se guarda en una sola escritura de Secure Store y cada solicitud original se reintenta una sola vez. Si la renovación falla, se limpian tokens y cache de Query antes de volver a login.

Las features exponen funciones HTTP en su carpeta `api`. Los componentes y rutas no llaman al cliente directamente.

### 7.3 Contratos

El snapshot `openapi/mobile.openapi.json` refleja los endpoints de auth, perfil, usuarios, alta y gestión de animales, dashboard, eventos generales, tareas de cuidado, gastos (incluido el detalle `GET /expenses/{id}` y la baja `DELETE /expenses/{id}` de RFG-155), registros médicos (incluido el historial de cambios y el actor enriquecido `actor`/`changedBy` de RFG-128), veterinarios, media y notificaciones push consumidos actualmente. Se genera de forma reproducible con `node scripts/sync-mobile-openapi.mjs` desde el OpenAPI del backend (selecciona los paths consumidos, resuelve el cierre transitivo de schemas y normaliza el artefacto de Swagger que emite `string | null` como `type: object`). `npm run api:generate` produce `src/core/api/generated/openapi.ts` (el generador resuelve `allOf` de un elemento); el CI verifica que el resultado esté versionado y actualizado. El flujo es:

```text
openapi.json del backend
  -> generación de tipos versionada/reproducible
  -> cliente o aliases de red
  -> mapper de feature
  -> modelo de vista
  -> componente
```

Los tipos de auth, alta de animales, adopciones y media derivan del archivo generado. El modelo de vista `Animal` de la feature se mapea desde el DTO generado y normaliza nulos.

### 7.4 Errores

La infraestructura debe normalizar errores técnicos a una forma segura. Las features traducen códigos de aplicación a mensajes y acciones de UI. Nunca se muestra al usuario un stack trace, token, URL sensible o payload clínico completo.

## 8. Estado y flujo de datos

- TanStack Query es responsable de cache, deduplicación, reintentos controlados e invalidaciones de datos remotos.
- Las queries reintentan una vez; las mutations no se reintentan automáticamente.
- Los listados operativos extensos usan `FlatList` con ventana y lotes acotados, keys UUID estables, callbacks estables y filas memoizadas; no renderizan colecciones paginadas con `map` dentro de un `ScrollView`.
- `NetInfo` alimenta `onlineManager` y `AppState` alimenta `focusManager`, habilitando refetch al reconectar o volver al foreground. `useConnectivityStatus` expone ese estado ya normalizado a la UI sin registrar un segundo listener de plataforma.
- Sin red, las pantallas distinguen fallo de transporte (`OfflineState` con reintento, vía `isNetworkError`) de error del servidor (`ErrorState`); la cache en memoria sigue visible durante la sesión.
- Los reintentos de escritura viven en `src/core/network` (`MutationRetryQueue`: FIFO acotada, backoff exponencial con jitter, dedupe por clave, solo mutaciones `safeToRetry`; sin timers, el reintento lo dispara la reconexión o un reintento manual).
- Un fallo de transporte durante la restauración o el refresh de sesión conserva los tokens; solo un `401` con código del servidor invalida la sesión.
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

`src/application/authorization` refleja la matriz `ROLE_CAPABILITIES` del backend y es la única fuente de capacidades visuales. `useCapabilities` conecta esa matriz con la sesión y `useAuthorizedNavigation` filtra destinos que declaran `requiredCapability`. Las rutas y features no comparan nombres de rol directamente; reciben o consultan capacidades. Las cuatro pestañas principales actuales son comunes a todos los roles y permanecen visibles.

El contrato actual del backend implementa login, refresh, logout, cambio de contraseña autenticado, solicitud de recuperación y confirmación de recuperación, además de `GET /users/me`. No se expone registro público mientras el backend no publique ese endpoint.

El flujo implementado de sesión es:

```text
inicio
  -> leer el par de tokens de Secure Store
  -> validar el perfil con GET /users/me
  -> renovar una sola vez si el access token venció
  -> área autenticada o login
  -> ante logout o refresh inválido, limpiar tokens y cache sensible
```

Cambio y recuperación de contraseña:

- Cambio autenticado desde "Más > Cuenta > Cambiar contraseña" (`POST /auth/change-password`): valida contraseña actual, nueva (≥ 12) y confirmación local. `INVALID_CURRENT_PASSWORD` muestra error sin cerrar la sesión; el éxito limpia tokens y cache (el backend revocó los refresh tokens) y redirige al login con aviso mediante `endSession`.
- Recuperación desde el login: `app/(auth)/forgot-password` solicita por email y muestra siempre la misma confirmación genérica tras el `202` (indistinguible para cuentas existentes, inexistentes o inactivas).
- `app/(auth)/reset-password` recibe el deep link `scheme://reset-password?token=...`, captura el token una única vez, lo elimina de la URL/historial/navegación y lo conserva solo en memoria. Tokens vencidos, reutilizados o inválidos muestran estados diferenciados con acción para solicitar un enlace nuevo; la confirmación exitosa vuelve al login con aviso. El token nunca se persiste ni se expone en query keys, logs o mensajes.

## 10. Dominios y permisos relevantes

La matriz completa vive en la arquitectura del backend. Para el frontend:

- Los tres roles pueden consultar animales.
- Solo `admin` y `shelter_manager` crean o editan la ficha general y cambian estado.
- Solo `admin` y `veterinarian` acceden a la evolución clínica; `shelter_manager` no ve acciones clínicas.
- `admin` y `veterinarian` crean y editan registros médicos con adjuntos clínicos (`ownerType=medical_record`); el backend valida siempre con 403 para `shelter_manager`.
- Los tres roles consultan tareas; solo `admin` y `shelter_manager` pueden crearlas, editarlas, completarlas o cancelarlas.
- `shelter_manager` no recibe actividad clínica reciente en dashboard.
- Solo `admin` consulta auditoría y administra usuarios.
- Auditoría consume `GET /audit-logs` y `GET /audit-logs/:id`, ofrece filtros por acción, tipo de recurso, actor (UUID) y rango de fechas, y vuelve a sanitizar metadata antes de presentarla. Presenta el actor por nombre (`actor`, con email solo en detalle), con fallback a UUID (`actorUserId`) durante rollout y "Sistema" cuando ambos son `null` (RFG-129). Las acciones (28) y tipos de recurso (7) se presentan con diccionarios en español rioplatense; ningún código crudo llega a la UI (RFG-131).
- Los tres roles consultan gastos (listado global, detalle `GET /expenses/:id` y listado por animal); solo `admin` y `shelter_manager` pueden registrarlos o eliminarlos (`DELETE /expenses/:id`).
- Los tres roles consultan veterinarios; solo `admin` y `shelter_manager` (`canManageVets`) los crean, editan o desactivan. El usuario auto-creado mediante `createUser` recibe siempre el rol `veterinarian` (regla del backend).

La UI por rol se deriva de esta matriz y debe actualizarse cuando cambie el backend.

## 11. Datos e invariantes

- IDs principales: UUID.
- Fechas de API: strings ISO 8601; parsear en el límite y formatear para la locale de UI.
- El backend serializa `intakeDate` y `birthDate` como ISO datetime pese a declarar `format: date`. `toDateOnly` los normaliza a `YYYY-MM-DD` en la frontera (`toAnimalView`); los mappers de edición comparan y envían siempre `YYYY-MM-DD` (ver ADR-0008).
- Dinero: enteros `amountCents`; no usar flotantes para lógica monetaria.
- Animal: `admitted | under_treatment | available_for_adoption | adopted | deceased`.
- Registro médico: `recordType` ∈ `consultation | vaccination | deworming | surgery | lab_result | treatment | other`.
- `occurredAt` de un registro médico no puede ser anterior al inicio de día local del `intakeDate` del animal ni futura más allá de 60 segundos (tolerancia de skew de reloj; ver ADR-0007).
- `occurredAt` de un evento general manual (opcional) respeta la misma ventana: inicio de día local del `intakeDate` ≤ `occurredAt` ≤ `now + 60 s`; la validación pura vive en `src/core/validation` (`localDayStartMs`/`localDayStart` + `OCCURRED_AT_FUTURE_TOLERANCE_MS`) y la comparten `animals` y `medical-records`.
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
- `patterns`: composiciones sin acceso a red. Incluye `DecorativeImage` (media decorativa oculta a AT, con `aspectRatio`, `allowDownscaling`, caché memoria/disco y fallback PNG), `brandAssets` (`resolveBrandSource`, registro de los assets de marca originales de D02) y los patrones compartidos de D03 (`DecorativeBackground`, `ScreenHeader`, `SectionHeader`, `SegmentedControl`, `EntityCard`, `MetadataRow`, `AttachmentList`/`AttachmentRow`) más el `FAB` en `primitives`.

No se incorpora `react-native-svg` mientras las formas nativas y `expo-symbols` resuelvan el caso; la única excepción vigente es el arco decorativo de la barra de navegación inferior (`CurvedTabBar`, ver §16 y ADR-0017).

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
- Refresh single-flight y reintento único de la solicitud original. Ante `REFRESH_TOKEN_CONCURRENT_USE` (401 benigno de rotación concurrente dentro de la ventana de gracia) el cliente adopta el par ganador ya persistido en storage sin invalidar sesión; si no hay ganador, o ante `REFRESH_TOKEN_EXPIRED`/`REFRESH_REUSE_DETECTED`/`INVALID_REFRESH_TOKEN`, limpia tokens y cache y propaga un mensaje seguro al estado de sesión.
- Provider de sesión con restauración, login para los tres roles y logout best-effort. Una sesión inválida/vencida deriva en `unauthenticated` con un `notice` claro (p. ej. "Tu sesión venció. Iniciá sesión nuevamente.") que la pantalla de login presenta al ser redirigida; el `notice` se limpia al re-autenticar y nunca contiene tokens. Sin red durante la restauración o el refresh, los tokens se conservan y la sesión se valida al reconectar.
- Comportamiento offline (RFG-87): `OfflineState` accionable con reintento en las pantallas de lectura ante `NETWORK_ERROR`/`REQUEST_TIMEOUT`, cola de reintentos con backoff para completar/cancelar tareas (piloto en `care-tasks`, con aviso de cambios pendientes), y E2E `offline`/`online-restore` que cortan la red con adb y verifican recuperación sin re-login. La cache es solo en memoria: reabrir sin red muestra login con tokens preservados, no datos.
- Rutas protegidas con Expo Router y splash coordinado con el bootstrap de sesión.
- Header de retorno persistente (`AppHeaderBack` en `src/components/navigation`) con `navigateBack` como fuente única de `canGoBack ? back : replace(fallback contextual)`, integrado en detalle, alta y edición de animales, eventos generales, registros médicos, tareas y gastos; elimina la lógica `goBack` duplicada por pantalla y hace predecible la navegación ante deep links sin historial.
- Acceso de cuenta y cierre de sesión desde toda el área autenticada: tab "Más" (`app/(app)/(tabs)/more.tsx` con `AccountScreen`) con perfil resumido, sección "Gestión", sección "Aplicación", notificaciones y salida con confirmación; `AccountMenuButton` (44 × 44, label accesible "Abrir menú de cuenta") en Inicio y en la fila de retorno de las pantallas stack (`AccountHeaderRow` = `AppHeaderBack` + botón, en `src/features/auth/components`). El cierre usa `SessionProvider.signOut()` (POST `/auth/logout` best-effort) y `useSignOut` (`src/features/auth/session`), con `AccountSignOutSheet` como confirmación nativa con carga y error seguro: siempre se limpia Secure Store y la cache de TanStack Query, incluso offline o con refresh inválido, y `Stack.Protected` redirige a login sin dejar rutas `(app)` accesibles.
- Tab "Más" (`more.tsx`, D08/RFG-141) mantiene la ruta delgada: adapta `src/application/management` al patrón compartido `ManagementSection` e inyecta Gestión y Notificaciones mediante slots nombrados de `AccountScreen`. La pantalla muestra textura decorativa, identidad real (`firstName`, `lastName`, email y roles), y una jerarquía `Gestión > Aplicación > Notificaciones > Salida`. Gestión agrupa filas `outlined` con icono, texto y chevron —"Veterinarios" para los tres roles, "Usuarios" solo con `canManageUsers`, "Ver auditoría" solo con `canReadAudit`—. Aplicación consume `useConnectivityStatus` (`src/core/network`, derivado de `onlineManager`), expone “Acerca de” expandible y enlaza el cambio de contraseña existente. No crea rutas conceptuales ausentes en el contrato. La ruta legacy `/account` no existe; los atajos navegan a `/more`.
- Perfil autenticado (`app/(app)/profile.tsx`, D09/RFG-142): la ruta delgada compone `ProfileScreen` de auth y se abre desde la tarjeta de identidad de “Más”. La pantalla reutiliza el usuario ya validado por `SessionProvider` (sin request adicional), presenta estado, fechas `es-AR`, roles y capacidades efectivas derivadas del registro central, siempre con labels legibles y sin UUIDs ni enums crudos. El cambio de contraseña conserva `/account/change-password` y la salida reutiliza `useSignOut` + `AccountSignOutSheet`, por lo que mantiene confirmación, limpieza de Secure Store/cache y handlers best-effort.
- Validación de Cuenta y Más por rol (D11/RFG-144): la matriz de `src/application/management` se prueba para `admin`, `shelter_manager` y `veterinarian`; Más y Mi perfil permanecen disponibles para toda sesión autenticada, Veterinarios es un destino común y Usuarios/Auditoría se filtran por `canManageUsers`/`canReadAudit`. Los deep links `/users`, `/users/new` y `/users/:id/edit` repiten el guard en la propia ruta y nunca montan el contenido protegido sin capacidad. Si los roles de sesión cambian durante el render, Más elimina destinos privilegiados y las rutas de usuarios reemplazan su contenido por el estado “Sin permiso”; el backend continúa revalidando toda petición.
- Cambio y recuperación segura de contraseña (RFG-121): snapshot OpenAPI móvil ampliado con `ChangePasswordDto`, `RequestPasswordResetDto`, `PasswordResetRequestedDto` y `ConfirmPasswordResetDto`; operaciones tipadas en `authApi` (`changePassword`, `requestPasswordReset`, `confirmPasswordReset`). Cambio autenticado en `app/(app)/account/change-password.tsx` (entrada en `AccountScreen`, `AccountHeaderRow` con `fallbackHref='/more'`): actual + nueva (≥ 12) + confirmación local, `INVALID_CURRENT_PASSWORD` sin cerrar sesión y éxito con limpieza de Secure Store/cache vía `endSession` que redirige al login con aviso. Recuperación pública desde el login (`app/(auth)/forgot-password.tsx`) con confirmación genérica idéntica tras el `202` y `app/(auth)/reset-password.tsx` que captura el token del deep link una única vez, lo elimina de URL/historial y lo conserva solo en memoria; tokens vencidos/reutilizados/inválidos muestran estados diferenciados con acción para solicitar un enlace nuevo. Validación pura en `src/features/auth/utils/passwordValidation` y traducción de códigos en `passwordErrorMessages` (`INVALID_CURRENT_PASSWORD`, `PASSWORD_RESET_TOKEN_EXPIRED`, `PASSWORD_RESET_TOKEN_ALREADY_USED`, `INVALID_PASSWORD_RESET_TOKEN`, 400, 429 y fallback seguro); `jest.config.js` agrega `standard-navigation` al transform de expo-router para tests.
- Pulido UX de "Olvidé mi contraseña" (RFG-130): toggle mostrar/ocultar en `PasswordField` (`src/features/auth/components`, área 44 × 44, labels accesibles y `testID` por campo) aplicado a login, reset y change; `textContentType` (`password`/`newPassword`) junto al `autoComplete` para gestores de contraseñas; medidor de fortaleza `PasswordStrengthMeter` (segmentos + label Débil/Media/Fuerte por longitud, texto y color, `accessibilityLiveRegion`) en reset y change; confirmación de solicitud con guía de spam y TTL ("vence en 30 minutos", `PASSWORD_RESET_LINK_TTL_MINUTES`, espejo del default del backend); reenvío con cooldown de 60 s (`useResendCooldown` en `src/features/auth/hooks`) que deshabilita el botón con cuenta regresiva para no chocar con el rate limit LOGIN (5/min); `429` con espera explícita. Se mantienen el `202` genérico idéntico (anti-enumeración), el token solo en memoria y los estados diferenciados de tokens vencidos/reutilizados/inválidos.
- Login editorial (RFG-137, D04): `app/(auth)/login.tsx` compone un hero decorativo a-bleed (`DecorativeBackground variant="hero"` con `priority="high"`, oculto a tecnologías asistivas y con overlay de contraste) sobre el que va copy nativo (marca `Refugiapp` como único encabezado principal, claim y descripción) y una tarjeta orgánica de acceso (`AppCard variant="organic"`) con el encabezado "Acceso para personal autorizado" y `LoginForm`. La captura de referencia nunca se usa como bitmap de fondo y el texto funcional es nativo. El contenido desplaza dentro de `KeyboardAvoidingView` + `ScrollView` (`keyboardShouldPersistTaps="handled"`), por lo que el teclado no oculta campos ni acciones en 320 × 568 ni 390 × 844. `LoginForm` reutiliza `PasswordField` (toggle 44 × 44) y refuerza autofill (`autoComplete`/`textContentType` email y password, `returnKeyType next → done`). Divergencia `ux` aceptada: no se incorporan iconos dentro de los inputs para no crear una primitiva compartida de campo ni duplicar el estilo del campo; el icono `account` decora el encabezado de la tarjeta. `app/(auth)/_layout.tsx` declara `title` por pantalla para el documento web.
- Navegación inferior alineada (RFG-138, D05): `app/(app)/(tabs)/_layout.tsx` mantiene cuatro destinos (`index`, `explore`, `care-tasks`, `more`) para los tres roles, con la etiqueta visible del tercero renombrada a "Cuidados" sin cambiar la ruta `care-tasks` (push, deep links y E2E intactos) ni la ruta legacy `inbox` (`href: null`). El `tabBar` nativo se reemplaza por `CurvedTabBar`, que compone el patrón compartido `BottomNavigation` (estado activo no-cromático: pastilla `surfaceElevated` + etiqueta `bodyStrong`, `accessibilityState.selected` y `tabBarAccessibilityLabel` en español) sobre una superficie `surfaceSubtle` con arco decorativo estático dibujado con `react-native-svg` cuyo path es la función pura `tabBarCurvePath`/`tabBarCurveArchPath` (`src/components/navigation/tabBarCurve.ts`). El arco es ornamental (`accessible={false}`, `pointerEvents="none"`), usa `sizes.bottomNavigationCurve` y se recalcula con `useWindowDimensions`. Se corrigió el doble inset inferior: `explore`, `care-tasks` y la sección Cuenta usan `SafeAreaView edges={['top','left','right']}` y la barra es la única dueña del inset (`sizes.bottomNavigationHeight + inset.bottom + arco`). Sin endpoints, permisos ni tipos nuevos; ver ADR-0017.
- Gestión de veterinarios: feature `src/features/veterinarians` con contrato derivado de OpenAPI (`CreateVeterinarianDto`, `CreateVeterinarianUserDto`, `UpdateVeterinarianDto`, `VeterinarianResponseDto`), listado paginado con búsqueda por nombre o matrícula y filtro por estado (`GET /veterinarians`), detalle (`GET /veterinarians/:id`), alta (`POST /veterinarians`) que soporta creación y vinculación atómica de usuario con rol `veterinarian` mediante `createUser` (email + contraseña ≥ 12; sin UUID manual, ver ADR-0010), edición con PATCH diferencial que envía `null` para limpiar `email`/`phone`/`notes` (`PATCH /veterinarians/:id`), desactivación lógica (`POST /veterinarians/:id/deactivate`) y reactivación (`POST /veterinarians/:id/reactivate`, RFG-123) con confirmación `ReactivateVeterinarianDialog`, ambas conservando el historial clínico. Escritura para `admin`/`shelter_manager` (`canManageVets`); lectura para los tres roles. El detalle y el listado presentan el vínculo desde `user.email` y rol (nunca UUID). Errores traducidos por código (`LICENSE_NUMBER_ALREADY_EXISTS`, `EMAIL_ALREADY_EXISTS`, `USER_ALREADY_LINKED_TO_VETERINARIAN`, `VET_USER_PAYLOAD_CONFLICT`, `VET_CREATE_USER_EMAIL_REQUIRED`, `VETERINARIAN_ALREADY_ACTIVE`), 403/404 por estado y fallback genérico en `toApiErrorMessage`. Las mutations invalidan `veterinarianKeys.all` por prefijo, refrescando también las opciones activas del formulario clínico (`['veterinarians', 'options']`). Rutas `app/(app)/veterinarians/index.tsx`, `new.tsx`, `[id].tsx` y `[id]/edit.tsx`.
- Proceso de adopción (RFG-125): feature `src/features/adoptions` derivada del contrato de RFG-95. La pestaña Adopción del detalle del animal muestra historial paginado a los tres roles; `admin` y `shelter_manager` (`canManageAdoptions`) también consultan postulaciones y datos de contacto, registran un adoptante seguido de su postulación y aprueban mediante confirmación explícita. La aprobación no es optimista: el backend cambia el animal a `adopted`, resuelve postulaciones competidoras y confirma el historial; la ruta coordina después la invalidación de `animalKeys.all`. Los datos personales solo viven en caché de memoria y nunca se incluyen en logs. El backend aún no publica búsqueda de adoptantes existentes, por lo que el conflicto de email se informa sin inventar recuperación por email.
- Gestión de usuarios para `admin`: acceso desde el dashboard, rutas `app/(app)/users/index.tsx`, `app/(app)/users/new.tsx` y `app/(app)/users/[id]/edit.tsx`, listado paginado mediante `GET /users` que incluye cuentas activas e inactivas en orden determinista. El alta D06-04/RFG-143 delega en `CreateUserScreen`, separa datos personales, acceso inicial y selección multirrol, valida password inicial ≥ 12 y exige confirmación antes de `POST /users`; solo envía los roles publicados por OpenAPI. La edición usa `PATCH /users/:id` diferencial (sin `GET` detalle: resolución por cache del listado con `useUser`), con confirmación para cambios de rol; activar y desactivar también se confirman. Los errores de alta distinguen falta de red, conflicto de email, payload inválido y 403, mientras edición conserva `LAST_ADMIN_FORBIDDEN`, `EMPTY_UPDATE_PAYLOAD`/`INVALID_PAYLOAD` y 404. Toda mutación invalida la lista.
- Notificaciones push (RFG-126, movil): feature `src/features/notifications` con permiso contextual (`granted`/`denied`/`blocked`/`unavailable`), registro y rotacion del token Expo ligado a la sesion (`usePushRegistration`, idempotente por hash y con dedupe en memoria), baja del dispositivo en el logout mediante `registerSignOutHandler` de la sesion (best-effort, antes de limpiar tokens), preferencias editables en la seccion "Notificaciones" del tab "Mas" (vencidas, proximas, antelacion 5..1440 y horas silenciosas) y navegacion segura al tocar una notificacion (`data.careTaskId` validado como UUID, cold start y app en ejecucion) hacia `app/(app)/care-tasks/[id]/index.tsx`. La seccion "Notificaciones" tiene un unico encabezado (lo aporta `NotificationsSection`; `NotificationPermissionCard` y `NotificationPreferencesSection` no repiten titulo) y las preferencias distinguen carga, error de servidor (`ErrorState`), fallo de transporte (`OfflineState` via `isNetworkError`) y datos cargados: un fallo nunca deja el spinner infinito. El adaptador `PushProvider` aisla `expo-notifications` y degrada a "no disponible" sin `EAS projectId`, permiso, dispositivo fisico o web. Expo Go (SDK 53+) no admite push real; en ese entorno el registro degrada a "no disponible" pero las preferencias siguen consultandose y guardandose porque son HTTP. Ver ADR-0014.
- TanStack Query conectado a NetInfo y AppState.
- Adapter HTTP falso inyectable para desarrollo y tests.
- Tipos de auth, animals y media generados desde el snapshot OpenAPI.
- Alta de animales con foto de perfil opcional: formulario React Hook Form + Zod en español, subida multipart huérfana, guard visual por rol y ruta `app/(app)/animals/new.tsx`.
- Detalle de animal en `app/(app)/animals/[id].tsx` visible para los tres roles y organizado como centro funcional con pestañas de resumen, historial, tareas, gastos y evolución clínica. La pestaña activa se conserva en estado local y cada consulta remota se monta bajo demanda para reutilizar la cache de TanStack Query y evitar lecturas innecesarias; evolución clínica se limita a `admin` y `veterinarian`.
- Las pestañas Tareas y Gastos exponen altas contextuales con `animalId` precargado para `admin`/`shelter_manager`; `veterinarian` recibe una explicación de solo lectura y no ve acciones que responderían 403. Gastos informa explícitamente que la edición no existe en el contrato vigente.
- Edición de ficha en `app/(app)/animals/[id]/edit.tsx` y cambio de estado desde el detalle, restringidos a `admin` y `shelter_manager`, con formulario compartido `AnimalProfileForm` (modos create/edit). Rediseño D16 (RFG-149): fondo decorativo, `ScreenHeader` único H1, formulario en cards (`Foto de perfil`/`Datos principales`/`Fechas`), `SegmentedControl` para sexo, dirty global + por campo ("Cambios sin guardar"/"Modificado"), `OfflineState` con reintento y `ConfirmDialog` de descarte mediante `useUnsavedChangesGuard` (`beforeRemove` + `gestureEnabled`); "Quitar" la foto actual envía `profilePhotoMediaId: null` y "Cambiar foto" compone un `BottomSheet` de cámara/galería.
- Cambio de estado con matriz de transiciones local (`animalTransitions`), confirmación con modal que explica la consecuencia y sin optimistic updates: invalidación de queries como fuente de verdad.
- Alta de eventos generales del animal desde una ruta protegida por capacidad para `admin` y `shelter_manager`, con tipos manuales derivados de OpenAPI e invalidación de la query key del historial. Rediseño D15 (RFG-148): card identidad `organic` con foto protagonista, selector de tipo fiel a la referencia sobre `BottomSheet` (solo los 3 tipos publicados), formulario con contador de descripción y banner de regla de fecha, validación local contra `intakeDate` (inicio de día local) y futuro +60 s, y estados loading/offline/error con reintento antes de montar el formulario.
- Los formularios de fecha reutilizan `DateTimeField`: selector nativo en iOS/Android, fallback textual web y serialización local consistente. Eventos generales y gastos ya no solicitan fechas ISO manuales; las presentaciones delegan en los formateadores `es-AR` compartidos.
- Listado paginado de animales en `app/(app)/(tabs)/explore.tsx` (tab "Animales") con búsqueda por nombre, filtro por estado y navegación al detalle; disponible para los tres roles.
- Foto de perfil en el listado de animales: `AnimalCardAvatar` consulta `useAnimalPhoto(profilePhotoMediaId)` por tarjeta con caché compartida por `animalKeys.media` (deduplicación por `mediaId`, `staleTime` 5 min), sin fetch para animales sin foto y fallback silencioso a iniciales ante error; la invalidación de `animalKeys.all` tras crear o editar la ficha mantiene la foto coherente sin optimistic updates.
- Dashboard de portada en el tab "Inicio" (`app/(app)/(tabs)/index.tsx`): feature `src/features/dashboard` que consume `GET /dashboard/overview` para los tres roles, con totales por estado y animales recientes (foto de perfil vía `GET /media/:id` solo cuando `profilePhotoMediaId` está presente, sin fetch si es `null`), estados de skeleton inicial, vacío, error con reintento y pull-to-refresh. La autorización visual sale del registro central `src/application/authorization`: "Alta animal"/"Nueva tarea" requieren `canEditAnimal`, "Registrar gasto" requiere `canManageExpenses` y "Gestionar usuarios" requiere `canManageUsers`; `canReadAudit` queda reservado a `admin` y se expone como entrada "Ver auditoría" en la sección "Gestión" del tab "Más" (no en el resumen operativo). `dashboardKeys.all = ['dashboard']` es la key canónica del panel; las mutaciones de tareas y gastos la invalidan por prefijo (constantes locales en cada feature, sin imports cruzados).
- Lectura y presentación del historial general en el detalle del animal (`GET /animals/:animalId/events`) para los tres roles mediante `useInfiniteQuery`: páginas de 20, único filtro contractual `eventType`, orden determinista del servidor (`occurredAt DESC, id DESC`) sin reordenar en cliente y deduplicación por UUID al aplanar páginas solapadas. `AnimalHistory` virtualiza con `FlatList`, carga por fin de scroll o CTA, pull-to-refresh y estados loading/empty/error/offline; la creación existente invalida todas las variantes de `animalKeys.history(animalId)`.
- Listado global de tareas (tab visible "Cuidados", ruta `care-tasks`) y listado embebido por animal desde su detalle, con filtro por estado, formularios de alta y edición y confirmaciones para completar o cancelar; las mutaciones esperan confirmación del backend e invalidan las queries de tareas y dashboard. La ruta legacy `/inbox` redirige a `/care-tasks`.
- Contratos de tareas derivados del snapshot OpenAPI y guards de escritura para `admin` y `shelter_manager`.
- Contrato compartido de opciones de animales (`src/application/animals`): `GET /animals?page=1&limit=100` sin parámetros de orden no documentados (`sortBy`/`sortOrder` no existen en OpenAPI y el backend los rechaza con 400), orden alfabético por `name` en cliente, fallback `GET /animals/:id` ante un `animalId` UUID válido cuando el listado falla o no lo contiene, cache compartida entre features, mensajes de error accionables por causa y `isUuid` centralizado en `src/core/validation`. Desbloquea los formularios de `care-tasks` y `expenses` (S09) y el reintento vuelve a ser funcional.
- Dependencias `react-hook-form`, `@hookform/resolvers` y `expo-image-picker` (ver ADR-0003).
- Captura de imágenes desde cámara o galería y selección de PDF mediante `expo-document-picker`; validación local espejo de MIME/tamaño del backend y subida multipart con progreso y cancelación (ver ADR-0005).
- Permiso de cámara/galería denegado con explicación y, si queda bloqueado permanentemente, acceso a los ajustes del dispositivo (`Linking.openSettings`). El picker de foto infiere MIME/nombre cuando el sistema omite metadatos (`resolveMediaMimeType`/`normalizeMediaFileName`) y permite subir sin `fileSize`, dejando al backend como autoridad de tamaño. `AppAvatar` cae a iniciales de forma silenciosa ante fallo de imagen (`onError`).
- Fechas presentadas siempre formateadas en `es-AR` con formadores compartidos `dateFormat` (nunca ISO crudo): detalle de animal, historial general, evolución clínica y tareas; las fechas de calendario se parsean como fecha local para evitar corrimientos de zona horaria, y las filas etiqueta-valor envuelven en pantallas estrechas y con fuente ampliada.
- Normalización de `intakeDate`/`birthDate` a `YYYY-MM-DD` en la frontera (`toDateOnly` en `toAnimalView` y en los mappers de edición), corrigiendo que las fechas de ingreso/nacimiento quedaran en blanco tras guardar la ficha: el backend las serializa como ISO datetime y `dateFormat` solo acepta `YYYY-MM-DD` (ver ADR-0008).
- Registros médicos y evolución clínica: feature `src/features/medical-records` con contrato derivado de OpenAPI (medical-records, veterinarians y media por owner), alta y edición con PATCH semántico (diff que omite campos intactos y envía `null` para limpiar), adjuntos clínicos multipart huérfanos en creación y directos al registro en edición, y selectores de veterinarios activos.
- Historial de cambios de registros médicos (RFG-124): contrato derivado de OpenAPI (`GET /medical-records/:id/changes`, RFG-96) con `useInfiniteQuery` paginada (páginas de 20, orden determinista `changedAt DESC, id DESC` sin reordenar en cliente), filtros completos por tipo de operación (`update | soft_delete | restore`), actor UUID (`isUuid` descarta valores inválidos) y rango de fechas (`from > to` no dispara query), y presentación por campo con `previousValues` formateado de forma defensiva (nulos, extensos y estructurados). Entrada "Ver historial" desde cada tarjeta de `ClinicalHistory` con ruta `app/(app)/animals/[id]/medical-records/[recordId]/changes.tsx`, guard visual por `canReadClinicalRecords` (el deep link para `shelter_manager` muestra acceso restringido sin montar la pantalla ni ejecutar la query), estados loading/empty/error/offline con reintento, fin de paginación y pull-to-refresh.
- Presentación del actor en Auditoría e Historial (RFG-129): el contrato enriquecido (`actor` en auditoría con nombre+email; `changedBy` en historial con nombre sin email) se mapea a vistas con `displayName`/`initials` en la frontera; las filas usan el patrón compartido `ActorRow` (`src/components/patterns`) con `AppAvatar` de iniciales, fecha relativa (`formatRelativeDateTime` de `dateFormat`) junto a la absoluta, y fallback a UUID durante rollout (`actorFallbackId`/`changedByFallbackId`) o "Sistema"/"Usuario del sistema" cuando ambos son `null`. El email del actor solo se presenta en el detalle de auditoría; los nombres nunca se persisten (solo cache en memoria) ni se incluyen en logs o query keys.
- Gastos: feature `src/features/expenses` con alta validada, importe entero en centavos, comprobante multipart huérfano vinculado mediante `ticketMediaId`, limpieza compensatoria e invalidación de gastos y dashboard; el detalle del animal consume `GET /animals/:animalId/expenses`, formatea ARS desde centavos, muestra la miniatura del comprobante cuando existe y ofrece alta contextual. El contrato no expone edición de gastos y la UI lo comunica sin ofrecer una acción inválida.
- Listado global de Gastos D21 (RFG-154): ruta delgada `app/(app)/expenses/index.tsx` (entrada desde "Más > Gestión", común a los tres roles) que compone `AccountHeaderRow` + `ExpensesOverviewScreen`. `useInfiniteExpenses` pagina `GET /expenses` en páginas de 20 con deduplicación por UUID y sin reordenar, y `expenseKeys.infiniteList` queda separada de la lista por animal. Filtros contractuales por `animalId`, `category` y rango `from`/`to` (presets y rango simple con `DateTimeField`, convertidos a límites ISO de día local inclusivo y validados con `from ≤ to`). "Subtotal cargado" (`sumExpenseAmountCents`) suma solo las páginas cargadas y nunca se rotula como total global; el total de registros proviene del `total` paginado. Los nombres de animal se resuelven best-effort desde la cache compartida de `src/application/animals` con fallback explícito `Animal no disponible` (nunca UUID crudo). Estados loading/vacío/error/offline, pull-to-refresh, paginación incremental y FAB de alta solo con `canManageExpenses`. Sin endpoints, roles ni tipos nuevos.
- Contrato de gastos D22 (RFG-155): el snapshot móvil incorpora `GET /expenses/{id}` (detalle, lectura para los tres roles) y `DELETE /expenses/{id}` (baja lógica, `admin`/`shelter_manager`), ambos ya publicados por el backend y sin schemas nuevos. `expensesApi` expone `getById` (mapea el DTO con `toExpense`) y `remove` (`204` sin body) y `expenseErrorMessages` agrega `toExpenseDetailErrorMessage`/`toDeleteExpenseErrorMessage` (403/404 propios, fallback en `toApiErrorMessage`). Sin hooks, query keys de detalle ni UI de detalle: corresponden a la historia RFG-157.
- Registro de gasto D23 (RFG-156): ruta delgada `app/(app)/expenses/new.tsx` que valida el `animalId` UUID opcional y compone `AccountHeaderRow` (`fallbackHref='/expenses'`) + `CreateExpenseScreen`. La feature captura el importe en unidades de pesos y lo convierte a `amountCents` con `parseArsUnitsToCents` (`src/features/expenses/utils/expenseAmount.ts`, enteros y `BigInt`, sin aritmética de punto flotante; formatos es-AR `48.500,00`, `48500,50` y `48500.50`), presenta moneda `ARS` fija no-editable con preview vivo, usa `DateTimeField` `datetime` para `incurredAt` (ISO local en el mapper) y mantiene el comprobante realmente opcional (`ticketMediaId` ausente no se envía; subida con progreso, cancelación y limpieza huérfana best-effort). Selectores de animal (búsqueda por nombre + foto cacheada vía `useAnimalOptionPhoto`) y categoría sobre el patrón `BottomSheet`. Estados loading/error/offline/fallback/vacío con reintento, guard `canManageExpenses` y anuncio accesible del alta.
- Formulario clínico con React Hook Form + Zod en español, `@react-native-community/datetimepicker` para `occurredAt` (validado contra el inicio de día local del `intakeDate` y con tolerancia de +60 s para el límite futuro, ver ADR-0007) y mensajes de error seguros por código de backend (`OCCURRED_AT_IN_FUTURE`, `OCCURRED_AT_BEFORE_INTAKE`, 403, 404 y 409 `VETERINARIAN_INACTIVE`).
- La carga de veterinarios en los formularios clínico no bloquea el render: estados de carga, error y vacío con reintento, y guardado posible sin veterinario.
- Rutas `app/(app)/animals/[id]/medical-records/new.tsx` y `app/(app)/animals/[id]/medical-records/[recordId]/edit.tsx`, y pestaña "Evolución clínica" en el detalle con `ClinicalHistory`, filtros por tipo y ventanas de fechas; guards visuales para `admin` y `veterinarian`.
- Invalidación de la evolución clínica (`medicalRecordKeys.lists()`) tras crear o editar registros, sin optimistic updates.
- Confirmación destructiva compartida `ConfirmDialog` en `src/components/feedback`: modal nativo con scrim, título, detalle de la consecuencia, acciones "Cancelar"/"Confirmar" con bloqueo durante `confirming` y error seguro; reemplaza los diálogos duplicados por feature (`StatusConfirmDialog` de animales, `CareTaskActionDialog` de tareas y `AccountSignOutSheet` de auth lo envuelven conservando su API pública). Ninguna acción destructiva se ejecuta sin confirmación.
- Borrado de adjuntos clínicos confirmado: quitar un adjunto ya subido en edición (`DELETE /media/:id`) requiere `ConfirmDialog` antes de encolarse al guardado; la limpieza huérfana automática post-fallo (foto, comprobante, adjuntos) permanece silenciosa por no ser iniciada por el usuario.
- Mapa de errores en español rioplatense unificado: `src/core/api/errors.ts` normaliza 400, 401, 403, 404, 409, 422, 429, 500 y 502-504 a mensajes accionables, diferencia red (`NETWORK_ERROR`) de timeout (`REQUEST_TIMEOUT`) y expone `toApiErrorMessage` como fallback seguro para errores desconocidos (nunca filtra payloads, tokens ni `requestId`); las features (animals, care-tasks, medical-records, dashboard, expenses y `src/application/animals`) especializan por código/dominio y delegan el fallback genérico en el core. `expenses` incorpora `toCreateExpenseErrorMessage` y login/errores de ruta quedan en voseo.
- Sistema de diseño, componentes compartidos y catálogo interno.
- Tests unitarios y de componentes.
- E2E por rol con Maestro (ver ADR-0011): `maestro/` cubre `login → dashboard → detalle de animal → completar tarea` para `admin`, `shelter_manager` y `veterinarian`, alta de animal y registro médico para roles con permiso, negativa clínica de `shelter_manager` (`clinical-denied`), logout más expiración básica (`session-expired`), restauración de sesión tras relaunch (`session-restore`) y offline con recuperación (`offline` + `online-restore`, con corte de red vía adb). Selectores duales `accessibilityLabel` en español más `testID` en inglés (`login-form`, `dashboard-screen`, `animals-list`, `task-list`, `clinical-history`, `confirm-dialog`, `account-logout`, `offline-state`, `users-list`); credenciales solo por entorno y sin binarios en E2E. Scripts `npm run e2e*` y workflow `mobile-e2e.yml` en CI.
- E2E de historial médico y auditoría (RFG-132): `maestro/medical-history.yaml` (abrir un registro → su historial → paginar hasta "No hay más cambios" → verificar actor por nombre `E2E Admin`, badge de operación y diff del campo `Diagnóstico` sin códigos crudos) y `maestro/audit.yaml` (lista → detalle con actor por nombre → filtrar por acción "Usuario creado" → verificar resultados legibles sin `user.create`). Selectores deterministas agregados: `clinical-record-history-button`, `history-filter-*`, `history-end-of-list`, `audit-card`, `audit-detail`, `audit-filter-*`, `audit-end-of-list`; `FilterChip` acepta `testID`. Requieren seeds en staging con ≥20 cambios de un registro (el más reciente un `update` de `diagnosis` por el admin E2E) y ≥1 evento `user.create` con actor enriquecido.
- CI móvil con generación de tipos, formato, lint, typecheck y tests RNTL.
- Distribución interna declarativa con EAS: perfil `staging` sobre ambiente `preview`, APK Android, ad hoc iOS, identidad separada de producción, versión nativa remota con autoincremento y escaneo del bundle previo a la entrega (ver ADR-0013 y `docs/release-runbook.md`).
- ESLint, Prettier, typecheck y export web verificados.
- Jerarquía de documentación y reglas locales por frontera.
- Compartición en desarrollo con túnel: scripts `start:tunnel` (solo Metro por ngrok), `start:lan` y `start:share` (`scripts/start-dev.mjs` resuelve `EXPO_PUBLIC_API_URL` con prioridad shell > `.env.local` > IP LAN autodetectada e inyecta el resultado; `node scripts/start-dev.mjs --print-api-url` muestra la URL sin arrancar Metro), con `@expo/ngrok` como devDependency. El túnel de Metro no publica la API: cada dispositivo debe alcanzarla por IP LAN o mediante un túnel propio del backend (cloudflared/ngrok), y ese valor sigue validándose en `src/core/config/env.ts`. En Expo Go + `start:share` (bundle por `https`) la API también debe ser `https`: una API `http` LAN se bloquea y el cliente la reporta como `NETWORK_ERROR`.
- Assets de marca (D02/RFG-135): hero de perro rescatado (fotografía de stock licenciada Pngtree, con atribución), marca vegetal y textura de hojas (ilustraciones vectoriales propias) en `assets/images/brand/` (WebP + PNG fallback), maestros en `docs/brand-assets/sources/`, procedencia en `docs/brand-assets.md` y pipeline reproducible con `npm run assets:brand`. Se consumen vía `brandAssets`/`resolveBrandSource` y `DecorativeImage` (decorativos ocultos a AT, `aspectRatio`, `allowDownscaling`, caché memoria/disco y fallback ante error; ver ADR-0015 y ADR-0016). La densidad la resuelve Metro por _base name_ en runtime; sin endpoints, permisos ni estados nuevos.
- Sistema visual compartido D03 (RFG-136): patrones reutilizables en `src/components` para fondo decorativo (`DecorativeBackground`), encabezados de pantalla y de sección (`ScreenHeader`/`SectionHeader`), control segmentado (`SegmentedControl` sobre `FilterChip` con semántica `radiogroup`/`radio`), acción flotante (`FAB` en `primitives`), tarjeta de entidad (`EntityCard`), metadatos (`MetadataRow`) y adjuntos (`AttachmentList`/`AttachmentRow` con confirmación de borrado). Tokens nuevos `sizes.fab`, `sizes.dialogMaxWidth` y `opacity.pressed`/`opacity.pressedSubtle`/`opacity.overlay` reemplazan medidas dispersas; todos los patrones consumen exclusivamente `src/theme`, respetan safe areas, targets de 44 × 44, escalado de fuente y reduce motion (solo feedback por `opacity`), y quedan catalogados en `/design-system`. Sin endpoints, permisos ni estados de dominio nuevos.
- Arnés de validación visual D06 (RFG-139): módulo `src/design-system` con las 23 referencias como casos reproducibles (`referenceCases.ts`, espejo tipado de la matriz D01), fixtures deterministas sin datos personales ni servicios externos (`fixtures.ts` con `DESIGN_SYSTEM_NOW`), matriz de seis viewports (`viewports.ts`), previews sobre los patrones compartidos (`referencePreviews.tsx`) y `ReferenceValidationSection`/`ReferenceCaseCard` integrados en `/design-system`. La checklist humana vive en `docs/design-validation/checklist.md` y los `testID` `ds-case-D06-NN` habilitan la regresión de `RFG-167`. Sin endpoints, permisos ni estados de dominio nuevos; no rediseña pantallas de producción.
- Detalle animal D12 (RFG-145): `app/(app)/animals/[id].tsx` compone una cabecera de identidad propia de la feature (`AnimalDetailHeader`) y navegación local (`AnimalDetailTabs`) sin mover la coordinación entre animales, tareas, gastos, adopciones y clínica fuera de la ruta. La cabecera consume exclusivamente el modelo `Animal`, foto cacheada y presentación local de estados; no agrega campos ni endpoints. `AppAvatar` incorpora la escala general `avatarXl` y forma `rounded`; las pestañas son un `tablist` horizontal con estado seleccionado y conservan Adopción y los guards clínicos existentes.
- Archivos del animal (D17/RFG-150): ruta `app/(app)/animals/[id]/files.tsx` con galería paginada (`AnimalFilesGrid`, `FlatList` de dos columnas, claves UUID y miniaturas Cloudinary optimizadas con fallback a glifo para PDF), entrada de subida directa vinculada (`ownerType=animal` + `ownerId`) con progreso textual, cancelación `AbortSignal` y reintento (`useUploadAnimalFile`), borrado confirmado (`ConfirmDialog`) que invalida `animalKeys.files` e idioma sin optimistic updates (`useDeleteAnimalFile`). La pantalla excluye el `profilePhotoMediaId` vigente para que la foto de perfil no aparezca duplicada y expone estados loading/empty/offline/error; lectura para los tres roles y escritura solo `admin`/`shelter_manager` (`canEditAnimal`), sin endpoints nuevos fuera del contrato media ya publicado.
- Cuidados globales D18 (RFG-151): la ruta `app/(app)/(tabs)/care-tasks.tsx` queda como composición delgada de `CareTasksOverviewScreen`. El listado usa `useInfiniteCareTasks` con páginas de 20, `FlatList`, deduplicación por UUID y el orden del backend; el filtro persistido sigue limitado a `pending`/`completed`/`cancelled`. `useCareTaskCounts` ejecuta exactamente tres queries `GET /care-tasks?page=1&limit=1`, una por estado persistido, compartiendo el `animalId` elegido y leyendo `total`; sus keys quedan separadas de la lista infinita. `Vencida` (`dueAt < now`) y `Próxima` (ventana determinista de 24 h) son presentaciones con icono y texto, no estados nuevos. Lectura para los tres roles y FAB de alta solo con `canEditAnimal`; se conservan estados loading/empty/error/offline, pull-to-refresh, reintento y fin de paginación.
- Alta de cuidado D19 (RFG-152): `app/(app)/care-tasks/new.tsx` queda como adaptador del parámetro `animalId` y delega en `CreateCareTaskScreen`. La feature obtiene `AnimalOption` desde la frontera `src/application/animals` (identidad mínima y metadatos opcionales de presentación), presenta carga/vacío/error/offline con reintento y mantiene el guard reactivo `canEditAnimal`. `CareTaskForm` envía solo `animalId`, `title`, `description?` y `dueAt?` a `POST /care-tasks`; `pending` se explica como estado inicial pero no se agrega al payload porque lo establece el backend. El éxito invalida todas las queries de tareas y dashboard, vuelve al origen y anuncia el resultado a tecnologías asistivas; un fallo conserva el borrador y requiere reenvío explícito para evitar duplicados. Selector y tarjetas de Cuidados resuelven `profilePhotoMediaId` con `GET /media/:id`, cache compartida, miniatura optimizada y fallback a iniciales.
- Detalle de cuidado D20 (RFG-153): `app/(app)/care-tasks/[id]/index.tsx` valida el UUID y delega en `CareTaskDetailScreen`. La feature consulta tarea e identidad resumida del animal mediante la frontera de aplicación, diferencia el estado persistido de `overdue`/`upcoming`, presenta descripción y fechas formateadas, y permite navegar a la ficha del animal. Las acciones reaccionan a `canEditAnimal`; completar/cancelar confirman, reutilizan la cola offline segura e invalidan tareas y dashboard. No se agrega borrado mientras OpenAPI no publique ese endpoint.
- Cambio de estado D14 (RFG-147): `AnimalStatusChanger` abre un selector tipo sheet (`AnimalStatusSheet` sobre el patrón compartido `BottomSheet` de `src/components/feedback`, ADR-0018) que ofrece solo las transiciones válidas de `animalTransitions`, con estado actual por icono + texto y `occurredAt` opcional (`DateTimeField`, 60 s de tolerancia de skew). Los estados terminales (`adopted`/`deceased`) encadenan un segundo `ConfirmDialog` `danger`; cancelar conserva el estado. Sin optimistic updates (`useChangeAnimalStatus` invalida `animalKeys.all`) y sin endpoints, roles ni tipos nuevos.

## 17. Pendientes y deuda conocida

- Ampliar el snapshot OpenAPI y los tipos generados a medida que nuevas features consuman endpoints (cubiertos: auth, animals, eventos generales, tareas, gastos —incluido el detalle y la baja de RFG-155—, registros médicos —incluido el historial de cambios—, veterinarios y media).
- El formulario de tareas no puede ofrecer `type` ni un responsable asignable hasta que el backend los incorpore al contrato. Hoy el backend registra al actor autenticado en `createdByUserId`.
- La evolución clínica se presenta con una sola página (20 ítems); falta paginación UI. El historial de cambios de un registro (`/medical-records/:id/changes`) sí está paginado con `useInfiniteQuery` (ver §16).
- Ampliar E2E con edición y cambio de estado de animales y edición de consultas; RFG-85 deja cubierta el alta, la creación clínica, la negativa por rol y la sesión básica, y RFG-132 agrega el flujo de historial médico y auditoría. La rotación concurrente y el single-flight quedan cubiertos por unit tests del cliente HTTP (`src/core/api/client.test.ts`) y por los E2E de rotación del backend (Testcontainers); los flows `session-expired` y `session-restore` actúan como proxy en dispositivo porque staging no expone TTL corto ni inyección de tokens vencidos.
- La cache de TanStack Query no persiste en frío (solo memoria): reabrir sin red muestra login con tokens preservados, no datos. Persistirla exigiría guardar datos clínicos en disco sin cifrar; queda como deuda hasta evaluar storage cifrado.
- Extender la cola de reintentos (`MutationRetryQueue`) más allá del piloto de completar/cancelar tareas cuando otra feature necesite reintento offline con `safeToRetry`.
- Los patrones compartidos de D03 conviven con filas y tarjetas locales de cada feature (tarjetas de tareas, gastos y veterinarios, adjuntos clínicos); su migración es progresiva y la resuelven las historias de rediseño (`RFG-151`, `RFG-154`, `RFG-161`, `RFG-165` y afines). RFG-146 ya migró el historial general a timeline virtualizado.
- `npm run typecheck` no exige `.expo/types`: verificado que compila sin el directorio generado por Expo Router. Si en el futuro el código depende de tipos de ruta generados, agregar el typegen al Mobile CI en ese momento.
- Configurar en GitHub la protección de `develop`/`master` para exigir el check `Mobile CI / lint, typecheck and tests` antes del merge.
- Validar el sistema visual y el selector de fecha nativo en dispositivos iOS y Android reales.
- Ejecutar y registrar los primeros builds EAS de staging en Android/iOS cuando exista una sesión autorizada, el proyecto Expo esté vinculado y la URL real de staging esté configurada; completar luego la evidencia de `docs/releases/1.0.0-staging.md`.

Los pendientes no se consideran implementados hasta que exista código, contrato y tests cuando corresponda.

## 18. Comandos de verificación

```bash
npm ci
node scripts/sync-mobile-openapi.mjs   # solo al ampliar el snapshot desde ../refugiapp/docs/openapi.json
npm run api:generate
npm run typecheck
npm run lint
npm run format:check
npm test -- --runInBand
npx expo export --platform web --output-dir dist
```
