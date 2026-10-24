import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { ArrowUpRight, CloudFog, Leaf, RefreshCw, ShieldCheck, Sparkles, SunDim } from 'lucide-react';
import { getListActivityLogQueryKey, getListBusinessesQueryKey, getListDraftsQueryKey, useGenerateDraft, useGetAIStatus, useListBusinesses, useTriggerSignal } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import type { Business, SignalDay, SignalForecast, TriggerResult } from '@workspace/api-client-react';
import { AlertCard } from '@/components/AlertCard';
import { OptionCard } from '@/components/OptionCard';
import { AppHeader } from '@/components/AppHeader';
import { CampaignStudio } from '@/components/CampaignStudio';
import { apiErrorInfo, useWorkspace } from '@/lib/workspace';

type ForecastAction = 'check' | 'simulate';

const severityColors = ['#4e9b74', '#d1a447', '#df8054', '#ba5149'];

function formatDate(date: string) {
  const value = new Date(date.length === 10 ? `${date}T12:00:00` : date);
  if (Number.isNaN(value.getTime())) return { day: date, date };
  return {
    day: new Intl.DateTimeFormat('en-MY', { weekday: 'short' }).format(value),
    date: new Intl.DateTimeFormat('en-MY', { day: 'numeric', month: 'short' }).format(value),
  };
}

function sourceLabel(source: SignalForecast['source']) {
  if (source === 'simulated') return 'SIMULATED';
  if (source === 'offline') return 'OFFLINE DATA';
  return 'LIVE · OPEN-METEO';
}

function ForecastDay({ day, index }: { day: SignalDay; index: number }) {
  const date = formatDate(day.date);
  const level = Math.max(0, Math.min(3, day.level));
  return (
    <article className="day-card" data-testid={`forecast-day-${index}`}>
      <div className="day-name" data-testid={`forecast-weekday-${index}`}>{date.day}</div>
      <div className="day-date" data-testid={`forecast-date-${index}`}>{date.date}</div>
      <div className="haze-visual" aria-hidden="true">
        {level === 0 ? <SunDim size={32} strokeWidth={1.55} /> : <CloudFog size={35} strokeWidth={1.55} />}
      </div>
      <div className="reading" data-testid={`forecast-value-${index}`}>
        <strong>{Number.isFinite(day.value) ? day.value : '—'}</strong>
        <span>{day.unit}</span>
      </div>
      <div className="severity" data-testid={`forecast-severity-${index}`}>
        <span className="severity-bars" aria-label={`Severity ${level} of 3`}>
          {[0, 1, 2, 3].map((bar) => (
            <i key={bar} className={bar <= level ? 'filled' : ''} style={{ '--severity-color': severityColors[level] } as CSSProperties} />
          ))}
        </span>
        <span>{day.levelLabel}</span>
      </div>
      <div className="day-detail">{day.detail || '\u00a0'}</div>
    </article>
  );
}

