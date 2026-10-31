import { PenLine, RefreshCw } from 'lucide-react';
import type { CampaignOption } from '@workspace/api-client-react';

export function OptionCard({ option, index, onPrepare, preparing, disabled, preparingLabel }: {
  option: CampaignOption; index: number; onPrepare?: () => void; preparing?: boolean; disabled?: boolean; preparingLabel?: string;
}) {
  return (
    <article className="option-card" data-testid={`option-card-${index}`}>
      <div className="option-top">
        <span className="option-num">0{index + 1}</span>
        <span className="option-budget" data-testid={`option-budget-${index}`}>
          RM {option.suggestedBudgetRM.toLocaleString('en-MY')}<small> suggested</small>
        </span>
      </div>
      <h4>{option.title}</h4>
      <p className="option-offer">{option.offer}</p>
      <p className="option-desc">{option.reason}</p>
      <button className="action-btn primary option-go" onClick={onPrepare} disabled={!onPrepare || preparing || disabled} data-testid={`button-prepare-${index}`}>
        {preparing ? <RefreshCw size={13} className="animate-spin" /> : <PenLine size={13} />}
        {preparing ? (preparingLabel || 'Preparing…') : 'Prepare campaign'}
      </button>
    </article>
  );
}
