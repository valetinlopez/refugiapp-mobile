# ADR-0002: Cliente Fetch, sesión single-flight y lifecycle de Query

- Estado: aceptado
- Fecha: 2026-09-20

## Contexto

El boilerplate tenía Axios con un interceptor inicial, pero no normalizaba errores, no propagaba correlation IDs y podía ejecutar varios refresh simultáneos. TanStack Query estaba instalado sin provider ni integración con el lifecycle de React Native. La navegación tampoco distinguía una sesión restaurada de una sesión ausente.

## Decisión

- Usar un cliente central basado en `fetch`, con transporte inyectable.
- Generar `x-request-id` UUID para cada solicitud lógica.
- Reintentar una vez solo métodos HTTP idempotentes y dejar las mutations sin retry automático.
- Compartir una única promesa de refresh entre respuestas `401` concurrentes.
- Guardar access y refresh token juntos en una sola entrada de Secure Store.
- Exponer la sesión mediante React Context y reducer, sin store global adicional.
- Proteger grupos de Expo Router con `Stack.Protected` y mantener el splash hasta terminar el bootstrap.
- Conectar TanStack Query con NetInfo y AppState.
- Mantener un snapshot OpenAPI parcial versionado y una generación reproducible de tipos.

## Consecuencias

- El core no depende de una feature para invalidar sesión; expone un callback que el provider registra.
- El transporte falso reutiliza el mismo contrato que `fetch` y permite pruebas deterministas.
- El snapshot parcial debe ampliarse cuando se consuman nuevos endpoints.
- La protección de branch sigue siendo una configuración externa de GitHub; el workflow publica un único check `verify` para marcarlo como obligatorio.

## Alternativas consideradas

- Mantener Axios: descartado porque el ticket exige un cliente basado en `fetch` y el interceptor existente no resolvía single-flight.
- Añadir un store global: descartado porque la sesión es pequeña y el criterio exige Context/reducer.
- Usar MSW: válido, pero el adapter inyectable es más pequeño y funciona igual en tests unitarios y desarrollo aislado.
