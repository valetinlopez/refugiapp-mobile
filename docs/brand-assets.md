# Assets de marca — D02 (RFG-135)

Documento de procedencia, autoría, licencia, variantes y uso de los assets de marca de Refugiapp Mobile. La fuente de verdad de forma es el sistema de diseño (`design.md`); los binarios resueltos en runtime viven en `assets/images/brand/`.

## 1. Propósito

Crear los bloques decorativos de la experiencia móvil sin reutilizar capturas de `docs/design-references/` como fondos:

- **Hero de perro rescatado:** protagonista editorial de la cabecera de login (consumida en RFG-137). Es **fotografía de stock licenciada** (Pngtree, plan gratuito con atribución) — ver §2 y ADR-0016.
- **Hero de Inicio:** banner fotográfico de perro y gato de la portada (consumido en D36 / RFG-169). Es **fotografía de stock** (4461×2500) — ver §2.
- **Marca vegetal:** símbolo botánico mínimo de marca (ilustración vectorial original propia).
- **Textura de hojas:** patrón sutil de fondo para cabeceras editoriales (ilustración vectorial original propia).

Ningún asset incrusta texto, badges, botones ni información de estado: son ornamentales y ocultos a tecnologías asistivas (ver §4 y `design.md` §12/§34).

## 2. Procedencia, autoría y licencia

| Asset             | Procedencia                                          | Licencia / atribución                                                                                                                                                          |
| ----------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Hero (perro)      | Pngtree, PNG `13290632`, 3000×3000 RGBA transparente | Plan gratuito de Pngtree. **Atribución requerida**: "Perro rescatado" — https://es.pngtree.com/ (autor: conocer por ID `13290632`). Confirmar pantalla de créditos en RFG-137. |
| Hero (perro+gato) | Stock, foto `home-refugiapp.png`, 4461×2500 RGBA     | Stock con atribución. **Atribución pendiente**: completar sitio, autor e ID antes del merge (formato análogo a la fila Pngtree).                                               |
| Marca vegetal     | Ilustración vectorial propia (SVG dibujado a mano)   | Uso interno de Refugiapp. © 2026.                                                                                                                                              |
| Textura de hojas  | Ilustración vectorial propia (SVG dibujado a mano)   | Uso interno de Refugiapp. © 2026.                                                                                                                                              |

- El hero dejó de ser ilustración propia en la revisión visual (ADR-0016): producto lo reemplazó por stock licenciado. El criterio "assets originales" de RFG-135 queda **relajado expresamente para el hero**, con conformidad del PO; las hojas conservan ese criterio.
- Original de Pngtree (3,5 MB) **no** se versiona en el repo. Trazabilidad auditada:
  - SHA-256 del original Pngtree: `13dc71bf4a61ec40301e1b8ddd62146ae77bad7c9b9c5cf25a821f21b9f7588e`
  - Master cuadrado (`hero-rescued-dog-source.png`): `9f8196a99c1b7b5ef29c45a790edc2fe99edfe4a9182dbdcf4ddc0ec598e3f1c`
- Original de Inicio (`imagenes-uso/home-refugiapp.png`, 9,4 MB, git-ignorado) **no** se versiona en el repo. Trazabilidad auditada:
  - SHA-256 del original: `e362895aed3fc7be729301248b15dc1ff51e4c6ad40071caad7f87879b5cc1eb`
  - Master 16:9 (`hero-home-source.png`, 1600×897): `aa6f08e11785cb21dc181f872f8c9500093594f7c95e2de663aad2b7ccc63cfd`

## 3. Inventario

### 3.1 Archivos de runtime

`assets/images/brand/`:

| Asset               | WebP                                 | PNG fallback                        | Uso             |
| ------------------- | ------------------------------------ | ----------------------------------- | --------------- |
| `hero-rescued-dog`  | `@3x` (1080) — única densidad        | `hero-rescued-dog.png` (360, PNG-8) | Hero login      |
| `hero-home`         | `@3x` (1080) — única densidad        | `hero-home.png` (360, PNG-8)        | Hero de Inicio  |
| `brand-leaf-mark`   | `@1x` (48), `@2x` (96), `@3x` (144)  | `brand-leaf-mark.png` (144)         | Marca vegetal   |
| `leaf-texture-tile` | `@1x` (80), `@2x` (160), `@3x` (240) | `leaf-texture-tile.png` (240)       | Fondo editorial |

`hero-home` es un banner 16:9 (el ancho se versiona, el alto deriva del aspect ratio); `hero-rescued-dog` es cuadrado.

- **Héroes fotográficos:** un único WebP @3x que `expo-image` downscala según la densidad del dispositivo (calidad máxima sin triplicar pesos). El fallback es un PNG-8 cuantizado a 360 px: red de seguridad de bajo peso, de calidad inferior evidente, solo para plataformas sin WebP (caso residual).
- **Vectores:** WebP lossless (colores planos) + PNG-8 a densidad máxima como fallback.
- Densidades `@Nx`, autoría y pesos verificados: ver tabla en §6.

