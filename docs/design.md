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

La referencia [`dashboard-organic-v1.png`](./design-references/dashboard-organic-v1.png) usa una base marrón oscura, superficies un poco más claras, tipografía serif de alto contraste para títulos y sans serif para información operativa. La jerarquía alterna un encabezado emocional, una tarjeta de resumen, tarjetas de animales, una agenda tabular y navegación inferior. Las esquinas son generosas; una tarjeta protagonista emplea una silueta más orgánica. Los acentos lima, naranja, coral, azul y gris separan estados.

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

`AppIcon` centraliza símbolos de `expo-symbols`, con SF Symbols en iOS y Material Symbols en Android/web. Se usan iconos simples, sólidos o de trazo consistente. Un icono decorativo se oculta a tecnologías de asistencia; uno interactivo requiere `accessibilityLabel` en el control que lo contiene. No se mezclan emojis con iconos de producto.

## 11. Fotografía animal

Priorizar retratos naturales, con ojos visibles, luz suave y fondo poco distractor. La fotografía debe informar identidad del animal, no decorar una operación. Usar relación 1:1 para avatar y entre 4:3 y 3:2 para tarjeta. Mantener el punto focal y ofrecer texto alternativo con el nombre del animal.

## 12. Imágenes transparentes y recortes

Un recorte transparente puede usarse una vez en una cabecera editorial. Debe conservar pelo, orejas y contorno, disponer de una imagen alternativa y no tapar texto al aumentar fuente. Si el recorte no es robusto en pantallas pequeñas, se sustituye por una fotografía rectangular con `cover`. Nunca incrustar texto, badges ni botones dentro del bitmap.

## 13. Botones y acciones

`primary` usa lima y se limita a una acción principal por contexto. `secondary` usa superficie elevada; `danger` confirma una consecuencia destructiva; `ghost` reduce peso visual. Todos tienen altura mínima de 48 pt, etiqueta visible, estado presionado, deshabilitado y ocupado. Un spinner sustituye temporalmente el contenido pero conserva la etiqueta accesible. Los botones solo de icono deben medir al menos 44 × 44 y tener nombre accesible.

## 14. Tarjetas y superficies

`default` agrupa contenido, `elevated` señala jerarquía, `outlined` sirve a bloques secundarios y `organic` identifica un único punto focal. No anidar más de dos niveles de superficie. Una tarjeta clicable debe usar un control accesible y no depender de que el usuario adivine la interacción.

## 15. Badges y estados

Los badges tienen texto, icono, tono y forma píldora. No se usa un punto de color aislado. Las etiquetas visibles se redactan en español; los valores de dominio permanecen en inglés. Para listas densas puede omitirse el icono solo si existe otra señal explícita y la etiqueta es inequívoca.

## 16. Avatares

Tamaños: 36, 48 y 72 pt. Los retratos usan recorte circular y borde cálido. Si falta la foto, mostrar hasta dos iniciales; nunca un espacio vacío ni una imagen genérica que pueda confundirse con el animal real.

## 17. Filas de tareas

Orden recomendado: avatar, hora y animal, tarea, responsable opcional y badge. La fila crece cuando el texto aumenta y puede reorganizar metadatos en pantallas estrechas. La etiqueta accesible concatena hora, animal, tarea, estado y responsable. Los divisores pertenecen al listado, no a la fila.

Prioridad visual: `completed` o `cancelled` son estados finales; para `pending`, primero se evalúa `overdue`, después `upcoming`, después `clinical`, y finalmente `pending`. Una tarea clínica vencida es **Vencida** en coral; el contexto clínico permanece en el título, iconografía secundaria o detalle.

## 18. Tarjetas de animales

Contienen fotografía, nombre como encabezado y estado explícito. La foto ocupa la zona superior; la información nunca se superpone a un área visual compleja. En móvil se muestran en carrusel accesible o cuadrícula adaptable; en listas operativas se prefiere una fila. No inventar estados como “en observación” si el backend no los expone.

## 19. Tarjetas de métricas

Muestran icono semántico, valor con Newsreader y etiqueta DM Sans. El número no comunica por sí solo: siempre necesita una etiqueta. Una métrica puede ser enlace si ofrece pista de navegación y área táctil completa. Limitar la cantidad visible y permitir desplazamiento o envoltura.

## 20. Navegación inferior

Máximo cuatro o cinco destinos estables. Cada elemento combina icono y texto; el activo usa lima, peso visual e `accessibilityState.selected`. Altura base de 72 pt más el inset inferior del dispositivo. La barra queda fija mientras el contenido principal desplaza. El catálogo muestra el componente, pero no reemplaza todavía la navegación funcional de producción.

## 21. Formularios

