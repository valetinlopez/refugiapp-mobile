import { adoptionsApi } from './adoptionsApi';

const ANIMAL_ID = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
const APPLICATION_ID = '4fa85f64-5717-4562-b3fc-2c963f66afa6';

describe('adoptionsApi', () => {
  it('creates an adopter and application using the published contract', async () => {
    const post = jest
      .fn()
      .mockResolvedValueOnce({ data: { id: 'adopter-id' } })
      .mockResolvedValueOnce({ data: { id: APPLICATION_ID } });
    const client = { post } as never;

    await adoptionsApi.createAdopter(
      {
        firstName: 'Ana',
        lastName: 'Pérez',
        email: 'ana@example.com',
        phone: '+5491123456789',
      },
      client
    );
    await adoptionsApi.createApplication(ANIMAL_ID, { adopterId: 'adopter-id' }, client);

    expect(post).toHaveBeenNthCalledWith(
      1,
      '/adopters',
      expect.objectContaining({ email: 'ana@example.com' })
    );
    expect(post).toHaveBeenNthCalledWith(2, `/animals/${ANIMAL_ID}/adoption-applications`, {
      adopterId: 'adopter-id',
    });
  });

  it('preserves pagination parameters and approval endpoint', async () => {
    const get = jest.fn().mockResolvedValue({ data: { items: [], page: 2, limit: 20, total: 0 } });
    const post = jest.fn().mockResolvedValue({ data: { id: 'adoption-id' } });
    const client = { get, post } as never;

    await adoptionsApi.listApplications(ANIMAL_ID, 2, 20, client);
    await adoptionsApi.listHistory(ANIMAL_ID, 2, 20, client);
    await adoptionsApi.approveApplication(APPLICATION_ID, {}, client);

    expect(get).toHaveBeenNthCalledWith(1, `/animals/${ANIMAL_ID}/adoption-applications`, {
      params: { page: 2, limit: 20 },
    });
    expect(get).toHaveBeenNthCalledWith(2, `/animals/${ANIMAL_ID}/adoptions`, {
      params: { page: 2, limit: 20 },
    });
    expect(post).toHaveBeenCalledWith(`/adoption-applications/${APPLICATION_ID}/approve`, {});
  });
});
