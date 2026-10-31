import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Link } from 'wouter';
import { Check, RefreshCw, Sparkles } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import {
  getListActivityLogQueryKey,
  getListBusinessesQueryKey,
  getListDraftsQueryKey,
  useGenerateDraft,
  useGetAIStatus,
  useListActivityLog,
  useListBusinesses,
  useListDrafts,
  useTriggerSignal,
} from '@workspace/api-client-react';
import type { CampaignDraft, LogEntry, TriggerResult } from '@workspace/api-client-react';
import { OptionCard } from '@/components/OptionCard';
import { AppHeader } from '@/components/AppHeader';
import { SabaveLogo } from '@/components/SabaveLogo';
import { CampaignStudio } from '@/components/CampaignStudio';
import { ForecastStrip } from '@/components/dashboard/forecast-strip';
import { WeatherMap } from '@/components/dashboard/weather-map';
import { formatDay, formatStamp, malaysiaToday, peakDay, scrollToSection } from '@/components/dashboard/format';
import { apiErrorInfo, useWorkspace } from '@/lib/workspace';

type ForecastAction = 'check' | 'simulate';
type JourneyPhase = 'forecast' | 'options' | 'approval' | 'published';

const TYPE_LABEL: Record<string, string> = {
  cafe: 'Cafe',
  laundromat: 'Laundromat',
  retail: 'Retail',
  other: 'Other',
};
const JOURNEY = ['Forecast', 'Alert', 'Options', 'Approval', 'Published'] as const;

function detailString(details: LogEntry['details'], key: string) {
  const value = details?.[key];
  return typeof value === 'string' ? value : undefined;
}

function averageAlertToPublishMinutes(logs: LogEntry[], drafts: CampaignDraft[]) {
  const samples: number[] = [];
  for (const draft of drafts) {
    if (draft.status !== 'published') continue;
    const publishedAt = Date.parse(logs.find((entry) => entry.action === 'PUBLISHED' && detailString(entry.details, 'draftId') === draft.id)?.timestamp ?? '');
    const alertAt = Date.parse(logs.find((entry) => entry.action === 'ALERT_TRIGGERED' && detailString(entry.details, 'alertId') === draft.alertId)?.timestamp ?? '');
    if (!Number.isFinite(publishedAt) || !Number.isFinite(alertAt)) continue;
    const minutes = (publishedAt - alertAt) / 60000;
    if (minutes >= 0) samples.push(minutes);
  }
  if (!samples.length) return null;
  return samples.reduce((sum, value) => sum + value, 0) / samples.length;
}

function minutesLabel(value: number | null) {
  if (value === null) return '—';
  if (value < 1) return '< 1';
  return String(Math.round(value));
}

function postIdsOf(draft: CampaignDraft) {
  return Object.values(draft.publishResult?.postIds || {}).filter((id): id is string => typeof id === 'string' && id.length > 0);
}

function journeyProgress(phase: JourneyPhase) {
  if (phase === 'published') return { current: 0, through: 5 };
  if (phase === 'approval') return { current: 4, through: 3 };
  if (phase === 'options') return { current: 3, through: 2 };
  return { current: 1, through: 0 };
}

