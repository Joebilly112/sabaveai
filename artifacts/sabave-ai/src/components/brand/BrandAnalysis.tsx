import { useEffect, useRef, useState } from 'react';
import { Globe, Sparkles } from 'lucide-react';
import { useAnalyzePoster, useAnalyzeWebsite } from '@workspace/api-client-react';
import { useWorkspace, apiErrorInfo } from '@/lib/workspace';
import { isHex } from '@/lib/colorExtract';
import type { FormState } from '@/lib/brandForm';

type Props = { form: FormState; update: (p: Partial<FormState>) => void; businessId?: string; epoch: number; onBusy: (k: 'poster' | 'website', b: boolean) => void };

const posterSig = (f: FormState) => JSON.stringify([f.posterColours, f.posterDescription.trim(), f.toneChips]);

function localPosterSummary(f: FormState) {
  const tone = f.toneChips.length ? f.toneChips.slice(0, 3).join(', ').toLowerCase() : 'friendly';
  return `Offline style notes: lean on ${f.posterColours.slice(0, 3).join(' / ') || 'your brand colours'}, keep a ${tone} voice, and echo this reference: ${f.posterDescription.trim().slice(0, 220)}`;
}

export function PosterAnalysisPanel({ form, update, businessId, epoch, onBusy }: Props) {
  const { userId } = useWorkspace();
  const analyze = useAnalyzePoster({ request: { headers: { 'x-user-id': userId } } });
  const [state, setState] = useState<{ kind: 'idle' | 'ok' | 'fallback' | 'stale' | 'error'; msg?: string }>({ kind: 'idle' });
  const epochRef = useRef(epoch); epochRef.current = epoch;
  const formRef = useRef(form); formRef.current = form;
  const onBusyRef = useRef(onBusy); onBusyRef.current = onBusy;
  useEffect(() => { setState({ kind: 'idle' }); }, [epoch]);

  const colours = form.posterColours.filter(isHex);
  const can = colours.length > 0 && form.posterDescription.trim().length > 0 && !analyze.isPending;

  const run = async () => {
    const startEpoch = epoch; const sig = posterSig(form);
    onBusyRef.current('poster', true);
    try {
      // Text only: colours, description, tone chips. Images never leave the browser here.
      const res = await analyze.mutateAsync({ data: { businessId, colours: colours.slice(0, 5), description: form.posterDescription.trim().slice(0, 2000), toneChips: form.toneChips } });
      if (epochRef.current !== startEpoch) return;
      if (posterSig(formRef.current) !== sig) { setState({ kind: 'stale', msg: 'Inputs changed while analysing, so the result was discarded. Run it again.' }); return; }
      update({ posterStyleSummary: (res.summary || localPosterSummary(formRef.current)).slice(0, 3000) });
      setState({ kind: res.fallback ? 'fallback' : 'ok', msg: res.fallback ? 'AI is unavailable, so a rule-based summary was used.' : res.model ? `Analysed by ${res.model}` : 'Analysed.' });
    } catch (e) {
      if (epochRef.current !== startEpoch) return;
      if (posterSig(formRef.current) === sig) update({ posterStyleSummary: localPosterSummary(formRef.current) });
      setState({ kind: 'error', msg: `${apiErrorInfo(e).message} An offline summary was written instead; edit freely.` });
    } finally { if (epochRef.current === startEpoch) onBusyRef.current('poster', false); }
  };

  return (
    <div className="analysis-block">
      <div className="analysis-head">
        <div><span className="field-label">Poster style summary</span><small className="field-hint">Saved with the brand kit and used by campaign drafts.</small></div>
        <button type="button" className="action-btn primary small" disabled={!can} onClick={run} data-testid="button-analyze-poster"><Sparkles size={13} />{analyze.isPending ? 'Analysing…' : 'Analyze style'}</button>
      </div>
      {!colours.length || !form.posterDescription.trim() ? <p className="field-hint">Needs at least one poster colour and a short description.</p> : null}
      <textarea className="text-input" rows={3} maxLength={3000} value={form.posterStyleSummary} disabled={analyze.isPending}
        placeholder="Run analysis or write your own notes on layout, type and mood." onChange={(e) => update({ posterStyleSummary: e.target.value })} data-testid="input-poster-summary" />
      {state.msg && <p className={`analysis-note n-${state.kind}`} data-testid="status-poster-analysis">{state.msg}</p>}
    </div>
  );
}

export function WebsiteAnalysisPanel({ form, update, businessId, epoch, onBusy }: Props) {
  const { userId } = useWorkspace();
  const analyze = useAnalyzeWebsite({ request: { headers: { 'x-user-id': userId } } });
  const [state, setState] = useState<{ kind: 'idle' | 'ok' | 'fallback' | 'stale' | 'error'; msg?: string; themes?: string[] }>({ kind: 'idle' });
  const epochRef = useRef(epoch); epochRef.current = epoch;
  const formRef = useRef(form); formRef.current = form;
  const onBusyRef = useRef(onBusy); onBusyRef.current = onBusy;
  useEffect(() => { setState({ kind: 'idle' }); }, [epoch]);

  const url = form.websiteUrl.trim();
  const run = async () => {
    const startEpoch = epoch; const sig = url;
    onBusyRef.current('website', true);
    try {
      const res = await analyze.mutateAsync({ data: { businessId, url: url.slice(0, 2000) } });
      if (epochRef.current !== startEpoch) return;
      if (formRef.current.websiteUrl.trim() !== sig) { setState({ kind: 'stale', msg: 'URL changed while analysing; result discarded.' }); return; }
      if (res.voiceSummary && !res.fallback) {
        update({ websiteVoiceSummary: res.voiceSummary.slice(0, 3000) });
        setState({ kind: 'ok', msg: res.model ? `Read by ${res.model}` : 'Website analysed.', themes: res.keyThemes });
      } else {
        if (res.voiceSummary) update({ websiteVoiceSummary: res.voiceSummary.slice(0, 3000) });
        setState({ kind: 'fallback', msg: 'Website could not be analysed right now. Your written ethos will guide the voice instead.' });
      }
    } catch (e) {
      if (epochRef.current !== startEpoch) return;
      setState({ kind: 'error', msg: `${apiErrorInfo(e).message} Your ethos will be used for voice.` });
    } finally { if (epochRef.current === startEpoch) onBusyRef.current('website', false); }
  };

  return (
    <div className="analysis-block">
      <label className="field-label" htmlFor="website-url">Website or social page</label>
      <div className="inline-row">
        <input id="website-url" className="text-input" type="url" placeholder="https://kopi-lane.my" value={form.websiteUrl} maxLength={2000} disabled={analyze.isPending}
          onChange={(e) => update({ websiteUrl: e.target.value })} data-testid="input-website-url" />
        <button type="button" className="action-btn small" disabled={!url || analyze.isPending} onClick={run} data-testid="button-analyze-website"><Globe size={13} />{analyze.isPending ? 'Reading…' : 'Analyze website'}</button>
      </div>
      <textarea className="text-input" rows={3} maxLength={3000} value={form.websiteVoiceSummary} disabled={analyze.isPending}
        placeholder="Voice summary appears here. Leave blank to rely on your ethos." onChange={(e) => update({ websiteVoiceSummary: e.target.value })} data-testid="input-website-voice" />
      {state.msg && <p className={`analysis-note n-${state.kind}`} data-testid="status-website-analysis">{state.msg}</p>}
      {state.themes?.length ? <div className="chip-row">{state.themes.map((t) => <span className="chip soft" key={t}>{t}</span>)}</div> : null}
    </div>
  );
}
