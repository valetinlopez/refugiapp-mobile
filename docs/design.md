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

`AppIcon` centraliza símbolos de `expo-symbols`, con SF Symbols en iOS y Material Symbols en Android/web. Se usan iconos simples, sólidos o de trazo consistente. Un icono decorativo se oculta a tecnologías de asistencia; uno interactivo requiere `accessibilityLabel` en el control que lo contiene. No se mezclan emojis con iconos de producto. El set incluye `account` (identidad/cuenta), `logout` (salida), `eye`/`eyeOff` (toggle mostrar/ocultar contraseña), `mail`/`phone` (líneas de contacto de identidad), `copy` (copiado de identificadores en Auditoría) y `refresh`, mapeados a SF Symbols y Material Symbols.

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

## 37. Validación visual de las 25 referencias (D06)

La ruta interna `/design-system` incorpora el arnés de validación de D06 (RFG-139), que prepara la comparación de las 25 referencias con la implementación. No rediseña pantallas ni introduce tokens: cataloga y hace reproducible cada referencia.

- **Casos:** `src/design-system/referenceCases.ts` reproduce la matriz D01 (`docs/design-references/README.md §2`) con id estable `D06-01…D06-25`, archivo de referencia, ruta, rol/capacidad, estados y divergencias. La matriz D01 manda; el arnés la refleja.
- **Fixtures:** `src/design-system/fixtures.ts` usa UUID, fechas e importes fijos y ancla los estados derivados en `DESIGN_SYSTEM_NOW`; no incluye datos personales reales (solo identidades `*@refugiapp.test`) ni depende de red o servicios externos.
- **Viewports:** `src/design-system/viewports.ts` fija la matriz `320 × 568`, `390 × 844`, tablet, horizontal aplicable, fuente 200 % y reduce motion; la checklist humana vive en `docs/design-validation/checklist.md`.
- **Catálogo:** `ReferenceValidationSection` agrupa los casos por dominio (Acceso y cuenta, Animales, Cuidados, Gastos, Clínica, Veterinarios, Auditoría, Inicio y cierre); `ReferenceCaseCard` muestra los metadatos, las divergencias, la checklist de seis viewports y el caso reproducible con `testID` `ds-case-D06-NN` para `RFG-167`.
- **Accesibilidad:** cada caso es un `summary` accesible con id, referencia, ruta, roles y estados; las divergencias y los viewports se comunican con texto e icono, nunca solo color. Los previews reutilizan los patrones y primitivas existentes.
- **Fuera de alcance:** el rediseño por referencia (`RFG-140…RFG-170`), la regresión (`RFG-167`) y la certificación del release (`RFG-168`).

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

## 43. Formulario Agregar evento (D15 / RFG-148)

El alta de un evento general (`app/(app)/animals/[id]/events/new.tsx`) toma la jerarquía de `08-animal-event-new.jpeg` sin inventar el identificador correlativo que la referencia muestra (el contrato solo expone UUID). Es una pantalla de escritura para `admin`/`shelter_manager` (`canEditAnimal`); un deep link sin la capacidad muestra el guard reactivo "Sin permiso" y `veterinarian` conserva el historial de solo lectura.

- **Fondo y encabezado:** `DecorativeBackground variant="texture"` + `AccountHeaderRow` (retorno con `fallbackHref` al detalle) + `ScreenHeader` con "Agregar evento" como único `heading1` y el subtítulo "Historial de {nombre}".
- **Identidad (card `organic`):** `AnimalEventIdentityCard` reutiliza el lenguaje del detalle del animal — `AppAvatar` protagonista (128 pt, `rounded`, foto cacheada o iniciales) + nombre `display` sin truncar + especie · raza + badge — pero el badge es fijo de contexto ("Evento general", tono `info`) porque la pantalla se abre siempre para ese cometido. `role="summary"` y `testID="create-event-identity"`.
- **Formulario (`AppCard elevated`):** `SectionHeader` "Información del evento" y tres campos:
  - **Tipo de evento:** desplegable fiel a la referencia sin usar un picker JS. `AnimalEventTypeField` compone un trigger (superficie `surface`, borde, icono circular, valor y chevron) que abre el `BottomSheet` del sistema (ADR-0018) con las **solo tres** opciones de OpenAPI (`general_note`, `behavior_note`, `transfer`) como radio-cards de 44 × 44 con icono, descripción y marca de selección; el estado nunca se comunica solo por color. `testID` `create-event-type-trigger/sheet/option-{tipo}`.
  - **Descripción:** campo multiline con contador `x/1000` anunciado (`accessibilityLiveRegion`) y `maxLength` contractual.
  - **Fecha y hora (opcional):** `DateTimeField` compartido con `minimumDate` = inicio de día local del `intakeDate` y `maximumDate` = `now + 60 s`; vacío delega la hora actual al backend. Un banner con icono y texto explica la regla ("no puede ser futura ni anterior al ingreso de {nombre}"); la validación local (`createAnimalEventSchema(intakeDate)`) rechaza antes del submit ambas desviaciones y el backend vuelve a validar.
