import { isCalendarDate } from './createAnimalSchema';

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function toDateOnly(value: string | null | undefined): string | null {
  if (typeof value !== 'string' || value.trim() === '') {
    return null;
  }
  const candidate = value.trim().slice(0, 10);
  return DATE_ONLY_PATTERN.test(candidate) && isCalendarDate(candidate) ? candidate : null;
}
