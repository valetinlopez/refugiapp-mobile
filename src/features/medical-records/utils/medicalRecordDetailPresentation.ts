import type { ClinicalAttachment } from '../types';

const sizeFormatter = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 1 });

export function formatClinicalAttachmentSize(bytes: number | null | undefined): string | null {
  if (typeof bytes !== 'number' || !Number.isFinite(bytes) || bytes < 0) return null;
  if (bytes < 1024) return `${String(Math.round(bytes))} B`;
  const kilobytes = bytes / 1024;
  if (kilobytes < 1024) return `${sizeFormatter.format(kilobytes)} KB`;
  return `${sizeFormatter.format(kilobytes / 1024)} MB`;
}

export function getClinicalAttachmentKind(attachment: ClinicalAttachment): string {
  if (attachment.resourceType === 'image') return 'Imagen';
  if (attachment.resourceType === 'video') return 'Video';
  return attachment.format?.toLowerCase() === 'pdf' ? 'PDF' : 'Documento';
}

export function getClinicalAttachmentMeta(attachment: ClinicalAttachment): string {
  const size = formatClinicalAttachmentSize(attachment.bytes);
  const kind = getClinicalAttachmentKind(attachment);
  return size === null ? kind : `${kind} · ${size}`;
}

export function isSafeClinicalAttachmentUrl(url: string): boolean {
  try {
    return new URL(url).protocol === 'https:';
  } catch {
    return false;
  }
}
