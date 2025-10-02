import type { ProjectWithDetails } from "@/modules/projects/services/ProjectService";
import type { Currency } from "@/services/CurrencyService";
import { currencyService } from "@/services/CurrencyService";
import { CheckCircle, Clock, XCircle } from "lucide-react";

interface ProjectOverviewTabProps {
  project: ProjectWithDetails;
}

export function ProjectOverviewTab({ project }: ProjectOverviewTabProps) {
  // Calculate project metrics
  const totalAmount = project.total_amount || 0;
  const paidAmount = project.paid_amount || 0;
  const pendingAmount = totalAmount - paidAmount;
  const progressPercentage = project.progress_percentage || 0;

  // Calculate days remaining
  const calculateDaysRemaining = () => {
    if (!project.estimated_end_date) return null;
    const today = new Date();
    const endDate = new Date(project.estimated_end_date);
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = calculateDaysRemaining();

  // Get project metadata
  const metadata = (project.metadata as any) || {};

  return (
    <div className="space-y-8">
      {/* Project Summary */}
      <div className="bg-white border border-gray-200 p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6">
          Resumen del Proyecto
        </h2>

        <div className="grid grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                Descripción
              </label>
              <p className="text-gray-900">
                {project.description || "Sin descripción disponible"}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                Tipo de Proyecto
              </label>
              <p className="text-gray-900">
                {project.project_type === "construction"
                  ? "Construcción"
                  : project.project_type === "renovation"
                  ? "Renovación"
                  : project.project_type === "design"
                  ? "Diseño"
                  : "Otro"}
              </p>
            </div>

            {metadata.propertyAddress && (
              <div>
                <label className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                  Dirección de la Propiedad
                </label>
                <p className="text-gray-900">{metadata.propertyAddress}</p>
                {metadata.city && (
                  <p className="text-sm text-gray-600">
                    {metadata.city}, {metadata.zipCode}
                  </p>
                )}
              </div>
            )}

            {metadata.propertyType && (
              <div>
                <label className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                  Tipo de Propiedad
                </label>
                <p className="text-gray-900 capitalize">
                  {metadata.propertyType}
                </p>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                  Fecha de Inicio
                </label>
                <p className="text-gray-900">
                  {project.start_date
                    ? new Date(project.start_date).toLocaleDateString()
                    : "No definida"}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                  Fecha Objetivo
                </label>
                <p className="text-gray-900">
                  {project.estimated_end_date
                    ? new Date(project.estimated_end_date).toLocaleDateString()
                    : "No definida"}
                </p>
              </div>
            </div>

            {daysRemaining !== null && (
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-gray-400" />
                  <p className="text-sm text-gray-900">
                    {daysRemaining < 0
                      ? `${Math.abs(daysRemaining)} días de retraso`
                      : `${daysRemaining} días restantes`}
                  </p>
                </div>
              </div>
            )}

            {metadata.paymentTerms && (
              <div>
                <label className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                  Términos de Pago
                </label>
                <p className="text-gray-900">{metadata.paymentTerms}</p>
              </div>
            )}

            {metadata.specialConditions && (
              <div>
                <label className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                  Condiciones Especiales
                </label>
                <p className="text-gray-900">{metadata.specialConditions}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="bg-white border border-gray-200 p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6">
          Resumen Financiero
        </h2>

        <div className="grid grid-cols-4 gap-8">
          <div>
            <label className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2 block">
              Monto Total
            </label>
            <p className="text-2xl font-light text-gray-900">
              {currencyService.formatCurrency(
                totalAmount,
                project.currency as Currency
              )}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2 block">
              Recibido
            </label>
            <p className="text-2xl font-light text-gray-900">
              {currencyService.formatCurrency(
                paidAmount,
                project.currency as Currency
              )}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {totalAmount > 0
                ? `${((paidAmount / totalAmount) * 100).toFixed(1)}%`
                : "0%"}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2 block">
              Pendiente
            </label>
            <p className="text-2xl font-light text-gray-900">
              {currencyService.formatCurrency(
                pendingAmount,
                project.currency as Currency
              )}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {totalAmount > 0
                ? `${((pendingAmount / totalAmount) * 100).toFixed(1)}%`
                : "0%"}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2 block">
              Progreso
            </label>
            <p className="text-2xl font-light text-gray-900 mb-2">
              {progressPercentage}%
            </p>
            <div className="w-full bg-gray-200 h-1">
              <div
                className="bg-gray-900 h-1 transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Payment Schedule */}
      {project.installments && project.installments.length > 0 && (
        <div className="bg-white border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">
            Plan de Pagos
          </h2>

          <div className="space-y-1">
            {project.installments.slice(0, 8).map((installment) => (
              <div
                key={installment.id}
                className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors duration-300"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2">
                    {installment.status === "paid" ? (
                      <CheckCircle className="h-4 w-4 text-gray-400" />
                    ) : installment.status === "overdue" ? (
                      <XCircle className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Clock className="h-4 w-4 text-gray-400" />
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {installment.installment_number === 0
                        ? "Anticipo"
                        : `Payment #${installment.installment_number}`}
                    </p>
                    <p className="text-xs text-gray-500">
                      Vencimiento:{" "}
                      {new Date(installment.due_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {currencyService.formatCurrency(
                      installment.amount,
                      project.currency as Currency
                    )}
                  </p>
                  <p className="text-xs text-gray-500">
                    {installment.status === "paid"
                      ? "Pagado"
                      : installment.status === "overdue"
                      ? "Vencido"
                      : "Pending"}
                  </p>
                </div>
              </div>
            ))}

            {project.installments.length > 8 && (
              <div className="text-center pt-4">
                <button className="text-sm text-gray-600 hover:text-gray-900 transition-colors duration-300">
                  Ver todos los pagos ({project.installments.length})
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notifications */}
      {(project.installments?.some((i) => i.status === "overdue") ||
        (daysRemaining !== null && daysRemaining < 30) ||
        progressPercentage >= 90) && (
        <div className="bg-white border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">
            Notificaciones
          </h2>

          <div className="space-y-3">
            {project.installments &&
              project.installments.some((i) => i.status === "overdue") && (
                <div className="flex items-start space-x-3 p-4 border-l-2 border-gray-200 bg-gray-50">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Pagos Vencidos
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {
                        project.installments.filter(
                          (i) => i.status === "overdue"
                        ).length
                      }{" "}
                      pago(s) están vencidos
                    </p>
                  </div>
                </div>
              )}

            {daysRemaining !== null &&
              daysRemaining < 30 &&
              daysRemaining >= 0 && (
                <div className="flex items-start space-x-3 p-4 border-l-2 border-gray-200 bg-gray-50">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Aproximación de Vencimiento
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      El proyecto vence en {daysRemaining} días
                    </p>
                  </div>
                </div>
              )}

            {progressPercentage >= 90 && (
              <div className="flex items-start space-x-3 p-4 border-l-2 border-gray-200 bg-gray-50">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Proyecto Casi Completo
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    El proyecto está {progressPercentage}% casi completado
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
