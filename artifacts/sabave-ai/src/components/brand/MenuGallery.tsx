import { useRef, useState } from 'react';
import { ArrowDown, ArrowUp, ImagePlus, Trash2 } from 'lucide-react';
import type { MenuDraft } from '@/lib/brandForm';
import { sanitizeImage } from '@/lib/imageSanitize';

function newId() {
  return `m_${crypto.randomUUID()}`;
}

async function photoUrl(file: File) {
  const image = await sanitizeImage(file, { kind: 'poster', colourCount: 1 });
  return image.dataUrl;
}

export function MenuGallery({ values, onChange }: { values: MenuDraft[]; onChange: (next: MenuDraft[]) => void }) {
  const bulk = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');

  const set = (index: number, patch: Partial<MenuDraft>) => {
    onChange(values.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  const addFiles = async (files: File[]) => {
    setError('');
    const room = 15 - values.length;
    if (room <= 0) { setError('You can add up to 15 items.'); return; }
    const next = [...values];
    const notes: string[] = [];
    for (const file of files.slice(0, room)) {
      try {
        next.push({ id: newId(), name: '', price: '', imageDataUrl: await photoUrl(file), bestseller: false });
      } catch (err) {
        notes.push(err instanceof Error ? err.message : 'A photo could not be read.');
      }
    }
    if (files.length > room) notes.push('Only the first photos that fit under 15 items were added.');
    onChange(next);
    if (notes.length) setError(notes[0]);
  };

  const move = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= values.length) return;
    const next = [...values];
    const [row] = next.splice(index, 1);
    next.splice(target, 0, row);
    onChange(next);
  };

  return (
    <div className="menu-gallery">
      <div
        className="drop-zone"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => { event.preventDefault(); void addFiles([...event.dataTransfer.files]); }}
      >
        <div className="drop-empty">
          <ImagePlus size={22} />
          <span>Drop menu photos here</span>
          <small>One row per photo. PNG, JPEG, SVG or WebP, max 2 MB. You type the name and price.</small>
        </div>
      </div>
      <input ref={bulk} type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp" multiple className="sr-only" data-testid="input-menu-photos" onChange={(event) => { void addFiles([...(event.target.files ?? [])]); event.target.value = ''; }} />
      <button type="button" className="action-btn small" onClick={() => bulk.current?.click()} data-testid="button-add-menu-photos">Add photos</button>
      <button type="button" className="action-btn small" onClick={() => onChange([...values, { id: newId(), name: '', price: '', imageDataUrl: '', bestseller: false }])} disabled={values.length >= 15} data-testid="button-add-menu-item">Add item</button>
      {values.map((item, index) => (
        <div className="product-row" key={item.id} data-testid={`row-menu-${index}`}>
          <MenuThumb item={item} onPhoto={(imageDataUrl) => set(index, { imageDataUrl })} />
          <input className="text-input" aria-label={`Item ${index + 1} name`} placeholder="Item name" maxLength={150} value={item.name} onChange={(event) => set(index, { name: event.target.value })} data-testid={`input-menu-name-${index}`} />
          <div className="rm-input"><span>RM</span><input aria-label={`Item ${index + 1} price`} inputMode="decimal" placeholder="0.00" value={item.price} onChange={(event) => set(index, { price: event.target.value })} data-testid={`input-menu-price-${index}`} /></div>
          <label className="check"><input type="checkbox" checked={item.bestseller} onChange={(event) => set(index, { bestseller: event.target.checked })} data-testid={`toggle-menu-bestseller-${index}`} />Bestseller</label>
          <button type="button" className="icon-btn" aria-label="Move item up" disabled={index === 0} onClick={() => move(index, -1)}><ArrowUp size={14} /></button>
          <button type="button" className="icon-btn" aria-label="Move item down" disabled={index === values.length - 1} onClick={() => move(index, 1)}><ArrowDown size={14} /></button>
          <button type="button" className="icon-btn" aria-label="Remove item" onClick={() => onChange(values.filter((row) => row.id !== item.id))} data-testid={`button-remove-menu-${index}`}><Trash2 size={14} /></button>
        </div>
      ))}
      {error && <p className="field-error" role="alert">{error}</p>}
    </div>
  );
}

function MenuThumb({ item, onPhoto }: { item: MenuDraft; onPhoto: (url: string) => void }) {
  const input = useRef<HTMLInputElement>(null);
  return (
    <div>
      <button type="button" className="icon-btn" aria-label={item.imageDataUrl ? 'Replace item photo' : 'Add item photo'} onClick={() => input.current?.click()}>
        {item.imageDataUrl ? <img src={item.imageDataUrl} alt="" width={40} height={40} style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 8 }} /> : <ImagePlus size={14} />}
      </button>
      <input ref={input} type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp" className="sr-only" onChange={(event) => {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file) return;
        void photoUrl(file).then(onPhoto).catch(() => undefined);
      }} />
    </div>
  );
}
