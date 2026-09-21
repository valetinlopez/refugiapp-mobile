# Reglas para `app`

## Responsabilidad

- Define rutas, grupos, layouts y opciones de navegación con Expo Router.
- Compone providers globales y pantallas de features.
- Resuelve redirecciones de alto nivel por sesión o rol cuando se implementen.

## Convenciones

- Mantener rutas delgadas: no llamar Axios, Secure Store ni APIs de plataforma directamente.
- Extraer UI reutilizable a `src/components` o a la feature correspondiente.
- Extraer queries, mutations y transformaciones a hooks o API de la feature.
- Usar route groups para organización sin convertirlos en segmentos públicos.
- Declarar providers globales solo en el layout raíz; providers de una feature deben vivir lo más cerca posible de su subárbol.

## Estructura actual

- `(auth)`: login público; no existe registro público en el backend.
- `(app)`: área autenticada.
- `(app)/(tabs)`: destinos principales.
- `design-system`: catálogo interno, no funcionalidad de producción.
- El layout raíz protege `(auth)` y `(app)` con `Stack.Protected` según el Session Context.

## Seguridad

- Una redirección de UI no sustituye permisos del servidor.
- No pasar tokens ni datos sensibles como route params.
- No persistir estado sensible en URL o deep links.
- Validar parámetros antes de usarlos en una query.

## Accesibilidad

- Cada pantalla debe tener jerarquía de encabezados, foco inicial razonable y safe areas.
- La navegación debe exponer roles y estados accesibles.
- No asumir una altura fija de viewport.

## Documentación y pruebas

- Actualizar `architecture.md` si cambia la jerarquía de rutas, providers o estrategia de protección.
- Ejecutar un export o arranque de Expo cuando cambien layouts o configuración.
- Agregar tests de navegación para redirects y guards cuando se implementen.
