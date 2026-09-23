# ADR-0006: Sesión web limitada a la pestaña

- Estado: aceptado
- Fecha: 2026-09-23

## Contexto

Expo Secure Store no está disponible en web. Mantener el par de tokens solo en memoria evitaba almacenamiento persistente inseguro, pero también cerraba la sesión ante cualquier recarga del navegador durante los flujos operativos.

## Decisión

- Android/iOS continúan usando una única entrada atómica de Expo Secure Store.
- Web guarda el par de tokens en `sessionStorage` mediante el adaptador central de `src/core/storage`.
- La sesión web sobrevive recargas en la misma pestaña y termina al cerrarla.
- No se usan `localStorage`, AsyncStorage ni cookies accesibles desde JavaScript.
- Si el navegador bloquea `sessionStorage`, el adaptador degrada a memoria para mantener utilizable la sesión actual.

## Consecuencias

- Una recarga web puede restaurar la sesión y validarla con `GET /users/me`.
- Los tokens web siguen siendo accesibles al JavaScript de la misma pestaña; la aplicación debe mantener su disciplina contra XSS y no registrar tokens.
- Una sesión compartida entre pestañas o persistente después de cerrar el navegador requeriría un flujo backend con cookies `HttpOnly`, `Secure`, `SameSite` y protección CSRF.

## Alternativas consideradas

- Memoria solamente: descartada porque una recarga interrumpe tareas normales del usuario.
- `localStorage`: descartado porque prolonga la exposición y comparte credenciales entre pestañas.
- Cookie `HttpOnly`: es la alternativa más fuerte para una sesión web persistente, pero requiere cambiar el contrato de autenticación, CORS y la protección CSRF del backend.
