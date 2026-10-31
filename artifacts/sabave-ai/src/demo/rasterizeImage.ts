import { sanitizeImage } from '@/lib/imageSanitize';

const DATA_URL = /^data:image\/(png|jpeg|webp);base64,/;

/** Turn a local demo image (SVG or raster) into a data URL the business save already accepts. */
export async function rasterizeImage(src: string, kind: 'logo' | 'poster'): Promise<string> {
  if (!src) return '';
  if (DATA_URL.test(src)) return src;
  const base = import.meta.env.BASE_URL || '/';
  const path = src.startsWith('/') ? src : `/${src}`;
  const url = `${base.endsWith('/') ? base.slice(0, -1) : base}${path}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('A demo image could not be loaded.');
  const blob = await response.blob();
  const name = path.split('/').pop() || 'image.svg';
  const type = blob.type && blob.type !== 'application/octet-stream'
    ? blob.type
    : name.endsWith('.svg') ? 'image/svg+xml' : 'image/png';
  const file = new File([blob], name, { type });
  const image = await sanitizeImage(file, { kind, colourCount: 1 });
  return image.dataUrl;
}