- **Footer:** `Cancelar` (`secondary`) sin submit + `Guardar evento` (`primary`, `loading` durante la mutación, icono de confirmación). Los errores del servidor usan `role="alert"` y el borrador se conserva (no hay `reset`).
- **Estados de preparación:** `LoadingState` mientras `useAnimal` resuelve; `OfflineState` (vía `isNetworkError`) o `ErrorState` con reintento antes de montar el formulario; nunca un spinner infinito sin red.
- **Accesibilidad y responsive:** radios `radiogroup`/`radio` con `selected`, errores por campo en `role="alert"`, target de 44 pt, contenido desplazable con fuente ampliada y sin alturas rígidas alrededor de texto. `testID` `create-event-description/cancel/submit` habilitan la regresión de RFG-167.

## 44. Edición de animales (D16 / RFG-149)

La edición de la ficha (`app/(app)/animals/[id]/edit.tsx`) adopta la jerarquía de `07-animal-edit.jpeg` sin copiar sus valores, su enum de especie (no publicado) ni un identificador correlativo. Es una pantalla de escritura para `admin`/`shelter_manager` (`canEditAnimal`); un deep link sin la capacidad monta el guard reactivo "Sin permiso" sin ejecutar la query y `veterinarian` no ve acciones de edición.

- **Fondo y encabezado:** `DecorativeBackground variant="texture"` + `AccountHeaderRow` (retorno con `fallbackHref` al detalle) + `ScreenHeader` con "Editar animal" como único `heading1`. Cuando hay cambios pendientes, `actions` monta `UnsavedChangesIndicator`: punto `positive` + texto "Cambios sin guardar" (el estado nunca depende solo del color), con `accessibilityLiveRegion` y `testID="edit-dirty-badge"`.
- **Formulario agrupado en cards `elevated`** (`AnimalProfileForm` modo edit, compartido con el alta):
  - **Foto de perfil:** `ProfilePhotoPicker mode="edit"` presente al actual (`AppAvatar` con fallback a iniciales) con "Cambiar foto" (`secondary`, icono cámara) que abre un `BottomSheet` (cámara/galería) y "Quitar" (`secondary`, icono papelera). "Quitar" descarta una foto recién elegida o marca la actual para borrado; elegir una nueva revierte ese estado.
  - **Datos principales:** `SectionHeader` + `Nombre`, `Especie` (campo abierto: el contrato no publica enum) y `Raza` como inputs con etiqueta visible; `Sexo` con `SegmentedControl` (`radiogroup`/`radio`, 44 pt).
  - **Fechas:** `Fecha de ingreso` y `Fecha de nacimiento` con `DateTimeField mode="date"` (presentación `es-AR`, envío `YYYY-MM-DD`), más la ayuda "La fecha de nacimiento debe ser anterior o igual a la fecha de ingreso".
