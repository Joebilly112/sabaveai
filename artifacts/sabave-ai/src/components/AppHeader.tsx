import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';
import type { Business } from '@workspace/api-client-react';
import { SabaveLogo } from '@/components/SabaveLogo';
import { isDemoIdentity, resetDemoAccount } from '@/demo/demoPresets';
import { asArray } from '@/lib/as-array';
import { useWorkspace } from '@/lib/workspace';

export function AppHeader({ businesses, isLoading }: { businesses: Business[]; isLoading: boolean }) {
  const shops = asArray<Business>(businesses);
  const { businessId, setBusinessId, role, session, confirmLeave, signOut, userId } = useWorkspace();
  const [location, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [resetting, setResetting] = useState(false);
  const [resetError, setResetError] = useState('');
  const demo = isDemoIdentity(session);
  const shopKey = shops.map((shop) => shop.id).join(',');

  useEffect(() => {
    if (isLoading) return;
    const ids = shopKey ? shopKey.split(',') : [];
    if (ids.length && !ids.includes(businessId)) setBusinessId(ids[0]);
  }, [shopKey, businessId, isLoading, setBusinessId]);

  const guard = (e: { preventDefault: () => void }) => { if (!confirmLeave()) e.preventDefault(); };
  const isLog = location.startsWith('/log');
  const isKit = location.startsWith('/brand-kit');
  const isDash = location === '/app';

  return (
    <header className="topbar">
      <Link href="/" onClick={guard} className="brand-lockup" data-testid="identity-sabave-orbyte" aria-label="sabave.ai, back to the landing page">
        <SabaveLogo height={36} />
        <div className="brand-caption">An Orbyte module</div>
      </Link>
      <div className="topbar-right">
        <nav className="nav-links" aria-label="Main navigation">
          <Link href="/app" onClick={guard} className={`nav-item ${isDash ? 'active' : ''}`} aria-current={isDash ? 'page' : undefined} data-testid="nav-dashboard">Dashboard</Link>
          <Link href="/brand-kit" onClick={guard} className={`nav-item ${isKit ? 'active' : ''}`} aria-current={isKit ? 'page' : undefined} data-testid="nav-brand-kit">Brand Kit</Link>
          <Link href="/log" onClick={guard} className={`nav-item ${isLog ? 'active' : ''}`} aria-current={isLog ? 'page' : undefined} data-testid="nav-activity-log">Activity Log</Link>
        </nav>
        <div className="identity-controls">
          <label className="sr-only" htmlFor="business-select">Select business</label>
          <select
            id="business-select" className="top-select business-select" value={businessId}
            onChange={(e) => { if (confirmLeave()) setBusinessId(e.target.value); }}
            disabled={isLoading || shops.length === 0} data-testid="select-business"
          >
            {isLoading && <option value="">Loading businesses…</option>}
            {!isLoading && shops.length === 0 && <option value="">No businesses available</option>}
            {shops.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <span className="account-chip" data-testid="text-account">{session?.name} · {role === 'owner' ? 'Owner' : 'Staff'}</span>
          {demo && (
            <button
              type="button"
              className="logout-btn"
              data-testid="button-reset-demo"
              disabled={resetting}
              onClick={() => {
                if (!session) return;
                setResetting(true);
                setResetError('');
                void resetDemoAccount(userId)
                  .then(() => {
                    setBusinessId('');
                    queryClient.clear();
                    navigate(role === 'owner' ? '/onboarding' : '/app');
                  })
                  .catch((error: unknown) => setResetError(error instanceof Error ? error.message : 'This demo could not be reset.'))
                  .finally(() => setResetting(false));
              }}
            >
              {resetting ? 'Resetting…' : 'Reset my demo'}
            </button>
          )}
          <button
            type="button"
            className="logout-btn"
            data-testid="button-log-out"
            onClick={() => {
              signOut();
              navigate('/');
            }}
          >
            Log out
          </button>
        </div>
      </div>
      {resetError && <p className="ob-error" role="alert">{resetError}</p>}
    </header>
  );
}
