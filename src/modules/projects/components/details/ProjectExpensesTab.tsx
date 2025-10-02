import React, { useState, useEffect } from 'react';
import { 
  Plus,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Package,
  Zap,
  Droplets,
  Wrench,
  Building2,
  Users,
  Calendar,
  Filter,
  ChevronRight,
  AlertCircle,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  CreditCard,
  ArrowRightLeft
} from 'lucide-react';
import { supabase } from '@/config/supabase';
import { currencyService } from '@/services/CurrencyService';
import type { Currency } from '@/services/CurrencyService';
import type { ProjectWithDetails } from '@/modules/projects/services/ProjectService';
import { ProjectPaymentModal } from '@/components/providers/ProjectPaymentModal';
import { CashTransferModal } from '@/components/cash/CashTransferModal';
import { ContractorBudgetTracking } from '@/components/contractors/ContractorBudgetTracking';

interface ProjectExpensesTabProps {
  project: ProjectWithDetails;
}

interface ProjectCashInfo {
  id: string;
  balance: number;
  total_received: number;
}

interface ProjectExpenseSummary {
  services_paid: number;
  services_pending: number;
  materials_paid: number;
  materials_pending: number;
  provider_payments_total: number;
  total_expenses: number;
  active_providers_count: number;
}

interface ProviderAssignment {
  id: string;
  provider: {
    id: string;
    name: string;
    provider_type: string;
  };
  service_type: string;
  status: string;
  total_spent: number;
  monthly_budget: number;
}

interface RecentExpense {
  id: string;
  type: 'service' | 'material' | 'payment';
  description: string;
  amount: number;
  date: string;
  provider_name?: string;
  status: string;
}

