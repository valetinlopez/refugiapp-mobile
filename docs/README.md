# Documentación de Refugiapp Mobile

Este directorio es el índice de documentación viva del frontend móvil.

## Mapa de documentos

| Documento                                                    | Propósito                                     | Cuándo actualizarlo                                                   |
| ------------------------------------------------------------ | --------------------------------------------- | --------------------------------------------------------------------- |
| [`../architecture.md`](../architecture.md)                   | Arquitectura, fronteras, flujos y estado real | Cambios estructurales, de dependencias, navegación, seguridad o datos |
| [`../AGENTS.md`](../AGENTS.md)                               | Reglas globales para contribuir               | Cambios de convenciones globales o gates                              |
| [`design.md`](design.md)                                     | Sistema visual y accesibilidad                | Tokens, componentes, patrones o reglas visuales                       |
| [`documentation-governance.md`](documentation-governance.md) | Política de mantenimiento documental          | Cambios en el proceso o catálogo documental                           |
| [`decisions/`](decisions/)                                   | ADRs de decisiones técnicas significativas    | Al tomar o reemplazar una decisión de arquitectura                    |
| [`../README.md`](../README.md)                               | Instalación, ejecución y orientación inicial  | Cambios operativos o de onboarding                                    |

## Reglas locales

Los `AGENTS.md` viven junto al código que gobiernan:

```text
app/AGENTS.md
src/core/AGENTS.md
src/components/AGENTS.md
src/theme/AGENTS.md
src/features/AGENTS.md
src/features/<feature>/AGENTS.md
docs/AGENTS.md
```

Antes de modificar un archivo se leen las reglas raíz y el `AGENTS.md` más cercano.

## Estado versus intención

Todo documento debe distinguir:

- **Implementado:** existe en código y fue validado.
- **Pendiente:** decisión deseada sin implementación completa.
- **Deuda conocida:** implementación existente que contradice o aún no alcanza el contrato objetivo.

Nunca presentar una intención futura como funcionalidad disponible.
