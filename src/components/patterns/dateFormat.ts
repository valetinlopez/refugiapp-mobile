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
  const date = parseDateOnly(value);
  return Number.isNaN(date.getTime()) ? '' : dateOnlyMediumFormatter.format(date);
}

export function formatDateTime(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : dateTimeFormatter.format(date);
}
