const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

function isCalendarDate(year: number, month: number, day: number): boolean {
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  );
}

/**
 * Normaliza un valor proveniente del backend a una fecha de calendario
 * `YYYY-MM-DD`. El contrato serializa varias fechas (`intakeDate`, `birthDate`)
 * como ISO datetime pese a declararlas `format: date`; esta utilidad recorta la
 * parte de fecha y descarta valores vacíos, malformados o imposibles
 * (`2026-02-30`). Devuelve `null` cuando el valor no es una fecha de calendario.
 *
 * Es una validación pura transversal compartida por `animals` y
 * `application/animals` (ver ADR-0008); no conoce dominios ni red.
 */
export function toDateOnly(value: string | null | undefined): string | null {
  if (typeof value !== 'string' || value.trim() === '') {
    return null;
  }
  const candidate = value.trim().slice(0, 10);
  const match = DATE_ONLY_PATTERN.exec(candidate);
  if (match === null) {
    return null;
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  return isCalendarDate(year, month, day) ? candidate : null;
}
