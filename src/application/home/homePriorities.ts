import type { HomePriorityTask } from './homeApi';

/**
 * Derived care-task priority states for Inicio (D36 / RFG-169).
 *
 * `overdue`, `upcoming` and `pending` are presentation states: they are never
 * persisted nor sent to the backend. The 24-hour `upcoming` window mirrors the
 * one already used by the `care-tasks` feature so the dashboard and the agenda
 * communicate the same thing.
 */
export type HomePriorityState = 'pending' | 'upcoming' | 'overdue';

const UPCOMING_WINDOW_HOURS = 24;
const HOUR_MS = 60 * 60 * 1000;

export interface HomePriority extends HomePriorityTask {
  state: HomePriorityState;
}

export function resolveHomePriorityState(
  dueAt: string | null,
  now: Date = new Date(),
  upcomingWindowHours = UPCOMING_WINDOW_HOURS
): HomePriorityState {
  if (dueAt === null || dueAt === '') return 'pending';
  const dueAtMs = new Date(dueAt).getTime();
  if (Number.isNaN(dueAtMs)) return 'pending';
  if (dueAtMs < now.getTime()) return 'overdue';
  if (dueAtMs - now.getTime() <= upcomingWindowHours * HOUR_MS) return 'upcoming';
  return 'pending';
}

function dueAtSortValue(dueAt: string | null): number {
  if (dueAt === null || dueAt === '') return Number.POSITIVE_INFINITY;
  const dueAtMs = new Date(dueAt).getTime();
  return Number.isNaN(dueAtMs) ? Number.POSITIVE_INFINITY : dueAtMs;
}

/**
 * Orders the loaded pending page by urgency — the most overdue first and the
 * undated tasks last — and attaches the derived state. This runs only over the
 * best-effort page already loaded; it never claims to be the global next-due
 * ordering, which the contract does not publish.
 */
export function buildHomePriorities(
  tasks: readonly HomePriorityTask[],
  now: Date = new Date()
): HomePriority[] {
  return tasks
    .map((task) => ({ ...task, state: resolveHomePriorityState(task.dueAt, now) }))
    .sort(
      (left, right) =>
        dueAtSortValue(left.dueAt) - dueAtSortValue(right.dueAt) || left.id.localeCompare(right.id)
    );
}

const timeFormatter = new Intl.DateTimeFormat('es-AR', {
  hour: '2-digit',
  minute: '2-digit',
});

/** Formats the due time in `es-AR`, never exposing the raw ISO string. */
export function formatHomePriorityTime(dueAt: string | null): string {
  if (dueAt === null || dueAt === '') return 'Sin hora';
  const dueAtDate = new Date(dueAt);
  return Number.isNaN(dueAtDate.getTime()) ? 'Sin hora' : timeFormatter.format(dueAtDate);
}
