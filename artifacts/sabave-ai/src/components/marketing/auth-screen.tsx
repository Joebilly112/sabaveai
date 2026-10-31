import { useEffect, useState, type FormEvent } from 'react';
import { Check } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { SabaveLogo } from '@/components/SabaveLogo';
import { MalaysiaGlobe } from '@/components/marketing/malaysia-globe';
import { Checkbox } from '@/components/ui/checkbox';
import { PasswordInput } from '@/components/ui/password-input';
import { TextField } from '@/components/ui/text-field';
import { useDocumentTitle } from '@/lib/use-document-title';
import { cn } from '@/lib/utils';
import { useWorkspace } from '@/lib/workspace';

const checks = [
  'Alerts 2–3 days before bad weather',
  'Campaigns in your brand, ready to approve',
  'Every action logged',
];

const demoAccounts = [
  { role: 'Staff', name: 'Aisyah', username: 'Aisyah', password: 'Aisyah123!@#' },
  { role: 'Owner', name: 'Tan', username: 'Tan', password: 'Tan123!@#' },
];

const fieldLook =
  'h-12 min-h-12 rounded-xl border-[#24342F] bg-[#101C19] pl-3.5 text-[15px] text-[#F2EEE6] shadow-none focus-visible:border-[#0F7A5C] focus-visible:ring-[#E4DDD2] focus-visible:ring-offset-[#070E0C]';

function useNightTheme() {
  useEffect(() => {
    document.documentElement.classList.add('theme-night');
    return () => document.documentElement.classList.remove('theme-night');
  }, []);
}