function LoadingForecast() {
  return (
    <div className="forecast-grid" aria-label="Loading forecast" data-testid="forecast-loading">
      {[0, 1, 2, 3, 4].map((item) => (
        <div className="day-card" key={item}>
          <div className="skeleton" style={{ width: 48, height: 10 }} />
          <div className="skeleton" style={{ width: 62, height: 13, marginTop: 9 }} />
          <div className="skeleton" style={{ width: 54, height: 54, margin: '14px auto' }} />
          <div className="skeleton" style={{ width: 76, height: 25 }} />
          <div className="skeleton" style={{ width: 92, height: 13, marginTop: 12 }} />
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const businessesQuery = useListBusinesses({ query: { queryKey: getListBusinessesQueryKey() } });
  const businesses = (businessesQuery.data || []) as Business[];
  const { businessId: selectedId, role: user, userId, confirmLeave } = useWorkspace();
  const queryClient = useQueryClient();
  const [draftId, setDraftId] = useState('');
  const [preparing, setPreparing] = useState('');
  const [prepareError, setPrepareError] = useState('');
  const [requestedAction, setRequestedAction] = useState<ForecastAction | null>(null);
  const [result, setResult] = useState<TriggerResult | null>(null);
  const [triggerError, setTriggerError] = useState(false);
  const selectedBusiness = useMemo(
    () => businesses.find((business) => business.id === selectedId) || businesses[0],
    [businesses, selectedId],
  );
  const businessId = selectedBusiness?.id || '';
  const trigger = useTriggerSignal({ request: { headers: { 'x-user-id': userId } } });
  const generate = useGenerateDraft({ request: { headers: { 'x-user-id': userId } } });
  const aiStatus = useGetAIStatus();
  const aiConfigured = !!aiStatus.data?.configured;
  const [useAI, setUseAI] = useState<boolean | null>(null);
  const aiOn = aiConfigured && (useAI ?? true);

  const prepare = async (alertId: string, optionId: string) => {
    if (!businessId || !confirmLeave()) return;
    setPreparing(optionId); setPrepareError('');
    try {
      const draft = await generate.mutateAsync({ data: { businessId, alertId, optionId, useAI: aiOn } });
      queryClient.setQueryData(getListDraftsQueryKey({ businessId }), (old: unknown) => (Array.isArray(old) ? [draft, ...old] : [draft]));
      void queryClient.invalidateQueries({ queryKey: getListDraftsQueryKey({ businessId }) });
      void queryClient.invalidateQueries({ queryKey: getListActivityLogQueryKey() });
      if (currentBusiness.current !== businessId) return;
      setDraftId(draft.id);
      requestAnimationFrame(() => document.getElementById('studio-heading')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    } catch (e) { if (currentBusiness.current === businessId) setPrepareError(apiErrorInfo(e).message); } finally { setPreparing(''); }
  };
  const mutateRef = useRef(trigger.mutateAsync);
  mutateRef.current = trigger.mutateAsync;
  const requestSeq = useRef(0);
  const currentBusiness = useRef('');

  const runForecast = useCallback(async (action: ForecastAction) => {
    const id = currentBusiness.current;
    if (!id) return;
    const seq = ++requestSeq.current;
    setRequestedAction(action);
    setTriggerError(false);
    setResult(null);
    try {
      const res = await mutateRef.current({ data: { businessId: id, signalId: 'haze', simulate: action === 'simulate' } });
      if (seq !== requestSeq.current || id !== currentBusiness.current) return;
      setResult(res);
    } catch {
      if (seq !== requestSeq.current || id !== currentBusiness.current) return;
      setTriggerError(true);
    } finally {
      if (seq === requestSeq.current) setRequestedAction(null);
    }
  }, []);

  useEffect(() => {
    currentBusiness.current = businessId;
    setDraftId('');
    setPrepareError('');
    requestSeq.current += 1;
    setResult(null);
    setTriggerError(false);
    setRequestedAction(null);
    if (businessId) {
      void runForecast('check');
    }
  }, [businessId, runForecast]);

  const forecast = result && result.forecast.businessId === businessId ? result.forecast : undefined;
  const isFetching = requestedAction !== null;
  const forecastQuery = { isFetching, isError: triggerError };
  const isLoadingBusinesses = businessesQuery.isLoading;
  const noBusiness = !isLoadingBusinesses && businesses.length === 0;

  return (
    <div className="app-shell">
      <AppHeader businesses={businesses} isLoading={isLoadingBusinesses} />

      <main className="content-wrap">
        <section className="page-heading" aria-labelledby="dashboard-heading">
          <div>
            <div className="eyebrow">Weather watch / Malaysia</div>
            <h1 id="dashboard-heading">Good to see you.</h1>
            <p className="heading-sub">A clear view of the weather ahead for your business.</p>
          </div>
          <div className="business-heading" data-testid="selected-business">
            <strong>{selectedBusiness?.name || (isLoadingBusinesses ? 'Loading business…' : 'Business unavailable')}</strong>
            <span>{selectedBusiness ? `${selectedBusiness.city} · ${selectedBusiness.type}` : 'Choose a business to view its forecast'}</span>
          </div>
        </section>

        {businessesQuery.isError && (
          <div className="error-box" role="alert" data-testid="businesses-error">
            <span>We couldn’t load your businesses. Check your connection and try again.</span>
            <button className="retry-btn" onClick={() => businessesQuery.refetch()} data-testid="button-retry-businesses">Try again</button>
          </div>
        )}

        {noBusiness ? (
          <section className="forecast-panel empty-state" data-testid="businesses-empty">
            <strong>No business data yet</strong>
            The forecast will appear here once a business is available.
          </section>
        ) : (
          <section className="forecast-panel" aria-labelledby="forecast-heading">
            <div className="forecast-head">
              <div className="forecast-title">
                <div className="haze-icon"><CloudFog size={24} strokeWidth={1.7} /></div>
                <div>
                  <h2 id="forecast-heading">Five-day haze forecast</h2>
                  <p>Air quality outlook · {selectedBusiness?.city || 'Malaysia'}</p>
                </div>
              </div>
              <div className="actions">
                <button
                  className="action-btn primary"
                  onClick={() => runForecast('check')}
                  disabled={!selectedBusiness || isFetching}
                  data-testid="button-check-forecast"
                >
                  <RefreshCw size={14} className={requestedAction === 'check' ? 'animate-spin' : ''} />
                  {requestedAction === 'check' ? 'Checking…' : 'Check forecast'}
                </button>
                <button
                  className="action-btn"
                  onClick={() => runForecast('simulate')}
                  disabled={!selectedBusiness || isFetching}
                  data-testid="button-simulate-forecast"
                >
                  {requestedAction === 'simulate' ? <RefreshCw size={14} className="animate-spin" /> : <ArrowUpRight size={14} />}
                  {requestedAction === 'simulate' ? 'Simulating…' : 'Simulate'}
                </button>
              </div>
            </div>

            {forecastQuery.isFetching && <LoadingForecast />}
            {!forecastQuery.isFetching && forecastQuery.isError && (
              <div className="error-box" role="alert" data-testid="forecast-error">
                <span>The forecast could not be reached. You can try again in a moment.</span>
                <button
                  className="retry-btn"
                  onClick={() => runForecast(requestedAction || 'check')}
                  data-testid="button-retry-forecast"
                >
                  Try again
                </button>
              </div>
            )}
            {!forecastQuery.isFetching && !forecast && !forecastQuery.isError && (
              <div className="empty-state" data-testid="forecast-empty">
                <strong>Your forecast is ready when you are</strong>
                Choose “Check forecast” for the latest available outlook.
              </div>
            )}
            {forecast && !forecastQuery.isFetching && (
              <>
                <div className="forecast-meta">
                  <span className="source-pill" data-testid="forecast-source"><i className="source-dot" />{sourceLabel(forecast.source)}</span>
                  <span className="updated-time" data-testid="forecast-updated">
                    Updated {new Intl.DateTimeFormat('en-MY', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(forecast.fetchedAt))}
                  </span>
                </div>
                {forecast.days.length > 0 ? (
                  <div className="forecast-grid" data-testid="forecast-days">
                    {forecast.days.slice(0, 5).map((day, index) => <ForecastDay day={day} index={index} key={`${day.date}-${index}`} />)}
                  </div>
                ) : (
                  <div className="empty-state" data-testid="forecast-days-empty"><strong>No daily readings found</strong>Try checking the forecast again.</div>
                )}
                <div className="legend-row">
                  <span className="legend-label">Haze severity</span>
                  <div className="legend-items" data-testid="severity-legend">
                    {['Low', 'Elevated', 'High', 'Very high'].map((label, index) => (
                      <span className="legend-item" key={label}><i className="legend-swatch" style={{ background: severityColors[index] }} />{index} · {label}</span>
                    ))}
                  </div>
                </div>
              </>
            )}
          </section>
        )}

        {!noBusiness && forecast && result && !isFetching && (
          <div className="signal-stack" data-testid="signal-results">
            {result.alert ? (
              <AlertCard alert={result.alert} city={selectedBusiness?.city || 'Malaysia'} salesDipPct={selectedBusiness?.brandKit?.lastBadWeatherDipPct} />
            ) : (
              <section className="calm-card" data-testid="alert-none">
                <Leaf size={22} strokeWidth={1.7} />
                <div>
                  <h3>Clear skies for business</h3>
                  <p>No haze warning for {selectedBusiness?.city || 'your area'} in the next five days. Nothing to act on right now.</p>
                </div>
              </section>
            )}
            {result.alert && (
              <section aria-labelledby="options-heading" data-testid="campaign-options">
                <div className="options-head">
                  <div>
                    <div className="info-label">Campaign options</div>
                    <h3 id="options-heading">Ways to keep sales steady</h3>
                  </div>
                  <p>Each option explains why it fits this warning. Budgets are suggestions in RM.</p>
                </div>
                <div className="ai-toggle-row" data-testid="ai-toggle-row">
                  <label className={`ai-toggle ${aiConfigured ? '' : 'off'}`}>
                    <input type="checkbox" role="switch" aria-checked={aiOn} checked={aiOn} disabled={!aiConfigured || !!preparing} onChange={(e) => setUseAI(e.target.checked)} aria-describedby="ai-toggle-help" data-testid="toggle-use-ai" />
                    <span className="ai-switch" aria-hidden="true"><i /></span>
                    <span><Sparkles size={13} /> Write copy with AI</span>
                  </label>
                  <span id="ai-toggle-help" className="ai-help" data-testid="text-ai-status">
                    {aiStatus.isLoading ? 'Checking AI availability…' : aiConfigured ? `DeepSeek${aiStatus.data?.model ? ` · ${aiStatus.data.model}` : ''} · falls back to templates if it fails` : 'AI copy is unavailable: no DeepSeek API key is configured. Template copy will be used.'}
                  </span>
                </div>
                {result.options.length > 0 ? (
                  <div className="options-grid">
                    {result.options.map((option, index) => <OptionCard option={option} index={index} key={option.id} preparing={preparing === option.id} preparingLabel={aiOn ? 'Writing with AI…' : 'Preparing…'} disabled={!!preparing} onPrepare={() => result.alert && prepare(result.alert.id, option.id)} />)}
                  </div>
                ) : (
                  <div className="info-card empty-state" data-testid="options-empty"><strong>No options for this warning</strong>Check the forecast again later.</div>
                )}
                {prepareError && <div className="error-box compact" role="alert" data-testid="prepare-error"><span>{prepareError}</span></div>}
              </section>
            )}
          </div>
        )}

        {!noBusiness && <CampaignStudio key={businessId} business={selectedBusiness} selectedId={draftId} onSelect={setDraftId} />}

        <div className="below-grid">
          <section className="info-card" data-testid="role-awareness-card">
            <div className="info-label">Your workspace</div>
            <h3>{user === 'owner' ? 'Owner view' : 'Staff view'} <span style={{ color: 'hsl(var(--primary))' }}>·</span> {user === 'owner' ? 'Mr. Tan' : 'Aisyah'}</h3>
            <p>{user === 'owner' ? 'You are viewing this dashboard as the business owner. You approve or reject drafts that staff submit. Approval publishes a simulated campaign.' : 'You are viewing this dashboard as a staff member. You can prepare campaign drafts and submit them to the owner.'}</p>
          </section>
          <section className="info-card" data-testid="forecast-context-card">
            <div className="risk-note">
              <ShieldCheck className="risk-symbol" size={19} strokeWidth={1.8} />
              <div>
                <div className="info-label">A note on this forecast</div>
                <h3>Plan with a little more context.</h3>
                <p>Severity levels run from 0 to 3. Forecast availability can vary by location and connection.</p>
              </div>
            </div>
          </section>
        </div>
        <footer className="footer-line">
          <span className="footer-brand">sabave.ai <span style={{ color: 'hsl(var(--accent))' }}>×</span> Orbyte</span>
          <span>Weather signals for the people who keep business moving.</span>
        </footer>
      </main>
    </div>
  );
}
