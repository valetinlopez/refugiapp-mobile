import { isUuid } from './uuid';

describe('isUuid', () => {
  it.each(['3fa85f64-5717-4562-b3fc-2c963f66afa6', '7fa85f64-5717-4562-b3fc-2c963f66afa6'])(
    'accepts %s',
    (value) => {
      expect(isUuid(value)).toBe(true);
    }
  );

  it.each([
    '',
    'not-a-uuid',
    '3fa85f64-5717-4562-b3fc-2c963f66afa',
    '3fa85f64-5717-4562-b3fc-2c963f66afa66',
  ])('rejects %s', (value) => {
    expect(isUuid(value)).toBe(false);
  });
});
