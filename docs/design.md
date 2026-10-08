# Sistema de diseño de Refugiapp

> Versión inicial — 20 de septiembre de 2026. La aplicación móvil ya vive en la raíz de este repositorio; por eso `docs/`, `app/`, `src/` y `assets/` equivalen a las rutas propuestas bajo `mobile/` en el brief.

## 1. Propósito

Este sistema convierte la identidad visual de Refugiapp en reglas y componentes reutilizables para una aplicación interna de gestión de refugio. Debe permitir construir pantallas coherentes sin volver a interpretar la referencia visual. La fuente de verdad ejecutable está en `src/theme`; este documento explica intención, composición y límites.

## 2. Personalidad de marca

Refugiapp es orgánica, protectora, cálida, tranquila, contemporánea y profesional. La cercanía nace del color tierra, la fotografía honesta y la tipografía editorial. La precisión operativa nace de la jerarquía, las etiquetas explícitas y el uso moderado de color semántico. La interfaz no debe parecer infantil, lúdica ni ornamental en exceso.

## 3. Principios visuales

1. **Cuidar con claridad:** cada acción y estado debe entenderse sin inferencias.
2. **Calidez contenida:** fondos tierra y formas suaves; el color intenso se reserva para señales.
3. **Jerarquía antes que decoración:** títulos, agrupación, ritmo y contraste organizan la pantalla.
4. **Información respirable:** una pantalla móvil puede desplazarse; no se comprime todo en el primer viewport.
5. **Accesible por defecto:** texto, icono y forma acompañan al color; controles de al menos 44 × 44 pt.

## 4. Análisis de la referencia

El mockup original que dio origen a este sistema (no versionado) usa una base marrón oscura, superficies un poco más claras, tipografía serif de alto contraste para títulos y sans serif para información operativa. La jerarquía alterna un encabezado emocional, una tarjeta de resumen, tarjetas de animales, una agenda tabular y navegación inferior. Las esquinas son generosas; una tarjeta protagonista emplea una silueta más orgánica. Los acentos lima, naranja, coral, azul y gris separan estados.

Se conserva la combinación editorial/operativa, el ritmo vertical, la navegación de cuatro destinos, los badges con icono y texto y la fotografía animal. No se copia la composición como una imagen, las leyendas manuscritas, el recorte rígido del viewport ni la idea de mostrar todos los módulos a la vez.

## 5. Paleta y tokens

| Token             | Valor     | Uso principal                             |
| ----------------- | --------- | ----------------------------------------- |
| `background`      | `#35231D` | Fondo de pantalla                         |
| `surface`         | `#50382E` | Tarjetas y bloques estándar               |
| `surfaceElevated` | `#63483B` | Superficie elevada o protagonista         |
| `surfaceSubtle`   | `#432E27` | Navegación y contenedores discretos       |
| `textPrimary`     | `#FAF4E9` | Texto prioritario sobre fondos oscuros    |
| `textSecondary`   | `#CCBEB1` | Texto de apoyo                            |
| `textInverse`     | `#261914` | Texto sobre acentos claros                |
| `positive`        | `#B9DB62` | Confirmación, selección, acción principal |
| `warning`         | `#E5A14B` | Próximo vencimiento                       |
| `danger`          | `#D96C5F` | Error, urgencia, vencimiento              |
| `info`            | `#75A7B8` | Información o contexto clínico            |
| `neutral`         | `#AAA29D` | Cancelado, inactivo, secundario           |

`surfaceElevated` se deriva de la base aumentando luminosidad sin abandonar la familia tierra. Los tokens complementarios de borde, divisor, foco, estados deshabilitados y scrim viven en `src/theme/colors.ts`. No se deben introducir hexadecimales en componentes.

## 6. Reglas semánticas de color

- Lima oliva: acción principal, destino activo, tarea completada y estado positivo.
- Naranja tierra: tarea pendiente que vence dentro de la ventana próxima.
- Coral terracota: error, urgencia o tarea vencida.
- Azul mineral: información y naturaleza clínica cuando no hay una urgencia superior.
- Gris piedra: cancelado, inactivo o secundario.
- Marrón: estructura y superficie, nunca un estado de negocio.

El color se combina siempre con texto e icono. Los acentos no ocupan fondos completos de pantalla. Sobre los acentos se usa `textInverse`, no blanco, para sostener contraste. La comprobación final debe realizarse con el contenido y tamaño reales de cada pantalla.

## 7. Tipografía y escala

Newsreader Semibold aporta el tono editorial a títulos y métricas. DM Sans cubre cuerpo, datos, formularios y controles. Las fuentes se cargan con `expo-font`; si fallan, la app continúa con la fuente del sistema en vez de quedar bloqueada.

| Estilo       | Tamaño / línea | Fuente         | Uso                              |
| ------------ | -------------- | -------------- | -------------------------------- |
| `display`    | 42 / 46        | Newsreader 600 | Encabezado emocional excepcional |
| `heading1`   | 34 / 40        | Newsreader 600 | Título principal de pantalla     |
| `heading2`   | 28 / 34        | Newsreader 600 | Título de sección                |
| `heading3`   | 22 / 28        | Newsreader 600 | Título de tarjeta o subsección   |
| `body`       | 16 / 24        | DM Sans 400    | Texto y datos generales          |
| `bodyStrong` | 16 / 24        | DM Sans 600    | Datos prioritarios               |
| `label`      | 14 / 20        | DM Sans 600    | Etiquetas y metadatos            |
| `caption`    | 12 / 17        | DM Sans 400    | Ayuda no crítica                 |
| `button`     | 15 / 20        | DM Sans 700    | Acciones                         |

No se desactiva el escalado del sistema. `AppText` permite escalado y fija por defecto un multiplicador máximo de 1,8 para evitar roturas extremas; una pantalla con información crítica puede elevarlo. Los contenedores deben crecer verticalmente y evitar alturas fijas alrededor de texto.

## 8. Espaciado y cuadrícula

La unidad base es 4 pt. Escala: `xxs=4`, `xs=8`, `sm=12`, `md=16`, `lg=24`, `xl=32`, `2xl=48`, `3xl=64`. La separación interna habitual de tarjeta es 16; entre secciones, 48. El margen lateral móvil es 16. En tablet o web, el contenido se centra y se limita a 760 pt.

La cuadrícula es fluida. Una fila puede envolver tarjetas si cada una conserva un ancho legible. No se calculan columnas partiendo de un único dispositivo de 390 × 844.

## 9. Radios, bordes, divisores y sombras

Los radios disponibles son 6, 10, 16, 24, 32, 36 y píldora. `lg` (24) es el estándar de tarjeta. `organic` se reserva para un bloque protagonista y combina esquinas de 36 con otras de 24; no se aplica a toda la interfaz. Los bordes son de 1 pt y las sombras son cálidas, de baja opacidad. Un divisor de 1 pt separa filas sin crear cajas adicionales.

## 10. Iconografía

`AppIcon` centraliza símbolos de `expo-symbols`, con SF Symbols en iOS y Material Symbols en Android/web. Se usan iconos simples, sólidos o de trazo consistente. Un icono decorativo se oculta a tecnologías de asistencia; uno interactivo requiere `accessibilityLabel` en el control que lo contiene. No se mezclan emojis con iconos de producto. El set incluye `account` (identidad/cuenta), `logout` (salida), `eye`/`eyeOff` (toggle mostrar/ocultar contraseña) y `refresh`, mapeados a SF Symbols y Material Symbols.

