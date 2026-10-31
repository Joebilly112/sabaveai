import { useState } from 'react';
import { getListActivityLogQueryKey, useListActivityLog, useListBusinesses } from '@workspace/api-client-react';
import type { Business, LogEntry } from '@workspace/api-client-react';
import { AppHeader } from '@/components/AppHeader';
import { asArray } from '@/lib/as-array';
import { listBusinessesQuery } from '@/lib/session-api';
import { useWorkspace } from '@/lib/workspace';

function fmt(s: string) {
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? s : new Intl.DateTimeFormat('en-MY', { dateStyle: 'medium', timeStyle: 'medium' }).format(d);
}
function details(d: LogEntry['details']) {
  return Object.entries(d || {}).filter(([, v]) => v !== undefined && v !== null && v !== '').map(([k, v]) => [k, typeof v === 'object' ? JSON.stringify(v) : String(v)] as const);
}

export default function ActivityLog() {
  const { userId } = useWorkspace();
  const businessesQuery = useListBusinesses(listBusinessesQuery(userId));
  const businesses = asArray<Business>(businessesQuery.data);
  const [filter, setFilter] = useState('');
  const params = filter ? { businessId: filter } : undefined;
  const log = useListActivityLog(params, { query: { queryKey: getListActivityLogQueryKey(params), refetchInterval: 5000 }, request: { headers: { 'x-user-id': userId } } });
  const logBroken = log.data != null && !Array.isArray(log.data);
  const entries = asArray<LogEntry>(log.data).slice().sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  const nameOf = (id: string) => businesses.find((b) => b.id === id)?.name || id;

  return (
    <div className="app-shell app-dark">
      <AppHeader businesses={businesses} isLoading={businessesQuery.isLoading} />
      <main className="content-wrap">
        <section className="page-heading">
          <div>
            <div className="eyebrow">Audit trail</div>
            <h1>Activity log</h1>
            <p className="heading-sub">Every signal, draft, decision and simulated publish, newest first.</p>
          </div>
          <div className="log-filter">
            <label htmlFor="log-filter" className="info-label">Business</label>
            <select id="log-filter" className="top-select" value={filter} onChange={(e) => setFilter(e.target.value)} data-testid="select-log-business">
              <option value="">All businesses</option>
              {businesses.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
        </section>
        <section className="forecast-panel" data-testid="activity-log">
          {log.isLoading && <div style={{ padding: 20 }}>{[0, 1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: 40, marginBottom: 10 }} />)}</div>}
          {(log.isError || logBroken) && (
            <div className="error-box" role="alert"><span>The activity log could not load.</span><button className="retry-btn" onClick={() => log.refetch()}>Try again</button></div>
          )}
          {!log.isLoading && !log.isError && !logBroken && entries.length === 0 && <div className="empty-state"><strong>Nothing logged yet</strong>Actions appear here as your team works.</div>}
          {entries.length > 0 && (
            <div className="log-table-wrap">
              <table className="log-table">
                <thead><tr><th>Time</th><th>Actor</th><th>Role</th><th>Business</th><th>Signal</th><th>Action</th><th>Details</th></tr></thead>
                <tbody>
                  {entries.map((e) => {
                    const signal = (e.details?.signalId as string) || (e.details?.signal as string) || '—';
                    return (
                      <tr key={e.id} data-testid={`log-row-${e.id}`}>
                        <td className="mono">{fmt(e.timestamp)}</td>
                        <td>{e.actor}</td>
                        <td><span className={`role-chip r-${e.role}`}>{e.role}</span></td>
                        <td>{nameOf(e.businessId)}</td>
                        <td className="mono">{signal}</td>
                        <td><strong>{e.action}</strong></td>
                        <td className="log-details">{details(e.details).map(([k, v]) => <span key={k}><b>{k}</b> {v}</span>)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
