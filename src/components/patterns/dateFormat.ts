const dateOnlyShortFormatter = new Intl.DateTimeFormat('es-AR', { dateStyle: 'short' });
const dateOnlyMediumFormatter = new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium' });
const dateTimeFormatter = new Intl.DateTimeFormat('es-AR', {
  dateStyle: 'short',
  timeStyle: 'short',
});

export function parseDateOnly(value: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (match === null) return new Date(NaN);
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12);
}

export function formatDateShort(value: string): string {
  const date = parseDateOnly(value);
  return Number.isNaN(date.getTime()) ? '' : dateOnlyShortFormatter.format(date);
}

export function formatDateMedium(value: string): string {
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value) ? parseDateOnly(value) : new Date(value);
  return Number.isNaN(date.getTime()) ? '' : dateOnlyMediumFormatter.format(date);
}

export function formatDateTime(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : dateTimeFormatter.format(date);
}

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

export function formatRelativeDateTime(value: string, now: Date = new Date()): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const elapsedMs = now.getTime() - date.getTime();
  if (elapsedMs < 0) return '';
  if (elapsedMs < MINUTE_MS) return 'ahora';
  const minutes = Math.floor(elapsedMs / MINUTE_MS);
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(elapsedMs / HOUR_MS);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(elapsedMs / DAY_MS);
  if (days < 7) return days === 1 ? 'ayer' : `hace ${days} d`;
  return '';
}