## 11. Fotografía animal

Priorizar retratos naturales, con ojos visibles, luz suave y fondo poco distractor. La fotografía debe informar identidad del animal, no decorar una operación. Usar relación 1:1 para avatar y entre 4:3 y 3:2 para tarjeta. Mantener el punto focal y ofrecer texto alternativo con el nombre del animal.

## 12. Imágenes transparentes y recortes

Un recorte transparente puede usarse una vez en una cabecera editorial. Debe conservar pelo, orejas y contorno, disponer de una imagen alternativa y no tapar texto al aumentar fuente. Si el recorte no es robusto en pantallas pequeñas, se sustituye por una fotografía rectangular con `cover`. Nunca incrustar texto, badges ni botones dentro del bitmap. El hero de marca (D02, `brandAssets.heroRescuedDog`: fotografía de stock licenciada con atribución, ver `docs/brand-assets.md` y ADR-0016) cumple estas reglas y se consume con `DecorativeImage` (§34), oculto a tecnologías asistivas; debe probarse en 320×568 y con fuente ampliada, reemplazándose por una fotografía `cover` si no es robusto.

## 13. Botones y acciones

`primary` usa lima y se limita a una acción principal por contexto. `secondary` usa superficie elevada; `danger` confirma una consecuencia destructiva; `ghost` reduce peso visual. Todos tienen altura mínima de 48 pt, etiqueta visible, estado presionado, deshabilitado y ocupado. Un spinner sustituye temporalmente el contenido pero conserva la etiqueta accesible. Los botones solo de icono deben medir al menos 44 × 44 y tener nombre accesible.

Las acciones rápidas de una pantalla (botonera de acceso, por ejemplo en Inicio) se agrupan como una columna full-width con `gap` por tokens: ancho y alineación uniformes, una acción por fila y targets táctiles consistentes, sin depender de la longitud de cada etiqueta.

### Contraseñas: visibilidad y fortaleza

`PasswordField` (auth) combina el input de contraseña con un toggle de visibilidad: botón solo-icono de 44 × 44 (`sizes.touchTarget`) con `hitSlop` de 8, icono `eye`/`eyeOff`, label accesible dinámico ("Mostrar contraseña"/"Ocultar contraseña") y padding derecho en el input para no solapar el texto. El `secureTextEntry` se alterna con el estado local; el estado nunca comunica solo por color.

`PasswordStrengthMeter` (auth) guía la fortaleza de la contraseña nueva en reset y change: tres segmentos en píldora (rellenos según longitud) más una etiqueta de texto (Débil/Media/Fuerte). El nivel se deriva solo de la longitud (Débil < 12, Media 12–15, Fuerte ≥ 16), el color acompaña pero nunca es la única señal, y el contenedor expone `accessibilityLabel` ("Fortaleza de la contraseña: …") con `accessibilityLiveRegion="polite"`. La coincidencia de la confirmación sigue siendo validación de formulario, no parte del medidor.

### Notificaciones push

Los ajustes de notificaciones viven en la sección "Notificaciones" del tab "Más", debajo de "Gestión" y antes de "Cuenta". La sección tiene un único encabezado "Notificaciones" (lo aporta `NotificationsSection`); la tarjeta de permiso y el bloque de preferencias no repiten el título. La tarjeta de permiso comunica el estado con texto y acción: `denied` ofrece activar, `blocked` ofrece abrir los ajustes del sistema (`Linking.openSettings`), `granted` confirma y `unavailable` explica que el dispositivo no admite push. El estado nunca depende solo del color.

Las preferencias usan filas con `Switch` de React Native (`trackColor` con tokens: `border` apagado, `positive` encendido; `thumbColor` `textPrimary`) y una etiqueta accesible por fila. La antelación se ajusta con botones `-`/`+` de 44 × 44 dentro de los límites 5–1440, y las horas silenciosas reutilizan `DateTimeField` en `mode="time"`. Los errores de validación y de guardado se muestran en texto debajo del bloque, nunca solo con color. La carga distingue tres estados excluyentes: `LoadingState` solo mientras no hay datos; `ErrorState` (con "Reintentar") ante una respuesta del servidor; y `OfflineState` ante un fallo de transporte (`isNetworkError`). Un fallo nunca deja el spinner indefinido y una recarga en segundo plano que falla no reemplaza el formulario ya cargado.

## 14. Tarjetas y superficies

`default` agrupa contenido, `elevated` señala jerarquía, `outlined` sirve a bloques secundarios y `organic` identifica un único punto focal. No anidar más de dos niveles de superficie. Una tarjeta clicable debe usar un control accesible y no depender de que el usuario adivine la interacción.

### Layout interno de tarjetas de contenido (tareas, gastos, historial)

Patrón responsive compartido por `CareTaskCard`, las tarjetas de gastos y el historial general, sin variantes nuevas:

- El contenido se ordena en un contenedor vertical con `gap` por tokens; nunca alturas fijas alrededor de texto.
- En el encabezado de fila (título + badge o texto + miniatura), la columna de texto usa `flex: 1` y `minWidth: 0`; el badge, el comprobante o el avatar usa `flexShrink: 0` para no encogerse. Así el texto cede y envuelve antes que la señal de estado o la media.
- Las filas etiqueta-valor y de metadatos pueden envolver (`flexWrap: 'wrap'`) en pantallas estrechas y con fuente ampliada; la fecha/envío se trunca a una línea y queda alineada sin colisionar.
- El texto de metadatos (título largo, nombre, fecha, descripción) se trunca con `numberOfLines` (título hasta 2 líneas, nombre/fecha 1, descripción hasta 3), pero el `accessibilityLabel` de la tarjeta conserva siempre el texto completo para tecnologías de asistencia.
- Las acciones de una tarjeta se agrupan en una fila con `flexWrap` y `gap` por tokens, manteniendo áreas táctiles de 44 × 44 y labels accesibles.
- Cuando una tarjeta de listado (p. ej. cuentas de usuario) expone una acción de estado, se usa una variante contenida (`secondary` para desactivar, `primary` para activar) alineada al inicio o fin de la fila de acciones; nunca una acción destructiva `danger` a lo ancho como CTA dominante. La consecuencia destructiva se explica en el diálogo de confirmación (`ConfirmDialog`), no en el botón de la fila.
- En tarjetas de cuentas (usuario interno), el nombre y el email se truncan a una línea con elipsis (`numberOfLines={1}` + `ellipsizeMode="tail"`) y la columna de texto usa `flex: 1` + `minWidth: 0`; el `accessibilityLabel` de la tarjeta y de cada texto conserva siempre el valor completo (nombre, email, roles y estado). El badge de estado incluye icono + texto (`check`/`close`) y no se encoge.

## 15. Badges y estados

Los badges tienen texto, icono, tono y forma píldora. No se usa un punto de color aislado. Las etiquetas visibles se redactan en español; los valores de dominio permanecen en inglés. Para listas densas puede omitirse el icono solo si existe otra señal explícita y la etiqueta es inequívoca.

Cuando un grupo de badges envuelve (por ejemplo en la tarjeta de métricas del panel), el contenedor usa `rowGap` y `columnGap` por tokens, alinea las filas al inicio y permite hasta dos líneas por etiqueta. Así se evitan líneas huérfanas, desalineaciones y colisiones en pantallas estrechas y con fuente ampliada.

