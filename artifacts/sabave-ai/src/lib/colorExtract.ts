const toHex = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
export const rgbToHex = (r: number, g: number, b: number) => `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
export const isHex = (s: string) => /^#[0-9A-Fa-f]{6}$/.test(s);

function hexDist(a: string, b: string) {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [x, y] = [p(a), p(b)];
  return Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2]);
}

/** Samples a downscaled copy of the image, ignores near-white/black/transparent pixels, buckets and returns top N hex colours. */
export function extractColours(source: CanvasImageSource, srcW: number, srcH: number, count: number): string[] {
  const scale = Math.min(1, 96 / Math.max(srcW, srcH, 1));
  const w = Math.max(1, Math.round(srcW * scale));
  const h = Math.max(1, Math.round(srcH * scale));
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return [];
  ctx.drawImage(source, 0, 0, w, h);
  const { data } = ctx.getImageData(0, 0, w, h);
  const buckets = new Map<number, { n: number; r: number; g: number; b: number }>();
  for (let i = 0; i < data.length; i += 4) {
    const [r, g, b, a] = [data[i], data[i + 1], data[i + 2], data[i + 3]];
    if (a < 128) continue;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    if (min > 232 || max < 24) continue;
    const key = ((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4);
    const bk = buckets.get(key) || { n: 0, r: 0, g: 0, b: 0 };
    bk.n++; bk.r += r; bk.g += g; bk.b += b;
    buckets.set(key, bk);
  }
  const sorted = [...buckets.values()].sort((a, b) => b.n - a.n).map((bk) => rgbToHex(bk.r / bk.n, bk.g / bk.n, bk.b / bk.n));
  const out: string[] = [];
  for (const c of sorted) {
    if (out.every((o) => hexDist(o, c) > 48)) out.push(c);
    if (out.length >= count) break;
  }
  return out;
}
