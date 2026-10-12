import type { AnimalHistoryEvent, AnimalStatus } from '../types';

export const HISTORY_MISSING_VALUE_LABEL = 'Sin valor';

const ANIMAL_STATUS_LABELS: Record<AnimalStatus, string> = {
  admitted: 'Ingresado',
  under_treatment: 'En tratamiento',
  available_for_adoption: 'Disponible para adopción',
  adopted: 'Adoptado',
  deceased: 'Fallecido',
};

const ANIMAL_STATUSES = Object.keys(ANIMAL_STATUS_LABELS) as AnimalStatus[];

const UUID_PATTERN = /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi;

const STATUS_CHANGE_PATTERN = /\bfrom\s+["']?([a-z_]+)["']?\s+to\s+["']?([a-z_]+)["']?/i;

export function isAnimalStatus(value: string): value is AnimalStatus {
  return (ANIMAL_STATUSES as readonly string[]).includes(value.toLowerCase());
}

export function getHumanStatusLabel(status: AnimalStatus): string {
  return ANIMAL_STATUS_LABELS[status];
}

export function parseStatusChange(
  description: string
): { from: AnimalStatus; to: AnimalStatus } | null {
  const match = STATUS_CHANGE_PATTERN.exec(description);
  if (match === null) return null;
  const [, rawFrom = '', rawTo = ''] = match;
  const from = rawFrom.toLowerCase();
  const to = rawTo.toLowerCase();
  if (!isAnimalStatus(from) || !isAnimalStatus(to)) return null;
  return { from, to };
}

function sanitizeStatusTokens(text: string): string {
  let result = text;
  for (const status of ANIMAL_STATUSES) {
    result = result.replaceAll(status, ANIMAL_STATUS_LABELS[status]);
    const capitalized = status.replace(
      /(^|_)([a-z])/g,
      (_, sep: string, letter: string) => `${sep === '_' ? ' ' : ''}${letter.toUpperCase()}`
    );
    if (capitalized !== status) {
      result = result.split(capitalized).join(ANIMAL_STATUS_LABELS[status]);
    }
  }
  return result.replace(UUID_PATTERN, HISTORY_MISSING_VALUE_LABEL);
}

export function hasRawAnimalStatus(text: string): boolean {
  const lowered = text.toLowerCase();
  return ANIMAL_STATUSES.some((status) => lowered.includes(status));
}

export function humanizeHistoryDescription(
  event: Pick<AnimalHistoryEvent, 'description' | 'eventType'>
): string {
  const raw = event.description?.trim() ?? '';
  if (raw === '') return HISTORY_MISSING_VALUE_LABEL;

  if (event.eventType !== 'status_change') {
    const sanitized = sanitizeStatusTokens(raw);
    return sanitized.trim() === '' ? HISTORY_MISSING_VALUE_LABEL : sanitized;
  }

  const parsed = parseStatusChange(raw);
  if (parsed !== null) {
    return `Cambió de ${ANIMAL_STATUS_LABELS[parsed.from]} a ${ANIMAL_STATUS_LABELS[parsed.to]}`;
  }

  const sanitized = sanitizeStatusTokens(raw);
  if (sanitized.trim() === '' || hasRawAnimalStatus(sanitized)) {
    return HISTORY_MISSING_VALUE_LABEL;
  }
  return sanitized;
}
