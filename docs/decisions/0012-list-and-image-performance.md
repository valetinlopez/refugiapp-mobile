# ADR-0012: Virtualización, imágenes remotas y carga diferida

- Estado: aceptado
- Fecha: 2026-10-01
- Ticket: RFG-89 (épica RFG-54)

## Contexto

Los listados paginados de animales, tareas, usuarios, auditoría y veterinarios ya usaban `FlatList`, pero no compartían límites de ventana/lotes ni todos conservaban `renderItem` y datos derivados estables. Los avatares y comprobantes usaban `Image` de React Native sobre el `secureUrl` original de Cloudinary, sin controlar dimensiones ni una política explícita de caché. Usuarios y auditoría son módulos exclusivos de administración que no deberían evaluar su UI pesada antes de navegar a esas rutas.

Expo SDK 57 ofrece `expo-image` con downscaling, caché memoria/disco, lazy loading web y protección para vistas recicladas. Expo Router también ofrece `asyncRoutes`, pero en SDK 57 requiere opt-in y no soporta carga asíncrona en builds native de producción.

## Alternativas consideradas

1. **`FlatList` ajustada + `expo-image` + imports dinámicos acotados (elegida).** Cumple el contrato del ticket, mantiene dependencias dentro del SDK de Expo y permite fallbacks accesibles por módulo.
2. **FlashList.** Puede mejorar listados muy grandes, pero el ticket exige `FlatList` y sumar otra dependencia no aporta valor medido con las páginas actuales.
3. **Activar `asyncRoutes` global.** Simplifica el code-splitting web, pero en SDK 57 es experimental en native, no funciona en producción native y amplía el cambio a todas las rutas.
4. **Conservar `Image` de React Native.** Evita una dependencia, pero no da una política uniforme de caché ni `recyclingKey` para filas virtualizadas.

## Decisión

- Mantener `FlatList` para listados operativos y compartir `initialNumToRender`, `maxToRenderPerBatch`, `updateCellsBatchingPeriod`, `windowSize` y clipping solo en Android.
- Mantener keys UUID del backend, arrays derivados con `useMemo`, callbacks con `useCallback` y cards con `React.memo`.
- Usar `expo-image` para avatares y miniaturas remotas con `cachePolicy="memory-disk"`, `loading="lazy"`, downscaling, prioridad baja y `recyclingKey` estable.
- Transformar únicamente URLs HTTPS `res.cloudinary.com/.../image/upload/...`: `f_auto`, `q_auto`, `c_fill`, `g_auto` y dimensiones según contexto. Otros hosts y recursos `raw` quedan intactos.
- Cargar con `React.lazy` los componentes principales de usuarios y auditoría, detrás del guard visual, con `Suspense` y `LoadingState`. No activar `asyncRoutes` global mientras native production no esté soportado.

## Consecuencias

- Menor trabajo por lote y menos renders repetidos durante scroll y cambios de filtros.
- Menor transferencia y memoria decodificada para miniaturas Cloudinary, con reuso entre montajes mediante caché.
- El primer acceso a usuarios o auditoría puede mostrar brevemente un estado de carga; accesos posteriores reutilizan el módulo cargado.
- La ausencia de drops de frames debe corroborarse en un dispositivo real con datos grandes y el profiler; los tests unitarios no sustituyen esa medición.
- `React.lazy` difiere evaluación y habilita chunks en plataformas compatibles, pero no promete code-splitting native de producción bajo Expo SDK 57.

## Criterios de revisión

- Medir nuevamente al superar 100 filas visibles o incorporar cards más costosas; considerar FlashList solo con evidencia.
- Reevaluar `asyncRoutes` al migrar a una versión de Expo Router que soporte producción native.
- Ajustar tamaños Cloudinary si aparecen nuevos contextos visuales; no reutilizar una miniatura de 400 px como imagen de detalle a pantalla completa.