Etiqueta visible sobre el campo, ayuda y error debajo. No usar placeholder como única etiqueta. Altura mínima 48 pt, borde de foco claro, teclado y `autoComplete` apropiados, y agrupación semántica. Los errores explican qué corregir y se anuncian; no se indican solo en coral. Los datos monetarios se transforman a `amountCents` fuera del componente visual. Los selectores de estado muestran valores permitidos por el backend y respetan permisos del rol.

## 22. Estados de carga, vacío, error, offline y sin permisos

- **Carga:** spinner y texto que describe qué se carga; usar skeleton solo cuando refleje la estructura real y respetar reduce motion.
- **Vacío:** explicar qué falta y ofrecer una acción cuando el rol pueda realizarla.
- **Error:** mensaje recuperable, acción de reintento y detalles técnicos fuera de la UI de usuario.
- **Offline:** distinguir falta de red de un error del servidor y explicar sincronización.
- **Sin permisos:** explicar que el rol no habilita la acción; no mostrar un botón que fallará con 403. Puede ofrecer navegación segura.

## 23. Accesibilidad

Objetivo mínimo WCAG 2.2 AA donde aplica. Probar texto normal con contraste 4,5:1 y texto grande con 3:1. Mantener áreas táctiles de 44 × 44, orden de foco lógico, labels en controles, estados accesibles y zoom de fuente. Nunca truncar silenciosamente nombre, estado, vencimiento o error. No agregar animación indispensable; cualquier animación futura consultará `useReducedMotion` o la preferencia del sistema y tendrá alternativa estática.

## 24. Responsive layout

El contenido principal usa `ScrollView`/listas y safe areas. En móvil estrecho, las tarjetas envuelven o pasan a una columna; en tablet, el ancho de lectura se limita. No fijar alturas en tarjetas con texto. Probar al menos 320 × 568, 390 × 844, tablet, orientación horizontal cuando la pantalla la admita y fuente al 200 %. La navegación fija debe sumar el inset inferior y el contenido debe reservar espacio para ella.

## 25. Variantes según rol

- `admin`: puede ver administración, auditoría y todas las acciones; las acciones destructivas mantienen confirmación.
- `shelter_manager`: prioriza ingresos, animales, gastos, tareas generales y dashboard sin actividad clínica reciente. No mostrar creación o cierre clínico prohibido.
- `veterinarian`: prioriza animales, evolución clínica y tareas; no mostrar edición general de animal ni gestión de gastos.

La diferencia de rol modifica acciones y módulos, no la identidad visual. Ocultar o deshabilitar depende del contexto: ocultar acciones irrelevantes; deshabilitar solo cuando explicar la restricción aporte valor.

## 26. Correspondencia con enums del backend

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

## 27. Elementos que necesitan SVG

La primera versión no necesita `react-native-svg`: radios nativos resuelven tarjetas y `expo-symbols` resuelve iconografía. Incorporar SVG solo para una textura lineal de hojas, un separador orgánico escalable o una forma de marca que no pueda expresarse con layout. Debe ser decorativo, liviano y no contener texto ni información de estado.

## 28. Aspectos conceptuales del mockup

Son conceptuales: el perro recortado sobre la cabecera, las frases manuscritas, las hojas de fondo, la tarjeta ondulada, los conteos y nombres, el indicador de notificación y todos los ejemplos de agenda. No representan datos reales, requisitos de endpoint ni una obligación de layout. La pantalla de catálogo usa contenido ficticio explícito para validar componentes.

## 29. Uso correcto e incorrecto

| Correcto                                        | Incorrecto                                            |
| ----------------------------------------------- | ----------------------------------------------------- |
| Badge coral con icono y texto “Vencida”         | Punto coral sin etiqueta                              |
| Una tarjeta orgánica protagonista               | Todas las tarjetas con siluetas diferentes            |
| Newsreader en títulos y métricas                | Newsreader en formularios o párrafos extensos         |
| Lista desplazable que conserva tamaño táctil    | Comprimir cinco tareas para que entren en un viewport |
| Foto con foco, recorte y texto alternativo      | Texto incrustado en una foto                          |
| Acción oculta cuando el rol no puede ejecutarla | Acción visible que siempre responde 403               |
| Tarea clínica vencida presentada como “Vencida” | Azul clínico ocultando la urgencia                    |

## 30. Checklist para nuevas pantallas

- [ ] La pantalla pertenece a una feature y la ruta solo compone.
- [ ] Todos los colores, espacios, radios, tamaños y tipografías provienen de tokens.
- [ ] Hay un único encabezado principal y una jerarquía legible.
- [ ] El contenido puede desplazarse y respeta safe areas.
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

## Referencias técnicas

- [Expo SDK 57](https://docs.expo.dev/versions/v57.0.0/)
- [Expo Font 57](https://docs.expo.dev/versions/v57.0.0/sdk/font/)
- [Safe area context para Expo 57](https://docs.expo.dev/versions/v57.0.0/sdk/safe-area-context/)
- [Expo Symbols 57](https://docs.expo.dev/versions/v57.0.0/sdk/symbols/)
