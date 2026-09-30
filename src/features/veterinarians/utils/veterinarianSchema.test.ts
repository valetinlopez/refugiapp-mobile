import { veterinarianFormSchema } from './veterinarianSchema';

describe('veterinarianFormSchema', () => {
  it('requires first name, last name and license number', () => {
    const result = veterinarianFormSchema.safeParse({
      firstName: '',
      lastName: '',
      licenseNumber: '',
      email: '',
      phone: '',
      userId: '',
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
      firstName: 'Sofía',
      lastName: 'Romero',
      licenseNumber: 'V'.repeat(81),
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path[0] === 'licenseNumber')).toBe(true);
    }
  });

  it('treats empty optional fields as undefined', () => {
    const result = veterinarianFormSchema.safeParse({
      firstName: 'Sofía',
      lastName: 'Romero',
      licenseNumber: 'VET-001',
      email: '',
      phone: '',
      userId: '',
      notes: '',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBeUndefined();
      expect(result.data.phone).toBeUndefined();
      expect(result.data.userId).toBeUndefined();
      expect(result.data.notes).toBeUndefined();
    }
  });

  it('rejects an invalid email', () => {
    const result = veterinarianFormSchema.safeParse({
      firstName: 'Sofía',
      lastName: 'Romero',
      licenseNumber: 'VET-001',
      email: 'not-an-email',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path[0] === 'email')).toBe(true);
    }
  });

  it('rejects an invalid user id', () => {
    const result = veterinarianFormSchema.safeParse({
      firstName: 'Sofía',
      lastName: 'Romero',
      licenseNumber: 'VET-001',
      userId: 'not-a-uuid',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path[0] === 'userId')).toBe(true);
    }
  });

  it('accepts a valid optional email and user id', () => {
    const result = veterinarianFormSchema.safeParse({
      firstName: 'Sofía',
      lastName: 'Romero',
      licenseNumber: 'VET-001',
      email: 'sofia@refugiapp.local',
      userId: '11111111-1111-4111-8111-111111111111',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe('sofia@refugiapp.local');
      expect(result.data.userId).toBe('11111111-1111-4111-8111-111111111111');
    }
  });
});
