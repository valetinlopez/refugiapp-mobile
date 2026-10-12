# Reglas para `src/design-system`

## Responsabilidad

- Es el arnés interno de validación visual de las 25 referencias versionadas (D06 / RFG-139, ampliado en D36/D37).
- Mantiene el catálogo de casos reproducibles, los fixtures deterministas y la matriz de viewports.
- Expone `ReferenceValidationSection` para la ruta interna `/design-system`.
- No implementa reglas de negocio, endpoints, permisos ni pantallas de producción; no conoce features.

## Dependencias

- Puede importar `src/components`, `src/theme`, `src/types` y `src/core/validation` (validadores puros).
- No puede importar `src/features`, `src/core/api`, storage ni configuración de endpoints.
- Las rutas (`app/`) componen este módulo; el módulo no importa rutas ni Expo Router.

## Contenido

- `referenceCases.ts`: espejo tipado de la matriz D01 (`docs/design-references/README.md §2`). No inventa rutas, roles, estados ni permisos; transcribe el origen.
- `viewports.ts`: matriz fija de seis viewports (`320 × 568`, `390 × 844`, tablet, horizontal, fuente 200 %, reduce motion).
- `fixtures.ts`: datos sintéticos congelados (UUID fijos, fechas fijas, importes enteros). Prohibido incluir datos personales reales, URLs externas o llamadas de red. No importa `src/features`.
- `referencePreviews.tsx`: previsualizaciones que componen patrones compartidos y fixtures; cada caso debe poder renderizarse sin red. Renderiza además los seis estados de regresión (`default`, `loading`, `empty`, `error`, `offline`, `restricted`) con `testID` `ds-case-D06-NN-<estado>`.
- `testUtils.ts`: builders puros de los selectores estables de RFG-167 (`ds-case-D06-NN-<estado>` y `ds-case-preview-D06-NN`) para catálogo y tests.
- `components/`: `ReferenceCaseCard` (metadatos + checklist + preview + cobertura de regresión) y `ReferenceValidationSection` (agrupación por dominio).

## Invariantes

- 25 casos, ids `D06-01…D06-25`, un archivo de referencia por caso y sin duplicados.
- Los estados y tipos de divergencia pertenecen a los enums de `types.ts`.
- Los viewports provienen siempre de `REFERENCE_VIEWPORTS`; no repetir etiquetas a mano.
- Los fixtures no dependen del reloj (`DESIGN_SYSTEM_NOW` los ancla) ni de servicios externos.

## Accesibilidad

- Cada caso es un `summary` accesible con id, referencia, ruta, roles y estados.
- Los estados se comunican con texto e icono además de color (patrones y tokens existentes).
- No introducir hexadecimales ni medidas arbitrarias; usar `src/theme`.

## Testing

- Unit tests: invariantes del catálogo, matriz de viewports, determinismo de fixtures y builders de selectores.
- Component tests RNTL: metadatos y checklist del caso, render de los 25 casos y previews, y cobertura de los seis estados de regresión por caso (`referencePreviews.test.tsx`).
- Accesibilidad: `a11y.test.tsx` congelan el `summary` accesible de cada caso y la comunicación textual de los estados.
- Rutas y SEO: `routes.test.ts` verifica que cada ruta de la matriz D01 resuelve a un archivo real en `app/`.
- Al agregar o renombrar una referencia, actualizar también `docs/design-validation/checklist.md` y `docs/design-references/README.md`.

## Estado

### Implementado

- Catálogo de 25 casos con ruta, rol, estados, divergencias y checklist de seis viewports.
- Previews deterministas con patrones compartidos y fixtures sintéticos.
- Sección integrada en `/design-system` y cubierta por unit y component tests.
- Regresión de estados (RFG-167): 150 bloques `ds-case-D06-NN-<estado>` (6 por caso) con estados de feedback compartidos y tests de cobertura, accesibilidad y estabilidad de rutas.

### Pendiente o deuda conocida

- La validación manual por viewport en dispositivo y la certificación del release corresponden a `RFG-168`.
