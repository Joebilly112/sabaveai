import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

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
  userId: 'u1' | 'u2';
  dirty: boolean;
  setDirty: (d: boolean) => void;
  confirmLeave: () => boolean;
};

const WorkspaceContext = createContext<Ctx | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [businessId, setBusinessId] = useState(() => read('sabave.business'));
  const [role, setRole] = useState<Role>(() => (read('sabave.role') === 'owner' ? 'owner' : 'staff'));
  const [dirty, setDirty] = useState(false);
  const dirtyRef = useRef(false);
  dirtyRef.current = dirty;

  useEffect(() => { write('sabave.business', businessId); }, [businessId]);
  useEffect(() => { write('sabave.role', role); }, [role]);
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);

  const value = useMemo<Ctx>(() => ({
    businessId, setBusinessId, role, setRole, dirty, setDirty,
    userId: role === 'owner' ? 'u2' : 'u1',
    confirmLeave: () => {
      if (!dirtyRef.current) return true;
      const ok = window.confirm('You have unsaved campaign edits. Leave and discard them?');
      if (ok) setDirty(false);
      return ok;
    },
  }), [businessId, role, dirty]);

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
