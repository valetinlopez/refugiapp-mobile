/**
 * Deterministic Inicio greeting + date helpers (D36 / RFG-169).
 *
 * The greeting and the local `es-AR` date are derived from the session
 * (`firstName`) and the device clock, never from text baked into a bitmap.
 */
export type GreetingKey = 'morning' | 'afternoon' | 'evening';

const GREETING_LABELS: Record<GreetingKey, string> = {
  morning: 'Buenos días',
  afternoon: 'Buenas tardes',
  evening: 'Buenas noches',
};

const AFTERNOON_START_HOUR = 12;
const EVENING_START_HOUR = 20;

export function resolveGreetingKey(hour: number): GreetingKey {
  if (hour < AFTERNOON_START_HOUR) return 'morning';
  if (hour < EVENING_START_HOUR) return 'afternoon';
  return 'evening';
}

export function getGreeting(now: Date = new Date()): string {
  return GREETING_LABELS[resolveGreetingKey(now.getHours())];
}

/** Full greeting: the time-of-day salutation plus the session first name. */
export function getSessionGreeting(
  firstName: string | null | undefined,
  now: Date = new Date()
): string {
  const name = typeof firstName === 'string' ? firstName.trim() : '';
  const greeting = getGreeting(now);
  return name === '' ? greeting : `${greeting}, ${name}`;
}

const longDateFormatter = new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'long' });

/** Local `es-AR` date such as "Hoy, 10 de octubre". */
export function formatHomeDate(now: Date = new Date()): string {
  return `Hoy, ${longDateFormatter.format(now)}`;
}
