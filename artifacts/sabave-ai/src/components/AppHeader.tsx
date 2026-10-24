import { useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import type { Business } from '@workspace/api-client-react';
import { useWorkspace, type Role } from '@/lib/workspace';

export function AppHeader({ businesses, isLoading }: { businesses: Business[]; isLoading: boolean }) {
  const { businessId, setBusinessId, role, setRole, confirmLeave } = useWorkspace();
  const [location] = useLocation();

  useEffect(() => {
    if (businesses.length && !businesses.some((b) => b.id === businessId)) setBusinessId(businesses[0].id);
  }, [businesses, businessId, setBusinessId]);

  const guard = (e: { preventDefault: () => void }) => { if (!confirmLeave()) e.preventDefault(); };
  const isLog = location.startsWith('/log');
  const isKit = location.startsWith('/onboarding');
  const isDash = !isLog && !isKit;

  return (
    <header className="topbar">
      <div className="brand-lockup" data-testid="identity-sabave-orbyte">
        <div className="brand-mark" aria-hidden="true">s</div>
        <div>
          <div className="brand-name">sabave.ai</div>
          <div className="brand-caption">A weather signal by Orbyte</div>
        </div>
      </div>
      <div className="topbar-right">
        <nav className="nav-links" aria-label="Main navigation">
          <Link href="/" onClick={guard} className={`nav-item ${isDash ? 'active' : ''}`} aria-current={isDash ? 'page' : undefined} data-testid="nav-dashboard">Dashboard</Link>
          <Link href="/onboarding" onClick={guard} className={`nav-item ${isKit ? 'active' : ''}`} aria-current={isKit ? 'page' : undefined} data-testid="nav-brand-kit">Brand Kit</Link>
          <Link href="/log" onClick={guard} className={`nav-item ${isLog ? 'active' : ''}`} aria-current={isLog ? 'page' : undefined} data-testid="nav-activity-log">Activity Log</Link>
        </nav>
        <div className="identity-controls">
          <label className="sr-only" htmlFor="business-select">Select business</label>
          <select
            id="business-select" className="top-select" value={businessId}
            onChange={(e) => { if (confirmLeave()) setBusinessId(e.target.value); }}
            disabled={isLoading || businesses.length === 0} data-testid="select-business"
          >
            {isLoading && <option value="">Loading businesses…</option>}
            {!isLoading && businesses.length === 0 && <option value="">No businesses available</option>}
            {businesses.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <label className="sr-only" htmlFor="user-select">Simulated user</label>
          <select id="user-select" className="top-select role-select" value={role} onChange={(e) => setRole(e.target.value as Role)} data-testid="select-user-role">
            <option value="staff">Aisyah · Staff</option>
            <option value="owner">Mr. Tan · Owner</option>
          </select>
        </div>
      </div>
    </header>
  );
}
