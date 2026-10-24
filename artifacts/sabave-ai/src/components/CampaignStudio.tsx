import { useEffect, useMemo, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, CheckCircle2, FileText, RefreshCw, Send, XCircle } from 'lucide-react';
import {
  getListActivityLogQueryKey, getListDraftsQueryKey, useDecideDraft, useListDrafts, useUpdateDraft,
} from '@workspace/api-client-react';
import type { Business, CampaignDraft, DraftUpdateChannelsItem } from '@workspace/api-client-react';
import { apiErrorInfo, useWorkspace } from '@/lib/workspace';
import { PosterPreview } from '@/components/PosterPreview';

const BASE_NEVER = ['cure', 'protects your lungs', 'prevents illness', 'kills germs'];
const STATUS_LABEL: Record<string, string> = { draft: 'Draft', pending_approval: 'Pending approval', published: 'Published', rejected: 'Rejected' };

type Form = { headline: string; caption_bm: string; caption_en: string; hashtags: string; cta: string; offer: string; budget: string; channels: DraftUpdateChannelsItem[] };

function toForm(d: CampaignDraft): Form {
  return {
    headline: d.copy.headline, caption_bm: d.copy.caption_bm, caption_en: d.copy.caption_en,
    hashtags: d.copy.hashtags.join(' '), cta: d.copy.cta, offer: d.option.offer,
    budget: String(d.budgetRM), channels: [...d.channels],
  };
}
const same = (a: Form | null, b: Form | null) => JSON.stringify(a) === JSON.stringify(b);

function escapeRe(s: string) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function findViolations(text: string, terms: string[]) {
  return terms.filter((t) => t.trim() && new RegExp(`(?<![\\p{L}\\p{N}_])${escapeRe(t.trim().normalize('NFKC')).replace(/\s+/g, '\\s+')}(?![\\p{L}\\p{N}_])`, 'iu').test(text.normalize('NFKC')));
}
function fmtTime(s?: string) {
  if (!s) return '';
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? s : new Intl.DateTimeFormat('en-MY', { dateStyle: 'medium', timeStyle: 'short' }).format(d);
}
const parseTags = (s: string) => s.split(/[\s,]+/).map((t) => t.trim()).filter(Boolean).map((t) => (t.startsWith('#') ? t : `#${t}`));

function Warn({ hits }: { hits: string[] }) {
  if (!hits.length) return null;
  return <div className="never-warn" role="alert"><AlertTriangle size={12} /> Avoid: {hits.map((h) => `"${h}"`).join(', ')}</div>;
}

