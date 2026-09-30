import { veterinarianFormSchema } from './veterinarianSchema';

const BASE = {
  firstName: 'Sofía',
  lastName: 'Romero',
  licenseNumber: 'VET-001',
  shouldCreateUser: false,
};

describe('veterinarianFormSchema', () => {
  it('requires first name, last name and license number', () => {
    const result = veterinarianFormSchema.safeParse({
      firstName: '',
      lastName: '',
      licenseNumber: '',
      email: '',
      phone: '',
      shouldCreateUser: false,
      createUserEmail: '',
      createUserPassword: '',
      notes: '',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const issues = result.error.issues.map((issue) => issue.path.join('.'));
      expect(issues).toEqual(expect.arrayContaining(['firstName', 'lastName', 'licenseNumber']));
    }
  });

  it('trims required fields', () => {
    const result = veterinarianFormSchema.safeParse({
      firstName: ' Sofía ',
      lastName: ' Romero ',
      licenseNumber: ' VET-001 ',
      shouldCreateUser: false,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.firstName).toBe('Sofía');
      expect(result.data.lastName).toBe('Romero');
      expect(result.data.licenseNumber).toBe('VET-001');
    }
  });

  it('enforces the license number maximum length', () => {
    const result = veterinarianFormSchema.safeParse({
      ...BASE,
      licenseNumber: 'V'.repeat(81),
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path[0] === 'licenseNumber')).toBe(true);
    }
  });

  it('treats empty optional fields as undefined', () => {
    const result = veterinarianFormSchema.safeParse({
      ...BASE,
      email: '',
      phone: '',
      createUserEmail: '',
      createUserPassword: '',
      notes: '',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBeUndefined();
      expect(result.data.phone).toBeUndefined();
      expect(result.data.createUserEmail).toBeUndefined();
      expect(result.data.createUserPassword).toBeUndefined();
      expect(result.data.notes).toBeUndefined();
    }
  });

  it('rejects an invalid email', () => {
    const result = veterinarianFormSchema.safeParse({
      ...BASE,
      email: 'not-an-email',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path[0] === 'email')).toBe(true);
    }
  });

  it('accepts a valid optional email', () => {
    const result = veterinarianFormSchema.safeParse({
      ...BASE,
      email: 'sofia@refugiapp.local',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe('sofia@refugiapp.local');
    }
  });

  it('accepts creating a user when password is valid and an email is present', () => {
    const result = veterinarianFormSchema.safeParse({
      ...BASE,
      shouldCreateUser: true,
      createUserEmail: 'sofia@refugiapp.local',
      createUserPassword: 'Refugia-2026-secure',
    });

    expect(result.success).toBe(true);
  });

  it('allows creating a user using the veterinarian profile email as fallback', () => {
    const result = veterinarianFormSchema.safeParse({
      ...BASE,
      email: 'sofia@refugiapp.local',
      shouldCreateUser: true,
      createUserPassword: 'Refugia-2026-secure',
    });

    expect(result.success).toBe(true);
  });

  it('rejects creating a user with a short password', () => {
    const result = veterinarianFormSchema.safeParse({
      ...BASE,
      shouldCreateUser: true,
      createUserEmail: 'sofia@refugiapp.local',
      createUserPassword: 'short',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path[0] === 'createUserPassword')).toBe(
        true
      );
    }
  });

  it('rejects creating a user without an email on either side', () => {
    const result = veterinarianFormSchema.safeParse({
      ...BASE,
      shouldCreateUser: true,
      createUserPassword: 'Refugia-2026-secure',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path[0] === 'createUserEmail')).toBe(true);
    }
  });

  it('ignores create user rules when the toggle is off', () => {
    const result = veterinarianFormSchema.safeParse({
      ...BASE,
      shouldCreateUser: false,
      createUserPassword: 'x',
    });

    expect(result.success).toBe(true);
  });
});
