import { buildAttachmentFormData } from './clinicalAttachmentsApi';

describe('buildAttachmentFormData', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('appends the browser File when the document picker provides one', () => {
    const appendSpy = jest.spyOn(FormData.prototype, 'append');
    const browserFile = new Blob(['document'], { type: 'application/pdf' });

    buildAttachmentFormData({
      uri: 'blob:https://app.test/document',
      name: 'document.pdf',
      mimeType: 'application/pdf',
      file: browserFile,
    });

    expect(appendSpy).toHaveBeenCalledWith('file', browserFile);
  });

  it('keeps the React Native URI descriptor when no browser File is available', () => {
    const appendSpy = jest.spyOn(FormData.prototype, 'append');

    buildAttachmentFormData({
      uri: 'file:///document.pdf',
      name: 'document.pdf',
      mimeType: 'application/pdf',
    });

    expect(appendSpy).toHaveBeenCalledWith(
      'file',
      expect.objectContaining({
        uri: 'file:///document.pdf',
        name: 'document.pdf',
        type: 'application/pdf',
      })
    );
  });
});
