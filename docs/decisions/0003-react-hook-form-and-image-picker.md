# ADR-0003: React Hook Form y expo-image-picker para el alta de animales

- Estado: aceptado
- Fecha: 2026-09-21

## Contexto

El alta de animales exige un formulario con validación en español (nombre, especie, sexo, estado, fecha de ingreso, raza y fecha de nacimiento) más foto de perfil opcional subida como multipart huérfana. El boilerplate no incluía gestión de formularios (el login usa estado local) ni acceso a la galería. La validación debe espejar `CreateAnimalDto` del backend sin duplicar su contrato a mano.

## Alternativas consideradas

1. Estado local + validación manual (como `LoginForm`): descartado porque no escala a siete campos con reglas cruzadas (`birthDate <= intakeDate`) y duplica lógica ya resuelta por el esquema Zod, que además es testeable en aislamiento.
2. Formik: descartado porque suma más peso de bundle y su integración con Zod es menos directa que `zodResolver`.
3. Selector de archivos propio con `expo-document-picker`: descartado porque no ofrece recorte 1:1 ni acceso optimizado a la galería de fotos en iOS/Android.

## Decisión

- Usar `react-hook-form` con `zodResolver` y un esquema Zod dedicado (`createAnimalSchema`) cuyos mensajes están en español y cuyos enums copian `animal_sex` y `animal_status` del backend.
- Usar `expo-image-picker` (versión fijada por `npx expo install` para SDK 57) solo para elegir la foto de perfil, con recorte 1:1, límite de 10 MB validado en cliente (tope del backend) y permiso `photosPermission` declarado en `app.json` con mensaje en español.
- Zod ya era dependencia del proyecto; se agregan `react-hook-form`, `@hookform/resolvers` y `expo-image-picker`.

## Consecuencias positivas

- La validación vive en una función pura con unit tests, separada del renderizado.
- El formulario conserva accesibilidad (labels, radiogroup, errores con `role="alert"`) y tokens de `src/theme`.
- La subida sigue usando el `HttpClient` existente (multipart sin boundary manual) y el transporte falso en tests.

## Costes y riesgos

- Tres dependencias más que mantener y auditar; `expo-image-picker` suma un config plugin con permisos nativos.
- En web la experiencia de picker depende del navegador; el flujo principal se valida en iOS/Android.

## Criterios de revisión

- Si futuros formularios necesitan un date-picker nativo o un select compartido, evaluar extraer un campo reutilizable a `src/components` en lugar de repetir el patrón por feature.
- Si el backend cambia `CreateAnimalDto`, el esquema Zod y el snapshot `openapi/mobile.openapi.json` deben actualizarse juntos.
