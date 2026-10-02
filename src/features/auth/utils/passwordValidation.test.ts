import {
  MIN_PASSWORD_LENGTH,
  isStrongEnoughPassword,
  isValidEmail,
  normalizeEmail,
  validateNewPassword,
} from './passwordValidation';

describe('normalizeEmail', () => {
  it('trims and lowercases the email', () => {
    expect(normalizeEmail('  User@Refugiapp.LOCAL  ')).toBe('user@refugiapp.local');
  });
});

describe('isValidEmail', () => {
  it('accepts a plausible email', () => {
    expect(isValidEmail('user@refugiapp.local')).toBe(true);
  });

  it('rejects emails without a local part or domain', () => {
    expect(isValidEmail('')).toBe(false);
    expect(isValidEmail('@refugiapp.local')).toBe(false);
    expect(isValidEmail('user@')).toBe(false);
    expect(isValidEmail('user')).toBe(false);
  });
});

describe('isStrongEnoughPassword', () => {
  it('enforces the 12 character minimum policy', () => {
    expect(isStrongEnoughPassword('a'.repeat(MIN_PASSWORD_LENGTH - 1))).toBe(false);
    expect(isStrongEnoughPassword('a'.repeat(MIN_PASSWORD_LENGTH))).toBe(true);
  });
});

describe('validateNewPassword', () => {
  it('rejects passwords shorter than the minimum policy', () => {
    expect(validateNewPassword('short', 'short')).toEqual({
      ok: false,
      message: `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`,
    });
  });

  it('rejects passwords whose confirmation does not match', () => {
    const password = 'a'.repeat(MIN_PASSWORD_LENGTH);
    expect(validateNewPassword(password, 'b'.repeat(MIN_PASSWORD_LENGTH))).toEqual({
      ok: false,
      message: 'Las contraseñas no coinciden.',
    });
  });

  it('accepts a strong password that matches its confirmation', () => {
    const password = 'a'.repeat(MIN_PASSWORD_LENGTH);
    expect(validateNewPassword(password, password)).toEqual({ ok: true, message: null });
  });
});
