import { createUserSchema } from './userSchema';

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
