# Assets de marca — D02 (RFG-135)

Documento de procedencia, autoría, variantes y uso de los assets originales de marca de Refugiapp Mobile. La fuente de verdad de forma es el diseño del sistema (`design.md`); los binarios resueltos en runtime viven en `assets/images/brand/`.

## 1. Propósito

Crear los tres bloques decorativos de la experiencia móvil con material **original**, sin reutilizar capturas de `docs/design-references/` como fondos:

- **Hero de perro rescatado:** protagonista editorial de la cabecera de login (consumida en RFG-137).
- **Marca vegetal:** símbolo botánico mínimo de marca.
- **Textura de hojas:** patrón sutil de fondo para cabeceras editoriales.

Ningún asset incrusta texto, badges, botones ni información de estado: son ornamentales y ocultos a tecnologías asistivas (ver §4 y `design.md` §12/§34).

## 2. Procedencia y autoría

| Campo       | Valor                                                                                 |
| ----------- | ------------------------------------------------------------------------------------- |
| Autor/a     | Refugiapp Mobile (ilustración vectorial propia)                                       |
| Fuente      | Vectorial original, dibujado a mano en SVG (maestros en `docs/brand-assets/sources/`) |
| Herramienta | SVG + generación reproducible con `sharp` (`scripts/generate-brand-assets.mjs`)       |
| Licencia    | Uso interno de Refugiapp. © 2026. No reutilizar sin autorización de producto          |
| Fecha       | 2026-10-05                                                                            |

No existe imagen tomada de Internet, stock ni captura de la referencia. Cumple el criterio de aceptación de RFG-135: "los assets son originales".

## 3. Inventario

### 3.1 Archivos de runtime

`assets/images/brand/`:

| Asset               | WebP (densidades)                      | PNG fallback                  | Uso             |
| ------------------- | -------------------------------------- | ----------------------------- | --------------- |
| `hero-rescued-dog`  | `@1x` (360), `@2x` (720), `@3x` (1080) | `hero-rescued-dog.png` (1080) | Hero login      |
| `brand-leaf-mark`   | `@1x` (48), `@2x` (96), `@3x` (144)    | `brand-leaf-mark.png` (144)   | Marca vegetal   |
| `leaf-texture-tile` | `@1x` (80), `@2x` (160), `@3x` (240)   | `leaf-texture-tile.png` (240) | Fondo editorial |

- WebP es el formato primario (lossless para colores planos: nitidez sin peso). PNG-8 cuantizado es fallback ante fallo de decodificación.
- Un solo PNG (máxima densidad) alcanza como fallback; no se multiplican PNG por densidad.
- Densidades `@Nx`, autoría y pesos: ver tabla de pesos en §6.

### 3.2 Maestros vectoriales

`docs/brand-assets/sources/*.svg` (hero, marca y textura). Son la única fuente editable para regenerar binarios.

## 4. Uso decorativo y accesibilidad

- Todo decorativo se oculta a tecnologías asistivas. `DecorativeImage` (patrón de `src/components/patterns`) aplica `accessible={false}`, `accessibilityElementsHidden`, `importantForAccessibility="no-hide-descendants"` y `alt=""` por defecto.
- Si un asset llegara a informar identidad, se le pasa `accessibilityLabel` (modo informativo del wrapper) — hoy los tres son decorativos y no exponen label.
- El color nunca comunica estado; las hojas y la marca son ornamentales, no señal semántica.
- `expo-image` con `allowDownscaling` + `cachePolicy="memory-disk"` y baja prioridad (`low`) por ser no crítico.

## 5. Consumo desde la UI

El registro vive en `src/components/patterns/brandAssets.ts`:

```ts
import { DecorativeImage, resolveBrandSource } from '@/components/patterns';

const hero = resolveBrandSource('heroRescuedDog');

<DecorativeImage
  aspectRatio={1}
  fallbackSource={hero.png}
  source={hero.webp}
  contentFit="contain"
/>
```

- La densidad la resuelve en runtime el pipeline de assets de React Native/Metro (base name → variantes `@Nx`), no el código.
- La textura se consume con `contentFit="cover"` sobre la zona de la cabecera: `expo-image` SDK 57 no repite tiles; el tile está afinado para cubrir sin bordes visibles.
- Handoff RFG-137 (login editorial): componer el hero detrás de la tarjeta de acceso con `expo-image`, `contentFit`, posicionamiento, caché y atributos accesibles.

## 6. Peso y presupuesto

Pesos de los archivos generados (primer build, reproducible con el script):

| Archivo                     | Peso     |
| --------------------------- | -------- |
| `hero-rescued-dog@1x.webp`  | 5.7 KiB  |
| `hero-rescued-dog@2x.webp`  | 11.5 KiB |
| `hero-rescued-dog@3x.webp`  | 17.6 KiB |
| `hero-rescued-dog.png`      | 18.7 KiB |
| `brand-leaf-mark@1x.webp`   | 0.6 KiB  |
| `brand-leaf-mark@2x.webp`   | 1.0 KiB  |
| `brand-leaf-mark@3x.webp`   | 1.5 KiB  |
| `brand-leaf-mark.png`       | 2.7 KiB  |
| `leaf-texture-tile@1x.webp` | 0.8 KiB  |
| `leaf-texture-tile@2x.webp` | 1.5 KiB  |
| `leaf-texture-tile@3x.webp` | 2.4 KiB  |
| `leaf-texture-tile.png`     | 3.6 KiB  |

Presupuesto D02: < 160 KiB. Los assets solo entran al bundle cuando una ruta los importa (RFG-137); la export de validación mostró ~90 KiB total con el hero incluido.

## 7. Regeneración

```bash
npm run assets:brand   # node scripts/generate-brand-assets.mjs
```

Requiere `sharp` (devDependency). El script es determinista: regenerar produce los mismos binarios; reporta la tabla de pesos.

## 8. Trazabilidad

- Plan: D02 — Historia `RFG-135`.
- Épica: `RFG-133`; Sprint 15.
- Fuente de referencias visuales: `docs/design-references/README.md` (§4 reglas de assets).
- Desbloquea: D04 login editorial `RFG-137`.
