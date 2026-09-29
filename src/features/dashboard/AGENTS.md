# Reglas para `dashboard`

## Responsabilidad

- Muestra el panel de portada del refugio: totales por estado y animales recientes.
- Filtra la autorización visual por capacidades y decide qué acciones rápidas se muestran por rol.
- No gestiona animales, tareas ni gastos; solo los enlaza con sus rutas de alta.

## Contratos

- `GET /dashboard/overview`: lectura para los tres roles autenticados (JWT). Respuesta `{ totals: { animals, byStatus }, recentAnimals: DashboardAnimal[] }` con `profilePhotoMediaId` nullable y límite de recientes 5 (`DASHBOARD_RECENT_ANIMALS_LIMIT` en el backend).
- `GET /media/:id`: lectura de un asset para mostrar la foto de perfil de un animal reciente. Si `profilePhotoMediaId` es `null`, no se realiza la consulta.
- Los tipos de red derivan de `openapi/mobile.openapi.json` (`DashboardOverviewResponseDto`, `DashboardAnimalDto`, `DashboardTotalsDto`). El snapshot normaliza `profilePhotoMediaId` a `string | null` y `byStatus` a objeto con `additionalProperties` numéricos; el mapper de feature los convierte a `Record<DashboardAnimalStatus, number>`.
- `DashboardAnimalStatus` es la unión `admitted | under_treatment | available_for_adoption | adopted | deceased`.

## Permisos

- Los tres roles consultan `GET /dashboard/overview`.
- La matriz de capacidades espeja `ROLE_CAPABILITIES` del backend (`src/common/authorization/role-capabilities.ts` y `docs/role-capabilities.md`):
  - `canEditAnimal`: `admin`, `shelter_manager`. Habilita "Alta animal" y "Nueva tarea".
  - `canManageExpenses`: `admin`, `shelter_manager`. Habilita "Registrar gasto".
  - `canReadClinicalRecords`: `admin`, `veterinarian`.
  - `canManageUsers`: `admin`.
  - `canManageVets`: `admin`, `shelter_manager`.
  - `canReadAudit`: `admin` (único rol con auditoría).
- `capabilitiesForRoles` combina los roles del usuario con OR desde `src/application/authorization`. La UI nunca decide por rol directo: siempre pasa por el registro central de capacidades.
- La autorización visual no reemplaza al backend; un `403` se traduce a mensaje seguro.

## Estructura

- `api/`: `GET /dashboard/overview` y lectura de `GET /media/:id` para fotos de recientes.
- `components/`: `DashboardScreen` (orquestación y estados), `DashboardTotalsCard`, `DashboardRecentAnimals`, `DashboardAnimalRow`, `DashboardQuickActions` y `DashboardSkeleton`.
- `hooks/`: `dashboardKeys`, `useDashboardOverview` y `useDashboardAnimalPhoto`.
- `utils/`: `quickActions` (registro declarativo de acciones con `requiredCapability`), `dashboardErrorMessages` (errores seguros) y `presentation` (estados visuales).
- `types.ts`: modelo de vista y mapper desde los DTO generados.
- El atajo de cuenta del encabezado de Inicio usa `AccountMenuButton` de `src/features/auth/components` (superficie pública de la feature auth, mismo patrón que `useSession`); es el único import cruzado de dashboard y está documentado en `src/features/auth/AGENTS.md`.

## Seguridad y privacidad

- No registrar URLs de media, IDs de assets ni datos del panel.
- La cache se limpia con el resto de TanStack Query al cerrar sesión.

## Testing

- Unit tests de `filterQuickActions`; la matriz y el filtrado genérico se prueban en `src/application/authorization`.
- Component tests RNTL de `DashboardScreen`: skeleton, vacío, error con reintento, datos, navegación al detalle, consulta de foto por `profilePhotoMediaId` y filtrado de acciones por rol.
- Component tests RNTL del polish responsive: un badge por estado en `DashboardTotalsCard` (wrap con `rowGap`/`columnGap` y alineación por tokens) y truncado controlado en `DashboardAnimalRow` (`numberOfLines={1}` en nombre/especie) con label accesible completo y navegación al detalle intacta.
- El pull-to-refresh se valida sobre el `RefreshControl` del `ScrollView`.

## Estado

### Implementado

- `GET /dashboard/overview` consumido en el tab "Inicio" para los tres roles.
- Acciones rápidas filtradas mediante el registro central de capacidades de aplicación.
- Estados de UI: skeleton inicial (placeholder estático, respeta reduce motion), vacío, error con reintento y pull-to-refresh.
- Totales por estado y animales recientes con foto de perfil (`useDashboardAnimalPhoto` consulta solo cuando `profilePhotoMediaId` está presente; `AppAvatar` cae a iniciales ante fallo).
- Acciones rápidas: "Alta animal", "Nueva tarea" y "Registrar gasto" según `canEditAnimal`/`canManageExpenses`.
- Navegación de un animal reciente a `/animals/[id]`.
- `dashboardKeys.all = ['dashboard']` como key canónica del panel; las features de `expenses` y `care-tasks` conservan una constante local idéntica solo para invalidar tras sus mutaciones (prefijo compartido por valor, sin imports cruzados entre features).

### Pendiente o deuda conocida

- No existe aún una sección de auditoría navegable en la app; `canReadAudit` queda en el registro de capacidades y con tests, listo para el primer consumidor real.
- El esqueleto es local a la feature; si otro contexto lo reutiliza, promover a `src/components/feedback` con su token y documentar en `docs/design.md`.
