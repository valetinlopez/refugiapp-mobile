# Gobierno de la documentación

## 1. Objetivo

La documentación de Refugiapp Mobile evoluciona junto con el código. Un cambio está incompleto cuando altera comportamiento, estructura o contratos y deja obsoletos los documentos afectados.

## 2. Principios

1. **Cercanía:** las reglas específicas viven junto al código mediante `AGENTS.md`.
2. **Una fuente por tema:** arquitectura, diseño, contratos y operación no compiten entre sí.
3. **Estado real:** se documenta lo implementado y los pendientes se marcan como tales.
4. **Cambio atómico:** código y documentación relacionada se actualizan en el mismo commit o PR.
5. **Trazabilidad:** decisiones relevantes se conservan como ADR, incluso cuando son reemplazadas.
6. **Sin duplicación extensa:** enlazar a la fuente de verdad en vez de copiar contratos completos.

## 3. Jerarquía de autoridad

Cuando dos documentos difieren:

1. El OpenAPI y la arquitectura del backend mandan sobre contratos HTTP y permisos.
2. `architecture.md` manda sobre fronteras y dependencias del móvil.
3. El `AGENTS.md` raíz define reglas globales.
4. El `AGENTS.md` local define reglas adicionales para su subárbol.
5. `docs/design.md` manda sobre decisiones visuales.
6. Un ADR explica por qué se tomó una decisión, pero no reemplaza el estado actual de `architecture.md`.

La contradicción debe corregirse; no se resuelve eligiendo silenciosamente el documento conveniente.

## 4. Matriz de actualización

| Cambio                                   | Documentos obligatorios a revisar                                                             |
| ---------------------------------------- | --------------------------------------------------------------------------------------------- |
| Nueva feature                            | `architecture.md`, `src/features/<feature>/AGENTS.md`, `docs/README.md` si agrega una guía    |
| Nuevo endpoint consumido                 | `AGENTS.md` de la feature, tipos OpenAPI generados y, si cambia un flujo, `architecture.md`   |
| Cambio de rol o permiso                  | `architecture.md`, `AGENTS.md` de features afectadas, tests de autorización visual            |
| Cambio de enum o invariante              | `architecture.md`, `AGENTS.md` de la feature y documentación visual si cambia su presentación |
| Cambio de rutas o navegación             | `architecture.md`, `app/AGENTS.md`, tests/export de Expo                                      |
| Cambio de cliente HTTP, storage o config | `architecture.md`, `src/core/AGENTS.md`, `README.md` si afecta operación                      |
| Nuevo token o componente compartido      | `docs/design.md`, `src/components/AGENTS.md` o `src/theme/AGENTS.md`                          |
| Nueva dependencia relevante              | `architecture.md`; ADR si afecta una decisión estructural                                     |
| Cambio de ambiente o comando             | `README.md` y guía operativa correspondiente                                                  |
| Decisión con alternativas y trade-offs   | Nuevo ADR en `docs/decisions/`                                                                |
| Deuda resuelta                           | Quitarla de “Pendientes” y moverla a “Implementado” en `architecture.md`                      |

## 5. Definition of Done documental

Antes de cerrar una tarea:

- [ ] Se leyó `architecture.md` y el `AGENTS.md` local.
- [ ] El comportamiento documentado coincide con el código y el backend.
- [ ] Las responsabilidades nuevas tienen dueño y frontera clara.
- [ ] Los endpoints, roles y enums no fueron inventados.
- [ ] Se actualizó el `AGENTS.md` local si cambió una regla o invariante.
- [ ] Se actualizó `architecture.md` si cambió una frontera o flujo.
- [ ] Se actualizó `docs/design.md` si cambió UI compartida.
- [ ] Se creó un ADR si la decisión tiene alternativas relevantes o impacto duradero.
- [ ] Los pendientes están marcados como pendientes.
- [ ] Los links relativos funcionan y no apuntan a rutas temporales.
- [ ] Los comandos de validación relevantes pasan.

## 6. Ciclo de vida de un `AGENTS.md`

### Creación

Crear un archivo local cuando aparece una nueva frontera con responsabilidad propia: feature, infraestructura, navegación, UI compartida o documentación. Usar la plantilla de `docs/templates/feature-AGENTS.template.md` para features.

### Actualización

Actualizarlo cuando cambien responsabilidad, dependencias, contrato, permisos, seguridad, invariantes o estrategia de test del área.

### División

Si un `AGENTS.md` mezcla responsabilidades independientes o supera una lectura práctica, dividir el módulo y colocar reglas más cercanas a cada subárbol.

### Retiro

Si desaparece una frontera, retirar su documento en el mismo cambio. Las decisiones históricas relevantes permanecen en ADRs.

## 7. ADRs

Los Architecture Decision Records viven en `docs/decisions` y usan numeración correlativa de cuatro dígitos.

Estados permitidos:

- `propuesto`
- `aceptado`
- `rechazado`
- `reemplazado por ADR-XXXX`

Un ADR aceptado no se reescribe para simular que el contexto anterior no existió. Si la decisión cambia, crear un ADR nuevo y marcar el anterior como reemplazado.

## 8. Revisión periódica

Además de la actualización por cambio, revisar el mapa documental antes de una release:

1. Comparar features reales con `architecture.md`.
2. Comparar endpoints consumidos con OpenAPI.
3. Buscar roles, enums y rutas obsoletos.
4. Confirmar que cada feature tenga `AGENTS.md`.
5. Revisar links y comandos.
6. Mover deuda resuelta entre pendientes e implementado.

La revisión periódica complementa, pero no sustituye, la actualización en cada cambio.
