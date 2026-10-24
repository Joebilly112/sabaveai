import { Plus, Trash2 } from 'lucide-react';

export type ProductRow = { name: string; price: string };

export function ProductListEditor({ values, onChange }: { values: ProductRow[]; onChange: (v: ProductRow[]) => void }) {
  const set = (i: number, patch: Partial<ProductRow>) => onChange(values.map((p, j) => (j === i ? { ...p, ...patch } : p)));
  return (
    <div className="product-list">
      {values.map((p, i) => (
        <div className="product-row" key={i} data-testid={`row-product-${i}`}>
          <input className="text-input" aria-label={`Product ${i + 1} name`} placeholder="e.g. Iced kopi-O" value={p.name} maxLength={150} onChange={(e) => set(i, { name: e.target.value })} data-testid={`input-product-name-${i}`} />
          <div className="rm-input"><span>RM</span><input aria-label={`Product ${i + 1} price`} inputMode="decimal" placeholder="0.00" value={p.price} onChange={(e) => set(i, { price: e.target.value })} data-testid={`input-product-price-${i}`} /></div>
          <button type="button" className="icon-btn" aria-label="Remove product" disabled={values.length <= 1} onClick={() => onChange(values.filter((_, j) => j !== i))} data-testid={`button-remove-product-${i}`}><Trash2 size={14} /></button>
        </div>
      ))}
      {values.length < 100 && <button type="button" className="action-btn small" onClick={() => onChange([...values, { name: '', price: '' }])} data-testid="button-add-product"><Plus size={13} />Add product</button>}
    </div>
  );
}
