# ADR-0016: Reemplazo del hero por stock licenciado (Pngtree) con atribución

- Estado: aceptado
- Fecha: 2026-10-06
- Ticket: RFG-135 (épica RFG-133, D02), revisión posterior al build inicial

## Contexto

El hero inicial de D02 era una ilustración vectorial propia de un perro rescatado. En la revisión visual, el equipo desaprobó el resultado: el perro no alcanzaba la calidad esperada. Las hojas originales (marca vegetal y textura) se conservaron sin cambios.

Producto proveyó un PNG fotográfico transparente descargado de Pngtree (`13290632`, 3000×3000, fondo alfa real) como reemplazo del hero. Se confirmó que la licencia es el **plan gratuito con atribución**.

## Alternativas consideradas

1. **Pngtree gratuito con atribución (elegido).** Calidad visual adecuada sin coste; la atribución se documenta en `docs/brand-assets.md`. Implica aceptar que el hero ya no es "original propio" (relaja el criterio de RFG-135) y que la licencia gratuita limita uso comercial sin crédito.
2. **Ilustración vectorial propia rediseñada.** Mantiene el criterio "original", pero consumía más iteraciones de diseño y no se contaba con un ilustrador disponible en el sprint.
3. **Premium de Pngtree.** Mejor rango comercial, pero requiere compra y aprobación de presupuesto.
4. **Fotografía propia del refugio.** Ideal en `design.md` (§11 fotografía honesta), pero no hay un set estable y autorizado disponible.

## Decisión

- Reemplazar el hero del login por el PNG fotográfico de Pngtree (free, con atribución).
- Convertir el PNG a master cuadradado y recortado: `docs/brand-assets/sources/hero-rescued-dog-source.png` (1080×1080 transparente). El original de 3000×3000 no se versiona; se registra su SHA-256 (procedencia auditable).
- Formato de runtime: **un único WebP @3x** (1080, lossy q82) con `allowDownscaling` para densidades menores, más un **PNG-8 fallback a 360 px** como red de seguridad de bajo peso. Un hero fotográfico no justifica tres densidades WebP ni un PNG RGBA de ~500 KB en el bundle.
- La marca vegetal y la textura de hojas quedan como vectorial original (sin cambios).
- Mantener `brandAssets` y `DecorativeImage` sin cambios de API: solo cambian los binarios y la procedencia.

## Consecuencias

- El hero pasa de origin­al propio a stock licenciado: requiere **atribución a Pngtree** documentada (y en la UI de créditos si legal lo exige; candidato para RFG-137).
- Criterio RFG-135 "assets originales": se relaja expresamente para el hero con conformidad del PO; las hojas siguen siendo originales.
- Bundle: peso final D02 ≈ 128 KiB (< 160 KiB de presupuesto). El hero pesa 77,4 KiB (WebP @3x) + 37,3 KiB (fallback PNG-8).
- Calidad en dispositivos: al ser un único @3x, `expo-image` lo decodifica y downscala; sin múltiples densidades se reduce el peso total.
- El fallback PNG-8 es cuantizado (visiblemente inferior); solo se muestra si el dispositivo no decodifica WebP, caso residual en los targets actuales.

## Criterios de revisión

- Verificar la atribución de Pngtree en `docs/brand-assets.md` y agregarla a la pantalla de créditos si producto/legal lo requiere.
- Si se obtiene la licencia premium, actualizar procedencia y quitar el requisito de crédito, sin cambiar binarios.
- Re-mensurar el bundle cuando RFG-137 consuma el hero en el login: el presupuesto de <160 KiB corresponde al pipeline; el peso real del bundle se reporta ahí.
