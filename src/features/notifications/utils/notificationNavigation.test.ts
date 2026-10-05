import { resolveCareTaskId } from './notificationNavigation';

describe('resolveCareTaskId', () => {
  it('returns the care task id for a valid payload', () => {
    expect(resolveCareTaskId({ careTaskId: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })).toBe(
      '3fa85f64-5717-4562-b3fc-2c963f66afa6'
    );
  });

  it('rejects a non-uuid value', () => {
    expect(resolveCareTaskId({ careTaskId: '../admin' })).toBeNull();
  });

  it('rejects a missing value', () => {
    expect(resolveCareTaskId({ kind: 'overdue' })).toBeNull();
  });

  it('rejects a non-object payload', () => {
    expect(resolveCareTaskId('careTaskId')).toBeNull();
    expect(resolveCareTaskId(null)).toBeNull();
  });
});
