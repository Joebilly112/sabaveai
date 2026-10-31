import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { authenticate, readSession, registerLocalAccount, writeSession, type Session } from '@/lib/local-auth';

export type Role = 'staff' | 'owner';

function read(key: string) {
  try { return window.localStorage.getItem(key) || ''; } catch { return ''; }
}
function write(key: string, value: string) {
  try { window.localStorage.setItem(key, value); } catch { /* storage unavailable */ }
}

type Ctx = {
  businessId: string;
  setBusinessId: (id: string) => void;
  role: Role;
  setRole: (r: Role) => void;
  userId: string;
  session: Session | null;
  signIn: (username: string, password: string) => boolean;
  signUp: (input: { name: string; businessName: string; email: string; password: string }) => Promise<{ ok: true } | { ok: false; error: string }>;
  signOut: () => void;
  dirty: boolean;
  setDirty: (d: boolean) => void;
  confirmLeave: () => boolean;
};

const WorkspaceContext = createContext<Ctx | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(() => readSession());
  const [businessId, setBusinessId] = useState(() => read('sabave.business') || readSession()?.businessId || '');
  const [role, setRoleState] = useState<Role>(() => readSession()?.role ?? 'staff');
  const [dirty, setDirty] = useState(false);
  const dirtyRef = useRef(false);
  dirtyRef.current = dirty;

  const setBusiness = (id: string) => {
    setBusinessId(id);
    setSession((current) => {
      if (!current || (current.businessId || '') === id) return current;
      return { ...current, businessId: id || undefined };
    });
  };

  const setRole = (next: Role) => {
    setRoleState(session?.role ?? next);
  };

  const signIn = (username: string, password: string) => {
    const next = authenticate(username, password);
    if (!next) return false;
    setSession(next);
    setRoleState(next.role);
    setBusinessId(next.businessId || '');
    return true;
  };

  const signUp = async (input: { name: string; businessName: string; email: string; password: string }) => {
    const result = await registerLocalAccount(input);
    if (!result.ok) return result;
    setSession(result.session);
    setRoleState('owner');
    if (result.session.businessId) {
      write('sabave.business', result.session.businessId);
      setBusinessId(result.session.businessId);
    }
    return { ok: true as const };
  };

  const signOut = () => {
    setSession(null);
    setBusinessId('');
    writeSession(null);
  };

  useEffect(() => { write('sabave.business', businessId); }, [businessId]);
  useEffect(() => {
    writeSession(session);
    if (session) write('sabave.role', session.role);
  }, [session]);
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);

  const value = useMemo<Ctx>(() => ({
    businessId, setBusinessId: setBusiness, role, setRole, dirty, setDirty, session, signIn, signUp, signOut,
    userId: session?.userId ?? '',
    confirmLeave: () => {
      if (!dirtyRef.current) return true;
      const ok = window.confirm('You have unsaved edits. Leave and discard them?');
      if (ok) setDirty(false);
      return ok;
    },
  }), [businessId, role, dirty, session]);

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error('WorkspaceProvider missing');
  return ctx;
}

export function apiErrorInfo(err: unknown): { message: string; violations: string[] } {
  const data = (err as { data?: { error?: string; violations?: string[] } } | null)?.data;
  return {
    message: data?.error || (err instanceof Error ? err.message : 'Something went wrong. Please try again.'),
    violations: Array.isArray(data?.violations) ? data!.violations! : [],
  };
}
