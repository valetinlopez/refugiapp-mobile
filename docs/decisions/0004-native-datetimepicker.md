# ADR-0004: Selector de fecha y hora multiplataforma compartido

- Estado: aceptado
- Fecha: 2026-09-22

## Contexto

Los registros médicos exigen `occurredAt` (fecha y hora de atención) obligatoria, validada contra el `intakeDate` del animal y la fecha actual. El contrato del backend la recibe como string ISO 8601. El proyecto ya manejaba fechas en formularios como texto plano (p. ej. `dueAt` de tareas de cuidado y `occurredAt` de eventos generales), con formatos frágiles y errores de usuario frecuentes. Para el formulario clínico se busca un selector que reduzca errores de entrada y respete el selector nativo del sistema.

## Alternativas consideradas

1. Input de texto ISO (como `care-tasks`/eventos): descartado porque `occurredAt` es obligatoria en registros médicos y la validación cruzada con `intakeDate` vuelve costoso el ingreso manual; además el ticket prioriza UX clínica y accesibilidad.
2. Input nativo de React Native (`TextInput` con `datetime-local` en web): descartado porque la experiencia varía por plataforma y no ofrece el picker del sistema en iOS/Android.
3. `@react-native-community/datetimepicker`: seleccionado. Es el selector estándar de la comunidad, compatible con Expo SDK 57, incluido en Expo Go, y el backend valida igualmente el formato ISO; el picker solo construye el string, no reemplaza la validación.

## Decisión

- Usar `@react-native-community/datetimepicker` (versión fijada por `npx expo install` para SDK 57) para fechas de animales, vencimientos de tareas y `occurredAt` de registros médicos.
- Centralizar el comportamiento en `DateTimeField`: selector nativo en iOS/Android, secuencia fecha-hora en Android y `TextInput` validado como fallback web.
- Registrar el config plugin en `app.config.ts` (requerido para builds nativos).
- El valor se serializa a ISO con offset local mediante `toLocalDateTimeIso`; el esquema Zod sigue validando formato, `intakeDate <= occurredAt <= now`.

## Consecuencias positivas

- La fecha se elige con el selector del sistema, mejorando accesibilidad y precisión.
- La validación de negocio permanece en Zod puro y testeable, independiente del componente.

## Costes y riesgos

- Una dependencia nativa más; requiere validar el comportamiento real en iOS y Android.
- En web el picker degrada a una experiencia de input nativo del navegador; el flujo principal se valida en dispositivos.

## Criterios de revisión

- Toda fecha nueva debe reutilizar `DateTimeField` cuando necesite selección interactiva; no duplicar el patrón dentro de una feature.
- Si el selector de fecha fuese insuficiente para rango (desde/hasta en evolución clínica), evaluar ampliar el patrón sin cambiar el contrato.
