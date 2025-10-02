import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  Building2,
  Package,
  CreditCard,
  FileText,
  Calendar,
  AlertCircle,
  Plus,
  ChevronRight,
  Zap,
  Droplets,
  Wrench,
  Clock,
  CheckCircle,
  XCircle,
  Filter,
  Download,
  Eye,
  Home,
  BarChart3,
  PieChart,
  Activity,
  Users,
  Receipt
} from 'lucide-react';
import { supabase } from '@/config/supabase';
import { currencyService } from '@/services/CurrencyService';
import { ProviderManagement } from '@/components/providers/ProviderManagement';
import { ServicePaymentModal } from '@/components/providers/ServicePaymentModal';

interface FinancialSummary {
  adminBalance: number;
  masterBalance: number;
  totalProjectsBalance: number;
  totalSystemBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  pendingPayments: number;
  overduePayments: number;
}

interface RecentTransaction {
  id: string;
  transaction_type: string;
  amount: number;
  description: string;
  transaction_date: string;
  provider?: { name: string };
  project?: { name: string; code: string };
  category?: { name: string };
  status: string;
  cash_type: string;
}

interface ProjectExpense {
  project_id: string;
  project_name: string;
  project_code: string;
  services_paid: number;
  services_pending: number;
  materials_paid: number;
  materials_pending: number;
  total_expenses: number;
  project_cash_balance: number;
  project_budget: number;
  active_providers_count: number;
}

