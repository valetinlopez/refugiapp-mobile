# ADR-0005: selección de media y progreso de subida

- Estado: aceptado
- Fecha: 2026-09-23

## Contexto

La app necesita capturar fotos, elegir imágenes y adjuntar PDF, validar las mismas restricciones que el backend y mostrar progreso/cancelación en subidas multipart. El cliente HTTP general usa `fetch`, que no expone progreso de subida de forma portable en React Native.

## Decisión

- Usar `expo-image-picker` para cámara y galería, y `expo-document-picker` para PDF.
- Centralizar el límite de 10 MB y los MIME admitidos por contexto en `src/core/media`.
- Mantener `fetch` como transporte predeterminado y usar `XMLHttpRequest` solo cuando una solicitud declare `onUploadProgress`.
- Propagar cancelación mediante `AbortSignal` y limpiar best-effort los assets huérfanos que ya se hayan creado.

## Consecuencias

- Las pantallas reciben progreso real sin duplicar autenticación, correlation ID ni normalización de errores.
- Los cambios de permisos requieren regenerar el binario nativo.
- La validación local mejora la respuesta inmediata, pero el backend conserva la autoridad final sobre tipo, tamaño y autorización.
