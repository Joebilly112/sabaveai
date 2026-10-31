import { useState, type CSSProperties } from 'react';
import { AlertTriangle, CloudSun, Sun, Wind } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { SignalForecast } from '@workspace/api-client-react';
import { asArray } from '@/lib/as-array';
import {
  ALERT_THRESHOLD,
  SEVERITY_COLORS,
  SEVERITY_HINTS,
  SEVERITY_LABELS,
  clampLevel,
  formatDateParts,
  formatStamp,
  peakDay,
} from '@/components/dashboard/format';

function SeverityIcon({ level }: { level: number }) {
  if (level <= 0) return <Sun size={20} strokeWidth={1.75} aria-hidden="true" />;
  if (level === 1) return <CloudSun size={20} strokeWidth={1.75} aria-hidden="true" />;
  if (level === 2) return <Wind size={20} strokeWidth={1.75} aria-hidden="true" />;
  return <AlertTriangle size={20} strokeWidth={1.75} aria-hidden="true" />;
}

function sourceLabel(source: SignalForecast['source']) {
  if (source === 'simulated') return 'Simulated';
  if (source === 'offline') return 'Offline data';
  return 'Live from Open-Meteo';
}

function ChartTip({ active, payload }: { active?: boolean; payload?: Array<{ payload: { day: string; date: string; value: number; unit: string; label: string } }> }) {
  const point = active ? payload?.[0]?.payload : undefined;
  if (!point) return null;
  return (
    <div className="dash-chart-tip">
      <strong>{point.day} {point.date}</strong>
      <span>{Number.isFinite(point.value) ? point.value : '—'} {point.unit}</span>
      <span>{point.label}</span>
    </div>
  );
}

