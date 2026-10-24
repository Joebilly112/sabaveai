import { useState } from 'react';
import { X } from 'lucide-react';

type Props = { id: string; values: string[]; onChange: (v: string[]) => void; placeholder: string; suggestions?: string[]; max: number; maxLen: number; disabled?: boolean; tone?: 'warn' };

export function ChipInput({ id, values, onChange, placeholder, suggestions = [], max, maxLen, disabled, tone }: Props) {
  const [draft, setDraft] = useState('');
  const add = (raw: string) => {
    const v = raw.trim().slice(0, maxLen);
    if (!v || values.length >= max || values.some((x) => x.toLowerCase() === v.toLowerCase())) return;
    onChange([...values, v]);
  };
  return (
    <div className={`chip-box ${tone === 'warn' ? 'warn' : ''}`}>
      <div className="chip-row">
        {values.map((v, i) => (
          <span key={v} className="chip" data-testid={`chip-${id}-${i}`}>{v}
            <button type="button" aria-label={`Remove ${v}`} disabled={disabled} onClick={() => onChange(values.filter((x) => x !== v))} data-testid={`button-remove-${id}-${i}`}><X size={11} /></button>
          </span>
        ))}
        <input id={id} className="chip-input" value={draft} placeholder={values.length >= max ? `Max ${max}` : placeholder} disabled={disabled || values.length >= max}
          onChange={(e) => setDraft(e.target.value)} data-testid={`input-${id}`}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(draft); setDraft(''); }
            else if (e.key === 'Backspace' && !draft && values.length) onChange(values.slice(0, -1));
          }}
          onBlur={() => { if (draft.trim()) { add(draft); setDraft(''); } }} />
      </div>
      {suggestions.filter((s) => !values.includes(s)).length > 0 && (
        <div className="chip-suggest">
          {suggestions.filter((s) => !values.includes(s)).map((s) => (
            <button type="button" key={s} disabled={disabled || values.length >= max} onClick={() => add(s)} data-testid={`button-suggest-${id}-${s.replace(/\s+/g, '-')}`}>+ {s}</button>
          ))}
        </div>
      )}
    </div>
  );
}