- **Dirty global y por campo:** cada campo modificado (`dirtyFields`) muestra el indicador "Modificado" (punto + texto, `accessibilityLabel` "{campo} modificado"); la foto cuenta como cambio. El indicador global del encabezado refleja cualquier cambio, incluido el de foto.
- **Guard de descarte:** salir con cambios pendientes (retorno del encabezado, botón `Descartar` o retroceso de Android) intercepta la navegación mediante `useUnsavedChangesGuard` (`beforeRemove` + `gestureEnabled` desactivado mientras hay borrador) y pide confirmación con `ConfirmDialog` no destructivo ("Seguir editando" / "Descartar"). Guardar con éxito omite el guard.
- **Footer:** `Descartar` (`secondary`) + `Guardar cambios` (`primary`, `loading` durante la mutación). Los errores de foto y de guardado siguen diferenciados, con reintento y "Guardar sin foto"; los errores Zod hacen scroll y foco al primer campo inválido (offsets acumulados por card).
- **Estados:** `LoadingState`, `OfflineState` (vía `isNetworkError`) y `ErrorState` con reintento antes de montar el formulario; `EmptyState` "Animal no encontrado".
- **Accesibilidad y responsive:** un único H1, errores por campo en `role="alert"`, targets de 44 × 44, contenido desplazable con `keyboardShouldPersistTaps` y fuente ampliada. `testID` `edit-field-*`, `edit-photo-change/remove`, `edit-discard/submit` habilitan la regresión de RFG-167.

## 45. Experiencia global de Cuidados (D18 / RFG-151)

El tab `Cuidados` adopta la jerarquía de `10-care-tasks-overview.jpeg` sin incorporar el tipo ni el responsable conceptuales de la referencia, porque el contrato vigente no publica esos campos.

- **Resumen y filtros:** el encabezado muestra el total pendiente y un `SegmentedControl` para los tres estados persistidos. Cada opción combina label y contador; los contadores provienen de tres consultas `limit=1` independientes. El selector de animal abre un `BottomSheet` con radios y aplica el mismo `animalId` a lista y contadores.
- **Listado:** `FlatList` virtualiza páginas de 20 y conserva el orden del backend. Cada tarjeta presenta la foto del animal cuando existe (iniciales como fallback), nombre, título, descripción opcional, fecha `es-AR`, badge y chevron; toda la superficie abre el detalle con una única etiqueta accesible. La URL se resuelve por media ID con cache compartida y la miniatura usa la optimización de `AppAvatar`.
- **Estados derivados:** `Vencida` se calcula cuando una tarea pendiente ya superó `dueAt`; `Próxima` cuando vence dentro de las siguientes 24 horas. Ambas señales incluyen icono y texto y nunca modifican los estados contractuales `pending`, `completed` y `cancelled`.
- **Acciones y permisos:** el FAB `Nueva tarea` aparece solo para `admin` y `shelter_manager`; `veterinarian` conserva lectura y un aviso explícito. El detalle existente mantiene las mutaciones autorizadas y el backend vuelve a validar.
- **Resiliencia:** carga inicial, vacío filtrado, error de servidor, offline con reintento, error de página siguiente, pull-to-refresh y fin de lista son estados diferenciados. Los controles mantienen targets de 44 × 44 y semántica `radiogroup`/`radio`.

## 46. Nueva tarea de cuidado (D19 / RFG-152)

El alta toma la jerarquía de `11-care-task-new.jpeg` y conserva estrictamente el contrato actual. No incorpora el tipo de tarea ni un responsable asignable porque esos datos no forman parte de `CreateCareTaskDto`.

- **Encabezado:** fondo de textura, fila de cuenta y retorno contextual, breadcrumb “Cuidados” y `ScreenHeader` con “Nueva tarea” / “Organizá el próximo cuidado”. La ruta conserva como fallback el detalle del animal cuando llega un UUID válido; de lo contrario vuelve al listado global.
- **Formulario:** una card `elevated` agrupa selector de animal, título obligatorio con contador `x / 160`, descripción opcional con acción de limpieza y vencimiento opcional mediante `DateTimeField`. Los labels distinguen campos obligatorios y opcionales sin depender del color.
- **Selector de animal:** trigger de 44 pt con foto cacheada o iniciales, nombre y chevron; abre el `BottomSheet` compartido con `radiogroup`/`radio`. Las opciones provienen de `src/application/animals`; la URL de media se solicita solo cuando hay una foto de perfil asociada.
- **Estado inicial:** una card `outlined` explica con icono, texto y badge que la tarea se crea como “Pendiente”. Es información de presentación: `pending` no se agrega al payload, porque el backend define el estado inicial.
- **Acciones y resultado:** “Cancelar” vuelve al origen sin enviar; “Crear tarea” muestra carga durante una única mutación. El éxito invalida lista/contadores, anuncia “Tarea … creada como Pendiente” y vuelve al origen, donde el filtro inicial pendiente permite verla. Los errores conservan todos los campos para reintento manual.
- **Estados y permisos:** carga, ausencia de animales, error conectado, offline y reintento se distinguen antes de montar el formulario. La pérdida de `canEditAnimal` desmonta inmediatamente el contenido de escritura y presenta “Sin permiso”; el backend vuelve a autorizar el `POST`.
- **Responsive y accesibilidad:** cards y acciones envuelven, el contenido desplaza, los controles conservan áreas táctiles mínimas, errores usan `role="alert"`/live region y el resultado se anuncia mediante la API de accesibilidad.