export function CampaignStudio({ business, selectedId, onSelect }: { business?: Business; selectedId: string; onSelect: (id: string) => void }) {
  const { userId, role, setDirty } = useWorkspace();
  const businessId = business?.id || '';
  const qc = useQueryClient();
  const headers = { headers: { 'x-user-id': userId } };
  const drafts = useListDrafts({ businessId }, { query: { queryKey: getListDraftsQueryKey({ businessId }), enabled: !!businessId, refetchInterval: 5000, staleTime: 0 }, request: headers });
  const update = useUpdateDraft({ request: headers });
  const decide = useDecideDraft({ request: headers });
  const list = useMemo(() => [...(drafts.data || [])], [drafts.data]);
  const draft = list.find((d) => d.id === selectedId);

  const [form, setForm] = useState<Form | null>(null);
  const [base, setBase] = useState<Form | null>(null);
  const [error, setError] = useState<{ message: string; violations: string[] } | null>(null);
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState<'' | 'save' | 'submit' | 'approve' | 'reject'>('');
  const [approveBudget, setApproveBudget] = useState('');
  const [reason, setReason] = useState('');
  const dirty = !!form && !same(form, base);
  const dirtyRef = useRef(dirty);
  dirtyRef.current = dirty;
  const loadedId = useRef('');
  const lastStatus = useRef('');

  useEffect(() => { setDirty(dirty); }, [dirty, setDirty]);
  useEffect(() => () => setDirty(false), [setDirty]);

  // Sync from server without clobbering unsaved edits
  useEffect(() => {
    if (!draft) { if (!selectedId) { setForm(null); setBase(null); loadedId.current = ''; } return; }
    const fresh = toForm(draft);
    if (loadedId.current !== draft.id) {
      loadedId.current = draft.id;
      setForm(fresh); setBase(fresh); setError(null); setNotice(''); setReason('');
      setApproveBudget(String(draft.budgetRM));
    } else if (!dirtyRef.current) {
      setForm(fresh); setBase(fresh);
    } else {
      setBase(fresh);
    }
    if (lastStatus.current !== `${draft.id}:${draft.status}`) {
      lastStatus.current = `${draft.id}:${draft.status}`;
      setApproveBudget(String(draft.budgetRM));
    }
  }, [draft, selectedId]);

  const neverSay = useMemo(() => [...BASE_NEVER, ...(business?.brandKit?.neverSay || [])], [business]);
  const editable = draft && (draft.status === 'draft' || draft.status === 'rejected');

  const refresh = (d: CampaignDraft) => {
    qc.setQueryData<CampaignDraft[]>(getListDraftsQueryKey({ businessId }), (old) => (old ? old.map((x) => (x.id === d.id ? d : x)) : old));
    void qc.invalidateQueries({ queryKey: getListDraftsQueryKey({ businessId }) });
    void qc.invalidateQueries({ queryKey: getListActivityLogQueryKey() });
    const f = toForm(d);
    setForm(f); setBase(f);
    lastStatus.current = `${d.id}:${d.status}`;
    setApproveBudget(String(d.budgetRM));
  };

  const payload = () => {
    if (!form || !draft) return null;
    return {
      draftId: draft.id,
      copy: { ...draft.copy, headline: form.headline, caption_bm: form.caption_bm, caption_en: form.caption_en, hashtags: parseTags(form.hashtags), cta: form.cta },
      offer: form.offer, budgetRM: Number(form.budget), channels: form.channels,
    };
  };

  const save = async (submit: boolean) => {
    const p = payload();
    if (!p) return;
    if (!Number.isFinite(p.budgetRM) || p.budgetRM < 0) { setError({ message: 'Enter a valid budget in RM.', violations: [] }); return; }
    setBusy(submit ? 'submit' : 'save'); setError(null); setNotice('');
    try {
      const d = await update.mutateAsync({ data: submit ? { ...p, action: 'submit' } : p });
      refresh(d);
      setNotice(submit ? 'Sent to the owner for approval.' : 'Changes saved.');
    } catch (e) { setError(apiErrorInfo(e)); } finally { setBusy(''); }
  };

  const decideAction = async (decision: 'approve' | 'reject') => {
    if (!draft) return;
    if (decision === 'reject' && !reason.trim()) { setError({ message: 'Add a reason so staff know what to change.', violations: [] }); return; }
    const budgetRM = Number(approveBudget);
    if (decision === 'approve' && (!Number.isFinite(budgetRM) || budgetRM < 0)) { setError({ message: 'Enter a valid budget in RM.', violations: [] }); return; }
    setBusy(decision); setError(null); setNotice('');
    try {
      const d = await decide.mutateAsync({ data: decision === 'approve' ? { draftId: draft.id, decision, budgetRM } : { draftId: draft.id, decision, reason: reason.trim() } });
      refresh(d); setReason('');
      setNotice(decision === 'approve' ? 'Approved and published (simulated).' : 'Draft returned to staff.');
    } catch (e) { setError(apiErrorInfo(e)); } finally { setBusy(''); }
  };

  const openDraft = (id: string) => {
    if (id === selectedId) return;
    if (dirtyRef.current && !window.confirm('You have unsaved edits. Discard them and open another draft?')) return;
    onSelect(id);
  };

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => (f ? { ...f, [k]: v } : f));
  const toggle = (c: DraftUpdateChannelsItem) => set('channels', form!.channels.includes(c) ? form!.channels.filter((x) => x !== c) : [...form!.channels, c]);

  if (!businessId) return null;

  return (
    <section className="studio" aria-labelledby="studio-heading" data-testid="campaign-studio">
      <div className="options-head">
        <div><div className="info-label">Campaign drafts</div><h3 id="studio-heading">Review, approve, publish</h3></div>
        <p>Drafts stay in server memory until a restart. Staff submit, the owner approves. Publishing is simulated.</p>
      </div>
      <div className="studio-grid">
        <aside className="draft-list" data-testid="draft-list">
          {drafts.isLoading && [0, 1, 2].map((i) => <div key={i} className="skeleton" style={{ height: 54, marginBottom: 8 }} />)}
          {drafts.isError && (
            <div className="error-box compact" role="alert"><span>Drafts could not load.</span><button className="retry-btn" onClick={() => drafts.refetch()}>Try again</button></div>
          )}
          {!drafts.isLoading && !drafts.isError && list.length === 0 && (
            <div className="empty-state small"><strong>No drafts yet</strong>Choose “Prepare campaign” on an option above.</div>
          )}
          {list.map((d) => (
            <button key={d.id} className={`draft-item ${d.id === selectedId ? 'active' : ''}`} onClick={() => openDraft(d.id)} data-testid={`draft-item-${d.id}`}>
              <span className={`status-chip s-${d.status}`}>{STATUS_LABEL[d.status] || d.status}</span>
              <strong>{d.copy.headline || d.option.title}</strong>
              <small>{d.option.title} · RM {d.budgetRM}</small>
            </button>
          ))}
        </aside>

        <div className="editor-card">
          {!draft || !form ? (
            <div className="empty-state"><FileText size={22} style={{ margin: '0 auto 8px', display: 'block' }} /><strong>Open a draft</strong>Pick a draft on the left, or prepare a new one from an option.</div>
          ) : (
            <>
              <div className="editor-head">
                <div>
                  <span className={`status-chip s-${draft.status}`} data-testid="draft-status">{STATUS_LABEL[draft.status]}</span>
                  <span className="source-pill" style={{ marginLeft: 8 }} data-testid="copy-source"><i className="source-dot" />SOURCE · {draft.copy.source.toUpperCase()}</span>
                </div>
                {dirty && <span className="unsaved" data-testid="unsaved-indicator">Unsaved changes</span>}
              </div>

              {draft.status === 'rejected' && draft.rejectReason && (
                <div className="reject-note"><XCircle size={14} /><div><strong>Returned by owner</strong>{draft.rejectReason}</div></div>
              )}

              {draft.status === 'published' && draft.publishResult && (
                <div className="published-panel" data-testid="publish-result">
                  <div className="pub-head"><CheckCircle2 size={18} /><strong>Published</strong><span className="sim-tag">SIMULATED · nothing was posted</span></div>
                  <dl>
                    <div><dt>Platforms</dt><dd>{draft.publishResult.platforms.join(', ') || '—'}</dd></div>
                    {Object.entries(draft.publishResult.postIds).map(([k, v]) => <div key={k}><dt>{k} post ID</dt><dd className="mono">{v}</dd></div>)}
                    {draft.publishResult.adId && <div><dt>Ad ID</dt><dd className="mono">{draft.publishResult.adId}</dd></div>}
                    <div><dt>Budget</dt><dd>RM {draft.budgetRM.toLocaleString('en-MY')}</dd></div>
                    <div><dt>Published at</dt><dd>{fmtTime(draft.publishResult.publishedAt)}</dd></div>
                    <div><dt>Status</dt><dd>{draft.publishResult.status}</dd></div>
                  </dl>
                </div>
              )}

              <div className="editor-body">
                <fieldset className="fields" disabled={!editable || !!busy}>
                  <label>Headline<input value={form.headline} onChange={(e) => set('headline', e.target.value)} maxLength={300} data-testid="input-headline" /></label>
                  <Warn hits={findViolations(form.headline, neverSay)} />
                  <label>Caption · Bahasa Malaysia{business?.brandKit.language !== 'en' && ' · Preferred'}<textarea rows={3} value={form.caption_bm} onChange={(e) => set('caption_bm', e.target.value)} data-testid="input-caption-bm" /></label>
                  <Warn hits={findViolations(form.caption_bm, neverSay)} />
                  <label>Caption · English{business?.brandKit.language !== 'bm' && ' · Preferred'}<textarea rows={3} value={form.caption_en} onChange={(e) => set('caption_en', e.target.value)} data-testid="input-caption-en" /></label>
                  <Warn hits={findViolations(form.caption_en, neverSay)} />
                  <label>Hashtags<input value={form.hashtags} onChange={(e) => set('hashtags', e.target.value)} placeholder="#jerebu #kopi" data-testid="input-hashtags" /></label>
                  <Warn hits={findViolations(form.hashtags, neverSay)} />
                  <label>Call to action<input value={form.cta} onChange={(e) => set('cta', e.target.value)} data-testid="input-cta" /></label>
                  <Warn hits={findViolations(form.cta, neverSay)} />
                  <label>Offer<input value={form.offer} onChange={(e) => set('offer', e.target.value)} data-testid="input-offer" /></label>
                  <Warn hits={findViolations(form.offer, neverSay)} />
                  <div className="two-col">
                    <label>Budget (RM) · cap RM{business?.brandKit.monthlyAdBudgetCapRM}<input type="number" min={0} step="1" value={form.budget} onChange={(e) => set('budget', e.target.value)} data-testid="input-budget" />
                      {Number(form.budget) > (business?.brandKit.monthlyAdBudgetCapRM ?? 0) && <span className="never-warn">Budget exceeds the business cap.</span>}
                    </label>
                    <div className="channels" role="group" aria-label="Channels">
                      <span>Channels</span>
                      {(['facebook', 'instagram'] as const).map((c) => (
                        <label key={c} className="check"><input type="checkbox" checked={form.channels.includes(c)} onChange={() => toggle(c)} data-testid={`check-${c}`} />{c === 'facebook' ? 'Facebook' : 'Instagram'}</label>
                      ))}
                      {['WhatsApp', 'TikTok'].map((c) => <label key={c} className="check off"><input type="checkbox" disabled />{c}<em>soon</em></label>)}
                    </div>
                  </div>
                  {draft.copy.rationale && <p className="rationale"><span>Rationale</span>{draft.copy.rationale}</p>}
                </fieldset>
                <PosterPreview business={business} headline={form.headline} offer={form.offer} cta={form.cta} />
              </div>

              {error && (
                <div className="error-box compact" role="alert" data-testid="draft-error">
                  <div><strong>{error.message}</strong>{error.violations.length > 0 && <ul>{error.violations.map((v) => <li key={v}>{v}</li>)}</ul>}</div>
                </div>
              )}
              {notice && !error && <div className="notice" role="status">{notice}</div>}

              {editable && (
                <div className="editor-actions">
                  <button className="action-btn" onClick={() => save(false)} disabled={!!busy || !dirty} data-testid="button-save-draft">
                    {busy === 'save' && <RefreshCw size={13} className="animate-spin" />}Save draft
                  </button>
                  <button className="action-btn primary" onClick={() => save(true)} disabled={!!busy} data-testid="button-submit-draft">
                    {busy === 'submit' ? <RefreshCw size={13} className="animate-spin" /> : <Send size={13} />}{dirty ? 'Save and submit' : 'Submit for approval'}
                  </button>
                </div>
              )}

              {draft.status === 'pending_approval' && role !== 'owner' && (
                <div className="notice">Waiting for the owner. Switch to Mr. Tan · Owner to review.</div>
              )}
              {draft.status === 'pending_approval' && role === 'owner' && (
                <div className="approval-box" data-testid="approval-controls">
                  <div className="info-label">Owner decision</div>
                  <div className="approval-row">
                    <label>Approved budget (RM) · cap RM{business?.brandKit.monthlyAdBudgetCapRM}<input type="number" min={0} value={approveBudget} onChange={(e) => setApproveBudget(e.target.value)} disabled={!!busy} data-testid="input-approve-budget" />
                      {Number(approveBudget) > (business?.brandKit.monthlyAdBudgetCapRM ?? 0) && <span className="never-warn">Budget exceeds the business cap.</span>}
                    </label>
                    <button className="action-btn primary" onClick={() => decideAction('approve')} disabled={!!busy} data-testid="button-approve">
                      {busy === 'approve' ? <RefreshCw size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}{busy === 'approve' ? 'Publishing (simulated)…' : 'Approve and publish'}
                    </button>
                  </div>
                  <div className="approval-row">
                    <label>Reason for rejecting<input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Required to reject" disabled={!!busy} data-testid="input-reject-reason" /></label>
                    <button className="action-btn danger" onClick={() => decideAction('reject')} disabled={!!busy || !reason.trim()} data-testid="button-reject">
                      {busy === 'reject' ? <RefreshCw size={13} className="animate-spin" /> : <XCircle size={13} />}Reject
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
