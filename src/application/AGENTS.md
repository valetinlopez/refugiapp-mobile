# Reglas para `src/application`

## Responsabilidad

- `src/application` es la frontera de coordinación entre features y dominios cuando existe reutilización real o una frontera técnica clara.
- No reemplaza a `src/core` (infraestructura transversal) ni a `src/features` (comportamiento de un dominio).
- Cada subárbol (p. ej. `animals/`) representa un contrato de aplicación compartido por varias features.

## Dependencias

- Puede importar `src/core`, contratos API generados (`src/core/api/generated`) y librerías de infraestructura.
- No puede importar `src/features`, `src/components` ni `src/theme`.
- No ejecuta red directamente: delega en el cliente HTTP de `src/core/api`.
- Las features pueden importar `src/application`; las rutas deben preferir componer a través de la feature que las usa.

## Reglas

- Centralizar aquí la lógica duplicada de coordinación entre features (misma query, misma transformación, mismo contrato) con su query key e invalidaciones propias.
- No colocar en `application` reglas de UI ni de presentación; los mensajes de error se traducen a texto seguro y accionable, sin payloads ni tokens.
- Los tipos de red se derivan de OpenAPI; los modelos de vista (p. ej. `AnimalOption`) pueden definirse aquí como contrato de la frontera.
- Toda nueva frontera de aplicación requiere su propio `AGENTS.md` y un ADR cuando la decisión sea estructural.

## Testing

- Unit tests para transformaciones y mappers con transporte falso en el límite HTTP.
- Hook tests para el contrato compuesto (estados de carga, error y fallback).
