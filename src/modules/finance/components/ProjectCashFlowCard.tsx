import { ArrowDownCircle, ArrowUpCircle, DollarSign, TrendingDown, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';
import type { Currency } from '@/services/CurrencyService';

interface ProjectCashFlowCardProps {
  currency: Currency;
  totalIncome: number;
  totalExpenses: number;
  currentBalance: number;
  className?: string;
}

export function ProjectCashFlowCard({
  currency,
  totalIncome,
  totalExpenses,
  currentBalance,
  className = '',
}: ProjectCashFlowCardProps) {
  // Calcular porcentaje ejecutado
  const executedPercentage = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0;

  // Determinar salud financiera
  const getHealthStatus = () => {
    if (currentBalance < 0) {
      return {
        label: 'Déficit',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        icon: TrendingDown,
        description: 'Los gastos exceden los ingresos'
      };
    }

    if (executedPercentage > 90) {
      return {
        label: 'Atención',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        icon: TrendingDown,
        description: 'Poco balance disponible'
      };
    }

    if (executedPercentage > 70) {
      return {
        label: 'Normal',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        icon: DollarSign,
        description: 'Ejecución controlada'
      };
    }

    return {
      label: 'Saludable',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      icon: TrendingUp,
      description: 'Buenos niveles de balance'
    };
  };

  const healthStatus = getHealthStatus();
  const HealthIcon = healthStatus.icon;

  return (
    <div className={`bg-white border border-gray-200 rounded-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">
            Flujo de Caja - {currency}
          </h3>
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${healthStatus.bgColor}`}>
            <HealthIcon className={`h-4 w-4 ${healthStatus.color}`} />
            <span className={`text-sm font-medium ${healthStatus.color}`}>
              {healthStatus.label}
            </span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 space-y-6">
        {/* Métricas principales */}
        <div className="grid grid-cols-3 gap-4">
          {/* Ingresos */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-green-50 rounded-lg">
                <ArrowDownCircle className="h-5 w-5 text-green-600" />
              </div>
              <span className="text-xs font-medium text-gray-500">Ingresos</span>
            </div>
            <p className="text-xl font-bold text-gray-900">
              {formatCurrency(totalIncome, currency)}
            </p>
            <p className="text-xs text-gray-500">Total recibido</p>
          </div>

          {/* Gastos */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-red-50 rounded-lg">
                <ArrowUpCircle className="h-5 w-5 text-red-600" />
              </div>
              <span className="text-xs font-medium text-gray-500">Gastos</span>
            </div>
            <p className="text-xl font-bold text-gray-900">
              {formatCurrency(totalExpenses, currency)}
            </p>
            <p className="text-xs text-gray-500">
              {executedPercentage.toFixed(1)}% ejecutado
            </p>
          </div>

          {/* Balance */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-50 rounded-lg">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
              <span className="text-xs font-medium text-gray-500">Balance</span>
            </div>
            <p className={`text-xl font-bold ${currentBalance >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
              {formatCurrency(currentBalance, currency)}
            </p>
            <p className="text-xs text-gray-500">Disponible</p>
          </div>
        </div>

        {/* Barra de progreso */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Ejecución del presupuesto</span>
            <span className="font-medium text-gray-900">
              {executedPercentage.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                executedPercentage > 90
                  ? 'bg-red-500'
                  : executedPercentage > 70
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(executedPercentage, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">{healthStatus.description}</p>
        </div>

        {/* Flujo visual */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">Ingresos</span>
            </div>
            <div className="flex-1 mx-4 border-t-2 border-dashed border-gray-300"></div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-gray-600">Gastos</span>
            </div>
            <div className="flex-1 mx-4 border-t-2 border-dashed border-gray-300"></div>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${currentBalance >= 0 ? 'bg-blue-500' : 'bg-red-500'}`}></div>
              <span className="text-gray-600">Balance</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