export function EnhancedFinancePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'providers' | 'projects' | 'reports'>('dashboard');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary>({
    adminBalance: 0,
    masterBalance: 0,
    totalProjectsBalance: 0,
    totalSystemBalance: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    pendingPayments: 0,
    overduePayments: 0
  });
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([]);
  const [projectExpenses, setProjectExpenses] = useState<ProjectExpense[]>([]);
  const [upcomingPayments, setUpcomingPayments] = useState<any[]>([]);

  useEffect(() => {
    loadFinancialData();
  }, []);

  const loadFinancialData = async () => {
    setLoading(true);
    try {
      // Load financial summary
      const [adminCash, masterCash, projectCashes] = await Promise.all([
        supabase.from('admin_cash').select('balance').single(),
        supabase.from('master_cash').select('balance').single(),
        supabase.from('project_cash').select('balance')
      ]);

      // Load monthly stats
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      // Recent transactions
      const { data: transactions } = await supabase
        .from('financial_transactions')
        .select(`
          *,
          provider:providers(name),
          project:projects(name, code),
          category:income_expense_categories(name)
        `)
        .order('transaction_date', { ascending: false })
        .limit(10);

      // Project expense summary
      const { data: expenseSummary } = await supabase
        .from('project_expense_summary')
        .select('*')
        .order('total_expenses', { ascending: false });

      // Upcoming payments
      const { data: schedules } = await supabase
        .from('payment_schedules')
        .select(`
          *,
          provider:providers(name),
          project:projects(name, code)
        `)
        .eq('is_active', true)
        .lte('next_payment_date', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('next_payment_date');

      // Calculate monthly income and expenses
      const { data: monthlyTransactions } = await supabase
        .from('financial_transactions')
        .select('transaction_type, amount')
        .gte('transaction_date', startOfMonth.toISOString());

      const monthlyIncome = monthlyTransactions
        ?.filter(t => t.transaction_type === 'income')
        .reduce((sum, t) => sum + t.amount, 0) || 0;

      const monthlyExpenses = monthlyTransactions
        ?.filter(t => t.transaction_type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0) || 0;

      // Count pending and overdue payments
      const { data: pendingData } = await supabase
        .from('provider_payments')
        .select('total_amount, due_date')
        .eq('status', 'pending');

      const now = new Date();
      const pendingPayments = pendingData?.reduce((sum, p) => sum + p.total_amount, 0) || 0;
      const overduePayments = pendingData
        ?.filter(p => p.due_date && new Date(p.due_date) < now)
        .reduce((sum, p) => sum + p.total_amount, 0) || 0;

      setFinancialSummary({
        adminBalance: adminCash.data?.balance || 0,
        masterBalance: masterCash.data?.balance || 0,
        totalProjectsBalance: projectCashes.data?.reduce((sum, p) => sum + p.balance, 0) || 0,
        totalSystemBalance: (masterCash.data?.balance || 0) + (adminCash.data?.balance || 0),
        monthlyIncome,
        monthlyExpenses,
        pendingPayments,
        overduePayments
      });

      setRecentTransactions(transactions || []);
      setProjectExpenses(expenseSummary || []);
      setUpcomingPayments(schedules || []);
    } catch (error) {
      console.error('Error loading financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'income': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'expense': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <DollarSign className="h-4 w-4 text-gray-600" />;
    }
  };

  const getCashTypeLabel = (type: string) => {
    switch (type) {
      case 'admin': return 'Caja Admin';
      case 'master': return 'Caja Maestra';
      case 'project': return 'Caja Proyecto';
      default: return type;
    }
  };

  const getProjectHealthColor = (spent: number, budget: number) => {
    const percentage = (spent / budget) * 100;
    if (percentage >= 90) return 'text-red-600 bg-red-50';
    if (percentage >= 75) return 'text-orange-600 bg-orange-50';
    if (percentage >= 50) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Centro Financiero Completo</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Control total de finanzas, proveedores y gastos de proyectos
                </p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
                >
                  <Plus className="h-4 w-4" />
                  Registrar Pago/Servicio
                </button>
                <button
                  onClick={() => navigate('/finance/reports')}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  <FileText className="h-4 w-4" />
                  Reportes
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mt-6 border-b border-gray-200 -mb-px">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-2 text-sm font-medium border-b-2 ${
                  activeTab === 'dashboard'
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Dashboard General
              </button>
              <button
                onClick={() => setActiveTab('providers')}
                className={`px-4 py-2 text-sm font-medium border-b-2 ${
                  activeTab === 'providers'
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Proveedores y Servicios
              </button>
              <button
                onClick={() => setActiveTab('projects')}
                className={`px-4 py-2 text-sm font-medium border-b-2 ${
                  activeTab === 'projects'
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Gastos por Proyecto
              </button>
              <button
                onClick={() => setActiveTab('reports')}
                className={`px-4 py-2 text-sm font-medium border-b-2 ${
                  activeTab === 'reports'
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Análisis y Reportes
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Cash Balances */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <Wallet className="h-8 w-8 text-gray-400" />
                  <span className="text-xs text-gray-500 font-medium">CAJA ADMIN</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {currencyService.formatCurrency(financialSummary.adminBalance, 'ARS')}
                </p>
                <button
                  onClick={() => navigate('/finance/admin-cash')}
                  className="mt-3 text-xs text-gray-600 hover:text-gray-900 flex items-center gap-1"
                >
                  Ver detalles <ChevronRight className="h-3 w-3" />
                </button>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <Building2 className="h-8 w-8 text-gray-400" />
                  <span className="text-xs text-gray-500 font-medium">CAJA MAESTRA</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {currencyService.formatCurrency(financialSummary.masterBalance, 'ARS')}
                </p>
                <button
                  onClick={() => navigate('/finance/master-cash')}
                  className="mt-3 text-xs text-gray-600 hover:text-gray-900 flex items-center gap-1"
                >
                  Ver detalles <ChevronRight className="h-3 w-3" />
                </button>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <Home className="h-8 w-8 text-gray-400" />
                  <span className="text-xs text-gray-500 font-medium">CAJAS PROYECTOS</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {currencyService.formatCurrency(financialSummary.totalProjectsBalance, 'ARS')}
                </p>
                <button
                  onClick={() => navigate('/projects')}
                  className="mt-3 text-xs text-gray-600 hover:text-gray-900 flex items-center gap-1"
                >
                  Ver proyectos <ChevronRight className="h-3 w-3" />
                </button>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <DollarSign className="h-8 w-8 text-gray-400" />
                  <span className="text-xs text-gray-500 font-medium">BALANCE TOTAL</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {currencyService.formatCurrency(financialSummary.totalSystemBalance, 'ARS')}
                </p>
                <p className="mt-3 text-xs text-gray-600">
                  Sistema completo
                </p>
              </div>
            </div>

            {/* Monthly Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-gray-600">Ingresos del Mes</span>
                </div>
                <p className="text-xl font-semibold text-green-600">
                  +{currencyService.formatCurrency(financialSummary.monthlyIncome, 'ARS')}
                </p>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-gray-600">Gastos del Mes</span>
                </div>
                <p className="text-xl font-semibold text-red-600">
                  -{currencyService.formatCurrency(financialSummary.monthlyExpenses, 'ARS')}
                </p>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-orange-600" />
                  <span className="text-sm text-gray-600">Pagos Pendientes</span>
                </div>
                <p className="text-xl font-semibold text-orange-600">
                  {currencyService.formatCurrency(financialSummary.pendingPayments, 'ARS')}
                </p>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-gray-600">Pagos Vencidos</span>
                </div>
                <p className="text-xl font-semibold text-red-600">
                  {currencyService.formatCurrency(financialSummary.overduePayments, 'ARS')}
                </p>
              </div>
            </div>

            {/* Recent Transactions and Upcoming Payments */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Transactions */}
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900">Transacciones Recientes</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {recentTransactions.slice(0, 5).map(transaction => (
                    <div key={transaction.id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          {getTransactionIcon(transaction.transaction_type)}
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {transaction.description}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {transaction.provider?.name || transaction.project?.name || 'General'}
                              {' • '}
                              {new Date(transaction.transaction_date).toLocaleDateString('es-AR')}
                              {' • '}
                              {getCashTypeLabel(transaction.cash_type)}
                            </p>
                          </div>
                        </div>
                        <p className={`text-sm font-semibold ${
                          transaction.transaction_type === 'income' 
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }`}>
                          {transaction.transaction_type === 'income' ? '+' : '-'}
                          {currencyService.formatCurrency(transaction.amount, 'ARS')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upcoming Payments */}
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900">Próximos Pagos Programados</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {upcomingPayments.length > 0 ? (
                    upcomingPayments.slice(0, 5).map(payment => (
                      <div key={payment.id} className="p-4 hover:bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {payment.provider?.name}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {payment.description || payment.frequency}
                              {' • '}
                              Vence: {new Date(payment.next_payment_date).toLocaleDateString('es-AR')}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-gray-900">
                              {currencyService.formatCurrency(payment.amount, 'ARS')}
                            </p>
                            <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded mt-1 inline-block">
                              {payment.frequency === 'monthly' ? 'Mensual' : 
                               payment.frequency === 'weekly' ? 'Semanal' : 
                               payment.frequency}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm">No hay pagos programados</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'providers' && (
          <ProviderManagement />
        )}

        {activeTab === 'projects' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Gastos por Proyecto</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Control detallado de gastos de servicios, materiales y proveedores
                </p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Proyecto
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Servicios
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Materiales
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Gastos
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Presupuesto
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Proveedores
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {projectExpenses.map(project => {
                      const budgetUsage = project.project_budget > 0 
                        ? (project.total_expenses / project.project_budget) * 100 
                        : 0;
                      
                      return (
                        <tr key={project.project_id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {project.project_name}
                              </p>
                              <p className="text-xs text-gray-500">{project.project_code}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-sm text-gray-900">
                                {currencyService.formatCurrency(project.services_paid, 'ARS')}
                              </p>
                              {project.services_pending > 0 && (
                                <p className="text-xs text-orange-600">
                                  Pendiente: {currencyService.formatCurrency(project.services_pending, 'ARS')}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-sm text-gray-900">
                                {currencyService.formatCurrency(project.materials_paid, 'ARS')}
                              </p>
                              {project.materials_pending > 0 && (
                                <p className="text-xs text-orange-600">
                                  Pendiente: {currencyService.formatCurrency(project.materials_pending, 'ARS')}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm font-semibold text-gray-900">
                              {currencyService.formatCurrency(project.total_expenses, 'ARS')}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-sm text-gray-900">
                                {currencyService.formatCurrency(project.project_budget, 'ARS')}
                              </p>
                              <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
                                <div
                                  className={`h-1.5 rounded-full ${
                                    budgetUsage >= 90 ? 'bg-red-600' :
                                    budgetUsage >= 75 ? 'bg-orange-600' :
                                    budgetUsage >= 50 ? 'bg-yellow-600' :
                                    'bg-green-600'
                                  }`}
                                  style={{ width: `${Math.min(budgetUsage, 100)}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              budgetUsage >= 90 ? 'bg-red-100 text-red-700' :
                              budgetUsage >= 75 ? 'bg-orange-100 text-orange-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {budgetUsage.toFixed(0)}% usado
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="text-sm text-gray-900">
                              {project.active_providers_count || 0}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Reportes y Análisis Avanzados
            </h3>
            <p className="text-gray-600 mb-6">
              Próximamente: Dashboards interactivos, gráficos de tendencias y reportes personalizables
            </p>
            <button
              onClick={() => navigate('/finance/reports')}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
            >
              Ver Reportes Básicos
            </button>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      <ServicePaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={() => {
          loadFinancialData();
          setShowPaymentModal(false);
        }}
      />
    </div>
  );
}