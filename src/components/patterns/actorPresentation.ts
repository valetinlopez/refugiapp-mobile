export function formatActorName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`.replace(/\s+/g, ' ').trim();
}

export function getActorInitials(firstName: string, lastName: string): string {
  const first = firstName.trim().charAt(0);
  const last = lastName.trim().charAt(0);
  return `${first}${last}`.toUpperCase();
}

export function resolveActorLabel(
  displayName: string | null | undefined,
  fallbackId: string | null | undefined,
  systemLabel: string
): string {
  const name = displayName?.trim();
  if (name) return name;
  const fallback = fallbackId?.trim();
  if (fallback) return fallback;
  return systemLabel;
}
