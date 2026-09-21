# Reglas para `src/components`

## Responsabilidad

- Contiene UI reutilizable por varias features.
- Organiza primitivas, feedback, navegación y patrones compuestos.
- Implementa accesibilidad y consistencia visual sobre tokens compartidos.

## Límites

- No importar `src/features`, `src/core/api`, storage ni configuración de endpoints.
- No realizar llamadas HTTP ni conocer DTOs del backend.
- No codificar permisos de un rol específico; recibir capacidades o callbacks desde la feature.
- No agregar una abstracción compartida para un único uso salvo que represente una regla del sistema de diseño.

## Tokens

- Usar exclusivamente `src/theme` para color, tipografía, espaciado, radios, tamaños y sombras.
- No introducir hexadecimales ni medidas arbitrarias en componentes.
- Si falta un token generalizable, agregarlo en `src/theme` y actualizar `docs/design.md`.

## Accesibilidad

- Área táctil mínima de 44 × 44.
- `accessibilityLabel`, role y state en controles.
- Texto escalable y contenedores sin alturas rígidas cuando contienen información.
- Estado comunicado con texto/icono además de color.
- Animación futura compatible con reduce motion.

## Composición

- `primitives`: una responsabilidad visual pequeña.
- `feedback`: estados transversales de carga, vacío, error y offline.
- `navigation`: piezas de navegación, sin conocer rutas concretas.
- `patterns`: composición reutilizable sin acceso a datos remotos.

## Testing

- Probar comportamiento, accesibilidad y estados; evitar snapshots como única verificación.
- Cubrir callbacks, disabled/loading, selección y precedencia semántica cuando aplique.

## Documentación

- Actualizar `docs/design.md` al modificar API pública, variantes o reglas visuales.
- Mantener exports públicos en archivos `index.ts` del submódulo.
