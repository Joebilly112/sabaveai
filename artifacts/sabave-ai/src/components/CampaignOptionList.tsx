import { useState, type ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';
import type { CampaignOption } from '@workspace/api-client-react';

export function CampaignOptionList({ options, preparing, preparingLabel, onPrepare, aside }: {
  options: CampaignOption[];
  preparing: boolean;
  preparingLabel: string;
  onPrepare: (optionId: string) => void;
  aside?: ReactNode;
}) {
  const [picked, setPicked] = useState('');
  const selected = options.find((option) => option.id === picked) ?? options[0]!;
  return (
    <>
      <fieldset className="option-list" disabled={preparing}>
        <legend className="sr-only">Campaign option</legend>
        {options.map((option, index) => (
          <label key={option.id} className={`option-row ${option.id === selected.id ? 'is-selected' : ''}`} data-testid={`option-row-${index}`}>
            <input type="radio" name="campaign-option" checked={option.id === selected.id} onChange={() => setPicked(option.id)} data-testid={`option-radio-${index}`} />
            <span className="option-row-text">
              <span className="option-row-title">{option.title}</span>
              <strong className="option-row-offer">{option.offer}</strong>
              <span className="option-row-reason" title={option.reason}>{option.reason}</span>
            </span>
            <span className="option-row-budget" data-testid={`option-budget-${index}`}>RM{option.suggestedBudgetRM.toLocaleString('en-MY')}</span>
          </label>
        ))}
      </fieldset>
      <div className="option-actions">
        <button type="button" className="action-btn primary" onClick={() => onPrepare(selected.id)} disabled={preparing} data-testid="button-prepare">
          {preparing ? <RefreshCw size={13} className="animate-spin" /> : null}
          {preparing ? preparingLabel : 'Prepare campaign'}
        </button>
        {aside}
      </div>
    </>
  );
}