## 47. Detalle de tarea de cuidado (D20 / RFG-153)

El detalle toma la jerarquía de `12-care-task-detail.jpeg` y conserva los estados y permisos publicados por el backend. No incorpora borrado porque el contrato vigente de tareas no expone ese endpoint.

- **Identidad y estado:** una card destacada presenta título, estado persistido e información derivada separada. Una tarea `pending` puede sumar `Vencida` o `Próxima` sin reemplazar ni persistir su estado real.
- **Animal:** card navegable con foto cacheada o iniciales, nombre, especie y raza opcional; “Ver ficha” abre el detalle del animal sin importar internals de esa feature.
- **Contenido:** descripción con fallback explícito y fechas de vencimiento, creación, actualización y finalización en formato `es-AR`. Un vencimiento atrasado se señala con icono, texto y tono, nunca solo por color.
- **Acciones:** editar, completar y cancelar aparecen únicamente con capacidad de escritura y solo mientras la tarea está pendiente. Completar y cancelar usan `ConfirmDialog`; el backend revalida permisos y las mutaciones invalidan detalle, listas, contadores y dashboard.
- **Resiliencia:** UUID inválido, carga, error conectado, offline con reintento, transición en cola y pérdida reactiva de permiso se presentan por separado. Los estados terminales no ofrecen acciones incompatibles.

## 48. Historia clínica global (D25 / RFG-158)

El listado global (`app/(app)/medical-records/index.tsx`) adopta la jerarquía de `16-clinical-history-overview.jpeg` y conserva estrictamente el contrato de `GET /medical-records`. Es de lectura y alta para `admin`/`veterinarian` (`canReadClinicalRecords`); `shelter_manager` recibe `403` y el destino de Gestión se oculta.

- **Encabezado y resumen:** fondo de textura, fila de cuenta y retorno con `fallbackHref='/more'`, `ScreenHeader` único `heading1` "Historia clínica" con subtítulo "Registros clínicos del refugio" y una card `outlined` resumen que muestra el total paginado según tipo y fechas (nunca un total global) y, con filtro animal activo, el aviso explícito "El filtro de animal se aplica sobre los registros cargados (N)". La fecha y el conteo no asumen un total monetario ni un universo completo que el servidor no declara.
- **Filtros:** tres triggers `secondary` sobre `BottomSheet` (ADR-0018) con radio-cards de 44 × 44 y `radiogroup`/`radio`: animal (foto/nombre desde `src/application/animals`), tipo (los 7 valores publicados) y fechas (presets "Últimos 7 días / 30 días / Este mes" + rango con `DateTimeField`; incompleto o `from > to` no dispara query). El filtro de tipo y el rango viajan al servidor; el de animal filtra en cliente sobre las páginas cargadas y la UI lo comunica.
- **Tarjeta de registro:** fila elevada con avatar del animal (foto cacheada por media ID, iniciales como fallback), nombre del animal, badge `info` con icono y tipo, título del registro a 2 líneas, fecha `es-AR` y veterinario. Toda la tarjeta es un botón accesible con label completo y abre `/medical-records/[id]`; los nombres se resuelven best-effort desde caches compartidas con fallback explícito ("Animal no disponible", "Sin veterinario asignado"/"Veterinario no disponible"); nunca un UUID crudo. Resolver nombres no genera request por fila.
- **Paginación y estados:** `FlatList` virtualiza páginas de 20 con orden del servidor sin reordenar y deduplicación por UUID; CTA "Cargar más registros", fin "No hay más registros", pull-to-refresh y estados de carga, vacío, vacío filtrado, error de servidor (con mensaje traducido) y offline con reintento diferenciados.
- **Alta contextual:** el FAB aparece solo con un animal elegido y navega al flujo por animal existente (`/animals/[id]/medical-records/new`); sin animal se explica "Para registrar un nuevo registro clínico, elegí un animal". El alta global dedicada llega con RFG-159.
- **Accesibilidad:** un único H1, labels accesibles en español más `testID` en inglés (`clinical-global-list`, `clinical-load-more`, `clinical-end-of-list`, `clinical-{animal|type|date}-filter`, `clinical-global-create`), targets de 44 × 44, decorativos ocultos a AT y contenido desplazable con fuente ampliada.

