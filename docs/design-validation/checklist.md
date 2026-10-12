# Checklist de validación visual — D06 (RFG-139)

> Estado: ejecutado por arnés estructural (RFG-167). La checklist humana por dispositivo y la certificación del release pertenecen a RFG-168. La evidencia trazable vive en `docs/design-validation/regression-25.md`.

## 1. Propósito y alcance

D06 prepara la validación visual de las 25 referencias versionadas en `docs/design-references/`. No rediseña pantallas de producción: cada historia de rediseño (RFG-140…RFG-170) reutiliza estos casos y esta checklist, y la regresión y certificación finales pertenecen a `RFG-167` y `RFG-168`.

- Fuente de trazabilidad: `docs/design-references/README.md` (D01 / RFG-134).
- Sistema visual y accesibilidad: `docs/design.md`.
- Arnés y fixtures: `src/design-system` (`src/design-system/AGENTS.md`).
- Cada caso es reproducible desde `/design-system` y no depende de red ni de datos reales.
- La regresión automatizada de RFG-167 cubre los seis estados de presentación por caso con `testID` `ds-case-D06-NN-<estado>`.

## 2. Cómo usar la checklist

1. Levantar la app y abrir la ruta interna `/design-system` (sección "Validación de referencias (D06)").
2. Para cada caso, comparar el preview con la imagen `docs/design-references/<archivo>.jpeg`.
3. Recorrer los seis viewports de la sección 3 y tildar la matriz de la sección 5.
4. Registrar hallazgos como incidencia con el `Caso` (`D06-NN`) y el viewport afectado; no bloquear D06 por divergencias ya catalogadas como `pendiente` (pertenecen a su historia de rediseño).

## 3. Matriz de viewports (obligatoria para los 25 casos)

| Viewport      | Qué verificar                                                                               |
| ------------- | ------------------------------------------------------------------------------------------- |
| 320 × 568     | Sin recortes ni desbordes horizontales; el contenido desplaza.                              |
| 390 × 844     | Ritmo vertical, jerarquía y áreas táctiles de 44 × 44.                                      |
| Tablet        | Ancho de lectura limitado a 760 pt y centrado.                                              |
| Horizontal    | Solo cuando la pantalla lo admita; sin alturas rígidas alrededor de texto.                  |
| Fuente 200 %  | El texto escala sin colisionar y sin truncar silenciosamente datos críticos.                |
| Reduce motion | Sin animación indispensable; toda transición tiene alternativa estática (hoy solo opacity). |

## 4. Checklist transversal (aplicar a cada caso)

- [ ] La UI consume solo tokens de `src/theme` (sin hexadecimales ni medidas arbitrarias).
- [ ] Cada control mide al menos 44 × 44 y tiene nombre accesible.
- [ ] El estado se comunica con texto e icono, nunca solo con color.
- [ ] Los datos sensibles (nombres, emails, importes, clínica) no aparecen en logs ni en query keys.
- [ ] Los textos funcionales son nativos; ningún bitmap contiene texto, badges ni botones.
- [ ] Los assets decorativos están ocultos a tecnologías asistivas (`alt=""`).
- [ ] Las fechas se presentan en `es-AR` y el dinero en centavos formateados, nunca ISO crudo.

## 5. Matriz por referencia y viewport

Leyenda: `A` = cubierto por el arnés estructural (RFG-167: 6 estados por caso, accesibilidad, rutas y tokens); `☐` = validación manual en dispositivo pendiente (RFG-168). `Caso` enlaza con el `testID` `ds-case-D06-NN` del catálogo y con los bloques `ds-case-D06-NN-<estado>`.

