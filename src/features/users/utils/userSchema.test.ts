import { createUserSchema, updateUserSchema } from './userSchema';

describe('createUserSchema', () => {
  const validInput = {
    email: ' ADMIN@Refugiapp.Local ',
    firstName: ' Ana ',
    lastName: ' Perez ',
    password: 'secure-pass-123',
    role: 'admin' as const,
  };

  it('normalizes email and trims names', () => {
    expect(createUserSchema.parse(validInput)).toMatchObject({
      email: 'admin@refugiapp.local',
      firstName: 'Ana',
      lastName: 'Perez',
    });
  });

  it('rejects invalid email and short passwords', () => {
    const result = createUserSchema.safeParse({
      ...validInput,
      email: 'invalid',
      password: 'short',
    });
    expect(result.success).toBe(false);
  });
});

describe('updateUserSchema', () => {
  it('normalizes email and trims names without a password', () => {
    expect(
      updateUserSchema.parse({
        email: ' MANAGER@Refugiapp.Local ',
        firstName: ' Sofía ',
        lastName: ' Ramírez ',
        role: 'shelter_manager',
      })
    ).toMatchObject({
      email: 'manager@refugiapp.local',
      firstName: 'Sofía',
      lastName: 'Ramírez',
    });
  });

  it('rejects empty names and invalid roles', () => {
    const result = updateUserSchema.safeParse({
      email: 'invalid',
      firstName: '  ',
      lastName: 'Ramírez',
      role: 'unknown',
    });
    expect(result.success).toBe(false);
  });
});
