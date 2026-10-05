import {
  toUpdatePreferencesPayload,
  validatePreferencesDraft,
  type NotificationPreferencesDraft,
} from './preferenceValidation';

function createDraft(
  overrides: Partial<NotificationPreferencesDraft> = {}
): NotificationPreferencesDraft {
  return {
    overdueEnabled: true,
    upcomingEnabled: true,
    upcomingWindowMinutes: 60,
    quietHoursEnabled: false,
    quietStart: '22:00',
    quietEnd: '07:00',
    timezone: 'America/Argentina/Buenos_Aires',
    ...overrides,
  };
}

describe('validatePreferencesDraft', () => {
  it('accepts a valid draft within the window bounds', () => {
    expect(validatePreferencesDraft(createDraft())).toEqual({ fieldErrors: {}, message: null });
  });

  it('rejects a window below the minimum', () => {
    const result = validatePreferencesDraft(createDraft({ upcomingWindowMinutes: 4 }));
    expect(result.message).not.toBeNull();
    expect(result.fieldErrors.upcomingWindowMinutes).toBeDefined();
  });

  it('rejects a window above the maximum', () => {
    const result = validatePreferencesDraft(createDraft({ upcomingWindowMinutes: 1441 }));
    expect(result.fieldErrors.upcomingWindowMinutes).toBeDefined();
  });

  it('requires both quiet times when quiet hours are enabled', () => {
    const result = validatePreferencesDraft(
      createDraft({ quietHoursEnabled: true, quietStart: '25:00' })
    );
    expect(result.fieldErrors.quietStart).toBeDefined();
  });

  it('ignores quiet times when quiet hours are disabled', () => {
    const result = validatePreferencesDraft(
      createDraft({ quietHoursEnabled: false, quietStart: 'nope', quietEnd: '' })
    );
    expect(result).toEqual({ fieldErrors: {}, message: null });
  });
});

describe('toUpdatePreferencesPayload', () => {
  it('sends quiet times when enabled', () => {
    expect(toUpdatePreferencesPayload(createDraft({ quietHoursEnabled: true })).quietStart).toBe(
      '22:00'
    );
  });

  it('clears quiet times with null when disabled', () => {
    const payload = toUpdatePreferencesPayload(createDraft({ quietHoursEnabled: false }));
    expect(payload.quietStart).toBeNull();
    expect(payload.quietEnd).toBeNull();
  });
});