### Chips de filtro (`FilterChip`)

Patrón compartido para filtrar listados (animales por estado, tareas por estado). Píldora con label, área táctil mínima de 44 pt, borde en `border`; estado seleccionado con fondo `positive` y texto inverso. Cada chip expone `accessibilityState.selected` para que el estado no dependa solo del color. Los chips se agrupan en un `ScrollView` horizontal para evitar desbordes.

`FilterChip` admite `accessibilityRole="radio"` (expone `checked` en lugar de `selected`) y `accessibilityRole="tab"` (expone `selected` dentro de un `tablist`), además de `disabled` (fondo `disabledSurface` y texto `disabledText`) y un `icon` opcional. Su apariencia `plain` elimina el borde en reposo para barras de pestañas contenidas, manteniendo la pastilla lima seleccionada; `outlined` permanece como default. `SegmentedControl` (§35) lo consume con semántica de grupo de opciones.

### Controles segmentados (`SegmentedControl`)

Grupo de selección única formado por chips (§15) que cambia de vista o filtra listados densos. El contenedor es un `radiogroup` y cada opción un `radio` con `checked`, por lo que la selección nunca depende solo del color. Las opciones se desplazan en horizontal (`ScrollView`) para no recortarse en pantallas estrechas ni con fuente ampliada; cada opción conserva área táctil mínima de 44 pt y admite `disabled` e `icon`. La feature provee las opciones y el valor; el componente no conoce el dominio.

## 16. Avatares

Tamaños: 36, 48, 72 y 128 pt (`avatarSm` a `avatarXl`). Los retratos usan recorte circular por defecto; la variante `rounded` se reserva para fotos protagonistas de cabeceras de entidad. Si falta la foto, mostrar hasta dos iniciales; nunca un espacio vacío ni una imagen genérica que pueda confundirse con el animal real. Si la imagen falla al cargar, el avatar vuelve a las iniciales de forma silenciosa (sin botón de reintento) y el fallo se resetea cuando cambia la URL.

Las fotos remotas se sirven con `expo-image`, caché combinada de memoria/disco y carga diferida. Cuando la fuente es Cloudinary, se pide una variante cuadrada según los píxeles físicos del avatar con formato y calidad automáticos; no se descarga el original para una miniatura. Las vistas recicladas cambian `recyclingKey` junto con la URI para no mostrar brevemente la foto de otra fila.

### Filas de actor (`ActorRow`)

Patrón de identidad reutilizable por Auditoría e Historial clínico: `AppAvatar` con iniciales (hasta dos), nombre de la persona, línea opcional de detalle (`caption`, p. ej. email) y fecha relativa + absoluta (`hace 2 h · 04/10/2026 14:30`). La fecha relativa se usa en la ventana de los últimos 7 días; fuera de ella se muestra solo la absoluta.

- La fila no conoce DTOs ni dominios: recibe `name`, `initials`, `caption` y `occurredAt`. La feature resuelve el label con `resolveActorLabel` (nombre → UUID durante rollout → "Sistema" / "Usuario del sistema").
- El avatar usa `flexShrink: 0`; la columna de texto `flex: 1` + `minWidth: 0` para que nombre y fecha envuelvan antes de colisionar en pantallas estrechas y con fuente ampliada.
- El estado de identidad nunca depende solo del color: el nombre se muestra siempre como texto y el contenedor expone `accessibilityRole="summary"` con `accessibilityLabel` que incluye nombre y fecha.
- El email del actor (solo auditoría, admin) se muestra únicamente en el detalle, como `caption`; nunca en listas ni en el historial clínico.

## 17. Filas de tareas

Orden recomendado: avatar, hora y animal, tarea, responsable opcional y badge. La fila crece cuando el texto aumenta y puede reorganizar metadatos en pantallas estrechas. La etiqueta accesible concatena hora, animal, tarea, estado y responsable. Los divisores pertenecen al listado, no a la fila.

Prioridad visual: `completed` o `cancelled` son estados finales; para `pending`, primero se evalúa `overdue`, después `upcoming`, después `clinical`, y finalmente `pending`. Una tarea clínica vencida es **Vencida** en coral; el contexto clínico permanece en el título, iconografía secundaria o detalle.

### Filas de animales (recientes)

Mismo patrón de fila operativa para animales: avatar, nombre, especie, badge de estado y chevron. La columna de texto usa `flex: 1` y `minWidth: 0`; el nombre y la especie se truncan a una línea con elipsis (`numberOfLines={1}` + `ellipsizeMode="tail"`) y el `accessibilityLabel` del control conserva el texto completo (nombre, especie y estado). El avatar y el chevron no se encogen (`flexShrink: 0`).

El badge de estado es estable: no se encoge (`flexShrink: 0`) y se limita a un tope proporcional de ancho (`maxWidth` ≈ 45 % de la fila, medida relativa de layout, no un token de medida) con una sola línea y elipsis. Así un estado largo (p. ej. `Disponible para adopción`) no empuja ni corta el nombre, no colisiona con el chevron y conserva altura de fila estable en pantallas estrechas y con fuente ampliada. El `labelNumberOfLines` de `AppBadge` permite forzar una línea en filas densas sin cambiar el default de dos líneas del componente. Los divisores pertenecen al listado, no a la fila, y llevan margen vertical por tokens.

## 18. Tarjetas de animales

Contienen fotografía, nombre como encabezado y estado explícito. La foto ocupa la zona superior; la información nunca se superpone a un área visual compleja. En móvil se muestran en carrusel accesible o cuadrícula adaptable; en listas operativas se prefiere una fila. No inventar estados como “en observación” si el backend no los expone.

## 19. Tarjetas de métricas

Muestran icono semántico, valor con Newsreader y etiqueta DM Sans. El número no comunica por sí solo: siempre necesita una etiqueta. Una métrica puede ser enlace si ofrece pista de navegación y área táctil completa. Limitar la cantidad visible y permitir desplazamiento o envoltura. El contenido interno mantiene un ritmo vertical por tokens (etiqueta, métrica, divisor y bloque de badges); el divisor separa la métrica del bloque de badges con respiro vertical por tokens.

## 20. Navegación inferior

Máximo cuatro o cinco destinos estables. Cada elemento combina icono y texto; el activo usa lima, peso visual e `accessibilityState.selected`. Altura base de 72 pt más el inset inferior del dispositivo. La barra queda fija mientras el contenido principal desplaza.

La navegación inferior de producción (D05/RFG-138) usa `Tabs` de Expo Router con cuatro destinos —Inicio, Animales, Cuidados (ruta `care-tasks`, renombrada solo en su etiqueta visible) y Más— para los tres roles, preservando `Stack.Protected` y la ruta legacy `inbox` oculta. El `tabBar` nativo se reemplaza por `CurvedTabBar` (`src/components/navigation/CurvedTabBar.tsx`), que dibuja un arco decorativo estático en el borde superior con `react-native-svg` (ver ADR-0017) y monta el patrón compartido `BottomNavigation` sobre esa superficie. El arco es ornamental: no comunica estado, no contiene texto, está oculto a tecnologías asistivas (`accessible={false}`) y no captura toques (`pointerEvents="none"`); su altura es `sizes.bottomNavigationCurve` y la geometría vive en la función pura `tabBarCurvePath`/`tabBarCurveArchPath` de `src/components/navigation/tabBarCurve.ts`. Detrás del arco se dibuja un rectángulo `background` que funde las esquinas transparentes con el fondo de las pantallas, de modo que solo se percibe el relieve del arco y no una franja de otro marrón.

