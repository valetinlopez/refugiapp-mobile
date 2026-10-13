import type { AnimalFile } from '../types';

const sizeFormatter = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 1 });

export function formatAnimalFileSize(bytes: number | null | undefined): string | null {
  if (typeof bytes !== 'number' || !Number.isFinite(bytes) || bytes < 0) return null;
  if (bytes < 1024) return `${String(Math.round(bytes))} B`;
  const kilobytes = bytes / 1024;
  if (kilobytes < 1024) return `${sizeFormatter.format(kilobytes)} KB`;
  return `${sizeFormatter.format(kilobytes / 1024)} MB`;
}

export function getAnimalFileKind(file: Pick<AnimalFile, 'format' | 'isImage'>): string {
  if (file.isImage) return 'Imagen';
  return file.format?.toLowerCase() === 'pdf' ? 'PDF' : 'Documento';
}

export function getAnimalFileMeta(file: Pick<AnimalFile, 'bytes' | 'format' | 'isImage'>): string {
  const size = formatAnimalFileSize(file.bytes);
  const kind = getAnimalFileKind(file);
  return size === null ? kind : `${kind} · ${size}`;
}

export function isSafeAnimalFileUrl(url: string): boolean {
  try {
    return new URL(url).protocol === 'https:';
  } catch {
    return false;
  }
}
