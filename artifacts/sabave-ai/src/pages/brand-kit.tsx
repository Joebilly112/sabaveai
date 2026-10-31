import { useCallback, useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, RotateCcw, Save } from 'lucide-react';
import {
  getGetBusinessQueryKey, getListActivityLogQueryKey, getListBusinessesQueryKey,
  useCreateBusiness, useGetBusiness, useListBusinesses, useUpdateBusiness,
} from '@workspace/api-client-react';
import type { Business } from '@workspace/api-client-react';
import { AppHeader } from '@/components/AppHeader';
import { BrandKitForm } from '@/components/brand/BrandKitForm';
import { asArray } from '@/lib/as-array';
import { listBusinessesQuery, userHeaders } from '@/lib/session-api';
import { useWorkspace, apiErrorInfo } from '@/lib/workspace';
import { blankForm, fromBusiness, toInput, type FormState } from '@/lib/brandForm';
import { useToast } from '@/hooks/use-toast';

export default function BrandKitPage() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { businessId, setBusinessId, userId, setDirty, confirmLeave } = useWorkspace();
  const businessesQuery = useListBusinesses(listBusinessesQuery(userId));
  const businesses = asArray<Business>(businessesQuery.data);
  const [mode, setMode] = useState<'edit' | 'new'>('edit');
  const detail = useGetBusiness(businessId, { query: { enabled: mode === 'edit' && !!businessId, queryKey: getGetBusinessQueryKey(businessId) }, request: userHeaders(userId) });
  const headers = { 'x-user-id': userId };
  const createBiz = useCreateBusiness({ request: { headers } });
  const updateBiz = useUpdateBusiness({ request: { headers } });

  const [form, setForm] = useState<FormState>(blankForm);
  const [baseline, setBaseline] = useState(() => JSON.stringify(blankForm()));
  const [epoch, setEpoch] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const [busy, setBusy] = useState({ poster: false, website: false });
  const loadedFor = useRef<string | null>(null);

  const load = useCallback((f: FormState, key: string) => {
    loadedFor.current = key; setForm(f); setBaseline(JSON.stringify(f)); setErrors([]);
    setBusy({ poster: false, website: false }); setEpoch((n) => n + 1);
  }, []);

  useEffect(() => {
    if (mode === 'edit' && detail.data && detail.data.id === businessId && loadedFor.current !== businessId) load(fromBusiness(detail.data), businessId);
  }, [mode, detail.data, businessId, load]);
  // Header business switch while composing a new business: return to edit mode for that business.
  const lastBiz = useRef(businessId);
  useEffect(() => { if (lastBiz.current !== businessId) { lastBiz.current = businessId; if (mode === 'new') setMode('edit'); } }, [businessId, mode]);

  const dirty = JSON.stringify(form) !== baseline;
  useEffect(() => { setDirty(dirty); }, [dirty, setDirty]);
  useEffect(() => () => setDirty(false), [setDirty]);

  const update = useCallback((p: Partial<FormState>) => setForm((f) => ({ ...f, ...p })), []);
  const onBusy = useCallback((k: 'poster' | 'website', b: boolean) => setBusy((s) => ({ ...s, [k]: b })), []);

  const startNew = () => { if (!confirmLeave()) return; setMode('new'); load(blankForm(), '__new__'); };
  const backToEdit = () => {
    if (!confirmLeave()) return;
    setMode('edit'); loadedFor.current = null;
    if (detail.data && detail.data.id === businessId) load(fromBusiness(detail.data), businessId);
  };
  const discard = () => { const f = JSON.parse(baseline) as FormState; setForm(f); setErrors([]); setEpoch((n) => n + 1); };

  const saving = createBiz.isPending || updateBiz.isPending;
  const save = async () => {
    const { input, errors: errs } = toInput(form);
    setErrors(errs);
    if (!input) { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    try {
      const saved = mode === 'new' ? await createBiz.mutateAsync({ data: input }) : await updateBiz.mutateAsync({ id: businessId, data: input });
      qc.setQueryData(getGetBusinessQueryKey(saved.id), saved);
      await Promise.all([
        qc.invalidateQueries({ queryKey: getListBusinessesQueryKey() }),
        qc.invalidateQueries({ queryKey: getGetBusinessQueryKey(saved.id) }),
        qc.invalidateQueries({ queryKey: getListActivityLogQueryKey() }),
      ]);
      lastBiz.current = saved.id;
      setMode('edit'); setBusinessId(saved.id); load(fromBusiness(saved), saved.id);
      toast({ title: mode === 'new' ? 'Business created' : 'Brand kit saved', description: `${saved.name} is selected. Remember: data resets when the server restarts.` });
    } catch (e) {
      const info = apiErrorInfo(e);
      setErrors([info.message, ...info.violations]);
    }
  };

  const analysing = busy.poster || busy.website;
  const loading = mode === 'edit' && (businessesQuery.isLoading || (detail.isLoading && loadedFor.current !== businessId));
  const current = businesses.find((b) => b.id === businessId);

  return (
    <div className="app-shell app-dark">
      <AppHeader businesses={businesses} isLoading={businessesQuery.isLoading} />
      <main className="content-wrap kit-wrap">
        <section className="page-heading">
          <div>
            <div className="eyebrow">{mode === 'new' ? 'Onboarding · new business' : 'Brand kit'}</div>
            <h1 data-testid="text-kit-title">{mode === 'new' ? (form.name.trim() || 'A new shop') : (current?.name || 'Brand kit')}</h1>
            <p className="heading-sub">Everything sabave.ai needs to write campaigns that sound like you.</p>
          </div>
          <div className="actions">
            {mode === 'new'
              ? <button className="action-btn" onClick={backToEdit} disabled={saving} data-testid="button-cancel-new">Cancel new</button>
              : <button className="action-btn" onClick={startNew} disabled={saving} data-testid="button-new-business"><Plus size={14} />New business</button>}
          </div>
        </section>

        <div className="memory-note" data-testid="text-memory-note">
          <strong>Pilot sandbox.</strong> Brand kits and uploaded images live in server memory only, with synthetic data. Everything resets when the server restarts.
        </div>

        {errors.length > 0 && (
          <div className="error-box kit-errors" role="alert" data-testid="error-save">
            <div><strong>Fix these before saving</strong><ul>{errors.map((e) => <li key={e}>{e}</li>)}</ul></div>
          </div>
        )}

        {mode === 'edit' && detail.isError ? (
          <div className="error-box" role="alert"><span>This business could not load.</span><button className="retry-btn" onClick={() => detail.refetch()} data-testid="button-retry-business">Try again</button></div>
        ) : mode === 'edit' && !businessesQuery.isLoading && businesses.length === 0 ? (
          <div className="empty-state"><strong>No businesses yet</strong>Start your first brand kit.<button className="action-btn primary" onClick={startNew} style={{ marginTop: 14 }} data-testid="button-empty-new">New business</button></div>
        ) : loading ? (
          <div className="kit-form">{[0, 1, 2].map((i) => <div key={i} className="skeleton" style={{ height: 220, borderRadius: 18 }} />)}</div>
        ) : (
          <fieldset disabled={saving} style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}>
            <BrandKitForm key={epoch} form={form} update={update} businessId={mode === 'edit' ? businessId : undefined} userId={userId} team={mode === 'edit' ? asArray(detail.data && typeof detail.data === 'object' ? detail.data.teamMembers : undefined) : undefined} epoch={epoch} busy={busy} onBusy={onBusy} />
          </fieldset>
        )}

        <div className={`save-bar ${dirty ? 'is-dirty' : ''}`}>
          <span className="save-state" data-testid="status-dirty">{analysing ? 'Analysis running…' : dirty ? 'Unsaved changes' : 'All changes saved'}</span>
          <div className="actions">
            <button className="action-btn" onClick={discard} disabled={!dirty || saving || analysing} data-testid="button-discard"><RotateCcw size={13} />Discard</button>
            <button className="action-btn primary" onClick={save} disabled={saving || analysing || loading || (!dirty && mode === 'edit')} data-testid="button-save-kit">
              <Save size={14} />{saving ? 'Saving…' : mode === 'new' ? 'Create business' : 'Save brand kit'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