El estado activo no depende solo del color: el icono activo se apoya en una pastilla `surfaceElevated` y la etiqueta cambia a `bodyStrong` (`BottomNavigation`), además de `accessibilityState.selected` y el label accesible en español del destino. La barra reserva `sizes.bottomNavigationHeight + inset.bottom` más el arco, con `paddingBottom` igual al inset, para no solaparse con la gesture bar ni el home indicator; las etiquetas se truncan a una línea y escalan con la fuente. Las pantallas del tab y la sección Cuenta usan `SafeAreaView edges={['top','left','right']}`: la barra es la única dueña del inset inferior, evitando el doble margen. `BottomNavigation` (catálogo) muestra el mismo tratamiento activo en su variante independiente.

## 21. Encabezado de retorno (`AppHeaderBack`)

Patrón persistente de retorno para pantallas stack sin header nativo (`headerShown: false`). Se renderiza fijo en la parte superior, dentro del safe area y antes del contenido desplazable, y acompaña estados de carga, error, vacío y sin permisos.

- Fila con icono `chevronLeft` y etiqueta visible ("Volver" por defecto), ambos en `textPrimary`.
- Área táctil mínima de 44 × 44 y `hitSlop` de 4 pt; sin altura rígida alrededor del texto.
- Comportamiento: si `router.canGoBack()` devuelve verdadero, retrocede; si no (deep link sin historial), reemplaza con un `fallbackHref` contextual decidido por la ruta (lista de origen o detalle del animal).
- Texto escalable con el multiplicador máximo estándar (`maxFontSizeMultiplier: 1.8`).
- El estado presionado usa `opacity`; no es una animación, por lo que es compatible con reduce motion por construcción. Si en el futuro se anima la transición, debe consultar `useReducedMotion`.
- La lógica de retorno vive en `navigateBack(fallbackHref)` en `src/components/navigation` y es la única fuente de verdad, compartida con las acciones "Volver" de `EmptyState`.

## 22. Formularios

Etiqueta visible sobre el campo, ayuda y error debajo. No usar placeholder como única etiqueta. Altura mínima 48 pt, borde de foco claro, teclado y `autoComplete` apropiados, y agrupación semántica. Los errores explican qué corregir y se anuncian; no se indican solo en coral. Los datos monetarios se transforman a `amountCents` fuera del componente visual. Los selectores de estado muestran valores permitidos por el backend y respetan permisos del rol. Las fechas usan `DateTimeField`: picker del sistema en iOS/Android y entrada textual con formato explícito en web. Acepta `mode` `date`, `datetime` y `time`; el modo `time` (formato `HH:mm`, icono de reloj, fallback textual web) se usa en las horas silenciosas de notificaciones. Esto incluye fechas de animales, eventos generales, vencimientos, gastos, filtros y registros médicos; no se duplican inputs ISO dentro de una feature. Las fechas guardadas se presentan siempre formateadas en `es-AR` mediante `dateFormat` (nunca ISO crudo); las fechas de calendario (`YYYY-MM-DD`) se parsean como fecha local para evitar corrimientos de zona horaria y los ISO `date-time` se interpretan como instantes. Los valores iniciales de calendario se calculan en hora local, no recortando `toISOString()`. En filas etiqueta-valor, la etiqueta no se encoge y el valor envuelve alineado a la derecha.

## 23. Estados de carga, vacío, error, offline y sin permisos

- **Carga:** spinner y texto que describe qué se carga; usar skeleton solo cuando refleje la estructura real y respetar reduce motion.
- **Subida de archivos:** mostrar nombre, porcentaje textual y barra accesible; durante una subida activa ofrecer cancelación explícita. Los errores se anuncian como alertas y nunca dependen solo del color.
- **Vacío:** explicar qué falta y ofrecer una acción cuando el rol pueda realizarla.
- **Error:** mensaje recuperable, acción de reintento y detalles técnicos fuera de la UI de usuario.
- **Offline:** distinguir falta de red de un error del servidor y explicar sincronización.
- **Sin permisos:** explicar que el rol no habilita la acción; no mostrar un botón que fallará con 403. Puede ofrecer navegación segura.

## 24. Accesibilidad

Objetivo mínimo WCAG 2.2 AA donde aplica. Probar texto normal con contraste 4,5:1 y texto grande con 3:1. Mantener áreas táctiles de 44 × 44, orden de foco lógico, labels en controles, estados accesibles y zoom de fuente. Nunca truncar silenciosamente nombre, estado, vencimiento o error. No agregar animación indispensable; cualquier animación futura consultará `useReducedMotion` o la preferencia del sistema y tendrá alternativa estática.

Tabla verificada (RFG-88, `src/theme/contrast.test.ts` como guard):

| Par                                                                            | Ratio                             | Estado                                                                       |
| ------------------------------------------------------------------------------ | --------------------------------- | ---------------------------------------------------------------------------- |
| `textPrimary` sobre `background`/`surfaceElevated`/`surfaceSubtle`             | 13,61 / 7,61 / 11,56              | Pasa                                                                         |
| `textSecondary` sobre `surface`/`surfaceElevated`/`surfaceSubtle`/`background` | 5,94 / 4,59 / 6,97 / 8,21         | Pasa                                                                         |
| `positive` sobre `surfaceSubtle`/`surfaceElevated`                             | 8,07 / 5,31                       | Pasa (destino activo de la barra inferior)                                   |
| `textInverse` sobre `positive`/`warning`/`danger`/`info`/`neutral`             | 10,86 / 7,74 / 5,08 / 6,48 / 6,79 | Pasa                                                                         |
| `disabledText` (`#CCBEB1`) sobre `disabledSurface`                             | 4,64                              | Pasa (sin `opacity`; el estilo `disabled` de `AppButton` no reduce opacidad) |

Reglas RFG-88: `sizes.touchTarget = 44` y `sizes.hitSlop = 8` como estándar en icon-only (`AppButton`, `FilterChip`, `AppHeaderBack`, `BottomNavigation`, `AccountMenuButton`, backdrop de `ConfirmDialog`); `minWidth: 44` en `FilterChip` y opciones `radio`; `AppBadge` con `role="text"`; filas informativas con `role="summary"`; `DateTimeField` con `accessibilityHint` de formato; formularios con cadena `returnKeyType next/done` + `onSubmitEditing`.

## 25. Responsive layout

El contenido principal usa `ScrollView`/listas y safe areas. En móvil estrecho, las tarjetas envuelven o pasan a una columna; en tablet, el ancho de lectura se limita. No fijar alturas en tarjetas con texto. Probar al menos 320 × 568, 390 × 844, tablet, orientación horizontal cuando la pantalla la admita y fuente al 200 %. La navegación fija debe sumar el inset inferior y el contenido debe reservar espacio para ella.

## 26. Variantes según rol

- `admin`: puede ver administración, auditoría y todas las acciones; las acciones destructivas mantienen confirmación.
- `shelter_manager`: prioriza ingresos, animales, gastos, tareas generales y dashboard sin actividad clínica reciente. No mostrar creación o cierre clínico prohibido.
- `veterinarian`: prioriza animales, evolución clínica y tareas; no mostrar edición general de animal ni gestión de gastos.

