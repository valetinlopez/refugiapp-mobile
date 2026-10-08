# Reglas para `app`

## Responsabilidad

- Define rutas, grupos, layouts y opciones de navegación con Expo Router.
- Compone providers globales y pantallas de features.
- Resuelve redirecciones de alto nivel por sesión o rol cuando se implementen.

## Convenciones

- Mantener rutas delgadas: no llamar Axios, Secure Store ni APIs de plataforma directamente.
- Extraer UI reutilizable a `src/components` o a la feature correspondiente.
- Extraer queries, mutations y transformaciones a hooks o API de la feature.
- Toda pantalla stack fuera de `(tabs)` debe componer `AppHeaderBack` como primer elemento de su `SafeAreaView`, con un `fallbackHref` contextual (lista de origen o detalle del animal). No reimplementar `router.canGoBack()` por pantalla; usar `navigateBack` de `src/components/navigation`.
- Las pantallas stack del área autenticada exponen el acceso de cuenta componiendo `AccountHeaderRow` (fila de retorno `AppHeaderBack` + botón de cuenta) de la feature auth, en lugar de `AppHeaderBack` directo. La ruta de cuenta vive en el tab `more`; los atajos navegan con `router.push('/more')`.
- Usar route groups para organización sin convertirlos en segmentos públicos.
- Declarar providers globales solo en el layout raíz; providers de una feature deben vivir lo más cerca posible de su subárbol.
- El layout `(app)` compone `NotificationsWiring` para coordinar `auth` y `notifications` (registro del dispositivo según la sesión, observador de navegación push y baja del dispositivo en `registerSignOutHandler`), sin que esas features se importen entre sí.
- Las pantallas pesadas exclusivas de administración y auditoría cargan el componente de feature con `React.lazy` + `Suspense`; el fallback usa `LoadingState` con una etiqueta accesible y el import dinámico queda detrás del guard visual de capacidad.

## Estructura actual

- `(auth)`: login público, recuperación (`forgot-password`) y confirmación (`reset-password`) de contraseña; no existe registro público en el backend. `reset-password` captura el token del deep link una única vez, lo elimina de la URL/historial y lo conserva solo en memoria.
- `(app)`: área autenticada.
- `(app)/account/change-password`: cambio de contraseña autenticado desde "Más > Cuenta" (`AccountHeaderRow` con `fallbackHref='/more'`); el éxito limpia la sesión local y vuelve al login con aviso.
- `(app)/profile`: perfil autenticado para los tres roles, accesible desde la tarjeta de identidad de “Más”; presenta identidad, estado, fechas, roles y capacidades efectivas con labels legibles, y reutiliza cambio de contraseña y cierre de sesión confirmado.
- `(app)/(tabs)`: destinos principales: `index` (Inicio), `explore` (Animales), `care-tasks` (Cuidados; la ruta permanece `care-tasks`) y `more` (Más). `more` adapta los destinos autorizados de `src/application/management` y pasa `ManagementSection` y `NotificationsSection` a los slots nombrados de `AccountScreen`; no implementa UI compleja ni lógica de plataforma. La jerarquía D08 es Gestión > Aplicación > Notificaciones > Salida, con "Veterinarios" para todos los roles, "Usuarios" solo `canManageUsers` y "Ver auditoría" solo `canReadAudit`. El `tabBar` nativo se reemplaza por `CurvedTabBar` (`src/components/navigation`), que compone `BottomNavigation` sobre un arco SVG decorativo (`tabBarCurvePath`) y conserva filtrado `href: null`, labels accesibles y navegación por `tabPress`. La barra se posiciona de forma absoluta sobre el borde inferior para que la zona exterior del arco no reserve una franja opaca; cada pantalla tab reserva en el contenido desplazable `bottomNavigationHeight + bottomNavigationCurve + spacing.lg`, y la barra conserva la responsabilidad del safe-area inset inferior. Las pantallas del tab usan `SafeAreaView edges={['top','left','right']}` para no duplicar el inset. La ruta legacy `inbox` es un redirect oculto (`href: null`) hacia `care-tasks`.
- `(app)/care-tasks/[id]`: detalle de tarea (lectura para los tres roles, con acciones de escritura según capacidad), destino seguro de la navegación por notificación push.
- `(app)/care-tasks/new`: ruta delgada que valida el `animalId` opcional y compone `CreateCareTaskScreen`; la feature resuelve opciones mínimas de animales, estados de preparación, guard reactivo de `canEditAnimal`, alta y anuncio accesible del resultado.
- `(app)/animals/[id]`: incorpora la sección Adopción para los tres roles; `admin` y `shelter_manager` pueden gestionar postulaciones y aprobar, mientras `veterinarian` solo consulta el historial sin datos personales.
- `(app)/animals/[id]/adoptions/new`: formulario protegido para registrar adoptante y postulación, con retorno a la sección Adopción.
- `(app)/expenses`: listado global paginado de gastos (D21/RFG-154) para los tres roles, con filtros por animal, categoría y fechas y entrada desde "Más > Gestión"; la ruta delgada compone `AccountHeaderRow` (`fallbackHref='/more'`) y `ExpensesOverviewScreen`.
- `(app)/expenses/new`: alta de gasto con comprobante para `admin` y `shelter_manager`.
- `(app)/users`: listado paginado, alta y edicion (`[id]/edit`) de usuarios internos, visible solo para `admin`; `new.tsx` mantiene el guard y compone de forma lazy `CreateUserScreen`, que posee formulario, confirmacion y mutacion. La activacion y desactivacion se confirman desde el listado y el cambio de rol se confirma desde la edicion.
- D11/RFG-144 prueba la matriz completa de Cuenta/Mas para los tres roles. Los deep links de listado, alta y edicion de usuarios deben conservar un guard local reactivo: al perder `canManageUsers`, desmontan el contenido protegido y muestran “Sin permiso”; ocultar el destino en Mas no sustituye este guard ni la autorizacion del backend.
- `(app)/veterinarians`: listado, alta, detalle y edición de veterinarios; lectura para los tres roles y escritura para `admin`/`shelter_manager` (`canManageVets`). La desactivación se confirma desde el detalle.
- `(app)/audit`: listado paginado y detalle de auditoría, visible solo para `admin` mediante `canReadAudit`.
- `design-system`: catálogo interno, no funcionalidad de producción. Incluye la sección "Validación de referencias (D06)" que monta `ReferenceValidationSection` de `src/design-system` (23 casos reproducibles, fixtures deterministas y checklist de viewports).
- El layout raíz protege `(auth)` y `(app)` con `Stack.Protected` según el Session Context.

## Seguridad

- Una redirección de UI no sustituye permisos del servidor.
- No pasar tokens ni datos sensibles como route params.
- No persistir estado sensible en URL o deep links.
- Validar parámetros antes de usarlos en una query.

## Accesibilidad

- Cada pantalla debe tener jerarquía de encabezados, foco inicial razonable y safe areas.
- La navegación debe exponer roles y estados accesibles.
- No asumir una altura fija de viewport.

## Documentación y pruebas

- Actualizar `architecture.md` si cambia la jerarquía de rutas, providers o estrategia de protección.
- Ejecutar un export o arranque de Expo cuando cambien layouts o configuración.
- Agregar tests de navegación para redirects y guards cuando se implementen.
