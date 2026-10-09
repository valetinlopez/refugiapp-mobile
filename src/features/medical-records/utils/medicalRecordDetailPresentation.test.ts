import type { ClinicalAttachment } from '../types';
import {
  formatClinicalAttachmentSize,
  getClinicalAttachmentMeta,
  isSafeClinicalAttachmentUrl,
} from './medicalRecordDetailPresentation';

function attachment(overrides: Partial<ClinicalAttachment> = {}): ClinicalAttachment {
  return {
    bytes: 2_400_000,
    format: 'jpg',
    id: 'media-1',
    name: 'control.jpg',
    resourceType: 'image',
    secureUrl: 'https://res.cloudinary.com/refugiapp/image/upload/control.jpg',
    ...overrides,
  };
}

describe('medical record detail presentation', () => {
  it('formats attachment sizes without changing raw bytes', () => {
    expect(formatClinicalAttachmentSize(180 * 1024)).toBe('180 KB');
    expect(formatClinicalAttachmentSize(2_400_000)).toBe('2,3 MB');
    expect(formatClinicalAttachmentSize(null)).toBeNull();
  });

  it('combines the file kind and size', () => {
    expect(getClinicalAttachmentMeta(attachment())).toBe('Imagen · 2,3 MB');
    expect(
      getClinicalAttachmentMeta(attachment({ bytes: null, format: 'pdf', resourceType: 'raw' }))
    ).toBe('PDF');
  });

  it('only accepts absolute HTTPS attachment URLs', () => {
    expect(isSafeClinicalAttachmentUrl('https://cdn.test/control.pdf')).toBe(true);
    expect(isSafeClinicalAttachmentUrl('http://cdn.test/control.pdf')).toBe(false);
    expect(isSafeClinicalAttachmentUrl('javascript:alert(1)')).toBe(false);
  });
});
