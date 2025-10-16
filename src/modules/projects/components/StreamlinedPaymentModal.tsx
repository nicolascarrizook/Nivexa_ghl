/**
 * StreamlinedPaymentModal - Flujo de pago condensado en un solo modal
 *
 * Reemplaza el flujo de 3 modales (PaymentSelection → AdminFeeConfig → PaymentConfirmation)
 * con una experiencia unificada y más fluida.
 */

import { useState, useEffect } from 'react';
import { X, CheckCircle, DollarSign, Percent, Calculator, AlertTriangle, CreditCard, ArrowLeft, ArrowRight } from 'lucide-react';
import { currencyService, type Currency } from '@/services/CurrencyService';
import { DataTable, type Column } from '@/design-system/components/data-display';
import { Badge } from '@/design-system/components/data-display';
import { formatDate, formatCurrency } from '@/utils/formatters';
import { supabase } from '@/config/supabase';
import { toast } from 'sonner';
import { newCashBoxService } from '@/services/cash/NewCashBoxService';

interface Installment {
  id: string;
  installment_number: number;
  amount: number;
  due_date: string;
  status: string;
  paid_amount: number | null;
  paid_date: string | null;
  admin_fee_percentage?: number;
  admin_fee_amount?: number;
  admin_fee_collected?: boolean;
}

interface PaymentConfirmation {
  confirmed: boolean;
  paymentMethod: string;
  referenceNumber?: string;
  bankAccount?: string;
  notes?: string;
  confirmedAt?: string;
  paymentCurrency?: Currency;
}

interface StreamlinedPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
  clientName: string;
  clientId: string;
  currency: Currency;
  totalAmount: number;
  onPaymentComplete: () => void;
}

type Step = 1 | 2 | 3;

