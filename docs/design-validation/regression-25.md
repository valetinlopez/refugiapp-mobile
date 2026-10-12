# Regresión visual y accesible de las 25 referencias — D34 (RFG-167)

> Estado: ejecutado (arnés estructural). Este documento es la evidencia trazable de RFG-167 y alimenta la certificación del release visual (RFG-168).

## 1. Propósito y método

RFG-167 ejecuta la regresión de las 25 referencias de `docs/design-references/`. La base es el arnés D06 (`src/design-system`, RFG-139): cada referencia se reproduce de forma determinista sin red, con fixtures sintéticos y con matrices de estados y viewports.

La ejecución combina:

1. **Evidencia automatizada (este cambio):** previews por estado con `testID` estable, tests estructurales de estados, accesibilidad, rutas y viewports; guard de que el arnés no importa features.
2. **Verificación humana en dispositivo:** matriz de seis viewports de `docs/design-validation/checklist.md`, perteneciente a la certificación de RFG-168. La celda `A` indica cobertura del arnés estructural; las celdas pendientes de ejecutar en dispositivo se marcan en RFG-168.

Las imágenes de referencia son inspiración, no contrato funcional. Cualquier discrepancia por contrato o accesibilidad se registra como divergencia aceptada (nunca como defecto) según la matriz D01.

## 2. Alcance

| Cobertura              | Detalle                                                                       |
| ---------------------- | ----------------------------------------------------------------------------- |
| Referencias            | 25 (01–23 + 24 Inicio + 25 Animales)                                          |
| Estados por caso       | 6 (default, carga, vacío, error, sin conexión, sin permisos) → 150 previews   |
| Viewports              | 320×568, 390×844, tablet, horizontal aplicable, fuente 200 %, reduce motion   |
| Selectores estables    | `ds-case-D06-NN`, `ds-case-D06-NN-<estado>`, `ds-case-preview-D06-NN`         |
| Fuente de trazabilidad | `docs/design-references/README.md §2` y `src/design-system/referenceCases.ts` |

## 3. Evidencia automatizada

| Test                                                 | Qué garantiza                                                                                                   |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `referencePreviews.test.tsx`                         | 25 previews de referencia y 150 bloques de estado (`ds-case-D06-NN-<estado>`), uno por cada estado y caso       |
| `a11y.test.tsx`                                      | Cada caso es `summary` accesible con label completo; los estados se comunican con texto y acciones recuperables |
| `routes.test.ts`                                     | Cada ruta de la matriz D01 resuelve a un archivo real en `app/` (deep links y web export estables)              |
| `referenceCases.test.ts`                             | 25 casos, ids `D06-01…D06-25`, enums conocidos, seis estados con label                                          |
| `viewports.test.ts` / `fixtures.test.ts`             | Seis viewports de la matriz y fixtures deterministas sin red ni datos reales                                    |
| `ReferenceCaseCard/ReferenceValidationSection` tests | La card muestra los seis estados de regresión y la sección renderiza los 25 casos con sus previews              |
| `Routes` de la sección 5                             | Verificación estructural de tokens, targets, texto+icono, `es-AR`/centavos y altas decorativas                  |

## 4. Lente SEO / semántica y web export

Regresión aplicada a descubribilidad y experiencia web (export de Expo):

- Cada pantalla conserva un único encabezado principal (`accessibilityRole="header"` vía `ScreenHeader`/`SectionHeader`) y jerarquía semántica legible por lectores.
- Labels accesibles en español y `testID` en inglés, estables para E2E y regresión.
- Los assets decorativos siguen ocultos a tecnologías asistivas (`alt=""`, `DecorativeImage`) y ninguno contiene texto, badges ni botones incrustados.
- La ruta interna `/design-system` declara `title` y `meta description` en `expo-router/head` para el documento web.
- Las rutas de la matriz se mantienen estables y verificadas sobre disco (`routes.test.ts`): deep links y URLs web no cambian.
- Fuente al 200 %: sin alturas rígidas en tarjetas con texto; contenido desplazable y acciones que envuelven.

## 5. Checklist transversal (verificada por el arnés)

- [x] La UI consume solo tokens de `src/theme` (los previews de estado usan únicamente primitivas y tokens).
- [x] Cada control conserva el estándar de 44 × 44 (`sizes.touchTarget`) y nombre accesible.
- [x] El estado se comunica con texto e icono, nunca solo con color (`LoadingState`, `EmptyState`, `ErrorState`, `OfflineState`, `FeedbackState`).
- [x] No se registran datos sensibles (fixtures sintéticos `*@refugiapp.test`; UUID fijos en fixtures).
- [x] Los textos funcionales son nativos; ningún bitmap aporta texto, badges ni botones.
- [x] Los decorativos están ocultos a tecnologías asistivas.
- [x] Las fechas se presentan en `es-AR` (`dateFormat`) y el dinero desde centavos (`formatAmountCents`).

