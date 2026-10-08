# ADR-0018: Sheet inferior del sistema de diseño con `Modal` nativo

- Estado: aceptado
- Fecha: 2026-10-07
- Ticket: RFG-147 (épica RFG-133, D14), rediseño del cambio de estado del animal

## Contexto

D14 pidió presentar el cambio de estado como un **selector tipo sheet** (referencia `06-animal-status-change.jpeg`). Hasta ahora el sistema de diseño solo contaba con `ConfirmDialog`, un modal transparente centrado, y no había ningún patrón de sheet inferior. La app no incluye librerías de bottom sheet (`@gorhom/bottom-sheet`) ni las necesita para otros flujos, y el skill de React Native adoptado recomienda usar el `Modal` nativo antes que sheets JS para conservar gestos, accesibilidad y rendimiento de plataforma.

El cambio de estado además necesita una confirmación destructiva adicional para estados terminales (`adopted`, `deceased`), que ya existe como `ConfirmDialog`.

## Alternativas consideradas

1. **Librería de bottom sheet JS (`@gorhom/bottom-sheet`).** Reproduce snap points y arrastre, pero suma una dependencia pesada (reanimated + gesture-handler ya presentes, pero con superficie nueva), duplica el control de safe areas y no aporta valor para un selector simple. Descartada por sobre-ingeniería.
2. **Dos `ConfirmDialog` centrados (sin sheet).** Sin dependencias, pero no respeta la referencia de sheet y degrada la jerarquía de selección. Descartada por fidelidad visual.
3. **Patrón `BottomSheet` compartido sobre `Modal` nativo (elegido).** Un componente genérico en `src/components/feedback` con `Modal` (`animationType="slide"`, `transparent`), scrim, handle decorativo, superficie anclada al borde inferior, contenido desplazable y safe area inferior. Sin dependencias nuevas; el feature aporta contenido, labels y callbacks.

## Decisión

- Incorporar `BottomSheet` en `src/components/feedback` como patrón compartido del sistema de diseño, construido solo con tokens de `src/theme` y `Modal` nativo. No conoce endpoints, roles ni dominio.
- Usarlo en D14 desde `AnimalStatusSheet` (feature `animals`); los tickets de rediseño siguientes (RFG-148/149 y afines) pueden reutilizarlo sin cargarlo de reglas de dominio.
- Mantener `ConfirmDialog` como la confirmación destructiva y **encadenar** dos pasos: el sheet selecciona y, para estados terminales, cierra y abre `StatusConfirmDialog` (`danger`). El estado no terminal confirma directamente desde el sheet.
- La validación del `occurredAt` opcional es pura y testeable (`isValidStatusChangeOccurredAt`), con la misma tolerancia de skew de 60 s que eventos y clínica (ADR-0007); vacío delega la hora actual al backend.

## Consecuencias

- **Gobernanza:** `docs/design.md` documenta el patrón (nueva sección D14 y §35) y `src/components/AGENTS.md` lo agrega a `feedback`.
- **Accesibilidad:** backdrop con label en español y target de 44 × 44, título con `accessibilityRole="header"`, contenido desplazable para fuente al 200 %, `accessibilityViewIsModal` en el scrim.
- **Modal anidado:** al encadenar sheet → diálogo se cierra el sheet antes de montar el `ConfirmDialog`; se valida en dispositivo iOS/Android que no haya avisos de presentación.
- **Reversión:** si el sheet se reemplaza por una librería, la API pública de `BottomSheet` (`visible`, `title`, `onClose`, `children`) permite el cambio sin tocar la feature.

## Criterios de revisión

- Verificar el gesto de descarte y el retroceso de Android en dispositivo real.
- Confirmar que el sheet no recorta opciones con seis viewports de D06 y fuente al 200 %.
- Si aparece una necesidad real de snap points múltiples, reevaluar el uso de una librería.