La diferencia de rol modifica acciones y módulos, no la identidad visual. Ocultar o deshabilitar depende del contexto: ocultar acciones irrelevantes; deshabilitar solo cuando explicar la restricción aporte valor.

## 27. Correspondencia con enums del backend

| Dominio        | Valor                    | Presentación sugerida                      |
| -------------- | ------------------------ | ------------------------------------------ |
| Animal         | `admitted`               | Ingresado · neutro                         |
| Animal         | `under_treatment`        | En tratamiento · info                      |
| Animal         | `available_for_adoption` | Disponible para adopción · positivo        |
| Animal         | `adopted`                | Adoptado · positivo                        |
| Animal         | `deceased`               | Fallecido · neutro, lenguaje respetuoso    |
| Tarea          | `pending`                | Pendiente · default                        |
| Tarea          | `completed`              | Completada · positivo                      |
| Tarea          | `cancelled`              | Cancelada · neutro                         |
| Derivado       | `overdue`                | Vencida · peligro                          |
| Derivado       | `upcoming`               | Próxima · advertencia                      |
| Característica | `clinical`               | Clínica · info, solo sin urgencia superior |

`overdue`, `upcoming` y `clinical` no se persisten como estados. `resolveTaskPresentation` codifica la precedencia visual. Los tipos de API futuros deben generarse desde `openapi.json`; las uniones actuales documentan solo el contrato visual confirmado y no sustituyen esa generación.

## 28. Elementos que necesitan SVG

La primera versión no necesita `react-native-svg`: radios nativos resuelven tarjetas y `expo-symbols` resuelve iconografía. Incorporar SVG solo para una textura lineal de hojas, un separador orgánico escalable o una forma de marca que no pueda expresarse con layout. Debe ser decorativo, liviano y no contener texto ni información de estado.

Excepción vigente (ADR-0017/RFG-138): la barra de navegación inferior usa `react-native-svg` **solo** para el arco decorativo de su borde superior (`CurvedTabBar` + `tabBarCurvePath`). Es la única forma de marca que no se expresa con layout nativo; el resto de la interfaz sigue sin SVG y el arco es estático, oculto a tecnologías asistivas y sin estado. La barra se superpone al borde inferior de la escena para que el área exterior situada sobre el arco muestre el contenido de la pantalla; las pantallas de los tabs reservan internamente la altura de navegación para que su último elemento pueda desplazarse por encima de la superficie.

## 29. Aspectos conceptuales del mockup

Son conceptuales: el perro recortado sobre la cabecera, las frases manuscritas, las hojas de fondo, la tarjeta ondulada, los conteos y nombres, el indicador de notificación y todos los ejemplos de agenda. No representan datos reales, requisitos de endpoint ni una obligación de layout. La pantalla de catálogo usa contenido ficticio explícito para validar componentes. El perro recortado y las hojas de fondo se materializan con los assets de D02 (`assets/images/brand`, ver `docs/brand-assets.md`): el hero es fotografía de stock licenciada con atribución y las hojas son ilustraciones vectoriales propias; siempre decorativos y ocultos a tecnologías asistivas.

## 30. Uso correcto e incorrecto

| Correcto                                        | Incorrecto                                            |
| ----------------------------------------------- | ----------------------------------------------------- |
| Badge coral con icono y texto “Vencida”         | Punto coral sin etiqueta                              |
| Una tarjeta orgánica protagonista               | Todas las tarjetas con siluetas diferentes            |
| Newsreader en títulos y métricas                | Newsreader en formularios o párrafos extensos         |
| Lista desplazable que conserva tamaño táctil    | Comprimir cinco tareas para que entren en un viewport |
| Foto con foco, recorte y texto alternativo      | Texto incrustado en una foto                          |
| Acción oculta cuando el rol no puede ejecutarla | Acción visible que siempre responde 403               |
| Tarea clínica vencida presentada como “Vencida” | Azul clínico ocultando la urgencia                    |

## 31. Checklist para nuevas pantallas

- [ ] La pantalla pertenece a una feature y la ruta solo compone.
- [ ] Todos los colores, espacios, radios, tamaños y tipografías provienen de tokens.
- [ ] Hay un único encabezado principal y una jerarquía legible.
- [ ] El contenido puede desplazarse y respeta safe areas.
- [ ] Las pantallas stack fuera de tabs muestran un header de retorno con fallback contextual.
- [ ] Se probó pantalla pequeña, tablet y fuente ampliada.
- [ ] Cada control tiene al menos 44 × 44 pt y nombre accesible.
- [ ] Los estados combinan texto, icono y color.
- [ ] Se contemplan carga, vacío, error, offline y permisos.
- [ ] La prioridad `overdue > upcoming > clinical > pending` se mantiene para tareas pendientes.
- [ ] Los permisos coinciden con `architecture.md` del backend.
- [ ] Los tipos de red provienen del OpenAPI cuando exista el contrato generado.
- [ ] No se registran tokens ni datos sensibles.
- [ ] Las imágenes tienen origen, recorte y alternativa definidos.
- [ ] Las animaciones respetan reduce motion.
- [ ] TypeScript, lint y tests pasan antes de integrar.

## 32. Cuenta y cierre de sesión

El acceso de cuenta es transversal al área autenticada y reutiliza el lenguaje visual del sistema sin introducir tokens nuevos.

- **Acceso:** `AccountMenuButton`, botón solo-icono de 44 × 44 (`sizes.touchTarget`) con `accessibilityLabel` "Abrir menú de cuenta", icono `account` en `textPrimary` y `hitSlop` de 8 pt (`sizes.hitSlop`). Aparece en el encabezado de Inicio y, en las pantallas stack, junto al retorno (`AccountHeaderRow` = `AppHeaderBack` + botón). Navega a la pantalla de cuenta.
- **Pantalla "Más" (tab, D08/RFG-141):** abre con encabezado editorial (`Más` / `Tu espacio de trabajo`) sobre textura vegetal decorativa y una tarjeta orgánica de perfil resumido con iniciales, nombre real, correo y badges de roles traducidos; nunca expone UUID. La jerarquía es `Gestión > Aplicación > Notificaciones > Salida`. `ManagementSection` recibe desde la ruta solo destinos autorizados por `src/application/management` y los agrupa en una única card con filas de 44 pt: "Veterinarios" para los tres roles, "Usuarios" solo con `canManageUsers` y "Ver auditoría" solo con `canReadAudit`. No se agregan los destinos conceptuales de la referencia que todavía no tienen ruta o contrato. `AccountApplicationSection` muestra conectividad con texto + icono + badge, información de producto expandible con `accessibilityState.expanded` y el acceso existente a cambio de contraseña. La ruta inyecta la sección completa de notificaciones mediante un slot nombrado y conserva sus estados loading/error/offline/reintento. El cierre de sesión queda como acción separada al final.
- **Pantalla "Mi perfil" (stack, D09/RFG-142):** la tarjeta resumida de “Más” es un botón de 44 pt con chevron y abre `/profile`. El perfil conserva el lenguaje editorial de la referencia con textura decorativa, tarjeta orgánica de identidad y secciones `Información personal`, `Permisos` y `Seguridad`. Estado, roles, fechas y capacidades se expresan con texto legible; `Activo/Inactivo` suma icono y badge, las fechas usan `dateFormat` en `es-AR`, y no se muestran UUIDs ni enums. Los permisos visibles son exclusivamente las capabilities efectivas del registro central. Cambio de contraseña y cierre de sesión reutilizan los flujos seguros existentes; la salida exige confirmación explícita.
- **Confirmación (`AccountSignOutSheet`):** envuelve a `ConfirmDialog` (ver §33) con título "¿Querés cerrar sesión?", correo del usuario y acciones "Cancelar" (`ghost`) y "Cerrar sesión" (`danger`) con estado de carga (`loading`) que bloquea el cierre durante la operación. El error se anuncia como alerta con texto + color; no se exponen tokens ni payloads.
- **Comportamiento:** se llama a `SessionProvider.signOut()` (POST `/auth/logout` best-effort); el cierre local (Secure Store + cache de TanStack Query) siempre ocurre, incluso offline o con refresh inválido, y `Stack.Protected` redirige a login sin dejar rutas `(app)` accesibles.
- **Accesibilidad:** estados visibles con texto/icono además de color, áreas táctiles de 44 × 44 y labels en español.