export function ProjectExpensesTab({ project }: ProjectExpensesTabProps) {
  const [loading, setLoading] = useState(true);
  const [cashInfo, setCashInfo] = useState<ProjectCashInfo | null>(null);
  const [expenseSummary, setExpenseSummary] = useState<ProjectExpenseSummary | null>(null);
  const [providers, setProviders] = useState<ProviderAssignment[]>([]);
  const [recentExpenses, setRecentExpenses] = useState<RecentExpense[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferDirection, setTransferDirection] = useState<'to' | 'from'>('from');
  const [activeFilter, setActiveFilter] = useState<'all' | 'services' | 'materials' | 'providers'>('all');

  useEffect(() => {
    loadProjectExpenses();
  }, [project.id]);

  const loadProjectExpenses = async () => {
    setLoading(true);
    try {
      // Load project cash info
      const { data: cashData } = await supabase
        .from('project_cash')
        .select('*')
        .eq('project_id', project.id)
        .single();

      setCashInfo(cashData);

      // Load expense summary
      const { data: summaryData } = await supabase
        .from('project_expense_summary')
        .select('*')
        .eq('project_id', project.id)
        .single();

      setExpenseSummary(summaryData);

      // Load assigned providers with their total spent
      const { data: providersData } = await supabase
        .from('project_providers')
        .select(`
          *,
          provider:providers(id, name, provider_type)
        `)
        .eq('project_id', project.id)
        .eq('status', 'active');

      // Calculate total spent for each provider
      const providersWithSpent = await Promise.all((providersData || []).map(async (assignment) => {
        // Get total from service consumptions
        const { data: consumptions } = await supabase
          .from('service_consumptions')
          .select('total_amount')
          .eq('project_provider_id', assignment.id)
          .eq('status', 'paid');
        
        const servicesTotal = consumptions?.reduce((sum, c) => sum + (c.total_amount || 0), 0) || 0;
        
        // Get total from provider payments
        const { data: payments } = await supabase
          .from('provider_payments')
          .select('total_amount')
          .eq('provider_id', assignment.provider.id)
          .eq('project_id', project.id)
          .eq('status', 'paid');
        
        const paymentsTotal = payments?.reduce((sum, p) => sum + (p.total_amount || 0), 0) || 0;
        
        return {
          ...assignment,
          total_spent: servicesTotal + paymentsTotal
        };
      }));

      setProviders(providersWithSpent);

      // Load recent expenses (combine from different sources)
      const [consumptions, materials, payments] = await Promise.all([
        // Service consumptions
        supabase
          .from('service_consumptions')
          .select(`
            id,
            service_description,
            total_amount,
            consumption_date,
            status,
            project_provider:project_providers!inner(
              provider:providers(name)
            )
          `)
          .eq('project_provider.project_id', project.id)
          .order('consumption_date', { ascending: false })
          .limit(5),
        
        // Material expenses
        supabase
          .from('material_expenses')
          .select(`
            id,
            description,
            total_amount,
            purchase_date,
            payment_status,
            provider:providers(name)
          `)
          .eq('project_id', project.id)
          .order('purchase_date', { ascending: false })
          .limit(5),
        
        // Provider payments
        supabase
          .from('provider_payments')
          .select(`
            id,
            total_amount,
            payment_date,
            status,
            provider:providers(name)
          `)
          .eq('project_id', project.id)
          .order('payment_date', { ascending: false })
          .limit(5)
      ]);

      // Combine and sort recent expenses
      const allExpenses: RecentExpense[] = [];
      
      // Add service consumptions
      consumptions.data?.forEach(c => {
        allExpenses.push({
          id: c.id,
          type: 'service',
          description: c.service_description,
          amount: c.total_amount,
          date: c.consumption_date,
          provider_name: c.project_provider?.provider?.name,
          status: c.status
        });
      });

      // Add material expenses
      materials.data?.forEach(m => {
        allExpenses.push({
          id: m.id,
          type: 'material',
          description: m.description,
          amount: m.total_amount,
          date: m.purchase_date,
          provider_name: m.provider?.name,
          status: m.payment_status
        });
      });

      // Add provider payments
      payments.data?.forEach(p => {
        allExpenses.push({
          id: p.id,
          type: 'payment',
          description: `Pago a ${p.provider?.name}`,
          amount: p.total_amount,
          date: p.payment_date,
          provider_name: p.provider?.name,
          status: p.status
        });
      });

      // Sort by date
      allExpenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setRecentExpenses(allExpenses.slice(0, 10));

    } catch (error) {
      console.error('Error loading project expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const getExpenseIcon = (type: string) => {
    switch (type) {
      case 'service': return <Zap className="h-4 w-4" />;
      case 'material': return <Package className="h-4 w-4" />;
      case 'payment': return <CreditCard className="h-4 w-4" />;
      default: return <Receipt className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'overdue':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const projectBudget = project.total_amount || 0;
  const totalExpenses = expenseSummary?.total_expenses || 0;
  const budgetRemaining = projectBudget - totalExpenses;
  const budgetUsedPercentage = projectBudget > 0 ? (totalExpenses / projectBudget) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Cash and Budget Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Project Cash Balance */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <Wallet className="h-5 w-5 text-gray-400" />
            <span className="text-xs text-gray-500 font-medium">CAJA PROYECTO</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {currencyService.formatCurrency(cashInfo?.balance || 0, 'ARS')}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Total recibido: {currencyService.formatCurrency(cashInfo?.total_received || 0, 'ARS')}
          </p>
        </div>

        {/* Project Budget */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="h-5 w-5 text-gray-400" />
            <span className="text-xs text-gray-500 font-medium">PRESUPUESTO</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {currencyService.formatCurrency(projectBudget, 'ARS')}
          </p>
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className={`h-1.5 rounded-full ${
                  budgetUsedPercentage >= 90 ? 'bg-red-600' :
                  budgetUsedPercentage >= 75 ? 'bg-orange-600' :
                  budgetUsedPercentage >= 50 ? 'bg-yellow-600' :
                  'bg-green-600'
                }`}
                style={{ width: `${Math.min(budgetUsedPercentage, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">{budgetUsedPercentage.toFixed(1)}% usado</p>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <TrendingDown className="h-5 w-5 text-red-500" />
            <span className="text-xs text-gray-500 font-medium">GASTOS TOTALES</span>
          </div>
          <p className="text-2xl font-bold text-red-600">
            -{currencyService.formatCurrency(totalExpenses, 'ARS')}
          </p>
          <div className="text-xs text-gray-500 mt-2 space-y-1">
            <p>Servicios: {currencyService.formatCurrency((expenseSummary?.services_paid || 0) + (expenseSummary?.services_pending || 0), 'ARS')}</p>
            <p>Materiales: {currencyService.formatCurrency((expenseSummary?.materials_paid || 0) + (expenseSummary?.materials_pending || 0), 'ARS')}</p>
          </div>
        </div>

        {/* Budget Remaining */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="h-5 w-5 text-green-500" />
            <span className="text-xs text-gray-500 font-medium">RESTANTE</span>
          </div>
          <p className={`text-2xl font-bold ${budgetRemaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {currencyService.formatCurrency(budgetRemaining, 'ARS')}
          </p>
          {budgetRemaining < 0 && (
            <p className="text-xs text-red-600 mt-2 flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" />
              Presupuesto excedido
            </p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => setShowPaymentModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
        >
          <Plus className="h-4 w-4" />
          Registrar Gasto
        </button>
        <button
          onClick={() => {
            setTransferDirection('from');
            setShowTransferModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
        >
          <ArrowUpRight className="h-4 w-4" />
          Transferir desde Proyecto
        </button>
        <button
          onClick={() => {
            setTransferDirection('to');
            setShowTransferModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
        >
          <ArrowDownRight className="h-4 w-4" />
          Recibir en Proyecto
        </button>
        <button
          onClick={() => setShowTransferModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
        >
          <ArrowRightLeft className="h-4 w-4" />
          Transferir entre Cajas
        </button>
      </div>

      {/* Assigned Providers */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Proveedores Asignados</h3>
            <span className="text-sm text-gray-500">
              {expenseSummary?.active_providers_count || 0} activos
            </span>
          </div>
        </div>
        
        <div className="p-6">
          {providers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {providers.map(assignment => (
                <div key={assignment.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {assignment.provider.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {assignment.service_type === 'electricity' ? 'Electricidad' :
                           assignment.service_type === 'plumbing' ? 'Plomería' :
                           assignment.service_type === 'construction' ? 'Construcción' :
                           assignment.service_type}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      assignment.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {assignment.status === 'active' ? 'Activo' : assignment.status}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mt-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Gastado</span>
                      <span className="font-medium text-gray-900">
                        {currencyService.formatCurrency(assignment.total_spent || 0, 'ARS')}
                      </span>
                    </div>
                    {assignment.monthly_budget && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Presup. mensual</span>
                        <span className="font-medium text-gray-900">
                          {currencyService.formatCurrency(assignment.monthly_budget, 'ARS')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p>No hay proveedores asignados a este proyecto</p>
              <button
                onClick={() => setShowPaymentModal(true)}
                className="mt-3 text-sm text-gray-900 hover:text-gray-700"
              >
                Asignar proveedor
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Contractor Budget Tracking */}
      <ContractorBudgetTracking projectId={project.id} />

      {/* Recent Expenses */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Gastos Recientes</h3>
            <div className="flex gap-2">
              <select
                value={activeFilter}
                onChange={(e) => setActiveFilter(e.target.value as any)}
                className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-gray-500"
              >
                <option value="all">Todos</option>
                <option value="services">Servicios</option>
                <option value="materials">Materiales</option>
                <option value="providers">Pagos</option>
              </select>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {recentExpenses.length > 0 ? (
            recentExpenses.map(expense => (
              <div key={expense.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      {getExpenseIcon(expense.type)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {expense.description}
                      </p>
                      <p className="text-xs text-gray-500">
                        {expense.provider_name || 'Sin proveedor'} • {new Date(expense.date).toLocaleDateString('es-AR')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      -{currencyService.formatCurrency(expense.amount, 'ARS')}
                    </p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(expense.status)}`}>
                      {expense.status === 'paid' ? 'Pagado' : 
                       expense.status === 'pending' ? 'Pendiente' : 
                       expense.status}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p>No hay gastos registrados</p>
            </div>
          )}
        </div>

        {recentExpenses.length > 0 && (
          <div className="p-4 border-t border-gray-200">
            <button className="text-sm text-gray-600 hover:text-gray-900 font-medium">
              Ver todos los gastos →
            </button>
          </div>
        )}
      </div>

      {/* Pending Payments Alert */}
      {expenseSummary && (expenseSummary.services_pending > 0 || expenseSummary.materials_pending > 0) && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5 mr-3" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-orange-900">Pagos Pendientes</h4>
              <div className="mt-2 space-y-1">
                {expenseSummary.services_pending > 0 && (
                  <p className="text-sm text-orange-700">
                    Servicios: {currencyService.formatCurrency(expenseSummary.services_pending, 'ARS')}
                  </p>
                )}
                {expenseSummary.materials_pending > 0 && (
                  <p className="text-sm text-orange-700">
                    Materiales: {currencyService.formatCurrency(expenseSummary.materials_pending, 'ARS')}
                  </p>
                )}
              </div>
            </div>
            <button className="px-3 py-1.5 bg-orange-100 text-orange-700 text-sm font-medium rounded-lg hover:bg-orange-200">
              Ver pendientes
            </button>
          </div>
        </div>
      )}

      {/* Project Payment Modal */}
      <ProjectPaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        projectId={project.id}
        onSuccess={() => {
          loadProjectExpenses();
          setShowPaymentModal(false);
        }}
      />

      {/* Cash Transfer Modal */}
      <CashTransferModal
        isOpen={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        projectId={project.id}
        sourceType={transferDirection === 'from' ? 'project' : undefined}
        onSuccess={() => {
          loadProjectExpenses();
          setShowTransferModal(false);
        }}
      />
    </div>
  );
}