import { useState } from 'react';
import { X, DollarSign, Calendar, FileText, CreditCard, Receipt } from 'lucide-react';
import { toast } from 'sonner';
import { newCashBoxService } from '@/services/cash/NewCashBoxService';
import { currencyService } from '@/services/CurrencyService';

interface AdminExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  availableBalanceARS: number;
  availableBalanceUSD: number;
}

const EXPENSE_CATEGORIES = [
  { value: 'personal', label: 'Gastos Personales', icon: '👤' },
  { value: 'rent', label: 'Alquiler', icon: '🏠' },
  { value: 'utilities', label: 'Servicios (Luz, Gas, Agua)', icon: '💡' },
  { value: 'services', label: 'Servicios Profesionales', icon: '🔧' },
  { value: 'provider', label: 'Prestadores/Proveedores', icon: '🤝' },
  { value: 'other', label: 'Otros', icon: '📝' },
] as const;

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Efectivo' },
  { value: 'transfer', label: 'Transferencia' },
  { value: 'debit', label: 'Tarjeta de Débito' },
  { value: 'credit', label: 'Tarjeta de Crédito' },
  { value: 'check', label: 'Cheque' },
];

export function AdminExpenseModal({
  isOpen,
  onClose,
  onSuccess,
  availableBalanceARS,
  availableBalanceUSD,
}: AdminExpenseModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    currency: 'ARS' as 'ARS' | 'USD',
    category: 'personal' as typeof EXPENSE_CATEGORIES[number]['value'],
    description: '',
    paymentMethod: 'cash',
    receiptNumber: '',
    notes: '',
  });

  const availableBalance = formData.currency === 'ARS' ? availableBalanceARS : availableBalanceUSD;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const amount = parseFloat(formData.amount);

      if (isNaN(amount) || amount <= 0) {
        toast.error('Ingrese un monto válido');
        return;
      }

      if (amount > availableBalance) {
        toast.error(`Fondos insuficientes. Disponible: ${currencyService.formatCurrency(availableBalance, formData.currency)}`);
        return;
      }

      if (!formData.description.trim()) {
        toast.error('Ingrese una descripción del gasto');
        return;
      }

      await newCashBoxService.recordAdminExpense({
        amount,
        currency: formData.currency,
        category: formData.category,
        description: formData.description.trim(),
        paymentMethod: formData.paymentMethod,
        receiptNumber: formData.receiptNumber.trim() || undefined,
        notes: formData.notes.trim() || undefined,
      });

      toast.success('Gasto registrado exitosamente');
      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error('Error registering expense:', error);
      toast.error(error.message || 'Error al registrar el gasto');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      amount: '',
      currency: 'ARS',
      category: 'personal',
      description: '',
      paymentMethod: 'cash',
      receiptNumber: '',
      notes: '',
    });
    onClose();
  };

  if (!isOpen) return null;

  const selectedCategory = EXPENSE_CATEGORIES.find(c => c.value === formData.category);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-red-100 p-2 rounded-lg">
              <DollarSign className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Registrar Gasto Administrativo</h2>
              <p className="text-sm text-gray-500">Gastos personales y operativos del administrador</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Balance Display */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-3 rounded-lg border border-gray-200">
              <div className="text-xs text-gray-500 mb-1">Disponible en Pesos</div>
              <div className="text-lg font-bold text-gray-900">
                {currencyService.formatCurrency(availableBalanceARS, 'ARS')}
              </div>
            </div>
            <div className="bg-white p-3 rounded-lg border border-gray-200">
              <div className="text-xs text-gray-500 mb-1">Disponible en Dólares</div>
              <div className="text-lg font-bold text-gray-900">
                {currencyService.formatCurrency(availableBalanceUSD, 'USD')}
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoría del Gasto
            </label>
            <div className="grid grid-cols-2 gap-3">
              {EXPENSE_CATEGORIES.map((category) => (
                <button
                  key={category.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, category: category.value }))}
                  className={`
                    p-3 rounded-lg border-2 transition-all text-left
                    ${formData.category === category.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                    }
                  `}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{category.icon}</span>
                    <span className="text-sm font-medium text-gray-900">{category.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Amount and Currency */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monto
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Moneda
              </label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value as 'ARS' | 'USD' }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ARS">ARS - Pesos</option>
                <option value="USD">USD - Dólares</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción del Gasto
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
                placeholder={`Ej: ${selectedCategory?.label} - Detalle del gasto`}
                required
              />
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Método de Pago
            </label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {PAYMENT_METHODS.map((method) => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Receipt Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Número de Comprobante <span className="text-gray-400">(Opcional)</span>
            </label>
            <div className="relative">
              <Receipt className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={formData.receiptNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, receiptNumber: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ej: FC-0001-00012345"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas Adicionales <span className="text-gray-400">(Opcional)</span>
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={2}
              placeholder="Información adicional sobre el gasto..."
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Registrando...' : 'Registrar Gasto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
