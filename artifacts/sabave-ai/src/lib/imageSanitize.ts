import { extractColours } from './colorExtract';

// Originals can be large because every image is shrunk and re-encoded before it is saved.
export const MAX_FILE_BYTES = 15 * 1024 * 1024;
const MAX_EDGE = 10_000;
const MAX_PIXELS = 50_000_000;
const OUTPUT_EDGE = 1200;
const ALLOWED = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'];

export type SanitizedImage = { dataUrl: string; colours: string[]; width: number; height: number };

async function sniff(file: File): Promise<string | null> {
  const head = new Uint8Array(await file.slice(0, 512).arrayBuffer());
  if (head[0] === 0x89 && head[1] === 0x50 && head[2] === 0x4e && head[3] === 0x47) return 'image/png';
  if (head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff) return 'image/jpeg';
  const ascii = String.fromCharCode(...head);
  if (ascii.startsWith('RIFF') && ascii.slice(8, 12) === 'WEBP') return 'image/webp';
  if (/<svg[\s>]/i.test(ascii.replace(/^\uFEFF/, ''))) return 'image/svg+xml';
  if (/^\s*<\?xml/i.test(ascii)) {
    const more = await file.slice(0, 4096).text();
    if (/<svg[\s>]/i.test(more)) return 'image/svg+xml';
  }
  return null;
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('This image could not be decoded.'));
    img.src = url;
  });
}

/** Validates type+size, decodes via <img>, re-encodes through canvas to a raster data URL (strips SVG scripts/metadata). In memory only. */
export async function sanitizeImage(file: File, opts: { kind: 'logo' | 'poster'; colourCount: number }): Promise<SanitizedImage> {
  if (file.size > MAX_FILE_BYTES) throw new Error(`"${file.name}" is ${(file.size / 1048576).toFixed(1)} MB. Max is 15 MB per file.`);
  if (/hei[cf]/i.test(file.type) || /\.hei[cf]$/i.test(file.name)) throw new Error('iPhone HEIC photos are not supported yet. Save it as a JPEG first, then upload that.');
  if (file.type && !ALLOWED.includes(file.type)) throw new Error('Use a PNG, JPEG, SVG or WebP image.');
  const real = await sniff(file);
  if (!real) throw new Error('That file does not look like a PNG, JPEG, SVG or WebP image.');
  const url = URL.createObjectURL(new Blob([file], { type: real }));
  try {
    const img = await loadImage(url);
    let w = img.naturalWidth, h = img.naturalHeight;
    if (real === 'image/svg+xml' && (!w || !h)) { w = 800; h = 800; }
    if (!w || !h) throw new Error('This image has no readable dimensions.');
    if (w > MAX_EDGE || h > MAX_EDGE || w * h > MAX_PIXELS) throw new Error(`Image is ${w}x${h}px. Keep each side at or under 10,000px.`);
    const scale = Math.min(1, OUTPUT_EDGE / Math.max(w, h));
    const cw = Math.max(1, Math.round(w * scale)), ch = Math.max(1, Math.round(h * scale));
    const canvas = document.createElement('canvas');
    canvas.width = cw; canvas.height = ch;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Your browser could not process this image.');
    const opaque = opts.kind === 'poster';
    if (opaque) { ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, cw, ch); }
    ctx.drawImage(img, 0, 0, cw, ch);
    let dataUrl = opaque ? canvas.toDataURL('image/jpeg', 0.84) : canvas.toDataURL('image/png');
    if (!opaque && dataUrl.length > 1_800_000) dataUrl = canvas.toDataURL('image/webp', 0.86);
    if (!/^data:image\/(png|jpeg|webp);base64,/.test(dataUrl)) dataUrl = canvas.toDataURL('image/jpeg', 0.84);
    if (dataUrl.length > 2_700_000) throw new Error('Image is still too large after compression. Try a smaller file.');
    const colours = extractColours(canvas, cw, ch, opts.colourCount);
    return { dataUrl, colours, width: cw, height: ch };
  } finally {
    URL.revokeObjectURL(url);
  }
}
