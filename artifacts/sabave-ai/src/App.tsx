import { useEffect, type ComponentType, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useListBusinesses, type Business } from '@workspace/api-client-react';
import Dashboard from '@/pages/dashboard';
import NotFound from '@/pages/not-found';
import ActivityLog from '@/pages/log';
import Onboarding from '@/pages/onboarding';
import BrandKitPage from '@/pages/brand-kit';
import HomePage from '@/pages/marketing/home';
import LoginPage from '@/pages/marketing/login';
import PricingPage from '@/pages/marketing/pricing';
import SignupPage from '@/pages/marketing/signup';
import SolutionsPage from '@/pages/marketing/solutions';
import {
  AboutPage,
  ChangelogPage,
  ContactPage,
  DocsArticlePage,
  DocsIndexPage,
  PrivacyPage,
  ResearchPage,
  SecurityPage,
  TermsPage,
} from '@/pages/marketing/placeholders';
import { isStaffSession } from '@/demo/demoPresets';
import { asArray } from '@/lib/as-array';
import { listBusinessesQuery } from '@/lib/session-api';
import { useWorkspace, WorkspaceProvider } from '@/lib/workspace';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false, staleTime: 15_000 },
  },
});

function RequireAuth({ component: Page }: { component: ComponentType }) {
  const { session } = useWorkspace();
  const [, navigate] = useLocation();
  useEffect(() => {
    if (!session) navigate('/login');
  }, [session, navigate]);
  if (!session) return null;
  return <Page />;
}

function WorkspacePage({ component: Page, allowDuringSetup = false }: { component: ComponentType; allowDuringSetup?: boolean }) {
  const { session, businessId, setBusinessId, userId } = useWorkspace();
  const [, navigate] = useLocation();
  const staff = isStaffSession(session);
  const list = useListBusinesses(listBusinessesQuery(userId));
  const ready = asArray<Business>(list.data).filter((business) => business.onboardingCompleted !== false);
  const readyKey = ready.map((business) => business.id).join(',');
  useEffect(() => {
    if (!session) navigate('/login');
  }, [session, navigate]);
  useEffect(() => {
    if (!session || staff || list.isLoading || allowDuringSetup) return;
    if (!readyKey) navigate('/onboarding');
  }, [session, staff, list.isLoading, allowDuringSetup, readyKey, navigate]);
  useEffect(() => {
    if (!session || list.isLoading) return;
    const ids = readyKey ? readyKey.split(',') : [];
    if (!ids.length) {
      if (staff && businessId) setBusinessId('');
      return;
    }
    if (!ids.includes(businessId)) setBusinessId(ids[0]);
  }, [session, staff, list.isLoading, readyKey, businessId, setBusinessId]);
  if (!session || list.isLoading) return null;
  if (!staff && !readyKey && !allowDuringSetup) return null;
  return <Page />;
}

function ProtectedDashboard() {
  return <WorkspacePage component={Dashboard} />;
}
function ProtectedLog() {
  return <WorkspacePage component={ActivityLog} allowDuringSetup />;
}
function ProtectedBrandKit() {
  return <WorkspacePage component={BrandKitPage} />;
}
function ProtectedOnboarding() {
  return <RequireAuth component={Onboarding} />;
}

function Router() {
  return (
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/solutions" component={SolutionsPage} />
        <Route path="/pricing" component={PricingPage} />
        <Route path="/login" component={LoginPage} />
        <Route path="/signup" component={SignupPage} />
        <Route path="/docs" component={DocsIndexPage} />
        <Route path="/docs/:slug" component={DocsArticlePage} />
        <Route path="/about" component={AboutPage} />
        <Route path="/research" component={ResearchPage} />
        <Route path="/privacy" component={PrivacyPage} />
        <Route path="/terms" component={TermsPage} />
        <Route path="/security" component={SecurityPage} />
        <Route path="/changelog" component={ChangelogPage} />
        <Route path="/contact" component={ContactPage} />
        <Route path="/app" component={ProtectedDashboard} />
        <Route path="/log" component={ProtectedLog} />
        <Route path="/brand-kit" component={ProtectedBrandKit} />
        <Route path="/onboarding" component={ProtectedOnboarding} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WorkspaceProvider>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
      </WorkspaceProvider>
    </QueryClientProvider>
  );
}

export default App;
