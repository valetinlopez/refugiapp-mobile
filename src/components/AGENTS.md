# Reglas para `src/components`

## Responsabilidad

- Contiene UI reutilizable por varias features.
- Organiza primitivas, feedback, navegación y patrones compuestos.
- Implementa accesibilidad y consistencia visual sobre tokens compartidos.

## Límites

- No importar `src/features`, `src/core/api`, storage ni configuración de endpoints.
- No realizar llamadas HTTP ni conocer DTOs del backend.
- No codificar permisos de un rol específico; recibir capacidades o callbacks desde la feature.
- No agregar una abstracción compartida para un único uso salvo que represente una regla del sistema de diseño.

## Tokens

- Usar exclusivamente `src/theme` para color, tipografía, espaciado, radios, tamaños, opacidades y sombras.
- No introducir hexadecimales ni medidas arbitrarias en componentes.
- Los estados presionados usan `opacity.pressed`/`opacity.pressedSubtle` y los overlays decorativos `opacity.overlay`; `sizes.fab` y `sizes.dialogMaxWidth` cubren la acción flotante y el ancho máximo del diálogo.
- Si falta un token generalizable, agregarlo en `src/theme` y actualizar `docs/design.md`.

## Accesibilidad

- Área táctil mínima de 44 × 44 (`sizes.touchTarget`) con `hitSlop` estándar de 8 (`sizes.hitSlop`) en icon-only y opciones `radio`.
- `accessibilityLabel`, role y state en controles.
- `AppBadge` usa `role="text"`; filas informativas usan `role="summary"`.
- `DateTimeField` expone `accessibilityHint` con formato y apertura del picker.
- Formularios con `returnKeyType next/done` y `onSubmitEditing` para orden de foco.
- Texto escalable y contenedores sin alturas rígidas cuando contienen información.
- Estado comunicado con texto/icono además de color.
- Animación futura compatible con reduce motion.

## Composición

