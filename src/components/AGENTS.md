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

- Usar exclusivamente `src/theme` para color, tipografía, espaciado, radios, tamaños y sombras.
- No introducir hexadecimales ni medidas arbitrarias en componentes.
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
- `navigation`: piezas de navegación, sin conocer rutas concretas. Incluye `AppHeaderBack` y `navigateBack` (retorno persistente con fallback contextual `canGoBack ? back : replace`) y `BottomNavigation`. Las pantallas deciden el `fallbackHref`; el componente nunca codifica rutas.
- `patterns`: composición reutilizable sin acceso a datos remotos.
- `ActorRow` (patterns): fila de identidad con `AppAvatar` (iniciales) + nombre + línea opcional de detalle (caption) + fecha relativa · absoluta. No conoce DTOs ni dominios: recibe `name`, `initials`, `caption` y `occurredAt`. Las features resuelven el label (nombre / fallback / sistema) con `resolveActorLabel` de `actorPresentation`.
- `performance`: configuración transversal de render por lotes y ventana para `FlatList`; cada listado conserva keys de dominio estables y un `renderItem` memoizado.
- `dateFormat` (patterns): formateadores `es-AR` hoisteados para fechas (`formatDateShort`, `formatDateMedium`, `formatDateTime` y `formatRelativeDateTime`); `formatDateMedium` acepta fecha de calendario o ISO `date-time`, y las features y `DateTimeField` delegan en ellos en lugar de crear `Intl.DateTimeFormat` por render.
- `AppAvatar` usa `expo-image` con caché memoria/disco, carga lazy en web, downscaling y `recyclingKey`; dimensiona las URLs Cloudinary al tamaño físico del avatar. Cae a iniciales de forma silenciosa si la imagen no carga (`onError`) y nunca muestra un avatar roto. El estado de fallo se resetea automáticamente al cambiar la URI.

## Testing

- Probar comportamiento, accesibilidad y estados; evitar snapshots como única verificación.
- `DateTimeField` centraliza selección, serialización ISO local y fallback web. Usa los listeners no deprecados del picker (`onValueChange` para confirmar y `onDismiss` para cerrar sin valor); `mode` admite `date`, `datetime` y `time`.
- Cubrir callbacks, disabled/loading, selección y precedencia semántica cuando aplique.

## Documentación

- Actualizar `docs/design.md` al modificar API pública, variantes o reglas visuales.
- Mantener exports públicos en archivos `index.ts` del submódulo.
