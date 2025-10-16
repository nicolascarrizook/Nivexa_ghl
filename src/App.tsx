import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@core/contexts/AuthContext';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { ProjectsPageImproved } from '@/pages/ProjectsPageImproved';
import { ClientsPage } from '@/pages/ClientsPage';
import { ClientProfilePage } from '@/pages/ClientProfilePage';
import { CalendarPage } from '@/pages/CalendarPage';
import { MessagesPage } from '@/pages/MessagesPage';
import { FinancePage } from '@/pages/FinancePage';
import { DocumentsPage } from '@/pages/DocumentsPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { ProjectDetailsPage } from '@/pages/ProjectDetailsPage';
import { MasterCashPage } from '@/pages/MasterCashPage';
import { AdminCashPage } from '@/pages/AdminCashPage';
import { TestFinancePage } from '@/pages/TestFinancePage';
import ProvidersPage from '@/pages/ProvidersPage';
import { InvestorsPage } from '@/pages/InvestorsPage';
import { InvestorProfilePage } from '@/pages/InvestorProfilePage';
import { InvestorPortalPage } from '@/pages/InvestorPortalPage';
import { Spinner } from '@/design-system/components/feedback';
import { Sidebar } from '@/components/navigation';
import { useState } from 'react';
import { Toaster } from 'sonner';

// Enterprise layout with sidebar navigation
const EnterpriseLayout = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <div className="flex-1 flex flex-col">
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
};
import { TestDatabaseConnection } from './components/TestDatabaseConnection';
import { SupabaseAuthDiagnostic } from './components/SupabaseAuthDiagnostic';
import { DatabaseTestPage } from './pages/DatabaseTestPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  return isAuthenticated ? (
    <EnterpriseLayout>
      {children}
    </EnterpriseLayout>
  ) : <Navigate to="/login" replace />;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" replace />;
}

function App() {
  return (
    <>
      <Toaster position="top-right" richColors />
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        } />

      {/* Investor Portal - Public with token authentication */}
      <Route path="/investor/:token" element={<InvestorPortalPage />} />

      {/* Protected routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>
      } />
      
      <Route path="/projects" element={
        <ProtectedRoute>
          <ProjectsPageImproved />
        </ProtectedRoute>
      } />
      
      {/* Legacy route - now handled by modal in projects page */}
      <Route path="/projects/new" element={
        <ProtectedRoute>
          <Navigate to="/projects" replace />
        </ProtectedRoute>
      } />
      
      <Route path="/projects/:projectId" element={
        <ProtectedRoute>
          <ProjectDetailsPage />
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
      
      <Route path="/providers" element={
        <ProtectedRoute>
          <ProvidersPage />
        </ProtectedRoute>
      } />

      <Route path="/investors" element={
        <ProtectedRoute>
          <InvestorsPage />
        </ProtectedRoute>
      } />

      <Route path="/investors/:investorId" element={
        <ProtectedRoute>
          <InvestorProfilePage />
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
      
      <Route path="/finance/master-cash" element={
        <ProtectedRoute>
          <MasterCashPage />
        </ProtectedRoute>
      } />
      
      <Route path="/finance/admin-cash" element={
        <ProtectedRoute>
          <AdminCashPage />
        </ProtectedRoute>
      } />
      
      <Route path="/finance/test" element={
        <ProtectedRoute>
          <TestFinancePage />
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
      
      {/* Test and diagnostic routes */}
      <Route path="/test-db" element={<TestDatabaseConnection />} />
      <Route path="/db-status" element={<DatabaseTestPage />} />
      <Route path="/auth-diagnostic" element={<SupabaseAuthDiagnostic />} />
      
      {/* Design System Demo - removed old showcases */}

      {/* Default redirects */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
    </>
  );
}

export default App;