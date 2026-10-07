# ADR-0017: Barra de navegación inferior curva con `react-native-svg`

- Estado: aceptado
- Fecha: 2026-10-06
- Ticket: RFG-138 (épica RFG-133, D05), seguimiento de "alinear la navegación inferior"

## Contexto

D05 alineó la navegación inferior con el diseño objetivo: cuatro destinos, etiqueta visible "Cuidados" sobre la ruta `care-tasks` y estado activo no-cromático (pastilla sobre el icono + etiqueta `bodyStrong`). Al validar en dispositivo, producto pidió un tratamiento de **relieve/curva** en el borde superior de la barra para separarla visualmente del contenido. Además se detectó un defecto de layout: las pantallas `explore`, `care-tasks` y la sección Cuenta reservaban el inset inferior por duplicado (su `SafeAreaView` más el inset de la barra), dejando un "margen" visible en todas menos Inicio (que ya excluía el borde inferior).

El diseño objetivo (referencias versionadas en `docs/design-references/`) inspiró el arco decorativo, pero no es contrato funcional. La arquitectura vigente prohíbe incorporar `react-native-svg` mientras las formas nativas y `expo-symbols` resuelvan el caso (`architecture.md`, `docs/design.md §28`).

## Alternativas consideradas

1. **Barra flotante redondeada (sin dependencias).** Márgenes + `borderRadius` + borde + sombra sobre el `tabBar` nativo. Da relieve real y conserva los tabs nativos, pero no reproduce una curva real; se descartó por pedido explícito de una curva.
2. **Barra adosada con esquinas superiores redondeadas (sin dependencias).** Solo `borderTopLeftRadius`/`borderTopRightRadius` + sombra. Cambio mínimo, pero la curva es una esquina, no un relieve.
3. **Arco estático con `react-native-svg` (elegido).** Un `tabBar` custom dibuja un arco tenue en el borde superior sobre la superficie `surfaceSubtle`. Curva real, controlada por tokens, sin animación (reduce motion por construcción). Exige una excepción documentada a la regla "sin SVG".
4. **Muesca que sigue al destino activo.** Más fiel a ciertos mockups, pero requiere medir posiciones con `onLayout` y animar el `path`; frágil con 4 etiquetas, fuente al 200 % y rotación. Descartada.

## Decisión

- Incorporar `react-native-svg` (`15.15.4`, versión compatible con Expo SDK 57; viene incluida en Expo Go) **exclusivamente** para el borde decorativo de la barra inferior. La regla "sin SVG" se relaja con el mismo criterio de `docs/design.md §28`: una forma de marca que no se expresa con layout nativo.
- Implementar la geometría como una función pura y testeable (`tabBarCurvePath`/`tabBarCurveArchPath` en `src/components/navigation/tabBarCurve.ts`) y un `tabBar` custom (`CurvedTabBar` en `src/components/navigation`) que compone el arco SVG con el patrón compartido `BottomNavigation`; la ruta `app/(app)/(tabs)/_layout.tsx` solo lo conecta y le pasa la presentación (label/icono) por prop.
- Mantener una sola fuente del estado activo: `BottomNavigation` (catálogo y producción). El arco es estático; el destino activo se sigue marcando con la pastilla y el peso tipográfico.
- Corregir el doble inset: las pantallas del tab y la sección Cuenta usan `SafeAreaView edges={['top','left','right']}`; la barra es la única dueña del inset inferior.
- El arco es decorativo (`accessible={false}`, `importantForAccessibility="no-hide-descendants"`, `pointerEvents="none"`), no comunica estado ni contiene texto.

## Consecuencias

- **Gobernanza:** `architecture.md` y `docs/design.md §28` dejan de afirmar que la app no usa SVG; se actualiza la excepción y su alcance (solo el borde de la barra).
- **Paridad funcional:** al reemplazar la barra nativa se debe conservar el filtrado de `href: null` (roles y ruta legacy `inbox`), los labels accesibles en español, los targets de 44 × 44 y la navegación por `tabPress` con `canPreventDefault`.
- **Nueva dependencia nativa:** `react-native-svg` suma módulo nativo; sigue disponible en Expo Go y en los builds EAS de staging.
- **Responsive:** el ancho del `path` se recalcula con `useWindowDimensions`; se valida en 320 × 568, 390 × 844, tablet, horizontal y fuente al 200 %.
- **Reversión:** si la dependencia se rechaza, la alternativa es la barra flotante redondeada (alternativa 1), que vive solo en `tabBarStyle` sin SVG.

## Criterios de revisión

- Confirmar que el arco no introduce solapes con la gesture bar ni con el contenido al 200 % de fuente; si aparecen, reducir `sizes.bottomNavigationCurve`.
- Revisar el peso del bundle tras `react-native-svg` (`npm run release:scan`) en el próximo build de staging.
- Si el contrato de navegación incorpora una barra nativa curva (o `expo-router` expone una), reevaluar el componente custom.