| #   | Referencia                          | Caso   | 320×568 | 390×844 | Tablet | Horizontal | Fuente 200 % | Reduce motion |
| --- | ----------------------------------- | ------ | ------- | ------- | ------ | ---------- | ------------ | ------------- |
| 01  | `01-login.jpeg`                     | D06-01 | A       | A       | A      | A          | A            | A             |
| 02  | `02-more-section.jpeg`              | D06-02 | A       | A       | A      | A          | A            | A             |
| 03  | `03-my-profile.jpeg`                | D06-03 | A       | A       | A      | A          | A            | A             |
| 04  | `04-user-create.jpeg`               | D06-04 | A       | A       | A      | A          | A            | A             |
| 05  | `05-animal-detail-history.jpeg`     | D06-05 | A       | A       | A      | A          | A            | A             |
| 06  | `06-animal-status-change.jpeg`      | D06-06 | A       | A       | A      | A          | A            | A             |
| 07  | `07-animal-edit.jpeg`               | D06-07 | A       | A       | A      | A          | A            | A             |
| 08  | `08-animal-event-new.jpeg`          | D06-08 | A       | A       | A      | A          | A            | A             |
| 09  | `09-animal-files-upload.jpeg`       | D06-09 | A       | A       | A      | A          | A            | A             |
| 10  | `10-care-tasks-overview.jpeg`       | D06-10 | A       | A       | A      | A          | A            | A             |
| 11  | `11-care-task-new.jpeg`             | D06-11 | A       | A       | A      | A          | A            | A             |
| 12  | `12-care-task-detail.jpeg`          | D06-12 | A       | A       | A      | A          | A            | A             |
| 13  | `13-expenses-overview.jpeg`         | D06-13 | A       | A       | A      | A          | A            | A             |
| 14  | `14-expense-new.jpeg`               | D06-14 | A       | A       | A      | A          | A            | A             |
| 15  | `15-expense-detail.jpeg`            | D06-15 | A       | A       | A      | A          | A            | A             |
| 16  | `16-clinical-history-overview.jpeg` | D06-16 | A       | A       | A      | A          | A            | A             |
| 17  | `17-medical-record-new.jpeg`        | D06-17 | A       | A       | A      | A          | A            | A             |
| 18  | `18-medical-record-detail.jpeg`     | D06-18 | A       | A       | A      | A          | A            | A             |
| 19  | `19-veterinarians-list.jpeg`        | D06-19 | A       | A       | A      | A          | A            | A             |
| 20  | `20-veterinarian-new.jpeg`          | D06-20 | A       | A       | A      | A          | A            | A             |
| 21  | `21-veterinarian-profile.jpeg`      | D06-21 | A       | A       | A      | A          | A            | A             |
| 22  | `22-audit-list.jpeg`                | D06-22 | A       | A       | A      | A          | A            | A             |
| 23  | `23-audit-detail.jpeg`              | D06-23 | A       | A       | A      | A          | A            | A             |
| 24  | `24-dashboard-home.jpeg`            | D06-24 | A       | A       | A      | A          | A            | A             |
| 25  | `25-animals-list.jpeg`              | D06-25 | A       | A       | A      | A          | A            | A             |

## 6. Estados por caso

Los estados relevantes (incluidos `loading`, `empty`, `error`, `offline` y `restricted`) están codificados en `src/design-system/referenceCases.ts`. La regresión de RFG-167 materializa los seis estados de presentación por caso: `ReferencePreview` renderiza un bloque por estado con `testID` `ds-case-D06-NN-<estado>` (150 bloques) sobre los componentes compartidos de feedback (`LoadingState`, `EmptyState`, `ErrorState`, `OfflineState`, `FeedbackState`). Los `referencePreviews.test.tsx` y `a11y.test.tsx` garantizan la cobertura; esta checklist verifica la presentación en dispositivo.

## 7. Fixtures deterministas

- Viven en `src/design-system/fixtures.ts` con UUID, fechas e importes fijos.
- No contienen datos personales reales (solo identidades sintéticas `*@refugiapp.test`).
- No dependen de servicios externos ni del reloj (`DESIGN_SYSTEM_NOW` ancla los estados derivados).
- Los unit tests (`fixtures.test.ts`) garantizan determinismo, UUID válidos, enums de contrato y ausencia de URLs externas.

## 8. Trazabilidad

- ID del plan: D06 (tarea `RFG-139 — Preparar la validación visual de las referencias`; ampliado a 25 casos finales con D36/`RFG-169` y D37/`RFG-170`).
- Épica: `RFG-133 — Finalización visual y UX móvil según referencias 2026`.
- Dependencia funcional: D01 (`RFG-134`, completada).
- Consumidores: historias de rediseño `RFG-140…RFG-170`; **regresión ejecutada en `RFG-167`** (evidencia en `docs/design-validation/regression-25.md`); certificación del release en `RFG-168`.
