import { useState } from 'react';
import { PaymentSelectionModal } from '@/modules/projects/components/PaymentSelectionModal';
import {
  DollarSign,
  Calendar,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  FileText,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  ChevronRight
} from 'lucide-react';
import type { ProjectWithDetails } from '@/modules/projects/services/ProjectService';
import { currencyService } from '@/services/CurrencyService';
import type { Currency } from '@/services/CurrencyService';

interface ProjectFinancesTabProps {
  project: ProjectWithDetails;
}

export function ProjectFinancesTab({ project }: ProjectFinancesTabProps) {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'pending' | 'paid' | 'overdue'>('all');
  const [showExpenses, setShowExpenses] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Calculate financial metrics
  const totalAmount = project.total_amount || 0;
  const paidAmount = project.paid_amount || 0;
  const pendingAmount = totalAmount - paidAmount;
  const downPaymentAmount = project.down_payment_amount || 0;
  
  // Filter installments based on selected filter
  const getFilteredInstallments = () => {
    if (!project.installments) return [];
    
    switch (selectedFilter) {
      case 'paid':
        return project.installments.filter(i => i.status === 'paid');
      case 'pending':
        return project.installments.filter(i => i.status === 'pending');
      case 'overdue':
        return project.installments.filter(i => i.status === 'overdue');
      default:
        return project.installments;
    }
  };

  const filteredInstallments = getFilteredInstallments();

  // Calculate payment statistics
  const totalInstallments = project.installments?.length || 0;
  const paidInstallments = project.installments?.filter(i => i.status === 'paid').length || 0;
  const overdueInstallments = project.installments?.filter(i => i.status === 'overdue').length || 0;
  const pendingInstallments = project.installments?.filter(i => i.status === 'pending').length || 0;

  // Calculate late fees
  const totalLateFees = project.installments?.reduce((sum, i) => sum + (i.late_fee_applied || 0), 0) || 0;

  // Get next payment
  const nextPayment = project.installments?.filter(i => i.status === 'pending')
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())[0];

  return (
    <div className="space-y-6">
      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Project Value */}
        <div className="bg-white rounded-lg  border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-gray-100 rounded-lg">
              <DollarSign className="h-5 w-5 text-gray-600" />
            </div>
            <span className="text-xs text-gray-500 font-medium">VALOR TOTAL</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {currencyService.formatCurrency(totalAmount, project.currency as Currency)}
          </p>
          <div className="mt-2 text-sm text-gray-600">
            <span>Anticipo: {currencyService.formatCurrency(downPaymentAmount, project.currency as Currency)}</span>
          </div>
        </div>

        {/* Amount Collected */}
        <div className="bg-white rounded-lg  border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-gray-100 rounded-lg">
              <ArrowUpRight className="h-5 w-5 text-gray-600" />
            </div>
            <span className="text-xs text-gray-600 font-medium">RECAUDADO</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {currencyService.formatCurrency(paidAmount, project.currency as Currency)}
          </p>
          <div className="mt-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Del total</span>
              <span className="font-medium text-gray-600">
                {totalAmount > 0 ? `${((paidAmount / totalAmount) * 100).toFixed(1)}%` : '0%'}
              </span>
            </div>
            <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gray-100 h-2 rounded-full"
                style={{ width: totalAmount > 0 ? `${(paidAmount / totalAmount) * 100}%` : '0%' }}
              />
            </div>
          </div>
        </div>

        {/* Pending Amount */}
        <div className="bg-white rounded-lg  border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-gray-100 rounded-lg">
              <ArrowDownRight className="h-5 w-5 text-gray-600" />
            </div>
            <span className="text-xs text-gray-600 font-medium">PENDIENTE</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {currencyService.formatCurrency(pendingAmount, project.currency as Currency)}
          </p>
          <div className="mt-2 text-sm text-gray-600">
            <span>{pendingInstallments} cuotas restantes</span>
          </div>
        </div>
      </div>

      {/* Payment Schedule */}
      <div className="bg-white rounded-lg  border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Cronograma de Pagos</h2>
            <div className="flex items-center space-x-2">
              {/* Filter Buttons */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setSelectedFilter('all')}
                  className={`px-3 py-1.5 text-sm font-medium rounded ${
                    selectedFilter === 'all' 
                      ? 'bg-white text-gray-900 ' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Todos ({totalInstallments})
                </button>
                <button
                  onClick={() => setSelectedFilter('paid')}
                  className={`px-3 py-1.5 text-sm font-medium rounded ${
                    selectedFilter === 'paid' 
                      ? 'bg-white text-gray-900 ' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Pagados ({paidInstallments})
                </button>
                <button
                  onClick={() => setSelectedFilter('pending')}
                  className={`px-3 py-1.5 text-sm font-medium rounded ${
                    selectedFilter === 'pending' 
                      ? 'bg-white text-gray-900 ' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Pendientes ({pendingInstallments})
                </button>
                <button
                  onClick={() => setSelectedFilter('overdue')}
                  className={`px-3 py-1.5 text-sm font-medium rounded ${
                    selectedFilter === 'overdue' 
                      ? 'bg-white text-gray-900 ' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Vencidos ({overdueInstallments})
                </button>
              </div>
              
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                <Download className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cuota
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vencimiento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pagado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mora
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInstallments.map((installment) => {
                const isPaid = installment.status === 'paid';
                const isOverdue = installment.status === 'overdue';
                const isPending = installment.status === 'pending';
                
                return (
                  <tr key={installment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`p-2 rounded-lg mr-3 ${
                          isPaid ? 'bg-gray-100' :
                          isOverdue ? 'bg-gray-100' :
                          'bg-gray-100'
                        }`}>
                          {isPaid ? (
                            <CheckCircle className="h-4 w-4 text-gray-600" />
                          ) : isOverdue ? (
                            <AlertCircle className="h-4 w-4 text-gray-600" />
                          ) : (
                            <Clock className="h-4 w-4 text-gray-600" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {installment.installment_number === 0 
                              ? 'Anticipo' 
                              : `Cuota #${installment.installment_number}`}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-900">
                        {new Date(installment.due_date).toLocaleDateString('es-AR')}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-medium text-gray-900">
                        {currencyService.formatCurrency(installment.amount, project.currency as Currency)}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        isPaid ? 'bg-gray-100 text-gray-600' :
                        isOverdue ? 'bg-gray-100 text-gray-600' :
                        installment.status === 'partial' ? 'bg-gray-100 text-gray-600' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {isPaid ? 'Pagado' :
                         isOverdue ? 'Vencido' :
                         installment.status === 'partial' ? 'Parcial' :
                         'Pendiente'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-900">
                        {installment.paid_amount > 0 
                          ? currencyService.formatCurrency(installment.paid_amount, project.currency as Currency)
                          : '-'}
                      </p>
                      {installment.paid_date && (
                        <p className="text-xs text-gray-500">
                          {new Date(installment.paid_date).toLocaleDateString('es-AR')}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-900">
                        {installment.late_fee_applied > 0 
                          ? currencyService.formatCurrency(installment.late_fee_applied, project.currency as Currency)
                          : '-'}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button className="text-gray-600 hover:text-gray-600 text-sm font-medium">
                        Ver detalles
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Next Payment Alert */}
      {nextPayment && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="p-2 bg-gray-100 rounded-lg mr-3">
              <Calendar className="h-5 w-5 text-gray-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-900">Próximo Pago</h3>
              <p className="mt-1 text-sm text-gray-600">
                {nextPayment.installment_number === 0 ? 'Anticipo' : `Cuota #${nextPayment.installment_number}`} - 
                Vence el {new Date(nextPayment.due_date).toLocaleDateString('es-AR')}
              </p>
              <p className="mt-1 text-lg font-semibold text-gray-900">
                {currencyService.formatCurrency(nextPayment.amount, project.currency as Currency)}
              </p>
            </div>
            <button 
              onClick={() => setShowPaymentModal(true)}
              className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800">
              Confirmar Pago
            </button>
          </div>
        </div>
      )}

      {/* Payment Methods & Bank Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Payment Methods */}
        <div className="bg-white rounded-lg  border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Métodos de Pago Aceptados</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <CreditCard className="h-5 w-5 text-gray-600 mr-3" />
                <span className="text-sm text-gray-900">Transferencia Bancaria</span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 text-gray-600 mr-3" />
                <span className="text-sm text-gray-900">Efectivo</span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Invoice Generation */}
        <div className="bg-white rounded-lg  border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Facturación</h3>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-gray-600 mr-3" />
                <span className="text-sm text-gray-900">Generar Factura</span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </button>
            <button className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
              <div className="flex items-center">
                <Download className="h-5 w-5 text-gray-600 mr-3" />
                <span className="text-sm text-gray-900">Descargar Estado de Cuenta</span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Late Fee Summary */}
      {totalLateFees > 0 && (
        <div className="bg-gray-100 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-gray-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Moras Acumuladas</p>
                <p className="text-xs text-gray-600 mt-1">
                  Se han aplicado cargos por mora en {overdueInstallments} cuota(s)
                </p>
              </div>
            </div>
            <p className="text-lg font-semibold text-gray-600">
              {currencyService.formatCurrency(totalLateFees, project.currency as Currency)}
            </p>
          </div>
        </div>
      )}

      {/* Payment Selection Modal */}
      <PaymentSelectionModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        projectId={project.id}
        projectName={project.name}
        clientName={project.client_name}
        clientId={project.client_id}
        currency={project.currency as Currency}
        totalAmount={project.total_amount}
        onPaymentComplete={() => {
          setShowPaymentModal(false);
          // You can add a callback here to refresh the project data if needed
        }}
      />
    </div>
  );
}