## 49. Listado de veterinarios (D28 / RFG-161)

La ruta `app/(app)/veterinarians/index.tsx` adopta la jerarquía de `19-veterinarians-list.jpeg` y conserva estrictamente el contrato de `GET /veterinarians`. Lectura para los tres roles; el alta solo aparece con `canManageVets` (`admin`/`shelter_manager`).

- **Encabezado y filtros:** fondo de textura, fila de cuenta y retorno con `fallbackHref='/more'`, `ScreenHeader` único `heading1` "Veterinarios" con subtítulo "Personal veterinario registrado", un buscador rápido visible con debounce que lee el término (dígitos → matrícula, si no → nombre) y un `SegmentedControl` `Todos/Activos/Inactivos` con `Todos` por defecto (`isActive: undefined`). Los filtros activos habilitan "Limpiar"; el filtro de estado se combina en AND con la búsqueda. La sección "Profesionales" muestra el `total` paginado del servidor (nunca un total inventado).
- **Filtros avanzados:** `VeterinarianFilterSheet` (sobre `BottomSheet`, ADR-0018) permite enviar `name` y `licenseNumber` juntos en AND —lo que el buscador rápido no puede— con campos recortados y vacíos omitidos. El buscador rápido y los filtros avanzados son mutuamente excluyentes para no perder ni duplicar filtros; las acciones del sheet son "Limpiar" y "Aplicar".
- **Tarjeta:** fila elevada con avatar de iniciales, nombre, matrícula y las líneas de contacto que existan (email del perfil con fallback a `user.email`, y teléfono), con badge de estado icono + texto (`Activo`/`Inactivo`) y chevron. Omite las líneas ausentes sin inventar un placeholder y nunca muestra el UUID. Toda la tarjeta es un único botón accesible con label completo.
- **Paginación y estados:** `FlatList` virtualiza páginas de 20 con orden determinista `lastName ASC, firstName ASC, id ASC` sin reordenar y deduplicación por UUID; CTA "Cargar más veterinarios", fin "No hay más veterinarios", pull-to-refresh y estados de carga, vacío (con/sin filtros y con/sin permiso de alta), error de servidor traducido y offline con reintento diferenciados. El `FAB` "Nuevo veterinario" aparece solo con `canManageVets`.
- **Accesibilidad:** un único H1, labels accesibles en español más `testID` en inglés (`veterinarians-list`, `veterinarians-search`, `veterinarians-status`, `veterinarians-open-filters`, `veterinarians-clear-filters`, `veterinarians-filter-sheet`/`-name`/`-license`/`-apply`/`-clear`, `veterinarians-load-more`, `veterinarians-end-of-list`, `veterinarians-create`), targets de 44 × 44, decorativos ocultos a AT y contenido desplazable con fuente ampliada.

## 49. Detalle de registro clínico (D27 / RFG-160)

El detalle (`/medical-records/[id]`) toma la jerarquía de `18-medical-record-detail.jpeg` sin inventar un identificador correlativo ni datos no publicados. Es accesible solo para `admin` y `veterinarian` mediante `canReadClinicalRecords`; `shelter_manager` ve “Sin permiso” y no monta consultas.

- **Identidad:** card protagonista navegable con foto cacheada o iniciales, nombre, especie y raza del animal; badge del tipo contractual, título, fecha `es-AR` y veterinario resuelto individualmente. “Ver ficha” abre el animal en Evolución clínica.
- **Contenido clínico:** diagnóstico, tratamiento y notas viven en cards separadas con icono y encabezado textual. Un valor `null` se presenta como “Sin información registrada”, nunca como espacio vacío.
- **Adjuntos:** card con contador y filas accesibles. Imágenes usan thumbnail `expo-image` con cache memoria/disco; documentos conservan glifo, nombre derivado del contrato, tipo y tamaño. Solo se abren URLs HTTPS absolutas; un fallo se anuncia sin exponer payloads clínicos.
- **Acciones:** “Editar registro” reutiliza la edición contextual existente. “Eliminar registro” abre `ConfirmDialog` y recién ejecuta la baja lógica al confirmar; no hay optimistic update. El éxito vuelve al origen e invalida historia global y evolución por animal; el historial de cambios permanece en el servidor.
- **Estados:** UUID inválido, carga, 404/403 seguro, offline con reintento, adjuntos vacíos, error de resolución de entidades y pérdida reactiva de permiso se diferencian. Los controles conservan targets de 44 × 44, el color no es la única señal y la pantalla desplaza con fuente ampliada.

