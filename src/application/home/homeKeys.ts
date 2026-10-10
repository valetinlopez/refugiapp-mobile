/**
 * Query keys for the Inicio (home) application boundary (D36 / RFG-169).
 *
 * The boundary coordinates read-only summaries that the dashboard consumes and
 * that belong to other features' domains (`care-tasks`, `expenses`). Keeping the
 * keys here lets consumers invalidate the whole panel by prefix without reaching
 * into those features' internals.
 */
export const homeKeys = {
  all: ['home'] as const,
  careTasks: () => [...homeKeys.all, 'care-tasks'] as const,
  pendingCount: () => [...homeKeys.careTasks(), 'count', 'pending'] as const,
  priorities: () => [...homeKeys.careTasks(), 'priorities', 'pending'] as const,
  expenses: () => [...homeKeys.all, 'expenses'] as const,
  expenseCount: () => [...homeKeys.expenses(), 'count'] as const,
};

/** Value-compatible constant so features can invalidate the panel without importing it. */
export const homeQueryKey = homeKeys.all;
