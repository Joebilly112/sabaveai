import { useEffect, useRef, useState } from 'react';
import { ImagePlus, Trash2 } from 'lucide-react';
import { sanitizeImage, type SanitizedImage } from '@/lib/imageSanitize';

type Props = {
  id: string; label: string; hint: string; kind: 'logo' | 'poster'; colourCount: number;
  value?: string; disabled?: boolean;
  onImage: (img: SanitizedImage) => void; onClear: () => void;
};

export function ImageUploader({ id, label, hint, kind, colourCount, value, disabled, onImage, onClear }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);

  const handle = async (file?: File) => {
    if (!file || busy || disabled) return;
    setBusy(true); setError('');
    try { const image = await sanitizeImage(file, { kind, colourCount }); if (mounted.current) onImage(image); }
    catch (e) { if (mounted.current) setError(e instanceof Error ? e.message : 'Image could not be read.'); }
    finally { if (mounted.current) setBusy(false); if (input.current) input.current.value = ''; }
  };

  return (
    <div className="uploader">
      <span className="field-label">{label}</span>
      <div
        className={`drop-zone ${kind} ${value ? 'has-image' : ''}`}
        onClick={() => { if (!disabled && !busy) input.current?.click(); }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); if (!disabled) void handle(e.dataTransfer.files[0]); }}
      >
        {value ? <img src={value} alt={`${label} preview`} data-testid={`img-${id}`} /> : (
          <div className="drop-empty"><ImagePlus size={22} /><span>{busy ? 'Reading image…' : 'Drop or choose an image'}</span><small>{hint}</small></div>
        )}
      </div>
      <div className="uploader-actions">
        <input ref={input} id={id} type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp" className="sr-only" disabled={disabled || busy}
          onChange={(e) => void handle(e.target.files?.[0])} data-testid={`input-${id}`} />
        <label htmlFor={id} className={`action-btn small ${disabled || busy ? 'is-disabled' : ''}`}>{value ? 'Replace' : 'Upload'}</label>
        {value && <button type="button" className="action-btn small ghost" onClick={onClear} disabled={disabled || busy} data-testid={`button-clear-${id}`}><Trash2 size={13} />Remove</button>}
      </div>
      {error && <p className="field-error" role="alert" data-testid={`error-${id}`}>{error}</p>}
    </div>
  );
}
