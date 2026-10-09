import type { ExpenseReceipt } from '../types';
import {
  formatFileSize,
  getReceiptFileName,
  getReceiptMetaLabel,
  getReceiptResourceLabel,
  isSafeReceiptUrl,
} from './expenseReceipt';

function receipt(overrides: Partial<ExpenseReceipt> = {}): ExpenseReceipt {
  return {
    id: 'media-1',
    secureUrl: 'https://res.cloudinary.com/demo/raw/upload/ticket.pdf',
    resourceType: 'raw',
    format: 'pdf',
    bytes: 1_258_291,
    ...overrides,
  };
}

describe('formatFileSize', () => {
  it('formats bytes, kilobytes and megabytes with es-AR separators', () => {
    expect(formatFileSize(512)).toBe('512 B');
    expect(formatFileSize(2048)).toBe('2 KB');
    expect(formatFileSize(1_258_291)).toContain('1,2');
    expect(formatFileSize(1_258_291)).toContain('MB');
  });

  it('returns null when the contract does not expose a size', () => {
    expect(formatFileSize(null)).toBeNull();
  });
});

describe('getReceiptResourceLabel', () => {
  it('labels raw pdf, raw unknown and images', () => {
    expect(getReceiptResourceLabel(receipt())).toBe('PDF');
    expect(getReceiptResourceLabel(receipt({ format: 'docx' }))).toBe('DOCX');
    expect(getReceiptResourceLabel(receipt({ resourceType: 'raw', format: 'tiff' }))).toBe('TIFF');
    expect(getReceiptResourceLabel(receipt({ resourceType: 'image', format: 'jpg' }))).toBe(
      'Imagen'
    );
    expect(getReceiptResourceLabel(receipt({ resourceType: 'image', format: 'png' }))).toBe(
      'Imagen'
    );
  });

  it('falls back to a generic document label without format', () => {
    expect(getReceiptResourceLabel(receipt({ format: null }))).toBe('Documento');
  });
});

describe('getReceiptFileName', () => {
  it('derives a stable file name from the format and never invents one', () => {
    expect(getReceiptFileName(receipt())).toBe('Comprobante.pdf');
    expect(getReceiptFileName(receipt({ format: 'PNG' }))).toBe('Comprobante.png');
    expect(getReceiptFileName(receipt({ format: null }))).toBe('Comprobante');
  });
});

describe('getReceiptMetaLabel', () => {
  it('joins resource and size, and omits the size when absent', () => {
    expect(getReceiptMetaLabel(receipt())).toContain('PDF ·');
    expect(getReceiptMetaLabel(receipt())).toContain('MB');
    expect(getReceiptMetaLabel(receipt({ bytes: null }))).toBe('PDF');
  });
});

describe('isSafeReceiptUrl', () => {
  it('accepts absolute https URLs', () => {
    expect(isSafeReceiptUrl('https://res.cloudinary.com/demo/image/upload/a.jpg')).toBe(true);
  });

  it('rejects non-https, relative and malformed values', () => {
    expect(isSafeReceiptUrl('http://example.com/a.pdf')).toBe(false);
    expect(isSafeReceiptUrl('file:///tmp/a.pdf')).toBe(false);
    expect(isSafeReceiptUrl('/media/a.pdf')).toBe(false);
    expect(isSafeReceiptUrl('not a url')).toBe(false);
  });
});
