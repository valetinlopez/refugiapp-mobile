import { buildReceiptFormData, expenseReceiptApi } from './expenseReceiptApi';

describe('expenseReceiptApi', () => {
  it('builds multipart data with the receipt file', () => {
    const append = jest.spyOn(FormData.prototype, 'append');
    buildReceiptFormData({
      uri: 'file://ticket.pdf',
      name: 'ticket.pdf',
      mimeType: 'application/pdf',
      size: 100,
    });
    expect(append).toHaveBeenCalledWith(
      'file',
      expect.objectContaining({ name: 'ticket.pdf', type: 'application/pdf' })
    );
  });

  it('uploads without setting a manual content type', async () => {
    const post = jest.fn().mockResolvedValue({ data: { id: 'media-id' } });
    await expenseReceiptApi.upload(
      { uri: 'file://ticket.pdf', name: 'ticket.pdf', mimeType: 'application/pdf', size: 100 },
      { post } as never
    );
    expect(post).toHaveBeenCalledWith(
      '/media/upload',
      expect.any(FormData),
      expect.objectContaining({ retry: 0 })
    );
    expect(post.mock.calls[0][2]).not.toHaveProperty('headers');
  });
});