## 33. Confirmaciones destructivas (`ConfirmDialog`)

`ConfirmDialog` es el diálogo compartido del sistema de diseño para acciones con consecuencia, sin `Alert` nativo. Reemplaza los diálogos duplicados por feature (cambio de estado de animal, completar/cancelar tarea, cierre de sesión) y se usa en todo borrado iniciado por el usuario.

- **Composición:** modal nativo transparente con scrim y `accessibilityViewIsModal`; contenido centrado, tarjeta `surfaceElevated` con radio `lg` y ancho máx 480. `role="alert"` y `liveRegion` para anunciar el diálogo y sus errores.
- **Contenido:** título con pregunta directa, detalle de la consecuencia y mensaje de error seguro opcional.
- **Acciones:** `Cancelar`/`Volver` (`ghost`, deshabilitado durante la operación) y confirmación (`primary` o `danger`, con `danger` por defecto) con estado de carga que bloquea ambas acciones mientras se ejecuta (`confirming`).
- **Regla:** toda acción destructiva exige confirmación explícita; nunca se ejecuta de forma inmediata. El borrado de un adjunto clínico ya subido (`DELETE /media/:id`) confirma antes de encolarse al guardado. La limpieza huérfana automática posterior a un fallo (foto de perfil, comprobante, adjuntos) permanece silenciosa porque no la inicia el usuario. En el cambio de estado (D14) el patrón `BottomSheet` (§42) encadena un segundo `ConfirmDialog` `danger` para estados terminales.
- **Tono del producto:** los mensajes de confirmación y de error usan voseo rioplatense ("¿Querés...?", "Revisá...", "Intentá...") de forma consistente en toda la app.

## 34. Assets de marca y decorativos (D02)

Los assets originales de marca (hero de perro rescatado, marca vegetal y textura de hojas) se registran en `src/components/patterns/brandAssets.ts` (`resolveBrandSource`) y se consumen con el patrón `DecorativeImage`:

- **Procedencia:** maestros en `docs/brand-assets/sources/`; binarios WebP + PNG fallback generados con `scripts/generate-brand-assets.mjs` (hero: fotografía Pngtree licenciada con atribución y densidad única @3x; hojas: SVG propios con `@1x/@2x/@3x`). Detalle y licencias en `docs/brand-assets.md` y ADR-0015/0016.
- **Decorativos por defecto:** ocultos a tecnologías asistivas (`accessible={false}`, `accessibilityElementsHidden`, `importantForAccessibility="no-hide-descendants"`, `alt=""`). Solo un `accessibilityLabel` los convierte en informativos.
- **Sin estado ni texto:** ningún asset comunica estado, ni contiene texto, badges ni botones incrustados.
- **Rendimiento:** el wrapper fija `allowDownscaling`, `cachePolicy="memory-disk"` y prioridad baja; reserva `aspectRatio` para evitar layout shift; ante fallo de decodificación cae al PNG fallback y se resetea al cambiar la fuente.
- **Densidades:** el import por _base name_ delega la selección de densidad a Metro/React Native; para el hero en login, `RFG-137` puede subir `priority` a `high`.
- La textura se consume como capa `cover` (expo-image SDK 57 no repite tiles); el tile sigue afinado para patrones nativos futuros.

## 35. Patrones compartidos D03

La fundación visual de D03 (RFG-136) agrega patrones reutilizables en `src/components`, todos construidos exclusivamente con tokens de `src/theme`, con safe areas, áreas táctiles de 44 × 44, escalado de fuente (máximo 1,8) y estados derivados de texto + icono además de color. No incorporan acceso a red ni conocen DTOs.

- **Fondo decorativo (`DecorativeBackground`)**: capa absoluta de pantalla que compone los assets de marca de D02 mediante `DecorativeImage`. Oculta a tecnologías asistivas, sin texto ni controles incrustados; un overlay opcional oscurece la fotografía para sostener el contraste del contenido. Variantes `hero`, `texture` y `none`.
- **Encabezados (`ScreenHeader` y `SectionHeader`)**: título de pantalla y de sección con jerarquía semántica (`accessibilityRole="header"`), subtítulo y acción opcional. La fila envuelve (`flexWrap`), de modo que una fuente ampliada nunca recorta la acción.
- **Acción flotante (`FAB`)**: acción principal contextual, 56 pt (`sizes.fab`), píldora `positive`, `hitSlop` de 8 y label accesible obligatorio. Respeta el inset inferior (`useSafeAreaInsets`); una pantalla con navegación inferior pasa un `bottomOffset` mayor. El estado presionado es `opacity` (`opacity.pressed`), compatible con reduce motion; `loading`/`disabled` se anuncian y bloquean la interacción.
- **Tarjeta de entidad (`EntityCard`)**: fila canónica para animales, tareas, gastos, veterinarios y auditoría. Avatar opcional, columna de texto `flex: 1` + `minWidth: 0`, badge de estado (`flexShrink: 0`, `maxWidth` relativo ≈ 45 %) y chevron cuando es navegable. El título se trunca a dos líneas; el `accessibilityLabel` conserva el texto completo. Con `onPress` toda la tarjeta es un botón accesible.
- **Metadatos (`MetadataRow`)**: fila etiqueta-valor para detalles de entidad. La etiqueta no se encoge y el valor envuelve alineado al final; las fechas llegan formateadas en `es-AR` y el dinero desde centavos, nunca como ISO crudo.
- **Adjuntos (`AttachmentList` y `AttachmentRow`)**: lista de archivos con miniatura o glifo, nombre, tamaño y estados `ready`/`uploading`/`error`. La subida expone barra de progreso accesible y porcentaje textual; el error muestra mensaje seguro y acción de reintento; el reintento y la eliminación conservan área táctil de 44 pt. El borrado exige confirmación mediante `ConfirmDialog` (la lista lo posee) y una lista vacía explica la ausencia sin inventar acciones.

Tokens agregados por D03: `sizes.fab` (56), `sizes.dialogMaxWidth` (480) y `opacity.pressed`/`opacity.pressedSubtle`/`opacity.overlay`. Reemplazan valores antes dispersos en `AppButton`, `AppHeaderBack`, `BottomNavigation` y `ConfirmDialog`, manteniendo el criterio de no introducir medidas arbitrarias en componentes compartidos.

