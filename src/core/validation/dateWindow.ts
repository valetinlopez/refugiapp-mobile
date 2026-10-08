const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Tolerancia de skew de reloj para el límite superior de fechas: el servidor
 * acepta hasta 60 segundos en el futuro para no penalizar diferencias menores
 * entre dispositivos (ver ADR-0007).
 */
export const OCCURRED_AT_FUTURE_TOLERANCE_MS = 60_000;

/**
 * Inicio del día local (medianoche) de una fecha `YYYY-MM-DD`, expresado en
 * milisegundos. Se calcula en la zona horaria del dispositivo para que
 * `intakeDate` (que llega como fecha de calendario) no se corra de día.
 * Devuelve `null` si el valor no es una fecha de calendario válida.
 */
export function localDayStartMs(dateOnly: string): number | null {
  const match = DATE_ONLY_PATTERN.exec(dateOnly);
  if (!match) {
    return null;
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const start = new Date(year, month - 1, day, 0, 0, 0, 0);
  if (start.getFullYear() !== year || start.getMonth() !== month - 1 || start.getDate() !== day) {
    return null;
  }
  return start.getTime();
}

/** Variante `Date` de `localDayStartMs`; `null` si la fecha no es válida. */
export function localDayStart(dateOnly: string): Date | null {
  const startMs = localDayStartMs(dateOnly);
  return startMs === null ? null : new Date(startMs);
}
