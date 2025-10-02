import './App.css';
import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@core/contexts/AuthContext';
import { Spinner } from '@/design-system/components/feedback';
// Temporary simple layout wrapper until proper DashboardLayout configuration
const EnterpriseLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-gray-50">
    <header className="bg-white border-b border-gray-200 px-4 py-3">
      <h1 className="text-xl font-semibold text-gray-900">Nivexa Studio</h1>
      <p className="text-sm text-gray-600">Gestión Arquitectónica</p>
    </header>
    <main className="p-4">{children}</main>
  </div>
);

// Lazy load all pages for better performance
const LoginPage = lazy(() => import('@/pages/LoginPage').then(m => ({ default: m.LoginPage })));
const DashboardPage = lazy(() => import('@/pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const ProjectsPage = lazy(() => import('@/pages/ProjectsPage').then(m => ({ default: m.ProjectsPage })));
const NewProjectPage = lazy(() => import('@/pages/NewProjectPage').then(m => ({ default: m.NewProjectPage })));
const ClientsPage = lazy(() => import('@/pages/ClientsPage').then(m => ({ default: m.ClientsPage })));
const ClientProfilePage = lazy(() => import('@/pages/ClientProfilePage').then(m => ({ default: m.ClientProfilePage })));
const CalendarPage = lazy(() => import('@/pages/CalendarPage').then(m => ({ default: m.CalendarPage })));
const MessagesPage = lazy(() => import('@/pages/MessagesPage').then(m => ({ default: m.MessagesPage })));
const FinancePage = lazy(() => import('@/pages/FinancePage').then(m => ({ default: m.FinancePage })));
const DocumentsPage = lazy(() => import('@/pages/DocumentsPage').then(m => ({ default: m.DocumentsPage })));
const SettingsPage = lazy(() => import('@/pages/SettingsPage').then(m => ({ default: m.SettingsPage })));

// Lazy load test pages (only in dev)
const TestDatabaseConnection = import.meta.env.DEV 
  ? lazy(() => import('./components/TestDatabaseConnection').then(m => ({ default: m.TestDatabaseConnection })))
  : () => <Navigate to="/dashboard" replace />;

const SupabaseAuthDiagnostic = import.meta.env.DEV
  ? lazy(() => import('./components/SupabaseAuthDiagnostic').then(m => ({ default: m.SupabaseAuthDiagnostic })))
  : () => <Navigate to="/dashboard" replace />;

const DatabaseTestPage = import.meta.env.DEV
  ? lazy(() => import('./pages/DatabaseTestPage').then(m => ({ default: m.DatabaseTestPage })))
  : () => <Navigate to="/dashboard" replace />;

// Loading component for suspense
function PageLoader() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Spinner size="lg" color="primary" />
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <PageLoader />;
  }

  return isAuthenticated ? (
    <EnterpriseLayout>
      <Suspense fallback={<PageLoader />}>
        {children}
      </Suspense>
    </EnterpriseLayout>
  ) : <Navigate to="/login" replace />;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <PageLoader />;
  }

  return !isAuthenticated ? (
    <Suspense fallback={<PageLoader />}>
      {children}
    </Suspense>
  ) : <Navigate to="/dashboard" replace />;
}

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={
        <PublicRoute>
          <LoginPage />
        </PublicRoute>
      } />

      {/* Protected routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>
      } />
      
      <Route path="/projects" element={
        <ProtectedRoute>
          <ProjectsPage />
        </ProtectedRoute>
      } />
      
      <Route path="/projects/new" element={
        <ProtectedRoute>
          <NewProjectPage />
        </ProtectedRoute>
      } />
      
      <Route path="/clients" element={
        <ProtectedRoute>
          <ClientsPage />
        </ProtectedRoute>
      } />
      
      <Route path="/clients/:id" element={
        <ProtectedRoute>
          <ClientProfilePage />
        </ProtectedRoute>
      } />
      
      <Route path="/calendar" element={
        <ProtectedRoute>
          <CalendarPage />
        </ProtectedRoute>
      } />
      
      <Route path="/messages" element={
        <ProtectedRoute>
          <MessagesPage />
        </ProtectedRoute>
      } />
      
      <Route path="/finance" element={
        <ProtectedRoute>
          <FinancePage />
        </ProtectedRoute>
      } />
      
      <Route path="/finance/*" element={
        <ProtectedRoute>
          <FinancePage />
        </ProtectedRoute>
      } />
      
      <Route path="/documents" element={
        <ProtectedRoute>
          <DocumentsPage />
        </ProtectedRoute>
      } />
      
      <Route path="/settings" element={
        <ProtectedRoute>
          <SettingsPage />
        </ProtectedRoute>
      } />
      
      {/* Test and diagnostic routes (only in dev) */}
      {import.meta.env.DEV && (
        <>
          <Route path="/test-db" element={
            <Suspense fallback={<PageLoader />}>
              <TestDatabaseConnection />
            </Suspense>
          } />
          <Route path="/db-status" element={
            <Suspense fallback={<PageLoader />}>
              <DatabaseTestPage />
            </Suspense>
          } />
          <Route path="/auth-diagnostic" element={
            <Suspense fallback={<PageLoader />}>
              <SupabaseAuthDiagnostic />
            </Suspense>
          } />
        </>
      )}

      {/* Default redirects */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;