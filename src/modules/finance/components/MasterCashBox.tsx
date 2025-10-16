import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Filter, 
  Download,
  Eye,
  EyeOff,
  Briefcase,
  Receipt,
  Building,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { newCashBoxService } from '@/services/cash/NewCashBoxService';
import { currencyService } from '@/services/CurrencyService';
import { cn } from '@/lib/utils';
import { supabase } from '@/config/supabase';
import type { 
  MasterCashBox, 
  MasterCashTransaction,
  MasterTransactionType,
  Currency,
  ExpenseCategory
} from '@/services/cash/CashBoxService';

interface MasterCashBoxProps {
  organizationId?: string;
}

export function MasterCashBoxComponent({ organizationId: propOrgId }: MasterCashBoxProps) {
  const [cashBox, setCashBox] = useState<MasterCashBox | null>(null);
  const [transactions, setTransactions] = useState<MasterCashTransaction[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewTransaction, setShowNewTransaction] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('ARS');
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [organizationId, setOrganizationId] = useState<string>('');
  
  // Filtros
  const [filterType, setFilterType] = useState<MasterTransactionType | 'all'>('all');
  const [filterDateRange, setFilterDateRange] = useState<'week' | 'month' | 'year' | 'all'>('month');

  useEffect(() => {
    // Get the current user's ID to use as organization ID
    const getOrgId = async () => {
      if (propOrgId) {
        setOrganizationId(propOrgId);
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setOrganizationId(user.id);
        }
      }
    };
    getOrgId();
  }, [propOrgId]);

  useEffect(() => {
    if (organizationId) {
      loadCashBoxData();
    }
  }, [organizationId]);

  const loadCashBoxData = async () => {
    if (!organizationId) return;

    try {
      setLoading(true);

      // Obtener o crear caja maestra usando newCashBoxService
      let masterCash = await newCashBoxService.getMasterCash();

      // Adaptar al formato esperado por el componente
      const masterBox: MasterCashBox = {
        id: masterCash?.id || '',
        organization_id: organizationId,
        name: 'Caja Maestra',
        description: 'Caja principal del estudio',
        current_balance_ars: masterCash?.balance_ars || 0,
        current_balance_usd: masterCash?.balance_usd || 0,
        total_income_ars: 0, // TODO: calcular desde cash_movements
        total_income_usd: 0,
        total_expenses_ars: 0,
        total_expenses_usd: 0,
        created_at: masterCash?.created_at || new Date().toISOString(),
        updated_at: masterCash?.updated_at || new Date().toISOString(),
      };

      setCashBox(masterBox);

      // TODO: Cargar transacciones y categorías cuando estén disponibles en newCashBoxService
      setTransactions([]);
      setCategories([]);
    } catch (error) {
      console.error('Error loading cash box:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: Currency) => {
    return currencyService.formatCurrency(amount, currency);
  };

  const getTransactionIcon = (type: MasterTransactionType) => {
    switch (type) {
      case 'project_income': return <ArrowDownRight className="h-4 w-4 text-gray-600" />;
      case 'honorarium_payment': return <Briefcase className="h-4 w-4 text-gray-600" />;
      case 'operational_expense': return <Receipt className="h-4 w-4 text-gray-600" />;
      case 'tax_payment': return <Building className="h-4 w-4 text-orange-500" />;
      default: return <CreditCard className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTransactionTypeLabel = (type: MasterTransactionType) => {
    const labels: Record<MasterTransactionType, string> = {
      'project_income': 'Ingreso de Proyecto',
      'honorarium_payment': 'Pago de Honorarios',
      'operational_expense': 'Gasto Operativo',
      'tax_payment': 'Pago de Impuestos',
      'investment': 'Inversión',
      'loan_given': 'Préstamo Otorgado',
      'loan_received': 'Préstamo Recibido',
      'loan_payment': 'Pago de Préstamo',
      'transfer_out': 'Transferencia Saliente',
      'transfer_in': 'Transferencia Entrante',
      'bank_fee': 'Comisión Bancaria',
      'other_income': 'Otros Ingresos',
      'other_expense': 'Otros Gastos'
    };
    return labels[type] || type;
  };

  const filteredTransactions = transactions.filter(t => {
    // Filtro por tipo
    if (filterType !== 'all' && t.transaction_type !== filterType) {
      return false;
    }

    // Filtro por fecha
    if (filterDateRange !== 'all') {
      const txDate = new Date(t.transaction_date);
      const now = new Date();
      const daysDiff = (now.getTime() - txDate.getTime()) / (1000 * 60 * 60 * 24);
      
      if (filterDateRange === 'week' && daysDiff > 7) return false;
      if (filterDateRange === 'month' && daysDiff > 30) return false;
      if (filterDateRange === 'year' && daysDiff > 365) return false;
    }

    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-200"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg  border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Caja Maestra Financiera</h2>
            <p className="text-sm text-gray-600 mt-1">
              Gestión privada de ingresos y egresos de la organización
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setBalanceVisible(!balanceVisible)}
              className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
              title={balanceVisible ? 'Ocultar balances' : 'Mostrar balances'}
            >
              {balanceVisible ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
            </button>
            <button
              onClick={() => setShowNewTransaction(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-900 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Nuevo Movimiento</span>
            </button>
          </div>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Balance ARS */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Balance ARS</span>
              <DollarSign className="h-4 w-4 text-gray-600" />
            </div>
            <div className="text-2xl font-bold text-gray-600">
              {balanceVisible ? formatCurrency(cashBox?.current_balance_ars || 0, 'ARS') : '••••••'}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <TrendingUp className="h-3 w-3 text-gray-600" />
              <span className="text-xs text-gray-600">
                Ingresos: {balanceVisible ? formatCurrency(cashBox?.total_income_ars || 0, 'ARS') : '••••'}
              </span>
            </div>
          </div>

          {/* Balance USD */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Balance USD</span>
              <DollarSign className="h-4 w-4 text-gray-600" />
            </div>
            <div className="text-2xl font-bold text-gray-600">
              {balanceVisible ? formatCurrency(cashBox?.current_balance_usd || 0, 'USD') : '••••••'}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <TrendingUp className="h-3 w-3 text-gray-600" />
              <span className="text-xs text-gray-600">
                Ingresos: {balanceVisible ? formatCurrency(cashBox?.total_income_usd || 0, 'USD') : '••••'}
              </span>
            </div>
          </div>

          {/* Total Gastos ARS */}
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Gastos ARS</span>
              <TrendingDown className="h-4 w-4 text-gray-600" />
            </div>
            <div className="text-2xl font-bold text-gray-600">
              {balanceVisible ? formatCurrency(cashBox?.total_expenses_ars || 0, 'ARS') : '••••••'}
            </div>
            <div className="text-xs text-gray-600 mt-2">
              Total acumulado
            </div>
          </div>

          {/* Total Gastos USD */}
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-orange-700">Gastos USD</span>
              <TrendingDown className="h-4 w-4 text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-orange-900">
              {balanceVisible ? formatCurrency(cashBox?.total_expenses_usd || 0, 'USD') : '••••••'}
            </div>
            <div className="text-xs text-gray-600 mt-2">
              Total acumulado
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg  border border-gray-200 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filtros:</span>
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-300 focus:border-gray-200"
          >
            <option value="all">Todos los tipos</option>
            <option value="project_income">Ingresos de Proyecto</option>
            <option value="honorarium_payment">Honorarios</option>
            <option value="operational_expense">Gastos Operativos</option>
            <option value="tax_payment">Impuestos</option>
            <option value="bank_fee">Comisiones</option>
            <option value="other_income">Otros Ingresos</option>
            <option value="other_expense">Otros Gastos</option>
          </select>

          <select
            value={filterDateRange}
            onChange={(e) => setFilterDateRange(e.target.value as any)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-300 focus:border-gray-200"
          >
            <option value="week">Última semana</option>
            <option value="month">Último mes</option>
            <option value="year">Último año</option>
            <option value="all">Todo</option>
          </select>

          <div className="ml-auto">
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Download className="h-4 w-4" />
              <span>Exportar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-lg  border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Movimientos Recientes
          </h3>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredTransactions.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              No hay movimientos para mostrar
            </div>
          ) : (
            filteredTransactions.map((transaction) => (
              <div key={transaction.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      {getTransactionIcon(transaction.transaction_type)}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {transaction.description}
                      </div>
                      <div className="text-sm text-gray-500">
                        {getTransactionTypeLabel(transaction.transaction_type)}
                        {transaction.reference_number && ` • Ref: ${transaction.reference_number}`}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(transaction.transaction_date).toLocaleString('es-AR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={cn(
                      "text-lg font-semibold",
                      transaction.amount > 0 ? "text-gray-600" : "text-gray-600"
                    )}>
                      {transaction.amount > 0 ? '+' : ''}
                      {formatCurrency(Math.abs(transaction.amount), transaction.currency)}
                    </div>
                    {transaction.project_id && (
                      <div className="text-xs text-gray-500">
                        Proyecto relacionado
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* New Transaction Modal */}
      {showNewTransaction && (
        <NewTransactionModal
          organizationId={organizationId}
          cashBoxId={cashBox?.id || ''}
          categories={categories}
          onClose={() => setShowNewTransaction(false)}
          onSuccess={() => {
            setShowNewTransaction(false);
            loadCashBoxData();
          }}
        />
      )}
    </div>
  );
}

// Modal para nueva transacción
interface NewTransactionModalProps {
  organizationId: string;
  cashBoxId: string;
  categories: ExpenseCategory[];
  onClose: () => void;
  onSuccess: () => void;
}

function NewTransactionModal({ 
  organizationId, 
  cashBoxId, 
  categories, 
  onClose, 
  onSuccess 
}: NewTransactionModalProps) {
  const [formData, setFormData] = useState({
    transaction_type: 'honorarium_payment' as MasterTransactionType,
    amount: 0,
    currency: 'ARS' as Currency,
    description: '',
    expense_category_id: '',
    recipient_name: '',
    recipient_account: '',
    reference_number: '',
    payment_method: 'bank_transfer',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.description) {
      alert('Por favor complete los campos requeridos');
      return;
    }

    setIsSubmitting(true);

    try {
      await cashBoxService.processMasterWithdrawal({
        organization_id: organizationId,
        amount: formData.amount,
        currency: formData.currency,
        transaction_type: formData.transaction_type,
        description: formData.description,
        expense_category_id: formData.expense_category_id || undefined,
        recipient_name: formData.recipient_name || undefined,
        recipient_account: formData.recipient_account || undefined,
        reference_number: formData.reference_number || undefined,
        payment_method: formData.payment_method || undefined,
      });
      
      onSuccess();
    } catch (error) {
      console.error('Error creating transaction:', error);
      alert('Error al crear el movimiento');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg  max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Nuevo Movimiento - Caja Maestra
            </h3>
          </div>

          <div className="px-6 py-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Movimiento *
                </label>
                <select
                  value={formData.transaction_type}
                  onChange={(e) => setFormData({ ...formData, transaction_type: e.target.value as MasterTransactionType })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-300"
                >
                  <option value="honorarium_payment">Pago de Honorarios</option>
                  <option value="operational_expense">Gasto Operativo</option>
                  <option value="tax_payment">Pago de Impuestos</option>
                  <option value="investment">Inversión</option>
                  <option value="loan_given">Préstamo Otorgado</option>
                  <option value="transfer_out">Transferencia Saliente</option>
                  <option value="bank_fee">Comisión Bancaria</option>
                  <option value="other_expense">Otros Gastos</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría
                </label>
                <select
                  value={formData.expense_category_id}
                  onChange={(e) => setFormData({ ...formData, expense_category_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-300"
                >
                  <option value="">Sin categoría</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción *
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-gray-300"
                placeholder="Descripción del movimiento"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monto *
                </label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-gray-300"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Moneda *
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value as Currency })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-300"
                >
                  <option value="ARS">ARS - Pesos</option>
                  <option value="USD">USD - Dólares</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Beneficiario
                </label>
                <input
                  type="text"
                  value={formData.recipient_name}
                  onChange={(e) => setFormData({ ...formData, recipient_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-gray-300"
                  placeholder="Nombre del beneficiario"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cuenta Destino
                </label>
                <input
                  type="text"
                  value={formData.recipient_account}
                  onChange={(e) => setFormData({ ...formData, recipient_account: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-gray-300"
                  placeholder="CBU/Alias/Cuenta"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Método de Pago
                </label>
                <select
                  value={formData.payment_method}
                  onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-300"
                >
                  <option value="bank_transfer">Transferencia Bancaria</option>
                  <option value="cash">Efectivo</option>
                  <option value="check">Cheque</option>
                  <option value="credit_card">Tarjeta de Crédito</option>
                  <option value="crypto">Criptomoneda</option>
                  <option value="other">Otro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nº de Referencia
                </label>
                <input
                  type="text"
                  value={formData.reference_number}
                  onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-gray-300"
                  placeholder="Número de transacción"
                />
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm text-white bg-gray-900 rounded-lg hover:bg-gray-900 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Procesando...' : 'Registrar Movimiento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}