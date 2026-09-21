# ADR-0001: Arquitectura feature-based con rutas delgadas

- Estado: aceptado
- Fecha: 2026-09-20

## Contexto

Refugiapp Mobile consume una API modular con dominios diferenciados, permisos por rol y evolución independiente. Expo Router favorece navegación basada en archivos, pero sin una frontera explícita las rutas pueden acumular llamadas HTTP, estado, reglas de autorización y UI difícil de reutilizar.

Se evaluaron tres enfoques:

1. Organización exclusiva por tipo técnico (`components`, `hooks`, `services`) para todo el proyecto.
2. Organización feature-based, con infraestructura y UI compartidas en fronteras separadas.
3. Replicar en el móvil las capas `domain/application/infrastructure/interfaces` del backend.

## Decisión

Adoptar organización feature-based:

- `app/` contiene rutas y layouts delgados.
- `src/features/<feature>` agrupa API, componentes, hooks y tipos de cada capacidad.
- `src/core` concentra infraestructura transversal.
- `src/components` y `src/theme` concentran UI compartida.
- Cada feature y frontera transversal mantiene un `AGENTS.md` local.

No se replica la arquitectura hexagonal completa del backend porque el frontend no posee las mismas responsabilidades de persistencia y dominio. Se conserva, en cambio, el principio central de fronteras explícitas y dependencias dirigidas.

## Consecuencias positivas

- Los cambios de una feature quedan localizados.
- Las rutas permanecen legibles y enfocadas en composición.
- La UI compartida no depende del backend.
- Las reglas locales pueden evolucionar con cada dominio.
- Facilita ownership, testing y eliminación futura de features.

## Costes y riesgos

- Requiere disciplina para no importar internals entre features.
- Puede existir duplicación temporal antes de identificar una abstracción compartida real.
- Los contratos generados deben mantenerse separados de los modelos de vista.
- Features muy pequeñas pueden comenzar con pocos archivos; no se crearán carpetas vacías solo por simetría.

## Criterios de revisión

Revisar esta decisión si:

- Aparece lógica de dominio offline compleja que justifique capas adicionales.
- Varias features requieren una capa de aplicación compartida y explícita.
- La navegación deja de poder actuar como punto de composición sin ciclos.