D05 (RFG-138) agrega `sizes.bottomNavigationCurve` (14) para la altura del arco decorativo de la barra inferior (ver ADR-0017).

D14 (RFG-147) agrega el patrón `BottomSheet` en `src/components/feedback`: sheet inferior sobre `Modal` nativo (`slide`), scrim, handle decorativo, superficie anclada al borde inferior con safe area y contenido desplazable. No conoce endpoints, roles ni dominio. Reutiliza los tokens existentes; no introduce medidas arbitrarias (ver ADR-0018).

## 36. Login editorial (D04)

La pantalla de acceso replica la composición editorial de la referencia `01-login.jpeg` sin incrustar la captura como fondo:

- **Hero decorativo:** `DecorativeBackground variant="hero"` a-bleed en el 62 % superior, con `priority="high"` y overlay (`opacity.overlay`) para sostener el contraste del copy. Oculto a tecnologías asistivas; no comunica estado ni contiene texto.
- **Copy nativo:** marca `Refugiapp` (`display`, `accessibilityRole="header"`, único encabezado principal), claim y descripción en `heading3`/`body`. El texto funcional nunca va dentro de un bitmap.
- **Tarjeta de acceso:** `AppCard variant="organic"` (superficie elevada, radios orgánicos, sombra `raised`) con el encabezado "Acceso para personal autorizado" (`heading3`, header, icono `account` decorativo) y `LoginForm`.
- **Teclado y viewport:** `KeyboardAvoidingView` (`padding` en iOS) + `ScrollView` (`keyboardShouldPersistTaps="handled"`, `flexGrow`, `justifyContent: 'space-between'`). En pantallas pequeñas o con fuente al 200 % el contenido desplaza; ninguna altura rígida rodea texto.
- **Formulario:** reutiliza `PasswordField` (toggle de visibilidad 44 × 44) y expone `autoComplete`/`textContentType` (email `emailAddress`, password `password`) y `returnKeyType next → done`; el error de validación y el aviso de sesión vencida se anuncian con `role="alert"` y `accessibilityLiveRegion`. En web, `app/+html.tsx` neutraliza el celeste nativo de `-webkit-autofill` solo para los campos del login y conserva `surface`, `textPrimary` y `border`, sin desactivar el autocompletado ni los gestores de contraseñas. El foco reemplaza el contorno blanco/negro del navegador con borde y anillo de 2 px en el token semántico `focus`; no usa `positive`, reservado para éxito y acciones principales.
- **Divergencia `ux` aceptada:** no se añaden iconos dentro de los inputs, ya que exigirían una primitiva compartida de campo nueva o duplicar el estilo del campo; se prioriza no crear una abstracción compartida para un único consumidor. El icono `account` decora el encabezado de la tarjeta. `app/(auth)/_layout.tsx` declara `title` por pantalla para el documento web.

## 37. Validación visual de las 23 referencias (D06)

La ruta interna `/design-system` incorpora el arnés de validación de D06 (RFG-139), que prepara la comparación de las 23 referencias con la implementación. No rediseña pantallas ni introduce tokens: cataloga y hace reproducible cada referencia.

- **Casos:** `src/design-system/referenceCases.ts` reproduce la matriz D01 (`docs/design-references/README.md §2`) con id estable `D06-01…D06-23`, archivo de referencia, ruta, rol/capacidad, estados y divergencias. La matriz D01 manda; el arnés la refleja.
- **Fixtures:** `src/design-system/fixtures.ts` usa UUID, fechas e importes fijos y ancla los estados derivados en `DESIGN_SYSTEM_NOW`; no incluye datos personales reales (solo identidades `*@refugiapp.test`) ni depende de red o servicios externos.
- **Viewports:** `src/design-system/viewports.ts` fija la matriz `320 × 568`, `390 × 844`, tablet, horizontal aplicable, fuente 200 % y reduce motion; la checklist humana vive en `docs/design-validation/checklist.md`.
- **Catálogo:** `ReferenceValidationSection` agrupa los casos por dominio (Acceso y cuenta, Animales, Cuidados, Gastos, Clínica, Veterinarios, Auditoría); `ReferenceCaseCard` muestra los metadatos, las divergencias, la checklist de seis viewports y el caso reproducible con `testID` `ds-case-D06-NN` para `RFG-167`.
- **Accesibilidad:** cada caso es un `summary` accesible con id, referencia, ruta, roles y estados; las divergencias y los viewports se comunican con texto e icono, nunca solo color. Los previews reutilizan los patrones y primitivas existentes.
- **Fuera de alcance:** el rediseño por referencia (`RFG-140…RFG-166`), la regresión (`RFG-167`) y la certificación del release (`RFG-168`).

## 38. Alta de usuario (D06-04 / RFG-143)

La pantalla administrativa de alta conserva el contenido funcional de la referencia `04-user-create.jpeg` sin copiar valores que contradicen el backend.

- **Jerarquía:** un único encabezado “Crear usuario” y tres cards `elevated`: Datos personales, Acceso inicial y Roles. La textura vegetal es decorativa, tiene overlay de contraste y permanece oculta a tecnologías asistivas.
- **Credenciales:** email con autofill y `PasswordField` compartido con toggle accesible. La ayuda y la validación comunican el mínimo real de 12 caracteres; nunca se muestra el mínimo conceptual de 8 ni se vuelve a presentar la contraseña luego del alta. En web, los campos `create-user-*` reutilizan la neutralización de `-webkit-autofill` de `app/+html.tsx`: fondo `surface`, texto/caret `textPrimary`, borde `border` y foco con borde + anillo `focus`, sin desactivar el gestor de contraseñas.
- **Multirrol:** cada rol soportado por OpenAPI es un checkbox de al menos 44 pt con nombre, descripción, icono y `accessibilityState.checked`. La selección usa borde, check, icono y texto, no solo color. Elegir Administrador añade ayuda contextual sobre su alcance.
- **Confirmación:** “Revisar y crear” abre `ConfirmDialog`, resume email y roles y advierte que la contraseña no volverá a mostrarse. Solo la confirmación ejecuta la mutación; durante el envío bloquea ambas acciones.
- **Errores:** conflicto de email, falta de permisos, payload inválido y falta de red tienen mensajes diferenciados y anunciados. Nunca se muestran detalles internos del backend.
- **Responsive:** el contenido desplaza, las acciones envuelven y cada botón conserva un ancho útil en viewport angosto o con fuente ampliada.

## 39. Matriz de navegación de Cuenta y Más (D11 / RFG-144)

La navegación de Cuenta se valida como una matriz explícita de destinos visibles y bloqueados. “Oculto” describe la presentación; la ruta y el backend vuelven a comprobar el permiso cuando corresponde.

| Destino / acción             | `admin` | `shelter_manager` | `veterinarian` | Regla                                   |
| ---------------------------- | ------- | ----------------- | -------------- | --------------------------------------- |
| Más                          | Visible | Visible           | Visible        | Toda sesión autenticada                 |
| Mi perfil                    | Visible | Visible           | Visible        | Datos y capacidades de la propia cuenta |
| Veterinarios                 | Visible | Visible           | Visible        | Lectura común a los tres roles          |
| Usuarios                     | Visible | Oculto            | Oculto         | Requiere `canManageUsers`               |
| Ver auditoría                | Visible | Oculto            | Oculto         | Requiere `canReadAudit`                 |
| `/users/new` por navegación  | Visible | Sin destino       | Sin destino    | El CTA solo existe con `canManageUsers` |
| `/users/new` por deep link   | Visible | Sin permiso       | Sin permiso    | Guard reactivo en la propia ruta        |
| `/users` y `/users/:id/edit` | Visible | Sin permiso       | Sin permiso    | Guard reactivo en cada ruta             |