- `primitives`: una responsabilidad visual pequeña.
- `feedback`: estados transversales de carga, vacío, error, offline y confirmaciones destructivas (`ConfirmDialog`). El diálogo compartido exige confirmación explícita para acciones con consecuencia; ninguna acción destructiva se ejecuta de forma inmediata. `ConfirmDialog` no conoce endpoints ni permisos; recibe `title`, `consequence`, labels y callbacks de la feature.
- `navigation`: piezas de navegación, sin conocer rutas concretas. Incluye `AppHeaderBack` y `navigateBack` (retorno persistente con fallback contextual `canGoBack ? back : replace`), `BottomNavigation` (estado activo no-cromático: pastilla `surfaceElevated` sobre el icono + etiqueta `bodyStrong`, `tablist`/`tab` y `accessibilityState.selected`), `CurvedTabBar` (barra de producción absoluta sobre el borde inferior que compone `BottomNavigation` sobre un arco SVG decorativo transparente por fuera; recibe la presentación por prop y nunca codifica rutas) y la geometría pura `tabBarCurvePath`/`tabBarCurveArchPath` (ver ADR-0017). Las pantallas deciden el `fallbackHref`; los componentes nunca codifican rutas. El `tabBar` de producción consume `BottomNavigation` con superficie transparente porque el arco SVG provee el fondo.
- `patterns`: composición reutilizable sin acceso a datos remotos.
- `ActorRow` (patterns): fila de identidad con `AppAvatar` (iniciales) + nombre + línea opcional de detalle (caption) + fecha relativa · absoluta. No conoce DTOs ni dominios: recibe `name`, `initials`, `caption` y `occurredAt`. Las features resuelven el label (nombre / fallback / sistema) con `resolveActorLabel` de `actorPresentation`.
- `DecorativeBackground` (patterns, D03): capa absoluta de fondo editorial que compone los assets de D02 vía `DecorativeImage`. Oculta a AT, sin texto ni controles; overlay opcional para contraste. Variantes `hero`/`texture`/`none`.
- `ScreenHeader` / `SectionHeader` (patterns, D03): encabezados de pantalla y de sección con `accessibilityRole="header"`, subtítulo y acción opcionales; la fila envuelve para no recortar acciones con fuente ampliada.
- `PasswordField` (patterns): campo compartido para passwords con toggle accesible mostrar/ocultar de 44 × 44; auth conserva un re-export de compatibilidad y las features deciden autofill, ayuda y validación.
- `SegmentedControl` (patterns, D03): grupo de selección única (`radiogroup`) sobre `FilterChip` con semántica `radio`/`checked`, scroll horizontal, `disabled`/`icon` por opción y target de 44 pt.
- `EntityCard` (patterns, D03): fila canónica de entidades (avatar opcional + texto `flex: 1`/`minWidth: 0` + badge `flexShrink: 0` + chevron). Título a 2 líneas con `accessibilityLabel` completo; con `onPress` es un único botón accesible.
- `MetadataRow` (patterns, D03): fila etiqueta-valor con etiqueta no encogible y valor que envuelve alineado al final. Las fechas llegan formateadas (`dateFormat`); nunca se inyecta ISO crudo.
- `ManagementSection` (patterns, D07): sección data-driven de destinos de Gestión con cards accesibles. Recibe `items` ya autorizados y un dispatcher `onSelect`; no conoce roles, capacidades, rutas concretas ni features. Usa `SectionHeader`, targets mínimos y feedback de presión mediante tokens.
- `AttachmentList` / `AttachmentRow` (patterns, D03): lista de adjuntos con estados `ready`/`uploading`/`error`, progreso accesible, reintento y borrado; el borrado exige `ConfirmDialog` (lo posee la lista) y la lista vacía usa `EmptyState`.
- `FAB` (primitives, D03): acción flotante de 56 pt (`sizes.fab`) con label accesible obligatorio, `hitSlop` estándar y respeto del inset inferior; `loading`/`disabled` bloquean la interacción.
- `DecorativeImage` (patterns): wrapper de `expo-image` para media decorativa. Oculta a AT por defecto (`accessible={false}` + `accessibilityElementsHidden` + `importantForAccessibility="no-hide-descendants"` + `alt=""`); un `accessibilityLabel` lo vuelve informativo. Fija `allowDownscaling`, `cachePolicy="memory-disk"` y prioridad baja, reserva `aspectRatio` para evitar layout shift y cae al `fallbackSource` (PNG) ante error de decodificación, resetando el estado al cambiar la fuente. No comunica estado.
- `brandAssets` (patterns): registro de los assets de marca (D02/RFG-135) con `resolveBrandSource(name)` — la UI no conoce nombres de archivo. Hojas vectoriales originales; hero fotográfico de stock licenciado (Pngtree) con atribución. Fuentes y procedencia en `docs/brand-assets.md`; regenerar con `npm run assets:brand`.
- `performance`: configuración transversal de render por lotes y ventana para `FlatList`; cada listado conserva keys de dominio estables y un `renderItem` memoizado.
- `dateFormat` (patterns): formateadores `es-AR` hoisteados para fechas (`formatDateShort`, `formatDateMedium`, `formatDateTime` y `formatRelativeDateTime`); `formatDateMedium` acepta fecha de calendario o ISO `date-time`, y las features y `DateTimeField` delegan en ellos en lugar de crear `Intl.DateTimeFormat` por render.
- `AppAvatar` usa `expo-image` con caché memoria/disco, carga lazy en web, downscaling y `recyclingKey`; dimensiona las URLs Cloudinary al tamaño físico del avatar. Admite tamaños `sm`/`md`/`lg`/`xl` y forma circular (default) o `rounded` para cabeceras protagonistas. Cae a iniciales de forma silenciosa si la imagen no carga (`onError`) y nunca muestra un avatar roto. El estado de fallo se resetea automáticamente al cambiar la URI.

## Testing

- Probar comportamiento, accesibilidad y estados; evitar snapshots como única verificación.
- `DateTimeField` centraliza selección, serialización ISO local y fallback web. Usa los listeners no deprecados del picker (`onValueChange` para confirmar y `onDismiss` para cerrar sin valor); `mode` admite `date`, `datetime` y `time`.
- Cubrir callbacks, disabled/loading, selección y precedencia semántica cuando aplique.

## Documentación

- Actualizar `docs/design.md` al modificar API pública, variantes o reglas visuales.
- Mantener exports públicos en archivos `index.ts` del submódulo.