### 3.2 Maestros

`docs/brand-assets/sources/`:

| Master                        | Tipo   | Deriva de                                                                 |
| ----------------------------- | ------ | ------------------------------------------------------------------------- |
| `hero-rescued-dog-source.png` | Raster | Pngtree `13290632`, trim de márgenes + canvas cuadrado transparente 1080² |
| `hero-home-source.png`        | Raster | Stock `home-refugiapp.png`, reescalado a 1600×897 sin recorte ni retoque  |
| `brand-leaf-mark.svg`         | Vector | Ilustración propia                                                        |
| `leaf-texture-tile.svg`       | Vector | Ilustración propia (patrón tile 240²)                                     |

## 4. Uso decorativo y accesibilidad

- Todo decorativo se oculta a tecnologías asistivas. `DecorativeImage` (`src/components/patterns`) aplica `accessible={false}`, `accessibilityElementsHidden`, `importantForAccessibility="no-hide-descendants"` y `alt=""` por defecto.
- Ningún asset comunica estado; las hojas y el hero son ornamentales, no señales semánticas.
- `expo-image`: `allowDownscaling` (clave para el hero de densidad única), `cachePolicy="memory-disk"` y prioridad baja por ser no crítico.

## 5. Consumo desde la UI

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

- La densidad del hero la resuelve Metro en runtime (asset scale 3) y la baja `expo-image`.
- Handoff RFG-137 (login editorial): componer el hero detrás de la tarjeta de acceso con `expo-image`, `contentFit`, posicionamiento, caché y atributos accesibles; confirmar la atribución de Pngtree con producto/legal.

## 6. Peso y presupuesto

Pesos de los archivos generados (reproducibles con el script):

| Archivo                     | Peso      |
| --------------------------- | --------- |
| `hero-rescued-dog@3x.webp`  | 77,4 KiB  |
| `hero-rescued-dog.png`      | 37,3 KiB  |
| `hero-home@3x.webp`         | 115,7 KiB |
| `hero-home.png`             | 36,4 KiB  |
| `brand-leaf-mark@1x.webp`   | 0,6 KiB   |
| `brand-leaf-mark@2x.webp`   | 1,0 KiB   |
| `brand-leaf-mark@3x.webp`   | 1,5 KiB   |
| `brand-leaf-mark.png`       | 2,7 KiB   |
| `leaf-texture-tile@1x.webp` | 0,8 KiB   |
| `leaf-texture-tile@2x.webp` | 1,5 KiB   |
| `leaf-texture-tile@3x.webp` | 2,4 KiB   |
| `leaf-texture-tile.png`     | 3,6 KiB   |

**Total D02 ≈ 128,7 KiB (< 160 KiB de presupuesto).** El hero fotográfico es el gran aporte; la única densidad WebP + el fallback cuantizado mantienen el peso controlado. Los binarios solo entran al bundle cuando se importan (RFG-137). (Alt: un PNG RGBA de fallback a 720 px pesaba ~509 KiB y quedó descartado.)

**D36 (RFG-169) suma ≈ 152,1 KiB** por el hero fotográfico de Inicio (`hero-home`: WebP @3x de 1080 px + PNG fallback, misma receta que el hero de login). Es fotografía, así que pesa un orden de magnitud más que los vectores; solo entra al bundle cuando `HomeHero` lo importa.

## 7. Regeneración

```bash
npm run assets:brand   # node scripts/generate-brand-assets.mjs
```

- Requiere `sharp` (devDependency). El pipeline es determinista (incluye limpieza de densidades obsoletas): regenerar produce los mismos binarios.
- El hero se regenera desde el master `hero-rescued-dog-source.png`; si se cambia el recorte, regenerar el master desde el original de Pngtree y actualizar los SHA256 de esta tabla.
- El hero de Inicio se regenera desde el master `hero-home-source.png` (derivado una vez del original `imagenes-uso/home-refugiapp.png`); si cambia la foto provista, regenerar el master y actualizar los SHA256 de esta tabla.

## 8. Trazabilidad

- Plan: D02 — Historia `RFG-135`.
- Épica: `RFG-133`; Sprint 15.
- Decisiones: ADR-0015 (pipeline), ADR-0016 (hero stock Pngtree con atribución).
- Desbloquea: D04 login editorial `RFG-137`.
- `hero-home` (foto perro+gato) se incorpora en D36 / `RFG-169`; es fotografía de stock con atribución pendiente (ver §2) y se consume vía `brandAssets`/`resolveBrandSource` en `HomeHero` de la feature `dashboard`.
