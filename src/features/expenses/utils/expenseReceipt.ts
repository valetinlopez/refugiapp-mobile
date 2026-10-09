import type { ExpenseReceipt } from '../types';

const sizeFormatter = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 1 });

const IMAGE_FORMATS = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif', 'heic']);

/**
 * Formats an exact byte count for display in `es-AR` (e.g. "1,2 MB").
 *
 * Only the UI representation uses fractional units; the raw integer is kept
 * untouched. Returns `null` when the contract does not expose a size, so the
 * caller omits the value instead of showing a placeholder.
 */
export function formatFileSize(bytes: number | null): string | null {
  if (bytes === null || !Number.isFinite(bytes) || bytes < 0) return null;
  if (bytes < 1024) return `${String(Math.round(bytes))} B`;
  const kilobytes = bytes / 1024;
  if (kilobytes < 1024) return `${sizeFormatter.format(kilobytes)} KB`;
  return `${sizeFormatter.format(kilobytes / 1024)} MB`;
}

/** Human label for the receipt resource: "Imagen", "PDF", "Documento" or "Video". */
export function getReceiptResourceLabel(receipt: ExpenseReceipt): string {
  if (receipt.resourceType === 'video') return 'Video';
  if (receipt.resourceType === 'image') return 'Imagen';
  const format = receipt.format?.toLowerCase() ?? '';
  if (format === 'pdf') return 'PDF';
  if (format !== '' && IMAGE_FORMATS.has(format)) return 'Imagen';
  return format !== '' ? format.toUpperCase() : 'Documento';
}

/**
 * Best-effort file name for the receipt.
 *
 * The contract does not publish the original upload name, so a stable label is
 * derived from `format` and never invented from other fields.
 */
export function getReceiptFileName(receipt: ExpenseReceipt): string {
  return receipt.format ? `Comprobante.${receipt.format.toLowerCase()}` : 'Comprobante';
}

/** Secondary line: "PDF · 1,2 MB" or just the resource label when size is absent. */
export function getReceiptMetaLabel(receipt: ExpenseReceipt): string {
  const size = formatFileSize(receipt.bytes);
  const resource = getReceiptResourceLabel(receipt);
  return size === null ? resource : `${resource} · ${size}`;
}

/**
 * Whether a receipt URL can be opened safely.
 *
 * Only absolute HTTPS URLs are accepted (the API serves Cloudinary secure
 * URLs). Anything else — relative paths, other schemes, malformed strings — is
 * rejected before reaching the platform, so the action fails closed.
 */
export function isSafeReceiptUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:';
  } catch {
    return false;
  }
}
