import { z } from 'zod';

import type { UpdateNotificationPreferencesRequest } from '../types';

export const UPCOMING_WINDOW_MIN = 5;
export const UPCOMING_WINDOW_MAX = 1440;
export const UPCOMING_WINDOW_DEFAULT = 60;

export const QUIET_TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

export interface NotificationPreferencesDraft {
  overdueEnabled: boolean;
  upcomingEnabled: boolean;
  upcomingWindowMinutes: number;
  quietHoursEnabled: boolean;
  quietEnd: string;
  quietStart: string;
  timezone: string;
}

const quietTimeSchema = z.string().regex(QUIET_TIME_PATTERN);

const draftSchema = z
  .object({
    overdueEnabled: z.boolean(),
    upcomingEnabled: z.boolean(),
    upcomingWindowMinutes: z
      .number()
      .int()
      .min(UPCOMING_WINDOW_MIN, `La antelación mínima es ${UPCOMING_WINDOW_MIN} minutos.`)
      .max(UPCOMING_WINDOW_MAX, `La antelación máxima es ${UPCOMING_WINDOW_MAX} minutos.`),
    quietHoursEnabled: z.boolean(),
    quietStart: z.string(),
    quietEnd: z.string(),
    timezone: z.string().min(1),
  })
  .superRefine((draft, context) => {
    if (!draft.quietHoursEnabled) {
      return;
    }
    if (!quietTimeSchema.safeParse(draft.quietStart).success) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Indicá una hora de inicio válida (por ejemplo 22:00).',
        path: ['quietStart'],
      });
    }
    if (!quietTimeSchema.safeParse(draft.quietEnd).success) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Indicá una hora de fin válida (por ejemplo 07:00).',
        path: ['quietEnd'],
      });
    }
  });

export interface PreferenceValidationResult {
  message: string | null;
  fieldErrors: Partial<Record<'quietStart' | 'quietEnd' | 'upcomingWindowMinutes', string>>;
}

export function validatePreferencesDraft(
  draft: NotificationPreferencesDraft
): PreferenceValidationResult {
  const result = draftSchema.safeParse(draft);
  if (result.success) {
    return { message: null, fieldErrors: {} };
  }

  const fieldErrors: PreferenceValidationResult['fieldErrors'] = {};
  let message: string | null = null;
  for (const issue of result.error.issues) {
    const [field] = issue.path;
    if (field === 'quietStart' || field === 'quietEnd' || field === 'upcomingWindowMinutes') {
      fieldErrors[field] = fieldErrors[field] ?? issue.message;
    }
    message = message ?? issue.message;
  }
  return { message, fieldErrors };
}

export function toUpdatePreferencesPayload(
  draft: NotificationPreferencesDraft
): UpdateNotificationPreferencesRequest {
  return {
    overdueEnabled: draft.overdueEnabled,
    upcomingEnabled: draft.upcomingEnabled,
    upcomingWindowMinutes: draft.upcomingWindowMinutes,
    quietStart: draft.quietHoursEnabled ? draft.quietStart : null,
    quietEnd: draft.quietHoursEnabled ? draft.quietEnd : null,
    timezone: draft.timezone,
  };
}
