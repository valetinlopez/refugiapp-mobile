# Reglas para `docs`

## Responsabilidad

- Mantiene documentación humana transversal: diseño, gobierno documental, decisiones y guías operativas.
- `architecture.md` permanece en la raíz como entrada principal de arquitectura.
- `README.md` permanece en la raíz como entrada de instalación y ejecución.

## Idioma y estilo

- Escribir en español claro y directo.
- Mantener nombres de código, rutas, comandos, enums y payloads en inglés cuando correspondan al sistema.
- Usar links relativos dentro del repositorio.
- Preferir tablas para matrices y listas para checklists; evitar repetir bloques extensos de otra fuente.

## Exactitud

- Distinguir siempre implementado, pendiente y deuda conocida.
- No describir un endpoint como disponible sin comprobar backend/OpenAPI.
- No documentar secretos, URLs privadas, tokens, passwords ni datos reales de animales o personas.
- La imagen de referencia visual es inspiración, no contrato funcional.

## Mantenimiento

- Aplicar `documentation-governance.md` en cada cambio.
- Actualizar el índice `docs/README.md` cuando se agregue o retire una familia de documentos.
- Crear un ADR para decisiones técnicas con impacto duradero y alternativas reales.
- No modificar un ADR aceptado para cambiar su decisión; reemplazarlo con uno nuevo.

## Validación

- Ejecutar Prettier sobre Markdown.
- Comprobar que los links relativos y nombres de archivos sean correctos.
- Revisar que ejemplos de comandos coincidan con `package.json`.
