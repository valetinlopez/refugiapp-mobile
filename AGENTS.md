# Reglas del proyecto Refugiapp Mobile

## Lectura obligatoria

- Leer `architecture.md` antes de modificar estructura, dependencias, navegación, seguridad o contratos de datos.
- Leer el `AGENTS.md` más cercano al archivo que se va a modificar. Sus reglas complementan este documento.
- Leer `docs/design.md` antes de crear o cambiar UI compartida, tokens o patrones visuales.
- Leer `architecture.md` del backend en `../refugiapp/architecture.md` antes de implementar o modificar consumo de endpoints.
- Consultar la documentación exacta de Expo SDK 57 en `https://docs.expo.dev/versions/v57.0.0/` antes de usar APIs de Expo.

## Idioma

- El código, nombres de componentes, hooks, variables, archivos técnicos, tests, commits técnicos y errores internos deben estar en inglés.
- La documentación para personas debe escribirse en español.
- Los valores de enums y contratos HTTP conservan exactamente el formato definido por el backend.

## Arquitectura

- El frontend usa arquitectura feature-based con Expo Router.
- `app/` contiene rutas y layouts delgados; compone features y providers, pero no implementa reglas de negocio ni llamadas HTTP.
- `src/features/<feature>/` contiene comportamiento por dominio organizado en `api`, `components`, `hooks` y `types` según necesidad.
- `src/core/` contiene infraestructura transversal: cliente API, configuración, storage seguro y futuros adaptadores de plataforma.
- `src/components/` y `src/theme/` contienen UI compartida sin conocimiento de endpoints ni reglas de una feature concreta.
- Una feature no debe importar internals de otra feature. La coordinación se realiza desde una ruta, un módulo de aplicación explícito o contratos compartidos.
- No crear abstracciones compartidas hasta que exista reutilización real o una frontera técnica clara.

## API y datos

- Consumir la API bajo el prefijo `/api/v1`; `config.apiBaseUrl` ya incluye ese prefijo.
- Los tipos de red deben generarse o derivarse de `openapi.json`. Los tipos escritos a mano son temporales y no son fuente de verdad.
- No inventar endpoints, roles, estados, campos ni permisos a partir de una pantalla o mockup.
- Los IDs principales son UUID.
- Los estados de animales siguen `animal_status`: `admitted`, `under_treatment`, `available_for_adoption`, `adopted`, `deceased`.
- Los estados persistidos de tareas son `pending`, `completed` y `cancelled`; `overdue`, `upcoming` y `clinical` son presentaciones derivadas.
- Los datos monetarios se manejan en centavos mediante `amountCents`.
- Toda lista paginada debe conservar el contrato y orden determinista documentados por el backend.
- Catálogo de especies/razas: `GET /species` y `GET /species/:id/breeds` devuelven `{ items: [{ id, slug, labelEs }] }` (razas con `speciesId` extra). El `slug` es la clave estable en inglés y se envía en `POST/PATCH /animals`; `labelEs` es solo presentación. La especie `other` y la raza `other` habilitan texto libre (`speciesOther`/`breedOther` no se persisten como campos separados: se colapsan al valor `species`/`breed`).
- `GET /species/:id/breeds` se consulta por UUID; el formulario conserva `id + slug` de la especie para pedir razas y enviar el slug.
- `animals.species/breed` siguen siendo texto libre para el backend (sin validación estricta contra el catálogo hasta S11); el frontend normaliza a slugs solo cuando el usuario elige una opción del catálogo y conserva texto libre histórico bajo la opción `Otra`.

## Seguridad

- Nunca almacenar tokens en AsyncStorage. Usar exclusivamente el adaptador de secure storage de `src/core/storage`.
- Nunca incluir tokens, passwords, credenciales, headers de autorización ni datos clínicos sensibles en logs o errores visibles.
- Usar HTTPS fuera del desarrollo local controlado.
- La autorización visual no sustituye la autorización del backend. La UI debe ocultar o explicar acciones no disponibles para el rol, pero asumir siempre que el servidor vuelve a validar.
- Implementar PKCE para OAuth2 si se incorpora un proveedor externo.

## Diseño y accesibilidad

- Todos los componentes compartidos consumen tokens de `src/theme`; no usar colores hexadecimales ni medidas arbitrarias dentro de componentes.
- Mantener áreas táctiles mínimas de 44 × 44, safe areas, escalado de fuente, labels accesibles y soporte para reduce motion.
- El color nunca es la única señal de estado.
- Actualizar `docs/design.md` junto con cualquier cambio de tokens, tipografía, patrones o reglas de accesibilidad.

## Testing y calidad

- Agregar unit tests para lógica de negocio, transformaciones y hooks.
- Agregar component tests con React Native Testing Library para comportamiento interactivo y accesibilidad.
- Reservar E2E para flujos críticos: login, renovación/cierre de sesión y flujo principal.
- Antes de finalizar un cambio ejecutar, según alcance: `npm run typecheck`, `npm run lint`, `npm run format:check`, `npm test -- --runInBand` y un export o arranque de Expo cuando cambie navegación o configuración nativa.

## Documentación viva

- La documentación forma parte del cambio, no es una tarea posterior.
- Si cambia una responsabilidad, convención, dependencia, endpoint consumido, permiso o invariante, actualizar el `AGENTS.md` local en el mismo cambio.
- Si cambia la estructura o el flujo entre capas, actualizar `architecture.md`.
- Si cambia una decisión técnica relevante, crear o actualizar un ADR en `docs/decisions/`.
- Si cambia configuración operativa, instalación o comandos, actualizar `README.md` y la guía correspondiente en `docs/`.
- No marcar como implementado comportamiento que solo esté planificado.
- Seguir la matriz y el checklist de `docs/documentation-governance.md`.
- Al crear una feature nueva, crear también `src/features/<feature>/AGENTS.md` usando `docs/templates/feature-AGENTS.template.md`.
