import { supabase } from "@/config/supabase";
import { PaymentConfirmationModal } from "@/modules/projects/components/PaymentConfirmationModal";
import type { PaymentConfirmation } from "@/modules/projects/types/project.types";
import { administratorFeeService } from "@/services/AdministratorFeeService";
import type { Currency } from "@/services/CurrencyService";
import { currencyService } from "@/services/CurrencyService";
import { newCashBoxService } from "@/services/cash/NewCashBoxService";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

interface Project {
  id: string;
  name: string;
  client_name: string;
  client_id: string | null;
  total_amount: number;
  down_payment_amount: number;
  installment_amount: number | null;
  installments_count: number;
  currency: string;
  status: string;
}

interface Installment {
  id: string;
  project_id: string;
  installment_number: number;
  amount: number;
  due_date: string;
  status: string;
  paid_amount: number | null;
  paid_date: string | null;
}

export function ConfirmPaymentPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInstallment, setSelectedInstallment] =
    useState<Installment | null>(null);
  const [organizationId, setOrganizationId] = useState<string>("");
  const [exchangeRate, setExchangeRate] = useState<number>(1);

  useEffect(() => {
    loadProjectData();
    getOrganizationId();
    loadExchangeRate();
  }, [projectId]);

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

  const loadProjectData = async () => {
    if (!projectId) return;

    try {
      setLoading(true);

      // Load project
      const { data: projectData, error: projectError } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .single();

      if (projectError) throw projectError;
      setProject(projectData);

      // Load installments
      const { data: installmentsData, error: installmentsError } =
        await supabase
          .from("installments")
          .select("*")
          .eq("project_id", projectId)
          .order("installment_number", { ascending: true });

      if (installmentsError) throw installmentsError;
      setInstallments(installmentsData || []);
    } catch (error) {
      console.error("Error loading project data:", error);
      alert("Error al cargar el proyecto");
      navigate("/projects");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = (installment: Installment) => {
    setSelectedInstallment(installment);
    setShowPaymentModal(true);
  };

  const handlePaymentConfirmation = async (
    confirmation: PaymentConfirmation
  ) => {
    if (!selectedInstallment || !project) return;

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

      // 2. Process payment to cash boxes (distribute to master and project cash)
      await newCashBoxService.processProjectPayment({
        organizationId: organizationId, // Not used anymore but kept for compatibility
        projectId: project.id,
        amount: selectedInstallment.amount,
        description: `Pago cuota #${selectedInstallment.installment_number} - ${project.name}`,
        installmentId: selectedInstallment.id,
      });

      // 3. Create and collect administrative fee for this payment
      const adminFeePercentage =
        await administratorFeeService.getProjectAdminFeePercentage(project.id);
      
      if (adminFeePercentage > 0) {
        // Create administrator fee record for this specific payment
        const adminFee = await administratorFeeService.createAdminFee(
          project.id,
          selectedInstallment.amount, // Base fee on this payment amount, not total project
          'ARS',
          adminFeePercentage,
          selectedInstallment.id // Link fee to specific installment
        );
        
        if (adminFee) {
          // Immediately collect the fee
          const feeCollected = await administratorFeeService.collectAdminFee(adminFee.id);
          
          if (!feeCollected) {
            console.error('Failed to collect administrator fee');
            // Continue without failing the entire payment
          }
        }
      }

      // 5. Reload data
      await loadProjectData();

      alert("Pago confirmado y distribuido exitosamente");
    } catch (error) {
      console.error("Error confirming payment:", error);
      alert("Error al confirmar el pago");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-200"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p>Proyecto no encontrado</p>
      </div>
    );
  }

  const unpaidInstallments = installments.filter((i) => i.status !== "paid");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="bg-white rounded-lg  border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Confirmar Pagos
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Proyecto: <span className="font-medium">{project.name}</span>
            </p>
            <p className="text-sm text-gray-600">
              Cliente:{" "}
              <span className="font-medium">{project.client_name}</span>
            </p>
          </div>
          <button
            onClick={() => navigate("/projects")}
            className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Volver a Proyectos
          </button>
        </div>

        {/* Financial Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600">Total del Proyecto</div>
            <div className="text-lg font-bold text-gray-900">
              {currencyService.formatCurrency(
                project.total_amount,
                project.currency as Currency
              )}
            </div>
          </div>
          <div className="bg-gray-100 rounded-lg p-4">
            <div className="text-sm text-gray-600">Total Cobrado</div>
            <div className="text-lg font-bold text-gray-600">
              {currencyService.formatCurrency(
                installments
                  .filter((i) => i.status === "paid")
                  .reduce((sum, i) => sum + (i.paid_amount || 0), 0),
                project.currency as Currency
              )}
            </div>
          </div>
          <div className="bg-gray-100 rounded-lg p-4">
            <div className="text-sm text-gray-600">Pendiente</div>
            <div className="text-lg font-bold text-gray-600">
              {currencyService.formatCurrency(
                project.total_amount -
                  installments
                    .filter((i) => i.status === "paid")
                    .reduce((sum, i) => sum + (i.paid_amount || 0), 0),
                project.currency as Currency
              )}
            </div>
          </div>
          <div className="bg-gray-900 rounded-lg p-4">
            <div className="text-sm text-white">Cuotas Pendientes</div>
            <div className="text-lg font-bold text-white">
              {unpaidInstallments.length} de {installments.length}
            </div>
          </div>
        </div>
      </div>

      {/* Installments List */}
      <div className="bg-white rounded-lg  border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Cuotas del Proyecto
          </h2>
        </div>

        {installments.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">
            No hay cuotas generadas para este proyecto
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {installments.map((installment) => (
              <div key={installment.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                            installment.status === "paid"
                              ? "bg-gray-100 text-gray-600"
                              : installment.installment_number === 0
                              ? "bg-gray-900 text-gray-600"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {installment.installment_number === 0
                            ? "A"
                            : installment.installment_number}
                        </div>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {installment.installment_number === 0
                            ? "Anticipo Inicial"
                            : `Cuota #${installment.installment_number}`}
                        </div>
                        <div className="text-sm text-gray-500">
                          Vencimiento:{" "}
                          {new Date(installment.due_date).toLocaleDateString(
                            "es-AR"
                          )}
                          {installment.status === "paid" &&
                            installment.paid_date && (
                              <span className="ml-2 text-gray-600">
                                • Pagado el{" "}
                                {new Date(
                                  installment.paid_date
                                ).toLocaleDateString("es-AR")}
                              </span>
                            )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-medium text-gray-900">
                        {currencyService.formatCurrency(
                          installment.amount,
                          project.currency as Currency
                        )}
                      </div>
                      {installment.status === "paid" ? (
                        <div className="text-xs text-gray-500">Pagado</div>
                      ) : (
                        <div className="text-xs text-gray-500">Pendiente</div>
                      )}
                    </div>

                    {installment.status !== "paid" && (
                      <button
                        onClick={() => handleConfirmPayment(installment)}
                        className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-900"
                      >
                        Confirmar Pago
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment Confirmation Modal */}
      {showPaymentModal && selectedInstallment && (
        <PaymentConfirmationModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedInstallment(null);
          }}
          onConfirm={handlePaymentConfirmation}
          amount={selectedInstallment.amount}
          currency={project.currency as Currency}
          projectName={project.name}
          projectId={project.id}
          organizationId={organizationId}
          clientId={project.client_id || undefined}
          installmentNumber={selectedInstallment.installment_number}
          exchangeRate={project.currency === "USD" ? exchangeRate : 1}
        />
      )}
    </div>
  );
}
