# Reglas para `src/theme`

## Responsabilidad

- Es la fuente ejecutable de tokens visuales y del provider de tema.
- Define color, tipografía, espaciado, radios, tamaños y sombras reutilizables.

## Convenciones

- Los nombres de tokens expresan función, no una pantalla concreta.
- Mantener escala de espaciado basada en múltiplos de 4.
- Reservar colores semánticos para significado consistente.
- Los estilos tipográficos definen tamaño, line height y familia; evitar pesos sintéticos cuando existe una fuente cargada.
- Las sombras deben funcionar en iOS, Android y web o degradar de forma segura.

## Accesibilidad

- Verificar contraste WCAG AA en combinaciones documentadas.
- Definir texto inverso explícito para superficies semánticas claras.
- No eliminar focus, font scaling ni estados de interacción.

## Dependencias

- No importar features, API, storage ni navegación.
- `ThemeProvider` no debe introducir reglas de negocio.

## Cambios

- Todo cambio de token requiere actualizar ejemplos y tablas de `docs/design.md`.
- Si un cambio rompe la API pública de tokens, documentar migración y considerar un ADR.
- Ejecutar el catálogo `/design-system`, typecheck, component tests y export de Expo.
