import { Lock } from 'lucide-react';
import type { CampaignOption } from '@workspace/api-client-react';

export function OptionCard({ option, index }: { option: CampaignOption; index: number }) {
  return (
    <article className="option-card" data-testid={`option-card-${index}`}>
      <div className="option-top">
        <span className="option-num">0{index + 1}</span>
        <span className="option-budget" data-testid={`option-budget-${index}`}>
          RM {option.suggestedBudgetRM.toLocaleString('en-MY')}<small> suggested</small>
        </span>
      </div>
      <h4>{option.title}</h4>
      <p className="option-desc">{option.description}</p>
      <div className="option-offer"><span>Offer</span>{option.offer}</div>
      <div className="option-why">
        <span>Why this?</span>
        <p>{option.reason}</p>
      </div>
      <button className="action-btn option-prepare" disabled aria-describedby={`stage3-${index}`} data-testid={`button-prepare-${index}`}>
        <Lock size={13} /> Prepare campaign
      </button>
      <small id={`stage3-${index}`} className="option-note">Drafting and approval arrive in Stage 3.</small>
    </article>
  );
}
