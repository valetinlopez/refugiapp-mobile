# Architecture Decision Records

Los ADRs registran decisiones técnicas relevantes, su contexto y sus consecuencias.

## Índice

| ADR                                                     | Título                                              | Estado   |
| ------------------------------------------------------- | --------------------------------------------------- | -------- |
| [ADR-0001](0001-feature-based-architecture.md)          | Arquitectura feature-based con rutas delgadas       | Aceptado |
| [ADR-0002](0002-fetch-session-and-query-lifecycle.md)   | Cliente Fetch, sesión y Query lifecycle             | Aceptado |
| [ADR-0003](0003-react-hook-form-and-image-picker.md)    | React Hook Form y expo-image-picker                 | Aceptado |
| [ADR-0004](0004-native-datetimepicker.md)               | Selector de fecha nativo para registros médicos     | Aceptado |
| [ADR-0005](0005-media-selection-and-upload-progress.md) | Selección de media y progreso de subida             | Aceptado |
| [ADR-0006](0006-web-session-storage.md)                 | Sesión web limitada a la pestaña                    | Aceptado |
| [ADR-0007](0007-occurred-at-skew-tolerance.md)          | Tolerancia de skew de reloj para `occurredAt`       | Aceptado |
| [ADR-0008](0008-animal-date-only-normalization.md)      | Normalización de fechas de animal a `date-only`     | Aceptado |
| [ADR-0009](0009-shared-animal-options-boundary.md)      | Frontera compartida de opciones de animales         | Aceptado |
| [ADR-0010](0010-veterinarian-user-create-user.md)       | Alta conjunta Veterinario-Usuario con `createUser`  | Aceptado |
| [ADR-0011](0011-maestro-e2e-per-role.md)                | E2E móvil por rol con Maestro                       | Aceptado |
| [ADR-0012](0012-list-and-image-performance.md)          | Virtualización, imágenes y carga diferida           | Aceptado |
| [ADR-0013](0013-eas-internal-distribution.md)           | Distribución interna EAS y seguridad de release     | Aceptado |
| [ADR-0014](0014-push-notifications-expo.md)             | Notificaciones push con Expo Push Service           | Aceptado |
| [ADR-0015](0015-brand-assets-marca-original.md)         | Assets de marca originales y pipeline de generación | Aceptado |
| [ADR-0016](0016-hero-stock-licenciado-pngtree.md)       | Hero de stock licenciado (Pngtree) con atribución   | Aceptado |
| [ADR-0017](0017-curved-tab-bar.md)                      | Barra de navegación inferior curva con SVG          | Aceptado |

## Cómo agregar una decisión

1. Copiar `../templates/ADR.template.md`.
2. Asignar el siguiente número correlativo.
3. Describir contexto, alternativas, decisión y consecuencias.
4. Actualizar esta tabla.
5. Si reemplaza otra decisión, actualizar el estado del ADR anterior.

Los ADRs explican historia y trade-offs. `architecture.md` sigue describiendo el estado actual.
