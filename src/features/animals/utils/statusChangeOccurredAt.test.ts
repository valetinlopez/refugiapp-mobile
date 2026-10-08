import {
  STATUS_CHANGE_FUTURE_TOLERANCE_MS,
  isValidStatusChangeOccurredAt,
} from './statusChangeOccurredAt';

describe('isValidStatusChangeOccurredAt', () => {
  const now = Date.parse('2026-10-07T12:00:00-03:00');

  it('treats the empty value as valid (backend records the current time)', () => {
    expect(isValidStatusChangeOccurredAt('', now)).toBe(true);
  });

  it('accepts a past date', () => {
    expect(isValidStatusChangeOccurredAt('2026-10-06T09:00:00-03:00', now)).toBe(true);
  });

  it('accepts a future date within the skew tolerance', () => {
    const within = new Date(now + STATUS_CHANGE_FUTURE_TOLERANCE_MS).toISOString();
    expect(isValidStatusChangeOccurredAt(within, now)).toBe(true);
  });

  it('rejects a future date beyond the skew tolerance', () => {
    const beyond = new Date(now + STATUS_CHANGE_FUTURE_TOLERANCE_MS + 1).toISOString();
    expect(isValidStatusChangeOccurredAt(beyond, now)).toBe(false);
  });

  it('rejects an unparsable value', () => {
    expect(isValidStatusChangeOccurredAt('not-a-date', now)).toBe(false);
  });
});
