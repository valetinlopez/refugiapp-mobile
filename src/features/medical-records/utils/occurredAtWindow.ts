/**
 * Re-export de compatibilidad: la ventana pura de fechas vive en
 * `src/core/validation` (transversal a `medical-records` y `animals`). Los
 * nombres conservan la semántica clínica de `intakeDate` para los consumidores
 * existentes de esta feature.
 */
export {
  localDayStart as intakeStartOfDay,
  localDayStartMs as intakeStartOfDayMs,
  OCCURRED_AT_FUTURE_TOLERANCE_MS,
} from '@/core/validation';
