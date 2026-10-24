import { Plus, X } from 'lucide-react';
import { isHex } from '@/lib/colorExtract';

type Props = { id: string; values: string[]; onChange: (v: string[]) => void; min: number; max: number; disabled?: boolean };

export function ColourSwatches({ id, values, onChange, min, max, disabled }: Props) {
  const set = (i: number, v: string) => onChange(values.map((x, j) => (j === i ? v : x)));
  return (
    <div className="swatch-list">
      {values.map((c, i) => (
        <div key={i} className={`swatch ${isHex(c) ? '' : 'invalid'}`}>
          <input type="color" aria-label={`Colour ${i + 1} picker`} value={isHex(c) ? c : '#888888'} disabled={disabled} onChange={(e) => set(i, e.target.value.toUpperCase())} data-testid={`input-${id}-picker-${i}`} />
          <input className="swatch-hex" aria-label={`Colour ${i + 1} hex`} value={c} maxLength={7} disabled={disabled}
            onChange={(e) => { const v = e.target.value.toUpperCase(); set(i, v.startsWith('#') ? v : `#${v}`); }} data-testid={`input-${id}-hex-${i}`} />
          {values.length > min && <button type="button" aria-label="Remove colour" disabled={disabled} onClick={() => onChange(values.filter((_, j) => j !== i))} data-testid={`button-remove-${id}-${i}`}><X size={12} /></button>}
        </div>
      ))}
      {values.length < max && <button type="button" className="swatch-add" disabled={disabled} onClick={() => onChange([...values, '#1F6F5C'])} data-testid={`button-add-${id}`}><Plus size={13} />Add</button>}
    </div>
  );
}
