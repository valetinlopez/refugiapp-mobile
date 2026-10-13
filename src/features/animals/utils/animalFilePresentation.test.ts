import { getAnimalFileKind, isSafeAnimalFileUrl } from './animalFilePresentation';

describe('animalFilePresentation', () => {
  it('labels images, PDFs and generic documents', () => {
    expect(getAnimalFileKind({ isImage: true, format: 'jpg' })).toBe('Imagen');
    expect(getAnimalFileKind({ isImage: false, format: 'pdf' })).toBe('PDF');
    expect(getAnimalFileKind({ isImage: false, format: 'PDF' })).toBe('PDF');
    expect(getAnimalFileKind({ isImage: false, format: null })).toBe('Documento');
  });

  it('only accepts https urls for external opening', () => {
    expect(isSafeAnimalFileUrl('https://cdn.test/archivo.pdf')).toBe(true);
    expect(isSafeAnimalFileUrl('http://cdn.test/archivo.pdf')).toBe(false);
    expect(isSafeAnimalFileUrl('javascript:alert(1)')).toBe(false);
    expect(isSafeAnimalFileUrl('not-a-url')).toBe(false);
  });
});
