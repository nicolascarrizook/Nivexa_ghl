import { CalendarDays, TrendingUp, Wallet } from 'lucide-react';
import { useContractorAccountStatement } from '../hooks/useContractorAccountStatement';
import { formatCurrency, formatCurrencyUSD } from '@/utils/formatters';

/**
 * Helper para formatear moneda según el tipo
 */
const formatAmount = (amount: number, currency: string) => {
  return currency === 'USD' ? formatCurrencyUSD(amount) : formatCurrency(amount);
};

/**
 * Badge component simple
 */
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'secondary' | 'destructive';
  className?: string;
}

const Badge = ({ children, variant = 'default', className = '' }: BadgeProps) => {
  const variantClasses = {
    default: 'bg-gray-900 text-white',
    outline: 'border border-gray-300 bg-white text-gray-900',
    secondary: 'bg-gray-100 text-gray-900',
    destructive: 'bg-red-600 text-white',
  };

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
};

interface ContractorAccountStatementCardProps {
  projectContractorId: string;
}

/**
 * Componente que muestra el estado de cuenta de un proveedor
 * Incluye presupuesto total, pagado, saldo pendiente e historial de pagos
 */
export function ContractorAccountStatementCard({ projectContractorId }: ContractorAccountStatementCardProps) {
  const { data: statement, isLoading, error } = useContractorAccountStatement(projectContractorId);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Estado de Cuenta</h3>
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500 dark:text-gray-400">Cargando...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !statement) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Estado de Cuenta</h3>
          <div className="text-sm text-red-600 dark:text-red-400">
            Error al cargar estado de cuenta: {error?.message}
          </div>
        </div>
      </div>
    );
  }

  const progressPercentage = statement.budget_total > 0
    ? (statement.total_paid / statement.budget_total) * 100
    : 0;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Wallet className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Estado de Cuenta</h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{statement.contractor_name}</p>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Resumen Financiero */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <div className="text-sm text-gray-600 dark:text-gray-400">Presupuesto Total</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {formatAmount(statement.budget_total, statement.currency)}
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Pagado</div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatAmount(statement.total_paid, statement.currency)}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {progressPercentage.toFixed(1)}% del presupuesto
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-sm text-gray-600 dark:text-gray-400">Saldo Pendiente</div>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {formatAmount(statement.pending_balance, statement.currency)}
            </div>
          </div>
        </div>

        {/* Separator */}
        <div className="border-t border-gray-200 dark:border-gray-700"></div>

        {/* Información Adicional */}
        <div className="flex flex-wrap gap-4 text-sm">
          {statement.last_payment_date && (
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">Último pago:</span>
              <span className="text-gray-900 dark:text-gray-100">{new Date(statement.last_payment_date).toLocaleDateString('es-AR')}</span>
            </div>
          )}

          {statement.progress_percentage_total > 0 && (
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">Avance total registrado:</span>
              <span className="text-gray-900 dark:text-gray-100">{statement.progress_percentage_total.toFixed(1)}%</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