## 50. Alta de veterinario (D29 / RFG-162)

El alta (`/veterinarians/new`) toma la jerarquía de `20-veterinarian-new.jpeg` y reemplaza el selector conceptual de usuario interno por el contrato atómico vigente. Solo `admin` y `shelter_manager` (`canManageVets`) acceden; una pérdida de capacidad desmonta el formulario y muestra “Sin permiso”.

- **Jerarquía:** textura vegetal decorativa, eyebrow “Veterinarios”, `ScreenHeader` único con “Nuevo veterinario” y cards elevadas para “Información profesional” y “Acceso a Refugiapp”. El contenido desplaza, mantiene ancho de lectura y no fija alturas alrededor de texto.
- **Información profesional:** nombre, apellido y matrícula obligatorios; correo, teléfono y notas opcionales. Labels visibles, ayudas y errores acompañan cada input.
- **Acceso opcional:** el switch accesible revela correo y contraseña inicial. El rol se presenta como badge fijo “Rol Veterinario”; no existe selector de roles, usuario existente ni UUID manual. La contraseña usa `PasswordField`, mínimo real de 12 caracteres y nunca se persiste ni vuelve a mostrarse.
- **Atomicidad:** el submit envía una sola operación `POST /veterinarians` con `createUser`. El servidor crea o reutiliza por correo y vincula dentro de la misma transacción; la UI explica que una falla no deja una cuenta huérfana.
- **Conflictos y resiliencia:** `LICENSE_NUMBER_ALREADY_EXISTS` se muestra junto a Matrícula; los conflictos de email/usuario vinculado se muestran junto al correo de acceso. Un error general, falta de permiso u offline conserva el borrador para reintento manual y no duplica envíos automáticamente.
- **Acciones y accesibilidad:** “Cancelar” y “Crear perfil” envuelven en ancho reducido, conservan targets mínimos y bloquean durante el envío. El éxito se anuncia a tecnologías asistivas y vuelve al listado.

## 51. Perfil de veterinario (D30 / RFG-163)

El detalle (`/veterinarians/[id]`) adopta la jerarquía de `21-veterinarian-profile.jpeg` sin introducir datos ni acciones ausentes del contrato. Los tres roles pueden consultarlo; editar, desactivar y reactivar requieren `canManageVets` (`admin`/`shelter_manager`).

- **Identidad:** fondo de textura, retorno rotulado “Veterinarios”, un único encabezado “Perfil veterinario” y card protagonista con avatar de iniciales, nombre contractual sin prefijo inventado, matrícula y badge de estado con icono + texto.
- **Información:** contacto e información profesional se separan en secciones con filas accesibles. Email, teléfono y notas ausentes usan fallbacks explícitos; nunca se deja un valor vacío.
- **Usuario vinculado:** la card de usuario muestra nombre, email, roles traducidos y estado de cuenta desde `VeterinarianResponseDto.user`. Cuando no existe vínculo se explica “Sin acceso vinculado”. Nunca se usa `userId` o un UUID como etiqueta visible y no se inventa una ruta de perfil de usuario inexistente.
- **Acciones y conservación:** editar y cambiar estado aparecen solo con capacidad de escritura. Desactivar y reactivar exigen `ConfirmDialog`; el copy previo y el diálogo aclaran que el historial clínico permanece asociado. No hay actualización optimista.
- **Resiliencia y accesibilidad:** UUID inválido, loading, ausencia, error, offline/reintento y pérdida reactiva de permiso se presentan por separado. El contenido desplaza con fuente ampliada, usa targets mínimos y conserva labels completos sin depender solo del color.

## 52. Certificación de Veterinarios (D31 / RFG-164)

Lista, alta y perfil se certifican como una experiencia continua mediante la matriz de `docs/design-validation/veterinarians.md`.

