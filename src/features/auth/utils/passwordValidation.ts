export const MIN_PASSWORD_LENGTH = 12;

// TTL por defecto del backend (DEFAULT_PASSWORD_RESET_TTL_MS = 30 min,
// overridable por PASSWORD_RESET_TOKEN_TTL_MS). No está expuesto en OpenAPI.
export const PASSWORD_RESET_LINK_TTL_MINUTES = 30;

export type PasswordStrengthLevel = 'weak' | 'medium' | 'strong';

export function passwordStrengthLevel(password: string): PasswordStrengthLevel | null {
  const length = password.length;
  if (length === 0) {
    return null;
  }
  if (length < MIN_PASSWORD_LENGTH) {
    return 'weak';
  }
  if (length <= 15) {
    return 'medium';
  }
  return 'strong';
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  const value = normalizeEmail(email);
  const atIndex = value.indexOf('@');
  return atIndex > 0 && atIndex < value.length - 1;
}

export function isStrongEnoughPassword(password: string): boolean {
  return password.length >= MIN_PASSWORD_LENGTH;
}

export interface NewPasswordValidationResult {
  ok: boolean;
  message: string | null;
}

export function validateNewPassword(
  password: string,
  confirmation: string
): NewPasswordValidationResult {
  if (!isStrongEnoughPassword(password)) {
    return {
      ok: false,
      message: `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`,
    };
  }
  if (password !== confirmation) {
    return { ok: false, message: 'Las contraseñas no coinciden.' };
  }
  return { ok: true, message: null };
}
