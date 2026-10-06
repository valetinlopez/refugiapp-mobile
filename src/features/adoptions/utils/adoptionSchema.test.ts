import { adopterSchema } from './adoptionSchema';
import { toCreateAdopterRequest } from './toCreateAdopterRequest';

describe('adopterSchema', () => {
  it('normalizes email and omits an empty optional address', () => {
    const values = adopterSchema.parse({
      firstName: ' Ana ',
      lastName: ' Pérez ',
      email: ' ANA@EXAMPLE.COM ',
      phone: '+5491123456789',
      address: '',
    });

    expect(toCreateAdopterRequest(values)).toEqual({
      firstName: 'Ana',
      lastName: 'Pérez',
      email: 'ana@example.com',
      phone: '+5491123456789',
    });
  });

  it.each(['123', '+00123456789', 'phone'])('rejects invalid phone %s', (phone) => {
    const result = adopterSchema.safeParse({
      firstName: 'Ana',
      lastName: 'Pérez',
      email: 'ana@example.com',
      phone,
      address: '',
    });
    expect(result.success).toBe(false);
  });
});