export function AuthScreen({ mode }: { mode: 'login' | 'signup' }) {
  const isSignup = mode === 'signup';
  const { session, signIn, signUp } = useWorkspace();
  const [, navigate] = useLocation();
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState('');
  const [note, setNote] = useState('');
  const [pending, setPending] = useState(false);

  useNightTheme();
  useDocumentTitle(isSignup ? 'Create your account · sabave.ai' : 'Log in · sabave.ai');

  useEffect(() => {
    if (session) navigate(isSignup ? '/onboarding' : '/app');
  }, [session, isSignup, navigate]);

  function fillDemo(account: (typeof demoAccounts)[number]) {
    setUsername(account.username);
    setPassword(account.password);
    setError('');
    setNote(`Filled ${account.username}. Press Log in to continue.`);
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setNote('');
    if (isSignup) {
      if (!consent) {
        setError('Agree to the Terms and Privacy Policy to create an account.');
        return;
      }
      setPending(true);
      const result = await signUp({ name, businessName, email, password });
      setPending(false);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      navigate('/onboarding');
      return;
    }
    if (!signIn(username, password)) {
      setError('That username or password doesn’t match.');
      return;
    }
    navigate('/app');
  }

  return (
    <div className="theme-night grid min-h-dvh bg-[#070E0C] text-ds-ink lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden lg:block">
        <div className="absolute top-1/2 left-1/2 h-[148%] w-[148%] -translate-x-1/2 -translate-y-1/2">
          <MalaysiaGlobe closeup />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#070E0C] via-[#070E0C]/10 to-[#070E0C]/45" />
        <div className="relative z-10 flex h-full flex-col justify-between p-10 xl:p-14">
          <Link href="/" className="w-fit rounded-xl">
            <SabaveLogo height={36} />
            <span className="mt-2 flex items-center gap-3 text-[13px] text-ds-faint">
              an Orbyte module
              <span className="h-px w-10 bg-[#8d9893]" aria-hidden />
            </span>
          </Link>
          <div className="max-w-md">
            <h2 className="font-display text-[40px] leading-[1.05] font-semibold tracking-tight">
              {isSignup ? 'Be ready before the haze.' : 'Welcome back.'}
            </h2>
            <p className="mt-3 text-base text-[#C5CDC8]">
              {isSignup ? 'Set up the shop sabave.ai will watch.' : 'Pick up the campaigns waiting for you.'}
            </p>
            <ul className="mt-6 space-y-3">
              {checks.map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-[#E7E4DC]">
                  <Check className="size-4 shrink-0 text-[#2BB673]" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-8 text-sm text-[#8E9893]">Set up in under 5 minutes.</p>
          </div>
        </div>
      </aside>

      <main className="flex items-center justify-center px-6 py-12 sm:px-8">
        <div className="w-full max-w-[400px] font-body">
          <div className="mb-8 lg:hidden">
            <Link href="/" className="inline-block w-fit rounded-xl">
              <SabaveLogo height={32} />
            </Link>
          </div>
          <h1 className="font-display text-[30px] leading-none font-semibold tracking-tight text-[#F2EEE6]">
            {isSignup ? 'Create an account' : 'Log in'}
          </h1>
          <p className="mt-3 text-sm text-[#B9C2BC]">
            {isSignup ? 'You will be the Owner, and the person who approves campaigns.' : 'Use your username and password.'}
          </p>

          <form className="mt-8 grid gap-4" onSubmit={onSubmit}>
            {isSignup ? (
              <>
                <TextField id="signup-name" label="Your name" value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" className={cn(fieldLook, 'pr-3.5')} />
                <TextField id="signup-business" label="Business name" value={businessName} onChange={(event) => setBusinessName(event.target.value)} autoComplete="organization" className={cn(fieldLook, 'pr-3.5')} />
                <TextField id="signup-email" label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" className={cn(fieldLook, 'pr-3.5')} />
                <PasswordInput id="signup-password" label="Password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" hint="At least 8 characters." className={fieldLook} />
                <label className="flex min-h-11 cursor-pointer items-start gap-3 text-sm leading-snug text-[#E7E4DC]">
                  <Checkbox checked={consent} onCheckedChange={(value) => setConsent(value === true)} className="mt-0.5 size-5 rounded-[4px]" />
                  <span>
                    I agree to the <Link href="/terms" className="underline decoration-[#24342F] underline-offset-2">Terms</Link> and <Link href="/privacy" className="underline decoration-[#24342F] underline-offset-2">Privacy Policy (PDPA)</Link>
                  </span>
                </label>
              </>
            ) : (
              <>
                <TextField id="login-username" label="Username" value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" className={cn(fieldLook, 'pr-3.5')} />
                <PasswordInput
                  id="login-password"
                  label="Password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  className={fieldLook}
                  labelAction={
                    <button
                      type="button"
                      className="shrink-0 text-[13px] text-[#B9C2BC] underline decoration-[#24342F] underline-offset-2 hover:text-[#F2EEE6] focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E4DDD2] focus-visible:ring-offset-2 focus-visible:ring-offset-[#070E0C]"
                      onClick={() => setNote('Password reset is not available in this local demo.')}
                    >
                      Forgot password?
                    </button>
                  }
                />
              </>
            )}
            {error ? <p className="text-sm font-medium text-[#E0563F]" role="alert">{error}</p> : null}
            {note ? <p className="text-sm text-[#B9C2BC]" role="status">{note}</p> : null}
            <button
              type="submit"
              disabled={pending}
              className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-[#0F7A5C] text-[15px] font-semibold text-[#F7F4EE] hover:bg-[#0C654C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E4DDD2] focus-visible:ring-offset-2 focus-visible:ring-offset-[#070E0C] disabled:opacity-60"
            >
              {pending ? 'Creating account…' : isSignup ? 'Create account' : 'Log in'}
            </button>
          </form>

          <p className="mt-5 text-sm text-[#7E8A84]">
            {isSignup ? (
              <>
                Already have an account?{' '}
                <Link href="/login" className="text-[#B9C2BC] underline decoration-[#24342F] underline-offset-4 hover:text-[#F2EEE6]">Log in</Link>
              </>
            ) : (
              <>
                New here?{' '}
                <Link href="/signup" className="text-[#B9C2BC] underline decoration-[#24342F] underline-offset-4 hover:text-[#F2EEE6]">Create an account</Link>
              </>
            )}
          </p>

          {!isSignup ? (
            <p className="mt-3 text-[13px] leading-5 text-[#7E8A84]">
              {demoAccounts.map((account, index) => (
                <span key={account.username}>
                  {index > 0 ? <span aria-hidden> · </span> : null}
                  {account.role}{' '}
                  <button
                    type="button"
                    className="text-[#B9C2BC] underline decoration-[#24342F] underline-offset-[3px] hover:text-[#F2EEE6] focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E4DDD2] focus-visible:ring-offset-2 focus-visible:ring-offset-[#070E0C]"
                    onClick={() => fillDemo(account)}
                  >
                    {account.name}
                  </button>
                </span>
              ))}
              <span aria-hidden> · </span>
              fills the form
            </p>
          ) : null}
        </div>
      </main>
    </div>
  );
}
