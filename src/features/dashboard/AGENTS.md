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
  - `DashboardScreen` (orquestación, estados y pull-to-refresh; compone cabecera, hero a-bleed y solape del resumen).
  - `HomeGreeting` (saludo + fecha + tagline `HOME_HERO_TAGLINE` + acciones de cabecera Perfil/Notificaciones, texto nativo sobre el fondo sólido), `HomeHero` (bloque de imagen decorativa `heroHome` a-bleed con `priority="high"` y fundido inferior al fondo), `TodaySummaryCard` (3-up simétrico con divisores e iconos circulares de color), `HomeQuickAccess` (grilla 2×2 simétrica de accesos), `TodayPriorities` + `HomePriorityRow` (prioridades memoizadas, dos líneas: animal + `hora · título`).
  - `DashboardRecentAnimals` + `DashboardAnimalRow` (animales recientes; nombre/specie a una línea, badge de estado acotado).
  - `DashboardSkeleton` (placeholder estático de la nueva jerarquía).
- `hooks/`: `dashboardKeys`, `useDashboardOverview` y `useDashboardAnimalPhoto`.
- `utils/`: `greeting` (saludo/fecha puros), `homeAccess` (registro de accesos con `requiredCapability`, `tone` semántico y subtítulos por conteo), `presentation` (estados de animal y de prioridad), `animalText` (`formatSpeciesLabel` capitaliza la especie y aplica fallback legible), `dashboardErrorMessages` (errores seguros).
- `types.ts`: modelo de vista y mapper desde los DTO generados.
- El encabezado lee `useSession` (superficie pública de auth) y navega con Expo Router a rutas reales (`/profile` para Perfil, `/more` para Notificaciones donde vive la sección de notificaciones); no importa internals de otras features ni inventa destinos.

## Seguridad y privacidad

- No registrar URLs de media, IDs de assets ni datos del panel.
- La cache se limpia con el resto de TanStack Query al cerrar sesión.
- Nunca se muestran UUID crudos: los animales sin nombre resoluble caen a "Animal no disponible".

## Testing

- Unit tests de `greeting` (saludo determinista por hora y fecha local), `homeAccess` (`filterHomeAccesses` y `buildHomeAccessSubtitles`), `presentation` (estados de prioridad) y `animalText` (`formatSpeciesLabel`: capitalización, idempotencia, acentos y fallback).
- Component tests RNTL de `DashboardScreen`: skeleton, vacío, error con reintento, offline con reintento, saludo desde sesión, tres indicadores, accesos filtrados por rol (incluida la ausencia de Historia clínica para `shelter_manager`), navegación a prioridad/agenda/reciente y pull-to-refresh que refetchea overview + resumen.
- Component tests RNTL de `TodaySummaryCard` (3-up con dos divisores, indicador sin dato → `—` con label seguro) y de `HomeQuickAccess` (subtítulos reales, ausencia sin accesos, label accesible completo y navegación al destino).
- Component tests RNTL de `TodayPriorities` (loading, error con reintento, vacío, fallback de nombre, navegación y separación en dos líneas: identidad del animal en su propia línea y `hora · título` debajo).
- Component tests RNTL de `DashboardAnimalRow` (nombre/specie truncados a una línea, badge acotado a dos líneas con `flexShrink: 0` y `maxWidth`, capitalización de especie, fallback de especie vacía, label accesible completo y navegación).
- El pull-to-refresh se valida sobre el `RefreshControl` del `ScrollView`.

## Estado

### Implementado

