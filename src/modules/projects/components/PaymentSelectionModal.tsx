import { supabase } from "@/config/supabase";
import {
  Badge,
  DataTable,
  type Column,
} from "@/design-system/components/data-display";
import { SectionCard } from "@/design-system/components/layout";
import { SuccessModal } from "@/design-system/components/feedback";
import { AdminFeeConfigModal } from "@/modules/projects/components/AdminFeeConfigModal";
import { PaymentConfirmationModal } from "@/modules/projects/components/PaymentConfirmationModal";
import type { PaymentConfirmation } from "@/modules/projects/types/project.types";
import { administratorFeeService } from "@/services/AdministratorFeeService";
import type { Currency } from "@/services/CurrencyService";
import { currencyService } from "@/services/CurrencyService";
import { newCashBoxService } from "@/services/cash/NewCashBoxService";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

interface Installment {
  id: string;
  project_id: string;
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

interface PaymentSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
  clientName: string;
  clientId: string | null;
  currency: Currency;
  totalAmount: number;
  onPaymentComplete?: () => void;
}

export function PaymentSelectionModal({
  isOpen,
  onClose,
  projectId,
  projectName,
  clientName,
  clientId,
  currency,
  totalAmount,
  onPaymentComplete,
}: PaymentSelectionModalProps) {
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showFeeConfigModal, setShowFeeConfigModal] = useState(false);
  const [selectedInstallment, setSelectedInstallment] =
    useState<Installment | null>(null);
  const [organizationId, setOrganizationId] = useState<string>("");
  const [exchangeRate, setExchangeRate] = useState<number>(1);
  const [defaultFeePercentage, setDefaultFeePercentage] = useState<number>(15);
  const [pendingFeeConfig, setPendingFeeConfig] = useState<{
    installment: Installment;
    feePercentage?: number;
    feeAmount?: number;
  } | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (isOpen) {
      loadInstallments();
      getOrganizationId();
      loadExchangeRate();
    }
  }, [isOpen, projectId]);

  const getOrganizationId = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      setOrganizationId(user.id);
    }
  };

  const loadExchangeRate = async () => {
    try {
      const { data } = await supabase
        .from("exchange_rates")
        .select("*")
        .eq("from_currency", "USD")
        .eq("to_currency", "ARS")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (data) {
        setExchangeRate(data.rate);
      }
    } catch (error) {
      console.error("Error loading exchange rate:", error);
    }
  };

  const loadInstallments = async () => {
    try {
      setLoading(true);
      const { data: installmentsData, error } = await supabase
        .from("installments")
        .select("*")
        .eq("project_id", projectId)
        .order("installment_number", { ascending: true });

      if (error) throw error;
      setInstallments(installmentsData || []);
    } catch (error) {
      console.error("Error loading installments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = (installment: Installment) => {
    // First, check if fees have already been configured or collected for this installment
    if (installment.admin_fee_collected) {
      // Fees already collected, go straight to payment
      setSelectedInstallment(installment);
      setShowPaymentModal(true);
    } else {
      // Show fee configuration modal first
      setSelectedInstallment(installment);
      setShowFeeConfigModal(true);
    }
  };

  const handleFeeConfigConfirm = (
    feePercentage?: number,
    feeAmount?: number
  ) => {
    if (selectedInstallment) {
      setPendingFeeConfig({
        installment: selectedInstallment,
        feePercentage,
        feeAmount,
      });
      setShowFeeConfigModal(false);
      setShowPaymentModal(true);
    }
  };

  const handlePaymentConfirmation = async (
    confirmation: PaymentConfirmation
  ) => {
    if (!selectedInstallment) return;

    try {
      // 1. Update installment as paid
      const { error: updateError } = await supabase
        .from("installments")
        .update({
          status: "paid",
          paid_amount: selectedInstallment.amount,
          paid_date: new Date().toISOString(),
          notes: confirmation.notes || null,
        })
        .eq("id", selectedInstallment.id);

      if (updateError) throw updateError;

      // 1b. Create payment record
      const { error: paymentError } = await supabase.from("payments").insert({
        installment_id: selectedInstallment.id,
        amount: selectedInstallment.amount,
        payment_method: confirmation.paymentMethod,
        payment_reference: confirmation.referenceNumber,
      });

      if (paymentError) throw paymentError;

      // 2. Process payment to cash boxes
      // Use the payment currency if specified, otherwise use project currency
      const paymentCurrency = (confirmation.paymentCurrency || currency) as 'ARS' | 'USD';

      await newCashBoxService.processProjectPayment({
        organizationId: organizationId,
        projectId: projectId,
        amount: selectedInstallment.amount,
        description: `Pago cuota #${selectedInstallment.installment_number} - ${projectName}`,
        installmentId: selectedInstallment.id,
        currency: paymentCurrency, // Use the actual payment currency
      });

      // 3. Create and collect administrative fee for this payment
      // Use the fee configuration from the modal (if configured) or default
      let feePercentage: number | undefined;
      let feeAmount: number | undefined;

      if (
        pendingFeeConfig &&
        pendingFeeConfig.installment.id === selectedInstallment.id
      ) {
        // Use the manually configured fee
        feePercentage = pendingFeeConfig.feePercentage;
        feeAmount = pendingFeeConfig.feeAmount;
      } else if (selectedInstallment.admin_fee_percentage !== undefined) {
        // Use installment-specific percentage
        feePercentage = selectedInstallment.admin_fee_percentage;
      } else if (selectedInstallment.admin_fee_amount !== undefined) {
        // Use installment-specific amount
        feeAmount = selectedInstallment.admin_fee_amount;
      } else {
        // Fall back to project default
        feePercentage =
          await administratorFeeService.getProjectAdminFeePercentage(projectId);
      }

      // Only create fee if there's a valid percentage or amount
      if (
        (feePercentage && feePercentage > 0) ||
        (feeAmount && feeAmount > 0)
      ) {
        // Calculate the actual fee amount
        const calculatedFeeAmount =
          feeAmount ||
          (selectedInstallment.amount * (feePercentage || 0)) / 100;

        // Create administrator fee record for this specific payment
        const adminFee = await administratorFeeService.createAdminFee(
          projectId,
          selectedInstallment.amount,
          "ARS",
          feePercentage,
          selectedInstallment.id
        );

        if (adminFee) {
          // Immediately collect the fee
          const feeCollected = await administratorFeeService.collectAdminFee(
            adminFee.id
          );

          if (feeCollected) {
            // Update installment to mark fee as collected
            await supabase
              .from("installments")
              .update({
                admin_fee_collected: true,
                admin_fee_percentage: feePercentage,
                admin_fee_amount: calculatedFeeAmount,
              })
              .eq("id", selectedInstallment.id);
          } else {
            console.error("Failed to collect administrator fee");
          }
        }
      }

      // Clear pending fee config
      setPendingFeeConfig(null);

      // 5. Reload data
      await loadInstallments();
      setShowPaymentModal(false);
      setSelectedInstallment(null);

      // Notify parent component
      if (onPaymentComplete) {
        onPaymentComplete();
      }

      // Show success modal instead of alert
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error confirming payment:", error);
      // Show error modal instead of alert
      setErrorMessage("Error al confirmar el pago. Por favor, intente nuevamente.");
      setShowErrorModal(true);
    }
  };

  const getInstallmentColumns = (): Column<Installment>[] => [
    {
      key: "installment_number",
      title: "Cuota",
      width: 120,
      render: (value: number) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center text-sm font-medium rounded-lg bg-gray-100 text-gray-700">
            {value === 0 ? "A" : value}
          </div>
          <span className="font-medium text-gray-900">
            {value === 0 ? "Anticipo" : `Cuota #${value}`}
          </span>
        </div>
      ),
    },
    {
      key: "due_date",
      title: "Vencimiento",
      width: 140,
      render: (value: string, record: Installment) => (
        <div>
          <div className="text-sm font-medium text-gray-900">
            {formatDate(value)}
          </div>
          {record.status === "paid" && record.paid_date && (
            <div className="text-xs text-gray-500">
              Pagado el {formatDate(record.paid_date)}
            </div>
          )}
        </div>
      ),
      sortable: true,
    },
    {
      key: "amount",
      title: "Monto",
      width: 140,
      align: "right" as const,
      render: (value: number) => (
        <span className="font-medium text-gray-900">
          {formatCurrency(value)}
        </span>
      ),
      sortable: true,
    },
    {
      key: "status",
      title: "Estado",
      width: 120,
      render: (value: string) => (
        <Badge variant={value === "paid" ? "success" : "default"} size="sm">
          {value === "paid" ? "Pagado" : "Pendiente"}
        </Badge>
      ),
    },
    {
      key: "actions",
      title: "Acciones",
      width: 140,
      align: "right" as const,
      render: (_, record: Installment) => {
        if (record.status === "paid") {
          return <span className="text-xs text-gray-500">Completado</span>;
        }

        return (
          <button
            onClick={() => handleConfirmPayment(record)}
            className="px-3 py-1.5 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-md transition-colors duration-200"
          >
            Confirmar Pago
          </button>
        );
      },
    },
  ];

  if (!isOpen) return null;

  const unpaidInstallments = installments.filter((i) => i.status !== "paid");
  const paidAmount = installments
    .filter((i) => i.status === "paid")
    .reduce((sum, i) => sum + (i.paid_amount || 0), 0);
  const pendingAmount = totalAmount - paidAmount;

  return (
    <>
      {/* Main Selection Modal */}
      <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 animate-in fade-in duration-300">
        <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg shadow-2xl animate-in zoom-in-95 duration-300">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-medium text-gray-900">
                  Confirmar Pagos
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {projectName} • {clientName}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-300"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Financial Summary */}
            <SectionCard
              title="Resumen Financiero"
              padding="md"
              background="gray"
              className="mt-6"
            >
              <div className="grid grid-cols-4 gap-6 mt-6">
                <div>
                  <div className="text-xs text-gray-500 uppercase font-medium">
                    Total
                  </div>
                  <div className="text-lg font-semibold text-gray-900 mt-1">
                    {currencyService.formatCurrency(totalAmount, currency)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase font-medium">
                    Cobrado
                  </div>
                  <div className="text-lg font-semibold text-gray-900 mt-1">
                    {currencyService.formatCurrency(paidAmount, currency)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase font-medium">
                    Pendiente
                  </div>
                  <div className="text-lg font-semibold text-gray-900 mt-1">
                    {currencyService.formatCurrency(pendingAmount, currency)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase font-medium">
                    Cuotas Pendientes
                  </div>
                  <div className="text-lg font-semibold text-gray-900 mt-1">
                    {unpaidInstallments.length} de {installments.length}
                  </div>
                </div>
              </div>
            </SectionCard>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            <SectionCard
              title="Cuotas del Proyecto"
              subtitle="Seleccione las cuotas que desea confirmar como pagadas"
              padding="none"
            >
              <DataTable<Installment>
                data={installments}
                columns={getInstallmentColumns()}
                rowKey="id"
                loading={loading}
                emptyText="No hay cuotas generadas para este proyecto"
                size="md"
                striped
                bordered={false}
              />
            </SectionCard>
          </div>
        </div>
      </div>

      {/* Payment Confirmation Modal */}
      {showPaymentModal && selectedInstallment && (
        <PaymentConfirmationModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedInstallment(null);
            setPendingFeeConfig(null);
          }}
          onConfirm={handlePaymentConfirmation}
          amount={selectedInstallment.amount}
          currency={currency}
          projectName={projectName}
          installmentNumber={selectedInstallment.installment_number}
          exchangeRate={currency === "USD" ? exchangeRate : 1}
        />
      )}

      {/* Admin Fee Configuration Modal */}
      {showFeeConfigModal && selectedInstallment && (
        <AdminFeeConfigModal
          isOpen={showFeeConfigModal}
          onClose={() => {
            setShowFeeConfigModal(false);
            setSelectedInstallment(null);
          }}
          onConfirm={handleFeeConfigConfirm}
          installmentAmount={selectedInstallment.amount}
          installmentNumber={selectedInstallment.installment_number}
          currency={currency}
          defaultPercentage={
            selectedInstallment.installment_number === 0 ? 20 : 15
          }
          isDownPayment={selectedInstallment.installment_number === 0}
        />
      )}

      {/* Success Modal */}
      <SuccessModal
        open={showSuccessModal}
        onOpenChange={setShowSuccessModal}
        title="¡Pago Confirmado!"
        message="El pago ha sido confirmado y distribuido exitosamente"
        variant="celebration"
        showConfetti={true}
        autoCloseDelay={5000}
        actions={{
          custom: {
            label: "Cerrar",
            onClick: () => setShowSuccessModal(false),
            variant: "primary",
          },
        }}
      />

      {/* Error Modal */}
      <SuccessModal
        open={showErrorModal}
        onOpenChange={setShowErrorModal}
        title="Error al Confirmar Pago"
        message={errorMessage}
        variant="minimal"
        actions={{
          custom: {
            label: "Intentar de Nuevo",
            onClick: () => setShowErrorModal(false),
            variant: "secondary",
          },
        }}
      />
    </>
  );
}