export function StreamlinedPaymentModal({
  isOpen,
  onClose,
  projectId,
  projectName,
  clientName,
  currency,
  totalAmount,
  onPaymentComplete,
}: StreamlinedPaymentModalProps) {
  // Step management
  const [currentStep, setCurrentStep] = useState<Step>(1);

  // Step 1: Installment selection
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [isLoadingInstallments, setIsLoadingInstallments] = useState(false);
  const [selectedInstallment, setSelectedInstallment] = useState<Installment | null>(null);

  // Step 2: Admin fee configuration
  const [feeType, setFeeType] = useState<'percentage' | 'fixed' | 'none'>('percentage');
  const [feePercentage, setFeePercentage] = useState<number>(15);
  const [feeAmount, setFeeAmount] = useState<number>(0);
  const [calculatedFee, setCalculatedFee] = useState<number>(0);
  const [skipFeeStep, setSkipFeeStep] = useState(false);

  // Step 3: Payment confirmation
  const [paymentData, setPaymentData] = useState<PaymentConfirmation>({
    confirmed: false,
    paymentMethod: '',
    referenceNumber: '',
    bankAccount: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate fee when relevant values change
  useEffect(() => {
    if (!selectedInstallment) return;

    if (feeType === 'percentage') {
      setCalculatedFee((selectedInstallment.amount * feePercentage) / 100);
    } else if (feeType === 'fixed') {
      setCalculatedFee(feeAmount);
    } else {
      setCalculatedFee(0);
    }
  }, [feeType, feePercentage, feeAmount, selectedInstallment]);

  // Load installments
  useEffect(() => {
    if (isOpen && projectId) {
      loadInstallments();
    }
  }, [isOpen, projectId]);

  const loadInstallments = async () => {
    setIsLoadingInstallments(true);
    try {
      const { data: installmentsData, error } = await supabase
        .from("installments")
        .select("*")
        .eq("project_id", projectId)
        .order("installment_number", { ascending: true });

      if (error) throw error;
      setInstallments(installmentsData || []);
    } catch (error) {
      console.error("Error loading installments:", error);
      toast.error("Error al cargar las cuotas");
    } finally {
      setIsLoadingInstallments(false);
    }
  };

  // Check if we should skip fee configuration step
  useEffect(() => {
    if (selectedInstallment) {
      setSkipFeeStep(!!selectedInstallment.admin_fee_collected);
    }
  }, [selectedInstallment]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(1);
      setSelectedInstallment(null);
      setFeeType('percentage');
      setFeePercentage(15);
      setFeeAmount(0);
      setPaymentData({
        confirmed: false,
        paymentMethod: '',
        referenceNumber: '',
        bankAccount: '',
        notes: '',
      });
    }
  }, [isOpen]);

  const handleInstallmentSelect = (installment: Installment) => {
    setSelectedInstallment(installment);

    // If fee already collected, skip to confirmation
    if (installment.admin_fee_collected) {
      setCurrentStep(3);
    } else {
      setCurrentStep(2);
    }
  };

  const handleNextStep = () => {
    if (currentStep === 1 && selectedInstallment) {
      if (skipFeeStep) {
        setCurrentStep(3);
      } else {
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      setCurrentStep(3);
    }
  };

  const handlePrevStep = () => {
    if (currentStep === 3) {
      if (skipFeeStep) {
        setCurrentStep(1);
      } else {
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      setCurrentStep(1);
    }
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedInstallment || !paymentData.paymentMethod) {
      toast.error('Por favor complete todos los campos requeridos');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Get cash boxes
      const { data: projectCash } = await supabase
        .from('project_cash_box')
        .select('*')
        .eq('project_id', projectId)
        .single();

      const { data: masterCash } = await supabase
        .from('master_cash')
        .select('*')
        .single();

      if (!projectCash || !masterCash) {
        throw new Error('Cash boxes not found');
      }

      // 2. Create cash movements
      const movements = [
        // Movement from external to project cash
        {
          movement_type: 'project_income',
          source_type: 'external',
          source_id: null,
          destination_type: 'project',
          destination_id: projectCash.id,
          amount: selectedInstallment.amount,
          description: `Pago de cuota #${selectedInstallment.installment_number}`,
          project_id: projectId,
          installment_id: selectedInstallment.id,
          metadata: {
            paymentMethod: paymentData.paymentMethod,
            referenceNumber: paymentData.referenceNumber,
            bankAccount: paymentData.bankAccount,
            notes: paymentData.notes,
          }
        },
        // Duplicate to master cash
        {
          movement_type: 'master_duplication',
          source_type: 'external',
          source_id: null,
          destination_type: 'master',
          destination_id: masterCash.id,
          amount: selectedInstallment.amount,
          description: `Cuota #${selectedInstallment.installment_number} duplicada - ${projectName}`,
          project_id: projectId,
          installment_id: selectedInstallment.id,
          metadata: {
            paymentMethod: paymentData.paymentMethod,
            referenceNumber: paymentData.referenceNumber,
            bankAccount: paymentData.bankAccount,
          }
        }
      ];

      // Insert movements
      const { error: movementError } = await supabase
        .from('cash_movements')
        .insert(movements);

      if (movementError) throw movementError;

      // 3. Update cash box balances
      const isARS = currency === 'ARS';
      const updates = [
        // Update project cash
        supabase
          .from('project_cash_box')
          .update({
            current_balance_ars: isARS ? projectCash.current_balance_ars + selectedInstallment.amount : projectCash.current_balance_ars,
            current_balance_usd: !isARS ? projectCash.current_balance_usd + selectedInstallment.amount : projectCash.current_balance_usd,
            total_income_ars: isARS ? projectCash.total_income_ars + selectedInstallment.amount : projectCash.total_income_ars,
            total_income_usd: !isARS ? projectCash.total_income_usd + selectedInstallment.amount : projectCash.total_income_usd,
            updated_at: new Date().toISOString(),
          })
          .eq('id', projectCash.id),

        // Update master cash (both legacy and multi-currency fields)
        supabase
          .from('master_cash')
          .update({
            balance: masterCash.balance + selectedInstallment.amount, // Legacy field
            balance_ars: isARS ? (masterCash.balance_ars || 0) + selectedInstallment.amount : (masterCash.balance_ars || 0),
            balance_usd: !isARS ? (masterCash.balance_usd || 0) + selectedInstallment.amount : (masterCash.balance_usd || 0),
            last_movement_at: new Date().toISOString(),
          })
          .eq('id', masterCash.id),
      ];

      await Promise.all(updates);

      // 4. Update installment as paid
      await supabase
        .from('installments')
        .update({
          status: 'paid',
          paid_amount: selectedInstallment.amount,
          paid_date: new Date().toISOString(),
          notes: paymentData.notes || null,
          admin_fee_collected: !skipFeeStep, // Mark fee as collected if we're collecting it
        })
        .eq('id', selectedInstallment.id);

      // 5. ✨ AUTOMATIC ADMIN FEE LIQUIDATION ✨
      // If fee was configured and not already collected, liquidate fees
      if (!skipFeeStep && feeType !== 'none') {
        try {
          let feeAmount = 0;

          if (feeType === 'percentage') {
            feeAmount = (selectedInstallment.amount * feePercentage) / 100;
          } else if (feeType === 'fixed') {
            feeAmount = calculatedFee;
          }

          if (feeAmount > 0) {
            await newCashBoxService.collectAdminFeeManual({
              amount: feeAmount,
              currency: currency,
              description: `Honorarios cuota #${selectedInstallment.installment_number} - ${projectName}`,
              projectId: projectId,
              percentage: feeType === 'percentage' ? feePercentage : 0,
            });

            console.log(`✅ Admin fees automatically liquidated: ${feeAmount} ${currency}`);
          }
        } catch (feeError) {
          console.error('Error liquidating admin fees:', feeError);
          toast.error('Pago registrado pero error al liquidar honorarios. Verifique la caja admin.');
          // Don't fail the entire payment if fee liquidation fails
        }
      }

      toast.success('Pago confirmado exitosamente');
      onPaymentComplete();
      onClose();
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('Error al procesar el pago. Intente nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const unpaidInstallments = installments.filter((i) => i.status !== 'paid');
  const paidAmount = installments
    .filter((i) => i.status === 'paid')
    .reduce((sum, i) => sum + (i.paid_amount || 0), 0);
  const pendingAmount = totalAmount - paidAmount;

  // Step indicator configuration
  const steps = [
    { number: 1, label: 'Seleccionar', completed: currentStep > 1 },
    ...(skipFeeStep ? [] : [{ number: 2, label: 'Configurar', completed: currentStep > 2 }]),
    { number: 3, label: 'Confirmar', completed: false },
  ];

  // Installment columns for DataTable
  const installmentColumns: Column[] = [
    {
      key: 'installment_number',
      title: 'Cuota',
      sortable: true,
      width: 80,
      render: (value) => (
        <span className="text-sm font-medium text-gray-900">
          #{value}
        </span>
      ),
    },
    {
      key: 'amount',
      title: 'Monto',
      sortable: true,
      align: 'right',
      render: (value) => (
        <span className="text-sm font-semibold text-gray-900">
          {formatCurrency(value, currency)}
        </span>
      ),
    },
    {
      key: 'due_date',
      title: 'Vencimiento',
      sortable: true,
      render: (value) => (
        <span className="text-sm text-gray-600">
          {formatDate(value)}
        </span>
      ),
    },
    {
      key: 'status',
      title: 'Estado',
      width: 120,
      render: (value: string) => {
        const getVariant = () => {
          switch (value) {
            case 'paid':
              return 'success';
            case 'pending':
              return 'warning';
            case 'overdue':
              return 'error';
            default:
              return 'default';
          }
        };

        const getLabel = () => {
          switch (value) {
            case 'paid':
              return 'Pagado';
            case 'pending':
              return 'Pendiente';
            case 'overdue':
              return 'Vencido';
            default:
              return value;
          }
        };

        return (
          <Badge variant={getVariant()} size="sm">
            {getLabel()}
          </Badge>
        );
      },
    },
  ];

  const paymentMethods = [
    { value: 'bank_transfer', label: 'Transferencia Bancaria' },
    { value: 'cash', label: 'Efectivo' },
    { value: 'check', label: 'Cheque' },
    { value: 'credit_card', label: 'Tarjeta de Crédito' },
    { value: 'debit_card', label: 'Tarjeta de Débito' },
    { value: 'other', label: 'Otro' },
  ];

  const bankAccounts = [
    { value: 'cuenta_corriente_ars', label: 'Cuenta Corriente ARS' },
    { value: 'cuenta_corriente_usd', label: 'Cuenta Corriente USD' },
    { value: 'caja_ahorro_ars', label: 'Caja de Ahorro ARS' },
    { value: 'caja_ahorro_usd', label: 'Caja de Ahorro USD' },
    { value: 'mercado_pago', label: 'Mercado Pago' },
    { value: 'other', label: 'Otra cuenta' },
  ];

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Confirmar Pago
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {projectName} • Cliente: {clientName}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Step Indicator */}
          <div className="mt-6 flex items-center justify-center">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                      step.completed
                        ? 'bg-green-500 text-white'
                        : currentStep === step.number
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {step.completed ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      step.number
                    )}
                  </div>
                  <span
                    className={`text-xs mt-2 font-medium ${
                      currentStep === step.number
                        ? 'text-gray-900'
                        : 'text-gray-500'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-16 h-0.5 mx-2 mb-6 transition-all ${
                      step.completed ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Step 1: Installment Selection */}
          {currentStep === 1 && (
            <div className="space-y-6">
              {/* Payment Summary */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600">Total Proyecto</div>
                  <div className="text-lg font-semibold text-gray-900 mt-1">
                    {currencyService.formatCurrency(totalAmount, currency)}
                  </div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600">Pagado</div>
                  <div className="text-lg font-semibold text-green-700 mt-1">
                    {currencyService.formatCurrency(paidAmount, currency)}
                  </div>
                </div>
                <div className="bg-amber-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600">Pendiente</div>
                  <div className="text-lg font-semibold text-amber-700 mt-1">
                    {currencyService.formatCurrency(pendingAmount, currency)}
                  </div>
                </div>
              </div>

              {/* Installments Table */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Selecciona la cuota a pagar ({unpaidInstallments.length} pendientes)
                </h3>
                <DataTable
                  data={unpaidInstallments}
                  columns={installmentColumns}
                  loading={isLoadingInstallments}
                  rowKey="id"
                  onRowClick={handleInstallmentSelect}
                  selectedRowKey={selectedInstallment?.id}
                  size="md"
                  bordered={true}
                  emptyText="No hay cuotas pendientes"
                />
              </div>
            </div>
          )}

          {/* Step 2: Admin Fee Configuration */}
          {currentStep === 2 && selectedInstallment && (
            <div className="space-y-6">
              {/* Installment Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-600">Cuota seleccionada</div>
                    <div className="text-lg font-semibold text-gray-900 mt-1">
                      Cuota #{selectedInstallment.installment_number}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Monto</div>
                    <div className="text-lg font-semibold text-gray-900 mt-1">
                      {currencyService.formatCurrency(selectedInstallment.amount, currency)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Fee Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Configurar Honorarios Administrativos
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setFeeType('percentage')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      feeType === 'percentage'
                        ? 'border-gray-900 bg-gray-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Percent className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                    <div className="text-sm font-medium">Porcentaje</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFeeType('fixed')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      feeType === 'fixed'
                        ? 'border-gray-900 bg-gray-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <DollarSign className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                    <div className="text-sm font-medium">Monto Fijo</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFeeType('none')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      feeType === 'none'
                        ? 'border-gray-900 bg-gray-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <X className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                    <div className="text-sm font-medium">Sin Honorarios</div>
                  </button>
                </div>
              </div>

              {/* Fee Configuration */}
              {feeType === 'percentage' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Porcentaje de Honorarios
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.5"
                      value={feePercentage}
                      onChange={(e) => setFeePercentage(parseFloat(e.target.value) || 0)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    />
                    <span className="text-gray-600 font-medium">%</span>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    Sugerido: 15% para cuotas regulares
                  </div>
                </div>
              )}

              {feeType === 'fixed' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monto de Honorarios
                  </label>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600 font-medium">{currency === 'USD' ? 'US$' : '$'}</span>
                    <input
                      type="number"
                      min="0"
                      step="100"
                      value={feeAmount}
                      onChange={(e) => setFeeAmount(parseFloat(e.target.value) || 0)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              {/* Fee Summary */}
              {feeType !== 'none' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Calculator className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">
                        Honorarios Calculados:
                      </span>
                    </div>
                    <span className="text-xl font-bold text-blue-900">
                      {currencyService.formatCurrency(calculatedFee, currency)}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-blue-700">
                    Sobre pago de {currencyService.formatCurrency(selectedInstallment.amount, currency)}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Payment Confirmation */}
          {currentStep === 3 && selectedInstallment && (
            <form onSubmit={handleSubmitPayment} className="space-y-6">
              {/* Amount Summary */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-6 text-center">
                <div className="text-sm text-gray-600 mb-2">
                  Cuota #{selectedInstallment.installment_number}
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  {currencyService.formatCurrency(selectedInstallment.amount, currency)}
                </div>
                {!skipFeeStep && calculatedFee > 0 && (
                  <div className="mt-2 text-sm text-gray-600">
                    + {currencyService.formatCurrency(calculatedFee, currency)} honorarios
                  </div>
                )}
              </div>

              {/* Warning */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mr-3 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-amber-900">
                      Sistema Triple Caja
                    </p>
                    <p className="text-amber-700 mt-1">
                      Este pago se registrará en la caja del proyecto y se duplicará automáticamente en la Caja Máster.
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Método de Pago <span className="text-red-500">*</span>
                </label>
                <select
                  value={paymentData.paymentMethod}
                  onChange={(e) => setPaymentData({ ...paymentData, paymentMethod: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  required
                >
                  <option value="">Seleccionar método...</option>
                  {paymentMethods.map((method) => (
                    <option key={method.value} value={method.value}>
                      {method.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Bank Account */}
              {paymentData.paymentMethod === 'bank_transfer' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cuenta Bancaria
                  </label>
                  <select
                    value={paymentData.bankAccount}
                    onChange={(e) => setPaymentData({ ...paymentData, bankAccount: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  >
                    <option value="">Seleccionar cuenta...</option>
                    {bankAccounts.map((account) => (
                      <option key={account.value} value={account.value}>
                        {account.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Reference Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Referencia
                </label>
                <input
                  type="text"
                  value={paymentData.referenceNumber}
                  onChange={(e) => setPaymentData({ ...paymentData, referenceNumber: e.target.value })}
                  placeholder="Ej: TRANS-123456"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas Adicionales
                </label>
                <textarea
                  value={paymentData.notes}
                  onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                  rows={3}
                  placeholder="Observaciones o detalles adicionales..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
                />
              </div>
            </form>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center flex-shrink-0">
          <div>
            {currentStep > 1 && (
              <button
                onClick={handlePrevStep}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 flex items-center space-x-2 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Anterior</span>
              </button>
            )}
          </div>

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              Cancelar
            </button>

            {currentStep < 3 && (
              <button
                onClick={handleNextStep}
                disabled={!selectedInstallment}
                className="px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <span>Siguiente</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            )}

            {currentStep === 3 && (
              <button
                onClick={handleSubmitPayment}
                disabled={isSubmitting || !paymentData.paymentMethod}
                className="px-6 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <CreditCard className="h-4 w-4" />
                <span>{isSubmitting ? 'Procesando...' : 'Confirmar Pago'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
