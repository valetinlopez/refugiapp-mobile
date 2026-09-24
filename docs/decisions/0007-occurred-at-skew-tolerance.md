# ADR-0007: Tolerancia de skew de reloj para `occurredAt`

- Estado: aceptado
- Fecha: 2026-09-23

## Contexto

El formulario clínico exige `occurredAt` dentro de la ventana `intakeDate <= occurredAt <= now`. En la práctica la validación original rechazaba fechas válidas por dos causas:

1. El límite inferior se calculaba con `Date.parse(intakeDate + "T00:00:00")`, una cadena sin offset cuya interpretación depende de la zona horaria del dispositivo; la comparación entre el instante UTC de `occurredAt` y ese valor local resultaba frágil en bordes de día.
2. El límite superior comparaba contra `Date.now()` sin tolerancia. El picker serializa los segundos a `00` y los relojes de dispositivo tienen desfase, por lo que una hora recién elegida podía quedar a milisegundos "en el futuro" y ser rechazada.

Además, `GET /veterinarians?isActive=true` bloqueaba el render del formulario: cualquier fallo o lista vacía dejaba la pantalla en blanco, pese a que `veterinarianId` es opcional.

## Alternativas consideradas

1. Tolerancia 0 estricta: descartada porque replica el comportamiento roto del backend en el cliente; no resuelve el desfase de reloj ni el truncado de segundos del picker.
2. Tolerancia amplia (varios minutos): descartada porque permite registrar sin intención fechas claramente futuras.
3. Tolerancia de 60 segundos: seleccionada. Cubre skew de reloj típico de dispositivos móviles y el truncado de segundos del picker, manteniendo la semántica de "no futura".

## Decisión

- Comparar siempre instantes (ms) de `occurredAt` contra el inicio de día **local** de `intakeDate`, calculado como `new Date(year, month - 1, day)` en `utils/occurredAtWindow.ts`.
- Aceptar `occurredAt <= Date.now() + 60_000` en el esquema Zod (create y edit).
- El picker (`DateTimeField`) recibe `minimumDate` (inicio de día local) y `maximumDate` (`now + 60 s`) para no permitir elegir valores que el esquema rechazará.
- `GET /veterinarians` deja de ser bloqueante: el formulario se muestra con estados de carga, error y vacío reintentables, y permite guardar sin veterinario.

## Consecuencias positivas

- La validación de negocio permanece en Zod puro y testeable, ahora determinista respecto a la zona local.
- El formulario clínico nunca queda en blanco por una lista de veterinarios; el rol puede continuar con el registro.
- El picker y el esquema usan los mismos límites, eliminando falsos negativos.

## Costes y riesgos

- Se admite hasta 60 segundos "futuros" respecto al reloj del dispositivo; el backend sigue siendo la autoridad final y rechazaría valores realmente futuros.
- Requiere validación física en iOS y Android para confirmar el comportamiento del picker con estos límites.

## Criterios de revisión

- La ventana se mantiene como decisión de producto documentada en `medical-records/AGENTS.md`; cualquier cambio de tolerancia debe actualizar el ADR y el esquema juntos.
- Toda fecha nueva con ventana de negocio debe reutilizar `intakeStartOfDay` y la tolerancia de `occurredAtWindow` en lugar de duplicar `Date.parse`.
