import { isUuid } from '@/core/validation';

/**
 * Extracts the `careTaskId` carried in a push notification payload. Only a
 * valid UUID is accepted so a malformed or spoofed payload can never navigate
 * to an arbitrary route.
 */
export function resolveCareTaskId(data: unknown): string | null {
  if (typeof data !== 'object' || data === null) {
    return null;
  }
  const candidate = (data as { careTaskId?: unknown }).careTaskId;
  return typeof candidate === 'string' && isUuid(candidate) ? candidate : null;
}