## 6. Matriz de resultados por referencia

Leyenda de «Resultado»:

- `P` — Pasa arnés estructural (estados 6/6, accesibilidad y ruta real).
- `V` — Verificación en dispositivo pendiente (pertenece a RFG-168).
- Divergencias: `A` = aceptada por contrato/UX documentado (D01); no constituye defecto.

| #   | Referencia                          | Caso   | Estados (arnés) | Resultado |
| --- | ----------------------------------- | ------ | --------------- | --------- |
| 01  | `01-login.jpeg`                     | D06-01 | 6 / 6           | P         |
| 02  | `02-more-section.jpeg`              | D06-02 | 6 / 6           | P         |
| 03  | `03-my-profile.jpeg`                | D06-03 | 6 / 6           | P         |
| 04  | `04-user-create.jpeg`               | D06-04 | 6 / 6           | P         |
| 05  | `05-animal-detail-history.jpeg`     | D06-05 | 6 / 6           | P         |
| 06  | `06-animal-status-change.jpeg`      | D06-06 | 6 / 6           | P         |
| 07  | `07-animal-edit.jpeg`               | D06-07 | 6 / 6           | P         |
| 08  | `08-animal-event-new.jpeg`          | D06-08 | 6 / 6           | P         |
| 09  | `09-animal-files-upload.jpeg`       | D06-09 | 6 / 6           | P         |
| 10  | `10-care-tasks-overview.jpeg`       | D06-10 | 6 / 6           | P         |
| 11  | `11-care-task-new.jpeg`             | D06-11 | 6 / 6           | P         |
| 12  | `12-care-task-detail.jpeg`          | D06-12 | 6 / 6           | P         |
| 13  | `13-expenses-overview.jpeg`         | D06-13 | 6 / 6           | P         |
| 14  | `14-expense-new.jpeg`               | D06-14 | 6 / 6           | P         |
| 15  | `15-expense-detail.jpeg`            | D06-15 | 6 / 6           | P         |
| 16  | `16-clinical-history-overview.jpeg` | D06-16 | 6 / 6           | P         |
| 17  | `17-medical-record-new.jpeg`        | D06-17 | 6 / 6           | P         |
| 18  | `18-medical-record-detail.jpeg`     | D06-18 | 6 / 6           | P         |
| 19  | `19-veterinarians-list.jpeg`        | D06-19 | 6 / 6           | P         |
| 20  | `20-veterinarian-new.jpeg`          | D06-20 | 6 / 6           | P         |
| 21  | `21-veterinarian-profile.jpeg`      | D06-21 | 6 / 6           | P         |
| 22  | `22-audit-list.jpeg`                | D06-22 | 6 / 6           | P         |
| 23  | `23-audit-detail.jpeg`              | D06-23 | 6 / 6           | P         |
| 24  | `24-dashboard-home.jpeg`            | D06-24 | 6 / 6           | P         |
| 25  | `25-animals-list.jpeg`              | D06-25 | 6 / 6           | P         |

Divergencias aceptadas por caso: son las de la matriz D01 (etiquetas `implementado`, `contrato` y `ux`) y se conservan tal cual en `docs/design-references/README.md §2` y `referenceCases.ts`. Inicio y Animales validan adicionalmente los estados extendidos (loading, vacío, error, offline) y los guard de permisos aplicables (`canReadClinicalRecords`, `canEditAnimal`).

## 7. Recorrido manual sugerido (al certificar en dispositivo)

1. Abrir `/design-system` y comparar cada preview con `docs/design-references/<archivo>.jpeg`.
2. Alternar los seis viewports y marcar la matriz de `checklist.md §5`.
3. Activar fuente al 200 % y verificar wrap sin truncar y targets ≥ 44.
4. Activar reduce motion y confirmar que solo `opacity` aporta feedback.
5. Reportar cualquier bloqueo real (clipping, contraste, target, lector) con `Caso + viewport`; las divergencias `contract`/`ux` no se reportan como defectos.

## 8. Trazabilidad

- ID del plan: D34.
- Ticket: `RFG-167 — Ejecutar regresión visual y accesible de las 25 referencias`.
- Épica: `RFG-133 — Finalización visual y UX móvil según referencias 2026` (Sprint 22).
- Dependencias funcionales: `RFG-139` (arnés D06), `RFG-134` (matriz D01), todas las historias D02–D33 y las finales `RFG-169`/`RFG-170`.
- Bloquea: `RFG-168 — Certificar el release visual móvil`.
- Este documento reemplaza a `docs/design-validation/veterinarians.md` como evidencia de cierre; la certificación por vista de veterinarios sigue siendo su complemento por flujo.
