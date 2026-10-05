import { useMemo } from 'react';

import type { UpdateNotificationPreferencesRequest } from '../types';
import {
  toUpdatePreferencesPayload,
  validatePreferencesDraft,
  type NotificationPreferencesDraft,
  type PreferenceValidationResult,
} from '../utils/preferenceValidation';

export interface NotificationPreferencesFormResult {
  fieldErrors: PreferenceValidationResult['fieldErrors'];
  payload: UpdateNotificationPreferencesRequest;
  validationMessage: string | null;
}

export function useNotificationPreferencesForm(
  draft: NotificationPreferencesDraft
): NotificationPreferencesFormResult {
  return useMemo(() => {
    const validation = validatePreferencesDraft(draft);
    return {
      fieldErrors: validation.fieldErrors,
      validationMessage: validation.message,
      payload: toUpdatePreferencesPayload(draft),
    };
  }, [draft]);
}