export function ForecastStrip({
  city,
  forecast,
  loading,
  error,
  stale,
  onRetry,
  peakDate,
}: {
  city: string;
  forecast?: SignalForecast;
  loading: boolean;
  error: boolean;
  stale: boolean;
  onRetry: () => void;
  peakDate?: string;
}) {
  const [reduceMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const days = asArray(forecast?.days).filter((day) => typeof day?.date === 'string').slice(0, 5);
  const peak = peakDay(days, peakDate);
  const chart = days.map((day) => {
    const date = formatDateParts(day.date);
    return {
      day: date.day,
      date: date.date,
      value: Number.isFinite(day.value) ? day.value : 0,
      unit: day.unit,
      label: day.levelLabel,
      level: clampLevel(day.level),
    };
  });
  const yMax = Math.ceil(Math.max(ALERT_THRESHOLD, ...chart.map((point) => point.value), 1) * 1.25);
  const updated = formatStamp(forecast?.fetchedAt);

  return (
    <section className="dash-forecast" aria-labelledby="forecast-heading">
      <div className="dash-forecast-head">
        <div>
          <h2 id="forecast-heading">Five-day haze forecast</h2>
          <p>Air quality outlook · {city}</p>
        </div>
      </div>

      {loading && (
        <div className="dash-days" aria-label="Loading forecast" data-testid="forecast-loading">
          {[0, 1, 2, 3, 4].map((item) => (
            <div className="dash-day dash-day-skeleton" key={item}>
              <div className="skeleton" style={{ width: 36, height: 10 }} />
              <div className="skeleton" style={{ width: 52, height: 12 }} />
              <div className="skeleton" style={{ width: 28, height: 28, marginTop: 8 }} />
              <div className="skeleton" style={{ width: 64, height: 22 }} />
              <div className="skeleton" style={{ width: '100%', height: 18, marginTop: 'auto' }} />
            </div>
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="error-box" role="alert" data-testid="forecast-error">
          <span>The forecast could not be reached. You can try again in a moment.</span>
          <button type="button" className="retry-btn" onClick={onRetry} data-testid="button-retry-forecast">Try again</button>
        </div>
      )}

      {!loading && !error && !forecast && (
        <div className="empty-state" data-testid="forecast-empty">
          <strong>Your forecast is ready when you are</strong>
          Choose Check now for the latest available outlook.
        </div>
      )}

      {forecast && !loading && (
        <>
          <div className="dash-forecast-meta">
            <span className="source-pill" data-testid="forecast-source"><i className="source-dot" />{sourceLabel(forecast.source)}</span>
            {updated && <span className="dash-updated" data-testid="forecast-updated">Updated {updated}</span>}
            {forecast.source === 'offline' && <span className="dash-saved" role="status">Using last saved forecast</span>}
            {stale && forecast.source !== 'offline' && <span className="dash-saved" role="status">Showing the previous forecast. The latest check didn’t go through.</span>}
          </div>
          {days.length > 0 ? (
            <>
              <div className="dash-days" data-testid="forecast-days">
                {days.map((day, index) => {
                  const date = formatDateParts(day.date);
                  const level = clampLevel(day.level);
                  const isPeak = !!peak && peak.date === day.date && peak.value === day.value;
                  const hint = SEVERITY_HINTS[level];
                  return (
                    <article
                      key={`${day.date}-${index}`}
                      className={`dash-day${isPeak ? ' is-peak' : ''}`}
                      style={{ '--sev': SEVERITY_COLORS[level] } as CSSProperties}
                      data-testid={`forecast-day-${index}`}
                    >
                      <div className="dash-day-top">
                        <div>
                          <div className="dash-dow" data-testid={`forecast-weekday-${index}`}>{date.day}</div>
                          <div className="dash-dom" data-testid={`forecast-date-${index}`}>{date.date}</div>
                        </div>
                        {isPeak && <span className="dash-peak">Peak</span>}
                      </div>
                      <SeverityIcon level={level} />
                      <div className="dash-reading" data-testid={`forecast-value-${index}`}>
                        <strong>{Number.isFinite(day.value) ? day.value : '—'}</strong>
                        <span>{day.unit}</span>
                      </div>
                      <span className="dash-pill" tabIndex={0} aria-label={`${day.levelLabel}. ${hint}`} data-testid={`forecast-severity-${index}`}>
                        {day.levelLabel}
                        <span className="dash-hover-tip" role="tooltip">{hint}</span>
                      </span>
                      <span className="dash-sev-bar" aria-hidden="true" />
                    </article>
                  );
                })}
              </div>
              <div className="dash-chart-block">
                <div className="dash-chart-head">
                  <span>PM2.5</span>
                  <span className="dash-threshold-key"><i aria-hidden="true" />Alert threshold</span>
                </div>
                <div className="dash-chart" role="img" aria-label={chart.map((point) => `${point.day} ${point.value} ${point.unit}`).join(', ') + `. Alert threshold ${ALERT_THRESHOLD}.`}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chart} margin={{ top: 16, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid vertical={false} stroke="#24342F" />
                      <XAxis dataKey="day" tick={{ fill: '#B9C2BC', fontSize: 11, fontFamily: 'Inter, sans-serif' }} axisLine={{ stroke: '#24342F' }} tickLine={false} />
                      <YAxis hide domain={[0, yMax]} />
                      <Tooltip cursor={{ fill: 'rgba(242, 238, 230, 0.06)' }} content={<ChartTip />} />
                      <ReferenceLine y={ALERT_THRESHOLD} stroke="#F08A3C" strokeDasharray="4 4" ifOverflow="extendDomain" />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={32} isAnimationActive={!reduceMotion}>
                        {chart.map((point) => <Cell key={`${point.day}-${point.date}`} fill={SEVERITY_COLORS[point.level]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="dash-forecast-legend" data-testid="severity-legend">
                {SEVERITY_LABELS.map((label, index) => (
                  <span key={label}><i style={{ background: SEVERITY_COLORS[index] }} />{label}</span>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state" data-testid="forecast-days-empty"><strong>No daily readings found</strong>Try checking the forecast again.</div>
          )}
        </>
      )}
    </section>
  );
}
