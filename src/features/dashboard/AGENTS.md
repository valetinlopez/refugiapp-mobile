# Reglas para `dashboard`

## Responsabilidad

- Muestra el panel de portada del refugio: saludo con la sesión, hero decorativo, resumen del día, accesos rápidos a los cuatro destinos reales y prioridades de cuidado best-effort.
- Filtra la autorización visual por capacidades y decide qué accesos se muestran por rol.
- No gestiona animales, tareas ni gastos; no implementa reglas de negocio ni llamadas HTTP de otros dominios.

## Contratos

- `GET /dashboard/overview`: lectura para los tres roles autenticados (JWT). Respuesta `{ totals: { animals, byStatus }, recentAnimals }` con `profilePhotoMediaId` nullable y límite de recientes 5.
- `GET /media/:id`: lectura de un asset para la foto de perfil de un animal reciente (solo si `profilePhotoMediaId` existe).
- El saludo usa `firstName` de la sesión y la fecha local `es-AR`; ambos son nativos, nunca texto incrustado en un bitmap.
- El resumen del día combina `GET /dashboard/overview` (animales y en tratamiento) con el conteo de cuidados pendientes de la frontera `src/application/home`.
- Los accesos rápidos navegan a Animales (`/explore`), Cuidados (`/care-tasks`), Historia clínica (`/medical-records`) y Gastos (`/expenses`).
- La sección "Prioridades de hoy" consume la frontera `src/application/home` (página best-effort de pendientes) y deriva `Vencida`/`Próxima`/`Pendiente`; nunca promete el próximo vencimiento global.
- Los tipos de red derivan de `openapi/mobile.openapi.json`. El modelo de vista `DashboardAnimal` normaliza nulos; `byStatus` se normaliza a `Record<DashboardAnimalStatus, number>`.

## Permisos

- Los tres roles consultan `GET /dashboard/overview` y ven Animales, Cuidados y Gastos.
- "Historia clínica" solo aparece con `canReadClinicalRecords` (`admin`, `veterinarian`); `shelter_manager` no ve el destino clínico.
- La matriz de capacidades espeja `ROLE_CAPABILITIES` del backend (`src/application/authorization`).
- La autorización visual no reemplaza al backend; un `403` se traduce a un mensaje seguro.

## Estructura

- `api/`: `GET /dashboard/overview` y lectura de `GET /media/:id` para fotos de recientes.
- `components/`:
  - `DashboardScreen` (orquestación, estados y pull-to-refresh).
  - `HomeGreeting` (saludo + fecha + atajo de cuenta), `HomeHero` (banner decorativo `heroHome`), `TodaySummaryCard` (tres indicadores), `HomeQuickAccess` (grilla 2×2 de accesos), `TodayPriorities` + `HomePriorityRow` (prioridades memoizadas).
  - `DashboardRecentAnimals` + `DashboardAnimalRow` (animales recientes, conservados).
  - `DashboardSkeleton` (placeholder estático de la nueva jerarquía).
- `hooks/`: `dashboardKeys`, `useDashboardOverview` y `useDashboardAnimalPhoto`.
- `utils/`: `greeting` (saludo/fecha puros), `homeAccess` (registro de accesos con `requiredCapability` y subtítulos por conteo), `presentation` (estados de animal y de prioridad), `dashboardErrorMessages` (errores seguros).
- `types.ts`: modelo de vista y mapper desde los DTO generados.
- El atajo de cuenta del encabezado usa `AccountMenuButton` de `src/features/auth/components` y el saludo lee `useSession`; son la superficie pública de auth consumida por dashboard (documentada en `src/features/auth/AGENTS.md`).

## Seguridad y privacidad

- No registrar URLs de media, IDs de assets ni datos del panel.
- La cache se limpia con el resto de TanStack Query al cerrar sesión.
- Nunca se muestran UUID crudos: los animales sin nombre resoluble caen a "Animal no disponible".

## Testing

- Unit tests de `greeting` (saludo determinista por hora y fecha local), `homeAccess` (`filterHomeAccesses` y `buildHomeAccessSubtitles`) y `presentation` (estados de prioridad).
- Component tests RNTL de `DashboardScreen`: skeleton, vacío, error con reintento, offline con reintento, saludo desde sesión, tres indicadores, accesos filtrados por rol (incluida la ausencia de Historia clínica para `shelter_manager`), navegación a prioridad/agenda/reciente y pull-to-refresh que refetchea overview + resumen.
- Component tests RNTL de `TodaySummaryCard` (indicador sin dato → `—` con label seguro) y `TodayPriorities` (loading, error con reintento, vacío, fallback de nombre y navegación).
- El pull-to-refresh se valida sobre el `RefreshControl` del `ScrollView`.

## Estado

### Implementado

- `GET /dashboard/overview` consumido en el tab "Inicio" para los tres roles.
- Rediseño D36 (RFG-169): saludo con `firstName` y fecha `es-AR`, hero decorativo de perro y gato (`heroHome`, oculto a AT), "Resumen de hoy" con animales/en tratamiento/cuidados pendientes, "Accesos rápidos" a los cuatro destinos filtrados por capacidades y "Prioridades de hoy" best-effort con estados derivados y acceso a la agenda completa.
- Frontera `src/application/home` para conteo exacto de pendientes (`GET /care-tasks?status=pending&page=1&limit=1`), página de prioridades y conteo de gastos, con invalidación por prefijo `['home']` desde `care-tasks` y `expenses` (por valor, sin imports cruzados).
- Estados de UI: skeleton estático de la nueva jerarquía, vacío, error con reintento, offline con reintento y pull-to-refresh que refetchea overview y resumen.
- Accesos ordenados en grilla responsive de dos columnas que colapsa a una con fuente ampliada o viewport angosto, con targets ≥ 44 × 44, icono + texto (nunca solo color) y chevron.
- `DashboardAnimalRow` conserva el layout responsive y el fallback a iniciales; las prioridades resuelven el nombre y la foto por la cache compartida de `animal-options` sin request por fila.
- `dashboardKeys.all = ['dashboard']` como key canónica del panel; `['home']` como prefijo del resumen.

### Pendiente o deuda conocida

- Las prioridades se limitan a la primera página de pendientes; un refugio con más volumen puede no ver su próxima tarea en Inicio (best-effort documentado en `src/application/home/AGENTS.md`).
- No se muestra unread count ni total mensual de gastos porque esos agregados no existen en el contrato.
- El esqueleto es local a la feature; si otro contexto lo reutiliza, promover a `src/components/feedback` con su token y documentar en `docs/design.md`.