- **Responsive:** el listado limita el ancho de lectura con `sizes.contentMaxWidth`; formularios, acciones, identidad y usuario vinculado permiten crecimiento vertical y wrap sin fijar alturas alrededor de texto. Los controles conservan `sizes.touchTarget` con fuente al 200 %.
- **Roles:** `admin` y `shelter_manager` conservan gestión; `veterinarian` mantiene lectura. Si `canManageVets` se pierde durante la sesión, se desmonta el alta, se deshabilita la consulta de edición y cualquier confirmación abierta se cierra sin mutar.
- **Conflictos:** matrícula y correo se presentan junto al campo correspondiente, sin vaciar el borrador. Los mensajes no exponen payloads, request IDs ni identificadores internos.
- **Preservación:** desactivar/reactivar cambia disponibilidad mediante endpoints dedicados e invalida solo la raíz de veterinarios; no elimina el perfil, usuario vinculado ni historia clínica.

## 53. Listado de auditoría (D32 / RFG-165)

La ruta `/audit` adopta la jerarquía de `22-audit-list.jpeg` sin convertir los UUID del mockup en la identidad principal del actor. Solo `admin` (`canReadAudit`) puede montar el módulo y consultar la API; una pérdida de capacidad lo reemplaza inmediatamente por “Sin permiso”.

- **Encabezado y filtros:** textura decorativa, `ScreenHeader` “Auditoría / Registro de actividad del sistema” y badge textual “Solo administradores”. La card orgánica de filtros agrupa acción y tipo de recurso en `BottomSheet`, UUID opcional de actor y recurso, y rango de fechas. Los UUID inválidos se omiten de manera segura y un rango incompleto o invertido no dispara una nueva consulta.
- **Tarjetas:** cada evento muestra acción y recurso traducidos, identificador de recurso abreviado, actor enriquecido por nombre cuando está disponible y fecha relativa + absoluta. El fallback contractual conserva actor UUID solo durante el rollout; el email queda reservado al detalle. La lista nunca renderiza `metadata`.
- **Riesgo:** accesos denegados y fallos de login, refresh o recuperación se marcan “Riesgo alto” mediante badge con icono, texto, borde y color `danger`; el label accesible también incluye el riesgo. Los eventos normales no reciben una alerta falsa.
- **Paginación y resiliencia:** `FlatList` conserva el orden determinista del servidor, agrega páginas sin reordenar, ofrece “Cargar más eventos”, reintento específico si falla una página posterior, pull-to-refresh y fin explícito. Carga, vacío, vacío filtrado, error conectado y offline tienen estados diferenciados sin mostrar payloads ni metadata sensible.
- **Accesibilidad:** encabezados semánticos, targets mínimos, sheets descartables, controles con labels completos y señales de estado no cromáticas. Los selectores E2E se mantienen y el flujo Maestro abre el sheet antes de elegir una acción.

## 54. Detalle de auditoría (D33 / RFG-166)

La ruta `/audit/[id]` adopta la jerarquía de `23-audit-detail.jpeg` sobre los patrones compartidos de D03. Solo `admin` (`canReadAudit`) monta el módulo; una pérdida de capacidad lo reemplaza por “Sin permiso” sin ejecutar la consulta. La cabecera usa `ScreenHeader` `display` “Detalle de auditoría / Registro de actividad del sistema” y badge textual “Solo administradores” sobre textura decorativa.