- `GET /dashboard/overview` consumido en el tab "Inicio" para los tres roles.
- Rediseño D36 (RFG-169): saludo con `firstName` y fecha `es-AR`, hero decorativo de perro y gato (`heroHome`, oculto a AT), "Resumen de hoy" con animales/en tratamiento/cuidados pendientes, "Accesos rápidos" a los cuatro destinos filtrados por capacidades y "Prioridades de hoy" best-effort con estados derivados y acceso a la agenda completa.
- Frontera `src/application/home` para conteo exacto de pendientes (`GET /care-tasks?status=pending&page=1&limit=1`), página de prioridades y conteo de gastos, con invalidación por prefijo `['home']` desde `care-tasks` y `expenses` (por valor, sin imports cruzados).
- Estados de UI: skeleton estático de la nueva jerarquía, vacío, error con reintento, offline con reintento y pull-to-refresh que refetchea overview y resumen.
- Accesos ordenados en grilla 2×2 simétrica de igual altura que no colapsa a una columna: celdas con base porcentual y `minWidth: 0` (dos columnas siempre a 320 × 568), targets ≥ 44 × 44, iconos circulares con acento semántico (`positive`/`warning`/`info`/`neutral`), título + subtítulo truncados internamente, texto (nunca solo color) y chevron.
- Polido D38.1 (RFG-172): "Resumen de hoy" como 3-up simétrico con divisores verticales e iconos circulares de color (animales `positive`, tratamiento `info`, pendientes `warning`); número en `heading2` y etiqueta a 2 líneas máximo, con degradación a `—` cuando un conteo falla. El color nunca es la única señal: cada métrica conserva icono + número + etiqueta accesible.
- Recomposición del hero D38.3 (RFG-174): `HomeHero` pasa de card contenida a **hero a-bleed estilo login** — el `hero-home.png` sangra de borde a borde con `priority="high"` y altura mínima proporcional al viewport; la foto permanece oculta a AT (`DecorativeImage`, WebP + fallback PNG), no incrusta texto y conserva el patrón del login (D04/RFG-137); sin endpoints, roles ni estados nuevos. El reorden header-first posterior mueve el copy fuera de la foto (fondo sólido, sin scrim) y agrega el fundido inferior al fondo con solape del resumen.
- Pulido D38.2 (RFG-173): legibilidad sin cortes en "Prioridades de hoy" y "Animales recientes". La fila de prioridad separa la identidad del animal (línea propia, `bodyStrong`, una línea con elipsis) de `hora · título` (caption); la hora lidera la segunda línea para no perderse. La fila de animal mantiene nombre y especie a una línea con elipsis y capitaliza la especie (`formatSpeciesLabel`, con fallback "Especie no registrada"). Ambas filas acotan la zona del estado (`flexShrink: 0` + `maxWidth` proporcional) y el `AppBadge` trunca su etiqueta internamente (`flexShrink: 1` + `maxWidth: '100%'`), por lo que ninguna pill empuja ni corta el texto a 320 × 568 o fuente 200 %. El estado conserva texto + icono (nunca solo color).
- Pulido D39.1 (RFG-175): cabecera según referencia 24 — saludo + fecha a la izquierda y acciones Perfil/Notificaciones ancladas al margen derecho. `HomeGreeting` deja el `flexWrap` que empujaba el atajo fuera del margen: la copia conserva `flex: 1` + `minWidth: 0` y las acciones quedan en fila `flexShrink: 0` con `gap` por tokens. Perfil es un avatar de iniciales (`AppAvatar sm`, sin foto ficticia) que navega a `/profile` y Notificaciones es un botón campana (`AppIcon notification`) que navega a `/more` donde vive la sección real; ambos de 44 × 44 con `hitSlop` de 8 y labels "Abrir perfil"/"Abrir notificaciones". Sin endpoints, roles ni agregados nuevos.
- Reorden header-first con degradado al fondo: `DashboardScreen` compone cabecera (`HomeGreeting` sobre el fondo sólido, `SafeAreaView` con `top`) → `HomeHero` (solo foto a-bleed + degradado `LinearGradient` de `transparent` a `colors.background`, sin banda plana oscura) → cuerpo con la card "Resumen de hoy" solapada (`marginTop` negativo por tokens). El degradado funde la foto con el fondo usando solo colores del tema, sin hexadecimales ni medidas arbitrarias.
- `DashboardAnimalRow` conserva el layout responsive y el fallback a iniciales; las prioridades resuelven el nombre y la foto por la cache compartida de `animal-options` sin request por fila.
- `dashboardKeys.all = ['dashboard']` como key canónica del panel; `['home']` como prefijo del resumen.

### Pendiente o deuda conocida

- Las prioridades se limitan a la primera página de pendientes; un refugio con más volumen puede no ver su próxima tarea en Inicio (best-effort documentado en `src/application/home/AGENTS.md`).
- No se muestra unread count ni total mensual de gastos porque esos agregados no existen en el contrato.
- El esqueleto es local a la feature; si otro contexto lo reutiliza, promover a `src/components/feedback` con su token y documentar en `docs/design.md`.