export default function Dashboard() {
  const businessesQuery = useListBusinesses({ query: { queryKey: getListBusinessesQueryKey() } });
  const businesses = businessesQuery.data || [];
  const { businessId: selectedId, setBusinessId, role, userId, confirmLeave } = useWorkspace();
  const queryClient = useQueryClient();
  const [draftId, setDraftId] = useState('');
  const [preparing, setPreparing] = useState('');
  const [prepareError, setPrepareError] = useState('');
  const [requestedAction, setRequestedAction] = useState<ForecastAction | null>(null);
  const [result, setResult] = useState<TriggerResult | null>(null);
  const [triggerError, setTriggerError] = useState(false);
  const [todayLevel, setTodayLevel] = useState<Record<string, number>>({});
  const selectedBusiness = useMemo(
    () => businesses.find((business) => business.id === selectedId) || businesses[0],
    [businesses, selectedId],
  );
  const businessId = selectedBusiness?.id || '';
  const journeyDraftsQuery = useListDrafts(
    { businessId },
    {
      query: { queryKey: getListDraftsQueryKey({ businessId }), enabled: !!businessId, refetchInterval: 5000, staleTime: 0 },
      request: { headers: { 'x-user-id': userId } },
    },
  );
  const logParams = businessId ? { businessId } : undefined;
  const activityQuery = useListActivityLog(logParams, {
    query: { queryKey: getListActivityLogQueryKey(logParams), enabled: !!businessId, refetchInterval: 5000, staleTime: 0 },
    request: { headers: { 'x-user-id': userId } },
  });
  const businessDrafts = journeyDraftsQuery.data || [];
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
      requestAnimationFrame(() => scrollToSection('draft-editor'));
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
    if (businessId) void runForecast('check');
  }, [businessId, runForecast]);

  const forecast = result && result.forecast.businessId === businessId ? result.forecast : undefined;
  const alert = forecast && result?.alert ? result.alert : null;
  const isFetching = requestedAction !== null;
  const isLoadingBusinesses = businessesQuery.isLoading;
  const noBusiness = !isLoadingBusinesses && businesses.length === 0;
  const alertDrafts = alert ? businessDrafts.filter((draft) => draft.alertId === alert.id) : [];
  const publishedDraft = alertDrafts
    .filter((draft) => draft.status === 'published')
    .sort((a, b) => (b.publishResult?.publishedAt || '').localeCompare(a.publishResult?.publishedAt || ''))[0];
  const pendingDrafts = alertDrafts.filter((draft) => draft.status === 'pending_approval');
  const editableDraft = alertDrafts.find((draft) => draft.status === 'draft' || draft.status === 'rejected');
  const phase: JourneyPhase = publishedDraft ? 'published' : (pendingDrafts.length || editableDraft) ? 'approval' : alert ? 'options' : 'forecast';
  const journey = journeyProgress(forecast ? phase : 'forecast');
  const city = selectedBusiness?.city || 'your area';
  const typeLabel = selectedBusiness ? (TYPE_LABEL[selectedBusiness.type] || selectedBusiness.type) : '';
  const lastCheck = formatStamp(forecast?.fetchedAt);
  const roleHint = role === 'owner'
    ? "You're viewing as Owner: you approve campaigns."
    : "You're viewing as Staff: you can draft, the Owner approves.";
  const salesDip = selectedBusiness?.brandKit?.lastBadWeatherDipPct;
  const showDip = typeof salesDip === 'number' && Number.isFinite(salesDip);
  const peak = forecast ? peakDay(forecast.days, alert?.peakDate) : undefined;
  const publishedCount = businessDrafts.filter((draft) => draft.status === 'published').length;
  const avgMinutes = averageAlertToPublishMinutes(activityQuery.data || [], businessDrafts);
  const tone = publishedDraft ? 'published' : pendingDrafts.length ? 'pending' : alert?.peakLevelLabel === 'Very Unhealthy' ? 'severe' : alert ? 'alert' : 'clear';

  useEffect(() => {
    if (!forecast?.days.length) return;
    const today = malaysiaToday();
    const day = forecast.days.find((item) => item.date.slice(0, 10) === today) ?? forecast.days[0];
    if (!day || !Number.isFinite(day.level)) return;
    setTodayLevel((prev) => (prev[forecast.businessId] === day.level ? prev : { ...prev, [forecast.businessId]: day.level }));
  }, [forecast]);

  const openDraft = (id: string) => {
    setDraftId(id);
    requestAnimationFrame(() => scrollToSection('draft-editor'));
  };

  const selectShop = (id: string) => {
    if (!id || id === businessId) return;
    if (confirmLeave()) setBusinessId(id);
  };

  const alertOnly = !!alert && !publishedDraft && pendingDrafts.length === 0 && !editableDraft;
  let heroTitle = `All clear for ${city}. We'll alert you 2–3 days before bad air.`;
  let heroBody = '';
  let heroAction: ReactNode = null;
  if (!forecast && !triggerError) {
    heroTitle = '';
  } else if (!forecast && triggerError) {
    heroTitle = `The forecast for ${city} could not be reached.`;
    heroBody = 'Use Check now to try again.';
  } else if (publishedDraft) {
    const when = formatStamp(publishedDraft.publishResult?.publishedAt);
    const posts = postIdsOf(publishedDraft);
    heroTitle = `Campaign published${when ? ` ${when}` : ''}${posts.length ? ` · post ${posts.join(', ')}` : ''}`;
    heroAction = (
      <Link href="/log" className="dash-log-link" onClick={(event) => { if (!confirmLeave()) event.preventDefault(); }}>
        View in activity log
      </Link>
    );
  } else if (pendingDrafts.length) {
    heroTitle = pendingDrafts.length === 1 ? '1 campaign waiting for approval' : `${pendingDrafts.length} campaigns waiting for approval`;
    heroAction = role === 'owner' ? (
      <button type="button" className="action-btn primary" onClick={() => openDraft(pendingDrafts[0].id)} data-testid="button-open-approval">Open approval</button>
    ) : (
      <p className="dash-wait">Waiting for Mr. Tan (Owner)</p>
    );
  } else if (editableDraft) {
    heroTitle = editableDraft.status === 'rejected' ? 'Campaign returned for changes' : 'Campaign draft ready to submit';
    heroBody = role === 'owner'
      ? 'Staff submit it for your approval.'
      : (editableDraft.rejectReason || 'Submit it so the owner can approve.');
    if (role !== 'owner') {
      heroAction = <button type="button" className="action-btn primary" onClick={() => openDraft(editableDraft.id)} data-testid="button-open-draft">Open draft</button>;
    }
  } else if (alert) {
    const first = alert.affectedDates[0];
    heroTitle = `${alert.peakLevelLabel} haze in ${city}${first ? ` from ${formatDay(first)}` : ''}`;
    if (peak && Number.isFinite(peak.value)) heroBody = `Peaks at ${peak.value} ${peak.unit} on ${formatDay(peak.date)}.`;
    else if (alert.peakDate) heroBody = `Peak day ${formatDay(alert.peakDate)}.`;
    const count = result?.options.length ?? 0;
    if (count > 0) {
      heroAction = (
        <button type="button" className="action-btn primary" onClick={() => scrollToSection('campaign-options')} data-testid="button-review-options">
          Review {count} campaign {count === 1 ? 'option' : 'options'}
        </button>
      );
    }
  }

  return (
    <div className="app-shell app-dark">
      <AppHeader businesses={businesses} isLoading={isLoadingBusinesses} />
      <main className="content-wrap dash">
        <header className="dash-page-head">
          <div>
            <h1 id="dashboard-heading" data-testid="selected-business">Weather ahead for {selectedBusiness?.name || 'your business'}</h1>
            {/* No scheduler interval exists in the API, so this line is the last check only. */}
            <p className="dash-sub">{selectedBusiness ? `${selectedBusiness.city} · ${typeLabel} · Last check ${lastCheck ?? '—'}` : 'Last check —'}</p>
          </div>
          <div className="dash-header-actions">
            <button
              type="button"
              className="action-btn dash-check"
              onClick={() => runForecast('check')}
              disabled={!selectedBusiness || isFetching}
              data-testid="button-check-forecast"
            >
              <RefreshCw size={14} className={requestedAction === 'check' ? 'animate-spin' : ''} />
              {requestedAction === 'check' ? 'Checking…' : 'Check now'}
            </button>
            <button
              type="button"
              className="action-btn ghost dash-sim"
              onClick={() => runForecast('simulate')}
              disabled={!selectedBusiness || isFetching}
              data-testid="button-simulate-forecast"
            >
              {requestedAction === 'simulate' ? <RefreshCw size={14} className="animate-spin" /> : null}
              {requestedAction === 'simulate' ? 'Simulating…' : 'Simulate haze'}
              <span className="dash-demo-tag">Demo</span>
            </button>
          </div>
        </header>

        {businessesQuery.isError && (
          <div className="error-box" role="alert" data-testid="businesses-error">
            <span>We couldn’t load your businesses. Check your connection and try again.</span>
            <button type="button" className="retry-btn" onClick={() => businessesQuery.refetch()} data-testid="button-retry-businesses">Try again</button>
          </div>
        )}

        {noBusiness ? (
          <section className="dash-forecast empty-state" data-testid="businesses-empty">
            <strong>No business data yet</strong>
            The forecast will appear here once a business is available.
          </section>
        ) : (
          <div className="dash-stack">
            <section className="dash-hero">
              <article className="dash-action" data-tone={forecast || triggerError ? tone : 'clear'} data-testid="action-hero" aria-live="polite">
                <p className="dash-kicker">What to do now</p>
                {!forecast && !triggerError ? (
                  <>
                    <div className="skeleton" style={{ width: '78%', height: 28 }} />
                    <div className="skeleton" style={{ width: '92%', height: 14, marginTop: 8 }} />
                    <div className="skeleton" style={{ width: 220, height: 40, marginTop: 16 }} />
                  </>
                ) : (
                  <>
                    <h2 data-testid={alertOnly ? 'alert-severity' : forecast && !alert ? 'alert-none' : undefined}>{heroTitle}</h2>
                    {heroBody && <p className="dash-body">{heroBody}</p>}
                    {alertOnly && showDip && (
                      <p className="dash-dip" data-testid="alert-sales-dip">Sales dipped {salesDip}% the last time bad weather hit.</p>
                    )}
                    {heroAction}
                  </>
                )}
                <p className="dash-role" data-testid="role-hint">{roleHint}</p>
              </article>
              <WeatherMap
                businesses={businesses}
                selectedId={businessId}
                todayLevel={todayLevel}
                alertBusinessId={alert?.businessId}
                onSelect={selectShop}
                loading={isLoadingBusinesses}
              />
            </section>

            <ol className="dash-journey" aria-label="Campaign journey" data-testid="journey-progress">
              {JOURNEY.map((label, index) => {
                const step = index + 1;
                const completed = step <= journey.through;
                const current = step === journey.current;
                return (
                  <li key={label} className={`${completed ? 'is-complete' : ''} ${current ? 'is-current' : ''}`} aria-current={current ? 'step' : undefined} data-testid={`journey-step-${step}`}>
                    <span className="dash-marker">{completed ? <Check size={12} strokeWidth={3} aria-hidden="true" /> : null}</span>
                    <span className="dash-journey-label">{label}</span>
                    {current && <span className="dash-here">You are here</span>}
                  </li>
                );
              })}
            </ol>

            <ForecastStrip
              city={city}
              forecast={forecast}
              loading={!forecast && isFetching}
              error={!forecast && triggerError}
              stale={!!forecast && triggerError}
              onRetry={() => runForecast('check')}
              peakDate={alert?.peakDate}
            />

            {alert && result && (
              <section id="campaign-options" aria-labelledby="options-heading" data-testid="campaign-options">
                <div className="options-head dash-options-head">
                  <div>
                    <h3 id="options-heading">Ready-made campaigns for this haze</h3>
                    <p>Options come from your Brand Kit. AI only writes the copy.</p>
                  </div>
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
                    {result.options.map((option, index) => (
                      <OptionCard
                        option={option}
                        index={index}
                        key={option.id}
                        preparing={preparing === option.id}
                        preparingLabel={aiOn ? 'Writing with AI…' : 'Preparing…'}
                        disabled={!!preparing}
                        onPrepare={() => prepare(alert.id, option.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="info-card empty-state" data-testid="options-empty"><strong>No options for this warning</strong>Check the forecast again later.</div>
                )}
                {prepareError && <div className="error-box compact" role="alert" data-testid="prepare-error"><span>{prepareError}</span></div>}
              </section>
            )}

            {businessDrafts.length > 0 && <CampaignStudio key={businessId} business={selectedBusiness} selectedId={draftId} onSelect={setDraftId} />}

            <section className="dash-stats" aria-label="Shop stats">
              <article className="dash-stat">
                <h3>Campaigns published</h3>
                <strong>{publishedCount}</strong>
                <p>Simulated campaigns published for this shop.</p>
              </article>
              <article className="dash-stat">
                <h3>Avg minutes alert → published</h3>
                <strong>{minutesLabel(avgMinutes)}</strong>
                <p>{avgMinutes === null ? 'Not enough published campaigns yet' : 'Average from activity-log timestamps, alert to publish.'}</p>
              </article>
              <article className="dash-stat">
                <h3>Manual steps</h3>
                <strong>—</strong>
                <p>Staff drafts, the owner approves.</p>
              </article>
              <article className="dash-stat">
                <h3>Days ahead of haze</h3>
                <strong>{alert ? alert.daysAhead : '—'}</strong>
                <p>{!alert ? 'No active haze alert.' : alert.daysAhead === 0 ? 'The unhealthy spell starts today.' : 'Days until this haze spell starts.'}</p>
              </article>
            </section>
          </div>
        )}

        <footer className="footer-line">
          <span className="footer-brand"><SabaveLogo height={28} /> <span style={{ color: 'hsl(var(--accent))' }}>×</span> Orbyte</span>
          <span>Weather signals for the people who keep business moving.</span>
        </footer>
      </main>
    </div>
  );
}