- **Hero de evento:** card `outlined` con icono del tipo de recurso, acción y tipo traducidos, fecha relativa + absoluta y, para eventos sensibles, badge “Riesgo alto” con icono, texto y borde `danger`. Toda la señal de riesgo combina icono, texto y color; nunca depende solo del color.
- **Información del evento:** filas `MetadataRow` para acción, fecha y hora y tipo de recurso; UUID de recurso y de actor con botón `AuditCopyButton` (ícono `copy` → `check`, target de 44 × 44, label “Copiar …”) o “Sin identificador” cuando el contrato no lo expone; y `ActorRow` con nombre, iniciales y email. El email sigue reservado al detalle.
- **Metadatos:** el backend no fija las claves, por lo que se presenta una vista híbrida: los valores escalares se muestran como filas legibles con etiquetas en español para claves conocidas y humanizadas para el resto, las claves identificadoras (UUID, correlación, deduplicación, códigos) se pueden copiar, y una lista de objetos/arrays permanece en el JSON sanitizado. El bloque “Mostrar/Ocultar datos sanitizados” usa `accessibilityState.expanded` y solo aparece cuando hay contenido.
- **Copiado accesible:** `useCopyAuditText` envuelve `expo-clipboard`; copiar anuncia el resultado a tecnologías asistivas y muestra feedback textual (“Copiado”/“No se pudo copiar”) además del cambio de icono. Un fallo de copiado anuncia un mensaje seguro y no rompe la pantalla. Nunca se copian ni muestran secretos: la metadata se vuelve a sanitizar en el cliente.
- **Estados:** loading, offline con reintento, error con reintento y “Sin identificador” en los campos nulos. Los `testID` (`audit-copy-resource-id`, `audit-copy-actor-id`, `audit-metadata-json-toggle`) quedan estables para la regresión de RFG-167.

## 55. Inicio / dashboard (D36 / RFG-169)

La ruta `app/(app)/(tabs)/index.tsx` conserva la consulta existente (`GET /dashboard/overview`) y adopta la jerarquía editorial de `24-dashboard-home.jpeg` sin inventar métricas. El saludo (`HomeGreeting`) es el único `heading1` y combina `firstName` de la sesión con la fecha local `es-AR` (`Hoy, 10 de octubre`); nunca depende de texto en un bitmap. El atajo de cuenta sigue siendo `AccountMenuButton` (44 × 44).

- **Hero (`HomeHero`):** banner fotográfico de perro y gato sobre el asset `heroHome` (fotografía de stock 16:9 con atribución, ver `docs/brand-assets.md`), compuesto con `DecorativeImage` (oculto a AT, sin texto, `aspectRatio` 16:9, `cachePolicy="memory-disk"` y fallback PNG). Es ornamental y no comunica estado.
- **Resumen del día (`TodaySummaryCard`):** card `organic` con tres métricas (icono + valor + etiqueta): animales y en tratamiento desde `GET /dashboard/overview`, y cuidados pendientes exactos desde `src/application/home` (`total` de `GET /care-tasks?status=pending&page=1&limit=1`). Un conteo que no cargó se muestra como `—` con label accesible "sin datos"; nunca `NaN`.
- **Accesos rápidos (`HomeQuickAccess`):** grilla responsive de dos columnas que colapsa a una cuando el viewport o la fuente al 200 % no permiten dos. Cada tarjeta navega a un destino real —Animales (`/explore`), Cuidados (`/care-tasks`), Historia clínica (`/medical-records`) y Gastos (`/expenses`)—, con icono + texto (nunca solo color), chevron y target ≥ 44 × 44. Historia clínica se filtra por `canReadClinicalRecords`. El subtítulo usa conteos reales (registrados/pendientes/registros) con fallback neutro.
- **Prioridades de hoy (`TodayPriorities` + `HomePriorityRow`):** vista compacta best-effort de la página cargada de pendientes, ordenada por urgencia, con estado derivado `Vencida`/`Próxima`/`Pendiente` (icono + texto) y acceso a la agenda completa. El nombre del animal se resuelve por la cache compartida `animal-options`; sin coincidencia cae a "Animal no disponible", nunca a un UUID. Las filas están memoizadas y navegan al detalle de la tarea.
- **Estados:** skeleton estático de la nueva jerarquía (respeta reduce motion), vacío cuando no hay animales, error con reintento, offline con reintento y pull-to-refresh que refetchea el overview y el resumen. El `content` limita el ancho a `sizes.contentMaxWidth` (760 pt) centrado en tablet y reserva el inset de la bottom navigation.
- **Divergencias aceptadas:** no hay total monetario mensual (el contrato no publica agregación) y los accesos de Gastos muestran el total de registros; no hay unread count; las prioridades son best-effort sobre el conjunto cargado.

## Referencias técnicas

- [Expo SDK 57](https://docs.expo.dev/versions/v57.0.0/)
- [Expo Font 57](https://docs.expo.dev/versions/v57.0.0/sdk/font/)
- [Safe area context para Expo 57](https://docs.expo.dev/versions/v57.0.0/sdk/safe-area-context/)
- [Expo Symbols 57](https://docs.expo.dev/versions/v57.0.0/sdk/symbols/)
