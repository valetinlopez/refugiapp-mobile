/**
 * Re-export de compatibilidad: la normalización `intakeDate`/`birthDate` vive
 * en `src/core/validation` (transversal a `animals` y `application/animals`).
 * Los consumidores de esta feature mantienen su import histórico.
 */
export { toDateOnly } from '@/core/validation';
