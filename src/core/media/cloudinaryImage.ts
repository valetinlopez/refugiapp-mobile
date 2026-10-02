export interface CloudinaryImageOptions {
  height?: number;
  width: number;
}

const CLOUDINARY_HOST = 'res.cloudinary.com';
const IMAGE_UPLOAD_SEGMENT = '/image/upload/';

function normalizeDimension(value: number): number {
  return Math.max(1, Math.round(value));
}

export function optimizeCloudinaryImageUrl(
  uri: string,
  { height, width }: CloudinaryImageOptions
): string {
  let parsed: URL;

  try {
    parsed = new URL(uri);
  } catch {
    return uri;
  }

  if (parsed.protocol !== 'https:' || parsed.hostname !== CLOUDINARY_HOST) return uri;

  const uploadIndex = parsed.pathname.indexOf(IMAGE_UPLOAD_SEGMENT);
  if (uploadIndex === -1) return uri;

  const normalizedWidth = normalizeDimension(width);
  const normalizedHeight = normalizeDimension(height ?? width);
  const transformation = [
    'f_auto',
    'q_auto',
    'c_fill',
    'g_auto',
    `w_${normalizedWidth}`,
    `h_${normalizedHeight}`,
  ].join(',');
  const insertionIndex = uploadIndex + IMAGE_UPLOAD_SEGMENT.length;

  if (parsed.pathname.slice(insertionIndex).startsWith(`${transformation}/`)) return uri;

  parsed.pathname = `${parsed.pathname.slice(0, insertionIndex)}${transformation}/${parsed.pathname.slice(insertionIndex)}`;
  return parsed.toString();
}
