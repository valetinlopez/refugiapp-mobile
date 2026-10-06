# ADR-0015: Assets de marca originales y pipeline de generación

- Estado: aceptado
- Fecha: 2026-10-05
- Ticket: RFG-135 (épica RFG-133, D02)

## Contexto

La épica RFG-133 exige finalizar la experiencia visual con assets de marca **originales**: un hero de perro rescatado, una marca vegetal y una textura de hojas. La regla D01 (RFG-134) prohíbe reutilizar capturas de `docs/design-references/` como fondos e impone naming `kebab-case`, uso exclusivamente decorativo y documentación de procedencia. La UI se consume con `expo-image` (SDK 57), y el sistema de diseño no permite pesos de bundle injustificados ni texto incrustado en bitmaps.

No había tooling de assets en el repo: `assets/images/` solo contenía iconos y splash. El proyecto no tenía dependencia de rasterización ni una receta reproducible.

## Alternativas consideradas

1. **Ilustración vectorial propia + `sharp` (elegida).** Maestros SVG versionados y una receta determinista (`scripts/generate-brand-assets.mjs`) que emite WebP `@1x/@2x/@3x` más un PNG fallback. Procedencia 100 % propia, licencia sin fricción, regenerable y revisable en PR.
2. **Fotografía del refugio recortada.** Más cercana a la "fotografía honesta" de `design.md`, pero no hay un set estable de imágenes originales disponible, es difícil versionar consistencia y complica licencia/privacidad.
3. **IA generativa con licencia comercial.** Rápido, pero la traza de autoría, las variantes de densidad y la consistencia vectorial son peores; el plan pidió una pieza original estable.
4. **PNG único a máxima densidad (sin WebP).** Simple, pero duplica el peso para colores planos y no aprovecha la compresión WebP.
5. **Import de densidad explícita (`import … from 'x@2x.webp'`).** Descartado por contratiempo de resolución: Metro trata `@Nx` como sufijo de escala y exige importar el **base name**; el import explícito no resuelve.

## Decisión

- Crear maestros vectoriales en `docs/brand-assets/sources/**/*.svg` e importarlos por **base name**; Metro empaqueta el set `@1x/@2x/@3x` y React Native resuelve la densidad por pixel ratio en runtime.
- Generar binarios con `sharp` (devDependency): WebP lossless primario (colores planos) y un único PNG-8 fallback a densidad máxima.
- Registrar los assets en `src/components/patterns/brandAssets.ts` (`resolveBrandSource(name)`) — la UI no conoce nombres de archivo.
- Introducir `DecorativeImage` en `src/components/patterns`: wrapper de `expo-image` que oculta decorativos a AT por defecto, permite modo informativo con `accessibilityLabel`, reserva `aspectRatio` (evita CLS), aplica `allowDownscaling`/`cachePolicy="memory-disk"`/prioridad baja y cae al PNG fallback ante error de decodificación (mismo patrón de `AppAvatar`).
- Ajustes de tooling para que Metro y análisis coexistan:
  - ESLint: `import/no-unresolved` ignora extensiones raster (el archivo literal no existe; Metro resuelve la variante).
  - Jest: `moduleNameMapper` de `.webp`/`.png` a stubs separados (Metro y Jest resuelven assets distinto).
  - `assets/images/brand/assets.d.ts`: declaración ambiente de módulos `*.webp`/`*.png` para TypeScript estricto.
- No se activa ningún endpoint, contrato ni permiso nuevo; cambios exclusivamente de UI.

## Consecuencias

- Cero imágenes ajenas o capturas en el bundle; todos los assets son originales y documentados.
- Peso total D02 < 160 KiB; los binarios solo entran al bundle cuando una ruta los importa (login en RFG-137), por lo que el bundle vigente no cambia.
- El consumo de `@Nx` delega la selección de densidad al pipeline de RN; no se duplica lógica de densidades en cliente.
- La textura no se repite como tile en runtime (`expo-image` SDK 57 no soporta `contentFit="repeat"`); se usa como capa `cover`, y el tile sigue siendo válido si en el futuro hay soporte nativo de patrones.
- Se agrega `sharp` como devDependency y un script reproducible; regenerar assets no requiere diseñadores.

## Criterios de revisión

- Al incorporar nuevos assets de marca, usar el mismo pipeline en `docs/brand-assets/sources/` y actualizar `docs/brand-assets.md` (procedencia, pesos, uso).
- Si RFG-137 necesita que el hero sea prioritario, pasar `priority="high"` explícito (no cambiar el default del wrapper).
- Si una futura plataforma soporta tiling, evaluar reusar la textura con patrones nativos sin cambiar la fuente.
- Mantener el invariante: decorativos ocultos a AT y sin estado; si un asset pasa a informar identidad se usa `accessibilityLabel` (modo informativo), nunca texto en bitmap.
