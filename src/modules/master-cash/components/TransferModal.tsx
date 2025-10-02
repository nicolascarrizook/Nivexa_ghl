import { useState, useEffect } from 'react';
import { X, DollarSign, ArrowRight, FileText, TrendingUp } from 'lucide-react';
import { useTransfer, useActiveAccounts } from '@/hooks/useMasterCash';
import type { TransferData } from '@/services/BankAccountService';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/utils/formatters';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface BankAccount {
  id: string;
  account_name: string;
  account_type: string;
  currency: string;
  balance: number;
  available_balance: number;
}

export function TransferModal({ isOpen, onClose }: TransferModalProps) {
  const { mutateAsync: transfer, isPending } = useTransfer();
  const { data: accounts } = useActiveAccounts();

  const [formData, setFormData] = useState<Partial<TransferData>>({
    from_account_id: '',
    to_account_id: '',
    amount: 0,
    transfer_type: 'internal_transfer',
    description: '',
    notes: '',
    reference_number: '',
    exchange_rate: undefined,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof TransferData, string>>>({});
  const [fromAccount, setFromAccount] = useState<BankAccount | null>(null);
  const [toAccount, setToAccount] = useState<BankAccount | null>(null);
  const [needsConversion, setNeedsConversion] = useState(false);
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);

  useEffect(() => {
    if (formData.from_account_id && accounts) {
      const account = accounts.find(a => a.id === formData.from_account_id);
      setFromAccount(account || null);
    } else {
      setFromAccount(null);
    }
  }, [formData.from_account_id, accounts]);

  useEffect(() => {
    if (formData.to_account_id && accounts) {
      const account = accounts.find(a => a.id === formData.to_account_id);
      setToAccount(account || null);
    } else {
      setToAccount(null);
    }
  }, [formData.to_account_id, accounts]);

  useEffect(() => {
    if (fromAccount && toAccount) {
      const currenciesDiffer = fromAccount.currency !== toAccount.currency;
      setNeedsConversion(currenciesDiffer);

      if (currenciesDiffer && formData.exchange_rate && formData.amount) {
        setConvertedAmount(formData.amount * formData.exchange_rate);
      } else {
        setConvertedAmount(null);
      }
    } else {
      setNeedsConversion(false);
      setConvertedAmount(null);
    }
  }, [fromAccount, toAccount, formData.amount, formData.exchange_rate]);

  if (!isOpen) return null;

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof TransferData, string>> = {};

    if (!formData.from_account_id) {
      newErrors.from_account_id = 'Selecciona la cuenta origen';
    }

    if (!formData.to_account_id) {
      newErrors.to_account_id = 'Selecciona la cuenta destino';
    }

    if (formData.from_account_id === formData.to_account_id) {
      newErrors.to_account_id = 'Las cuentas deben ser diferentes';
    }

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'El monto debe ser mayor a 0';
    }

    if (fromAccount && formData.amount && formData.amount > fromAccount.available_balance) {
      newErrors.amount = 'Fondos insuficientes en cuenta origen';
    }

    if (needsConversion && (!formData.exchange_rate || formData.exchange_rate <= 0)) {
      newErrors.exchange_rate = 'Ingresa la tasa de cambio';
    }

    if (!formData.description?.trim()) {
      newErrors.description = 'La descripción es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isPending) return;

    const isValid = validateForm();
    if (!isValid) return;

    try {
      await transfer(formData as TransferData);
      onClose();

      // Reset form
      setFormData({
        from_account_id: '',
        to_account_id: '',
        amount: 0,
        transfer_type: 'internal_transfer',
        description: '',
        notes: '',
        reference_number: '',
        exchange_rate: undefined,
      });
    } catch (error) {
      console.error('Error transferring:', error);
    }
  };

  const handleInputChange = <K extends keyof TransferData>(field: K) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const value = (field === 'amount' || field === 'exchange_rate')
      ? parseFloat(e.target.value) || 0
      : e.target.value;

    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    if (currency === 'ARS') {
      return formatCurrency(amount);
    }
    return `USD ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 backdrop-blur-md bg-black/20 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-x-4 top-[5%] z-50 mx-auto max-w-3xl bg-white rounded-lg border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Transferencia entre Cuentas
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-4 max-h-[70vh] overflow-y-auto">
          <div className="space-y-6">
            {/* Account Selection */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Cuentas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* From Account */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cuenta Origen *
                  </label>
                  <select
                    value={formData.from_account_id}
                    onChange={handleInputChange('from_account_id')}
                    className={cn(
                      "w-full px-3 py-2 border rounded-lg text-gray-900",
                      "focus:outline-none focus:ring-2 focus:ring-gray-300",
                      errors.from_account_id ? "border-red-300" : "border-gray-200"
                    )}
                  >
                    <option value="">Seleccionar...</option>
                    {accounts?.map(account => (
                      <option key={account.id} value={account.id}>
                        {account.account_name} - {formatAmount(account.available_balance, account.currency)}
                      </option>
                    ))}
                  </select>
                  {errors.from_account_id && (
                    <p className="mt-1 text-sm text-red-600">{errors.from_account_id}</p>
                  )}
                  {fromAccount && (
                    <p className="mt-1 text-xs text-gray-500">
                      Disponible: {formatAmount(fromAccount.available_balance, fromAccount.currency)}
                    </p>
                  )}
                </div>

                {/* To Account */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cuenta Destino *
                  </label>
                  <select
                    value={formData.to_account_id}
                    onChange={handleInputChange('to_account_id')}
                    className={cn(
                      "w-full px-3 py-2 border rounded-lg text-gray-900",
                      "focus:outline-none focus:ring-2 focus:ring-gray-300",
                      errors.to_account_id ? "border-red-300" : "border-gray-200"
                    )}
                  >
                    <option value="">Seleccionar...</option>
                    {accounts?.map(account => (
                      <option key={account.id} value={account.id}>
                        {account.account_name} ({account.currency})
                      </option>
                    ))}
                  </select>
                  {errors.to_account_id && (
                    <p className="mt-1 text-sm text-red-600">{errors.to_account_id}</p>
                  )}
                  {toAccount && (
                    <p className="mt-1 text-xs text-gray-500">
                      Balance actual: {formatAmount(toAccount.balance, toAccount.currency)}
                    </p>
                  )}
                </div>
              </div>

              {/* Visual Transfer Indicator */}
              {fromAccount && toAccount && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="text-center flex-1">
                      <p className="text-xs text-gray-500 mb-1">Origen</p>
                      <p className="text-sm font-medium text-gray-900">{fromAccount.account_name}</p>
                      <p className="text-xs text-gray-600">{fromAccount.currency}</p>
                    </div>
                    <div className="px-4">
                      <ArrowRight className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="text-center flex-1">
                      <p className="text-xs text-gray-500 mb-1">Destino</p>
                      <p className="text-sm font-medium text-gray-900">{toAccount.account_name}</p>
                      <p className="text-xs text-gray-600">{toAccount.currency}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Amount and Conversion */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Monto a Transferir
              </h3>
              <div className="space-y-4">
                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Monto *
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <DollarSign className="h-4 w-4" />
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.amount || ''}
                      onChange={handleInputChange('amount')}
                      className={cn(
                        "w-full pl-9 pr-3 py-2 border rounded-lg text-gray-900",
                        "focus:outline-none focus:ring-2 focus:ring-gray-300",
                        errors.amount ? "border-red-300" : "border-gray-200"
                      )}
                      placeholder="10000.00"
                    />
                  </div>
                  {errors.amount && (
                    <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
                  )}
                  {fromAccount && formData.amount && (
                    <p className="mt-1 text-xs text-gray-500">
                      Se transferirán: {formatAmount(formData.amount, fromAccount.currency)}
                    </p>
                  )}
                </div>

                {/* Exchange Rate (if needed) */}
                {needsConversion && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start mb-3">
                      <TrendingUp className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-yellow-800 mb-1">
                          Conversión de Moneda Requerida
                        </p>
                        <p className="text-xs text-yellow-700">
                          Las cuentas usan monedas diferentes ({fromAccount?.currency} → {toAccount?.currency})
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tasa de Cambio *
                      </label>
                      <input
                        type="number"
                        step="0.0001"
                        min="0"
                        value={formData.exchange_rate || ''}
                        onChange={handleInputChange('exchange_rate')}
                        className={cn(
                          "w-full px-3 py-2 border rounded-lg text-gray-900",
                          "focus:outline-none focus:ring-2 focus:ring-gray-300",
                          errors.exchange_rate ? "border-red-300" : "border-gray-200"
                        )}
                        placeholder="1200.50"
                      />
                      {errors.exchange_rate && (
                        <p className="mt-1 text-sm text-red-600">{errors.exchange_rate}</p>
                      )}
                      {convertedAmount !== null && (
                        <p className="mt-2 text-sm text-gray-700">
                          <strong>Monto convertido:</strong> {formatAmount(convertedAmount, toAccount?.currency || 'ARS')}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Transfer Details */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Detalles de Transferencia
              </h3>
              <div className="space-y-4">
                {/* Transfer Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Transferencia
                  </label>
                  <select
                    value={formData.transfer_type}
                    onChange={handleInputChange('transfer_type')}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300"
                  >
                    <option value="internal_transfer">Transferencia Interna</option>
                    <option value="fee_payment">Pago de Honorarios</option>
                    <option value="loan_disbursement">Desembolso de Préstamo</option>
                    <option value="loan_repayment">Pago de Préstamo</option>
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción *
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-3 text-gray-400">
                      <FileText className="h-4 w-4" />
                    </div>
                    <textarea
                      value={formData.description}
                      onChange={handleInputChange('description')}
                      rows={2}
                      className={cn(
                        "w-full pl-9 pr-3 py-2 border rounded-lg text-gray-900",
                        "focus:outline-none focus:ring-2 focus:ring-gray-300",
                        errors.description ? "border-red-300" : "border-gray-200"
                      )}
                      placeholder="Descripción de la transferencia..."
                    />
                  </div>
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                  )}
                </div>

                {/* Reference Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número de Referencia (Opcional)
                  </label>
                  <input
                    type="text"
                    value={formData.reference_number || ''}
                    onChange={handleInputChange('reference_number')}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300"
                    placeholder="REF-12345"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notas Adicionales
                  </label>
                  <textarea
                    value={formData.notes || ''}
                    onChange={handleInputChange('notes')}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300"
                    placeholder="Información adicional (opcional)..."
                  />
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
            disabled={isPending}
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isPending}
            className={cn(
              "px-4 py-2 text-white bg-gray-900 rounded-lg",
              "hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300",
              "disabled:bg-gray-400 disabled:cursor-not-allowed"
            )}
          >
            {isPending ? 'Procesando...' : 'Realizar Transferencia'}
          </button>
        </div>
      </div>
    </>
  );
}
