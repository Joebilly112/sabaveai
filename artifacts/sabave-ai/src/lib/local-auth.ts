import { signupOwner } from '@workspace/api-client-react';

export type Session = {
  username: string;
  name: string;
  role: 'owner' | 'staff';
  userId: string;
  businessId?: string;
  email?: string;
};

type Account = Session & {
  password: string;
  businessName?: string;
};

const SESSION_KEY = 'sabave.session';
const ACCOUNTS_KEY = 'sabave.localAccounts';

const builtinAccounts: Account[] = [
  { username: 'Tan', password: 'Tan123!@#', name: 'Mr. Tan', role: 'owner', userId: 'u2' },
  { username: 'Aisyah', password: 'Aisyah123!@#', name: 'Aisyah', role: 'staff', userId: 'u1' },
];

function readJson<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch { /* storage unavailable */ }
}

function extraAccounts(): Account[] {
  const stored = readJson<Account[]>(ACCOUNTS_KEY);
  return Array.isArray(stored) ? stored : [];
}

function allAccounts(): Account[] {
  return [...builtinAccounts, ...extraAccounts()];
}

function knownUserId(userId: string) {
  return userId === 'u1' || userId === 'u2' || /^u_[0-9a-f-]{8,}$/i.test(userId);
}

export function readSession(): Session | null {
  const session = readJson<Session>(SESSION_KEY);
  if (!session || !knownUserId(session.userId)) return null;
  if (session.role !== 'owner' && session.role !== 'staff') return null;
  if (!session.username || !session.name) return null;
  return session;
}

export function writeSession(session: Session | null) {
  try {
    if (!session) window.localStorage.removeItem(SESSION_KEY);
    else writeJson(SESSION_KEY, session);
  } catch { /* storage unavailable */ }
}

export function authenticate(username: string, password: string): Session | null {
  const name = username.trim().toLowerCase();
  const account = allAccounts().find((item) => {
    const matchesUser = item.username.toLowerCase() === name || item.email?.toLowerCase() === name;
    return matchesUser && item.password === password;
  });
  if (!account) return null;
  return {
    username: account.username,
    name: account.name,
    role: account.role,
    userId: account.userId,
    businessId: account.businessId,
    email: account.email,
  };
}

function signupError(error: unknown) {
  const data = (error as { data?: { error?: string } } | null)?.data;
  if (data?.error) return data.error;
  if (error instanceof Error && error.message) return error.message;
  return 'Could not create the account. Try again.';
}

export async function registerLocalAccount(input: {
  name: string;
  businessName: string;
  email: string;
  password: string;
}): Promise<{ ok: true; session: Session } | { ok: false; error: string }> {
  const name = input.name.trim();
  const businessName = input.businessName.trim();
  const email = input.email.trim().toLowerCase();
  if (!name || !businessName || !email || !input.password) {
    return { ok: false, error: 'Fill in every field.' };
  }
  if (!email.includes('@') || !email.includes('.')) return { ok: false, error: 'Enter a valid email address.' };
  if (input.password.length < 8) return { ok: false, error: 'Use at least 8 characters for the password.' };
  const taken = allAccounts().some((item) => item.username.toLowerCase() === name.toLowerCase() || item.email === email);
  if (taken) return { ok: false, error: 'That name or email is already used.' };
  try {
    const created = await signupOwner({ name, businessName, email });
    if (created.user.id === 'u1' || created.user.id === 'u2' || created.business.id === 'b1') {
      return { ok: false, error: 'Could not create a new business. Try again.' };
    }
    const account: Account = {
      username: name,
      password: input.password,
      name,
      email,
      businessName,
      role: 'owner',
      userId: created.user.id,
      businessId: created.business.id,
    };
    writeJson(ACCOUNTS_KEY, [...extraAccounts(), account]);
    return {
      ok: true,
      session: {
        username: name,
        name,
        role: 'owner',
        userId: created.user.id,
        businessId: created.business.id,
        email,
      },
    };
  } catch (error) {
    return { ok: false, error: signupError(error) };
  }
}