- **Pérdida de permisos:** cuando las capacidades vigentes cambian, Más vuelve a filtrar su registro y elimina Usuarios/Auditoría. Si el usuario estaba en una ruta de gestión, el siguiente render desmonta el módulo y presenta “Sin permiso”.
- **Mi perfil:** muestra únicamente las capacidades efectivas derivadas del registro central; nunca expone nombres internos de capabilities.
- **Defensa en profundidad:** `Stack.Protected` exige sesión para todo `(app)`, cada ruta sensible exige su capability y la API conserva la autorización final. Un deep link no convierte la visibilidad en permiso.
- **Cobertura:** tests puros validan visibles/bloqueados, tests RNTL cubren la interacción accesible de Más y Mi perfil, y tests de rutas ejercitan listado, alta y edición de usuarios para los tres roles y tras una revocación en sesión.

## 40. Cabecera y pestañas del detalle animal (D12 / RFG-145)

El detalle del animal toma la jerarquía visual de `05-animal-detail-history.jpeg` como base compartida para todas sus secciones, sin inventar el identificador correlativo presente en la referencia porque el contrato actual solo expone UUID.

- **Cabecera de identidad:** una card `organic` reúne foto protagonista de 128 pt, nombre completo sin truncar, especie, raza opcional y badge de estado. La composición envuelve en ancho reducido o con fuente ampliada y centra la foto cuando la identidad pasa a la línea siguiente; sin foto o ante error de carga, `AppAvatar` muestra iniciales y anuncia la ausencia.
- **Estado accesible:** el badge conserva icono y texto en español y el resumen accesible concatena nombre, especie/raza y estado. El color nunca es la única señal.
- **Navegación local:** las secciones viven en un `tablist` horizontal sobre una única superficie elevada que recorta su contenido al radio del contenedor. Las opciones sin seleccionar no dibujan cards ni bordes individuales; solo la activa usa una pastilla lima. Cada opción tiene rol `tab`, estado `selected`, label e indicación accesible; el desplazamiento horizontal evita recortes.
- **Capacidades preservadas:** Resumen, Historial, Cuidados, Gastos y Adopción siguen disponibles. Evolución clínica solo se presenta con `canReadClinicalRecords`; el deep link sin capacidad conserva el estado de acceso restringido y no ejecuta consultas clínicas.
- **Alcance:** RFG-145 establece la cabecera y navegación comunes. El contenido y la paginación visual del Historial se implementan en RFG-146 y las demás secciones mantienen sus tickets de rediseño específicos.

## 41. Timeline del historial animal (D13 / RFG-146)

La pestaña Historial presenta exclusivamente los eventos generales entregados por `GET /animals/:animalId/events`. No mezcla tareas futuras ni registros clínicos, que conservan sus propias secciones y permisos.

- **Timeline:** cada evento usa una tarjeta elevada conectada por un eje vertical. El marcador circular combina icono y tono según el tipo (`intake`, `transfer`, `status_change`, `behavior_note`, `adoption`, `general_note`); la tarjeta siempre muestra además el tipo en texto, descripción y fecha `es-AR`.
- **Filtros:** el control compacto “Todos los eventos” expande un `radiogroup` con exactamente los seis valores publicados por OpenAPI. Elegir una opción actualiza `eventType`; no se envían filtros locales ni valores inventados.
- **Paginación:** `useInfiniteQuery` solicita páginas de 20 y respeta el orden determinista del servidor (`occurredAt DESC, id DESC`). Las páginas se concatenan sin reordenar y deduplican por UUID para tolerar solapamientos; `FlatList` virtualiza el resultado y ofrece carga por scroll o por el CTA accesible “Cargar más eventos”.
- **Estados:** carga inicial, vacío global, vacío filtrado, error, offline con reintento, carga incremental, fin de lista y pull-to-refresh permanecen diferenciados.
- **Permisos:** los tres roles pueden leer y filtrar. “Agregar evento” solo aparece con `canEditAnimal` (`admin`/`shelter_manager`) y navega al formulario existente; `veterinarian` conserva historial de solo lectura. El backend vuelve a autorizar toda operación.
- **Responsive y accesibilidad:** cabecera, filtro y CTA envuelven con fuente ampliada; controles de 44 pt; lista, eventos, filtros, estado expandido y selección exponen semántica accesible. Los marcadores son decorativos y el resumen del evento incluye todo su contenido textual.

## 42. Cambio de estado del animal (D14 / RFG-147)

El detalle del animal presenta el cambio de estado como un `BottomSheet` (`06-animal-status-change.jpeg`) sin copiar valores que contradicen el contrato: no se muestra el identificador correlativo de la referencia y los textos salen de la presentación local de estados.

- **Entrada:** `AnimalStatusChanger` reemplaza la lista inline por una card `outlined` con "Estado actual" + `AppBadge` (icono + texto) y un botón secundario "Cambiar estado". Si el estado es terminal (`adopted`/`deceased`) no hay botón y se explica que es final. Solo se muestra con `canEditAnimal` (`admin`/`shelter_manager`); `veterinarian` no ve la acción y el backend revalida.
- **Sheet:** `AnimalStatusSheet` compone `BottomSheet` con el estado actual, la instrucción "Seleccioná el nuevo estado de {nombre}" y **solo** las transiciones de `getAllowedTransitions` como radio-cards (icono circular, título, descripción y radio de 44 pt). El estado nunca se comunica solo por color: icono + texto + radio seleccionado.
- **Fecha opcional:** "Fecha y hora del cambio (opcional)" reutiliza `DateTimeField` (`datetime`); vacío registra el momento actual en el backend. La validación pura `isValidStatusChangeOccurredAt` aplica la tolerancia de skew de 60 s de ADR-0007.
- **Confirmación:** el botón del sheet confirma el estado no terminal directamente; los terminales cierran el sheet y abren `StatusConfirmDialog` (envuelve `ConfirmDialog`, tono `danger` por `isTerminalStatus`, ya no por comparación de strings). "Cancelar" en cualquier punto conserva el estado original.
- **Sin optimistic update:** `useChangeAnimalStatus` invalida `animalKeys.all`; un `409`/`403`/`404` se traduce con `toChangeStatusErrorMessage` en voseo y nunca reemplaza la autoridad del backend.
- **Accesibilidad y responsive:** `dialog`/`radiogroup`/`radio` con `accessibilityState.selected`, título `header`, errores `role="alert"` + `liveRegion`, targets de 44 pt y contenido desplazable para fuente al 200 %. `testID` `status-sheet`, `status-option-{estado}`, `status-confirm`, `status-cancel` habilitan la regresión de RFG-167.

## Referencias técnicas

- [Expo SDK 57](https://docs.expo.dev/versions/v57.0.0/)
- [Expo Font 57](https://docs.expo.dev/versions/v57.0.0/sdk/font/)
- [Safe area context para Expo 57](https://docs.expo.dev/versions/v57.0.0/sdk/safe-area-context/)
- [Expo Symbols 57](https://docs.expo.dev/versions/v57.0.0/sdk/symbols/)
