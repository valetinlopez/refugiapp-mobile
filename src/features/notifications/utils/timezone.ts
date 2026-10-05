const FALLBACK_TIMEZONE = 'America/Argentina/Buenos_Aires';

/**
 * IANA timezone of the device. Falls back to the backend default when the
 * runtime does not expose `Intl` (older Hermes/edge runtimes).
 */
export function resolveTimezone(): string {
  try {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return typeof timeZone === 'string' && timeZone.length > 0 ? timeZone : FALLBACK_TIMEZONE;
  } catch {
    return FALLBACK_TIMEZONE;
  }
}
