import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import Dashboard from '@/pages/dashboard';
import NotFound from '@/pages/not-found';
import ActivityLog from '@/pages/log';
import Onboarding from '@/pages/onboarding';
import HomePage from '@/pages/marketing/home';
import PricingPage from '@/pages/marketing/pricing';
import {
  AboutPage,
  ChangelogPage,
  ContactPage,
  DocsArticlePage,
  DocsIndexPage,
  LoginPage,
  PrivacyPage,
  ResearchPage,
  SecurityPage,
  SignupPage,
  SolutionsPage,
  TermsPage,
} from '@/pages/marketing/placeholders';
import { WorkspaceProvider } from '@/lib/workspace';
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
        <Route path="/app" component={Dashboard} />
        <Route path="/log" component={ActivityLog} />
        <Route path="/onboarding" component={Onboarding} />
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
