import type { Currency } from "@/services/CurrencyService";
import { currencyService } from "@/services/CurrencyService";
import { useProjectWizard } from "../../hooks/useProjectWizard";

export function EnterpriseReviewConfirmStep() {
  const { formData, updateFormData } = useProjectWizard();

  const formatCurrency = (amount: number | undefined) => {
    if (!amount)
      return currencyService.formatCurrency(
        0,
        (formData.currency as Currency) || "ARS"
      );
    return currencyService.formatCurrency(
      amount,
      (formData.currency as Currency) || "ARS"
    );
  };

  const getProjectTypeLabel = (type: string | undefined) => {
    const typeMap = {
      construction: "Construction",
      renovation: "Renovation",
      design: "Design & Planning",
      other: "Other",
    };
    return typeMap[type as keyof typeof typeMap] || "Not specified";
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "Not specified";
    return new Date(dateString).toLocaleDateString();
  };

  const financedAmount =
    (formData.totalAmount || formData.estimatedValue || 0) -
    (formData.downPaymentAmount || 0);
  const installmentAmount =
    financedAmount > 0 && formData.installmentCount
      ? financedAmount / formData.installmentCount
      : 0;

  return (
    <div className="space-y-8">
      <div className="border-b border-gray-100 pb-6">
        <h2 className="text-xl text-gray-900 mb-2">Revisión y Confirmación </h2>
        <p className="text-sm text-gray-600">
          Por favor, revise todos los detalles del proyecto antes de crearlo
        </p>
      </div>

      <div className="space-y-8">
        {/* Project Information Summary */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="bg-gray-50 border-l-4 border-gray-200 p-4 rounded-tl-lg rounded-tr-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-1">
              Información del Proyecto
            </h3>
            <p className="text-xs text-gray-600">
              Información básica del proyecto
            </p>
          </div>

          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <div className="text-xs text-gray-500 mb-1">
                  Nombre del Proyecto
                </div>
                <div className="text-sm text-gray-900">
                  {formData.projectName || "Not specified"}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">
                  Tipo de Proyecto
                </div>
                <div className="text-sm text-gray-900">
                  {getProjectTypeLabel(formData.projectType)}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">
                  Monto Total del Proyecto
                </div>
                <div className="text-sm text-gray-900">
                  {formatCurrency(formData.totalAmount)}
                </div>
              </div>
            </div>

            {formData.description && (
              <div>
                <div className="text-xs text-gray-500 mb-1">Descripción</div>
                <div className="text-sm text-gray-900">
                  {formData.description}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Client Information Summary */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="bg-gray-50 border-l-4 border-gray-200 p-4 rounded-tl-lg rounded-tr-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-1">
              Información del Cliente
            </h3>
            <p className="text-xs text-gray-600">
              Información del cliente y la propiedad
            </p>
          </div>

          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <div className="text-xs text-gray-500 mb-1">
                  Nombre del Cliente
                </div>
                <div className="text-sm text-gray-900">
                  {formData.clientName || "Not specified"}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Email</div>
                <div className="text-sm text-gray-900">
                  {formData.clientEmail || "Not specified"}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Teléfono</div>
                <div className="text-sm text-gray-900">
                  {formData.clientPhone || "Not specified"}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">CUIT</div>
                <div className="text-sm text-gray-900">
                  {formData.clientTaxId || "Not provided"}
                </div>
              </div>
            </div>

            {formData.propertyAddress && (
              <div>
                <div className="text-xs text-gray-500 mb-1">
                  Dirección de la Propiedad
                </div>
                <div className="text-sm text-gray-900">
                  {formData.propertyAddress}
                </div>
              </div>
            )}

            {formData.additionalContacts &&
              formData.additionalContacts.length > 0 && (
                <div>
                  <div className="text-xs text-gray-500 mb-2">
                    Contactos Adicionales
                  </div>
                  <div className="space-y-2">
                    {formData.additionalContacts.map((contact, index) => (
                      <div key={index} className="bg-gray-50 rounded-md p-3">
                        <div className="text-sm text-gray-900 font-medium">
                          {contact.name}
                        </div>
                        <div className="text-xs text-gray-600">
                          {contact.role}
                        </div>
                        {contact.email && (
                          <div className="text-xs text-gray-600">
                            {contact.email}
                          </div>
                        )}
                        {contact.phone && (
                          <div className="text-xs text-gray-600">
                            {contact.phone}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </div>

        {/* Currency and Payment Confirmation */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="bg-gray-50 border-l-4 border-purple-500 p-4 rounded-tl-lg rounded-tr-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-1">
              Moneda y Confirmación de Pago
            </h3>
            <p className="text-xs text-gray-600">
              Moneda del proyecto y estado del anticipo
            </p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4">
              <div>
                <div className="text-xs text-gray-500 mb-1">
                  Moneda del Proyecto.
                </div>
                <div className="text-sm text-gray-900">
                  {currencyService.getCurrencyName(
                    (formData.currency as Currency) || "ARS"
                  )}
                  ({(formData.currency as Currency) || "ARS"})
                </div>
              </div>
              {formData.currency === "USD" && formData.exchangeRate && (
                <div>
                  <div className="text-xs text-gray-500 mb-1">Cotización.</div>
                  <div className="text-sm text-gray-900">
                    {currencyService.getExchangeRateText(
                      formData.exchangeRate,
                      "USD",
                      "ARS"
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Payment Confirmation Status */}
            {formData.downPaymentAmount && formData.downPaymentAmount > 0 && (
              <div className="border-t border-gray-100 pt-4">
                <div className="text-xs text-gray-500 mb-2">
                  Estado del Anticipo.
                </div>
                {formData.paymentConfirmation?.confirmed ? (
                  <div className="flex items-center space-x-3 p-3 bg-gray-100 border border-gray-200 rounded-lg">
                    <div className="flex-shrink-0">
                      <svg
                        className="w-5 h-5 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-600">
                        Anticipo Confirmado.
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {formatCurrency(formData.downPaymentAmount)} recibido
                        vía{" "}
                        {formData.paymentConfirmation.paymentMethod ===
                        "bank_transfer"
                          ? "Transferencia Bancaria"
                          : formData.paymentConfirmation.paymentMethod ===
                            "cash"
                          ? "Efectivo"
                          : formData.paymentConfirmation.paymentMethod ===
                            "check"
                          ? "Cheque"
                          : formData.paymentConfirmation.paymentMethod ===
                            "credit_card"
                          ? "Tarjeta de Crédito"
                          : formData.paymentConfirmation.paymentMethod ===
                            "debit_card"
                          ? "Tarjeta de Débito"
                          : formData.paymentConfirmation.paymentMethod ===
                            "crypto"
                          ? "Criptomoneda"
                          : "Otro método"}
                        {formData.paymentConfirmation.referenceNumber &&
                          ` (Ref: ${formData.paymentConfirmation.referenceNumber})`}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3 p-3 bg-gray-100 border border-gray-200 rounded-lg">
                    <div className="flex-shrink-0">
                      <svg
                        className="w-5 h-5 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-600">
                        Anticipo Pendiente.
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        Debe confirmar la recepción del anticipo de{" "}
                        {formatCurrency(formData.downPaymentAmount)} antes de
                        crear el proyecto
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Administrator Fee Information */}
            {formData.adminFeeType !== "none" && (
              <div className="border-t border-gray-100 pt-4 mt-4">
                <div className="text-xs text-gray-500 mb-2">
                  Honorarios Administrativos
                </div>
                <div className="text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span>
                      {formData.adminFeeType === "percentage" &&
                      formData.adminFeePercentage
                        ? `${formData.adminFeePercentage}% del valor del proyecto:`
                        : formData.adminFeeType === "fixed"
                        ? "Monto fijo:"
                        : "Honorario calculado:"}
                    </span>
                    <span className="font-medium">
                      {(() => {
                        const totalAmount = formData.totalAmount || 0;
                        if (
                          formData.adminFeeType === "fixed" &&
                          formData.adminFeeAmount
                        ) {
                          return formatCurrency(formData.adminFeeAmount);
                        } else if (
                          formData.adminFeeType === "percentage" &&
                          formData.adminFeePercentage
                        ) {
                          return formatCurrency(
                            totalAmount * (formData.adminFeePercentage / 100)
                          );
                        }
                        return formatCurrency(0);
                      })()}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {formData.adminFeeType === "percentage"
                      ? "Se calculará como porcentaje del valor total"
                      : "Monto fijo configurado para este proyecto"}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Financial Configuration Summary */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="bg-gray-50 border-l-4 border-orange-500 p-4 rounded-tl-lg rounded-tr-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-1">
              Configuración Financiera
            </h3>
            <p className="text-xs text-gray-600">
              Estructura de pagos y términos
            </p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div>
                <div className="text-xs text-gray-500 mb-1">Anticipo</div>
                <div className="text-sm text-gray-900">
                  {formatCurrency(formData.downPaymentAmount)}
                </div>
                {formData.downPaymentPercentage && (
                  <div className="text-xs text-gray-500">
                    ({formData.downPaymentPercentage.toFixed(1)}%)
                  </div>
                )}
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">
                  Número de Cuotas
                </div>
                <div className="text-sm text-gray-900">
                  {formData.installmentCount || "No especificado"}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">
                  Frecuencia de Pago
                </div>
                <div className="text-sm text-gray-900">
                  {formData.paymentFrequency === "monthly"
                    ? "Mensual"
                    : formData.paymentFrequency === "quarterly"
                    ? "Trimestral"
                    : formData.paymentFrequency === "biweekly"
                    ? "Quincenal"
                    : formData.paymentFrequency === "weekly"
                    ? "Semanal"
                    : "Mensual"}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Monto de Cuota</div>
                <div className="text-sm text-gray-900">
                  {formatCurrency(installmentAmount)}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">
                  Monto Financiado
                </div>
                <div className="text-sm text-gray-900">
                  {formatCurrency(financedAmount)}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">
                  Recargo por Mora
                </div>
                <div className="text-sm text-gray-900">
                  {formData.lateFeeType === "fixed"
                    ? formatCurrency(formData.lateFeeAmount || 0)
                    : `${formData.lateFeePercentage || 0}%`}
                </div>
              </div>
            </div>

            {(formData.downPaymentDate ||
              formData.firstPaymentDate ||
              formData.gracePeriodDays) && (
              <div className="border-t border-gray-100 pt-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {formData.downPaymentDate && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1">
                        Down Payment Due
                      </div>
                      <div className="text-sm text-gray-900">
                        {formatDate(formData.downPaymentDate)}
                      </div>
                    </div>
                  )}
                  {formData.firstPaymentDate && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1">
                        First Installment Due
                      </div>
                      <div className="text-sm text-gray-900">
                        {formatDate(formData.firstPaymentDate)}
                      </div>
                    </div>
                  )}
                  {formData.gracePeriodDays !== undefined && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1">
                        Grace Period
                      </div>
                      <div className="text-sm text-gray-900">
                        {formData.gracePeriodDays} days
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Project Timeline Summary */}
        {(formData.startDate ||
          formData.estimatedEndDate ||
          (formData.projectPhases && formData.projectPhases.length > 0)) && (
          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="bg-gray-50 border-l-4 border-purple-500 p-4 rounded-tl-lg rounded-tr-lg">
              <h3 className="text-sm font-medium text-gray-900 mb-1">
                Project Timeline
              </h3>
              <p className="text-xs text-gray-600">
                Schedule and project phases
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {formData.startDate && (
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Start Date</div>
                    <div className="text-sm text-gray-900">
                      {formatDate(formData.startDate)}
                    </div>
                  </div>
                )}
                {formData.estimatedEndDate && (
                  <div>
                    <div className="text-xs text-gray-500 mb-1">
                      Estimated Completion
                    </div>
                    <div className="text-sm text-gray-900">
                      {formatDate(formData.estimatedEndDate)}
                    </div>
                  </div>
                )}
              </div>

              {formData.projectPhases && formData.projectPhases.length > 0 && (
                <div>
                  <div className="text-xs text-gray-500 mb-2">
                    Project Phases
                  </div>
                  <div className="space-y-2">
                    {formData.projectPhases.map((phase, index) => (
                      <div key={index} className="bg-gray-50 rounded-md p-3">
                        <div className="text-sm text-gray-900 font-medium">
                          {phase.name}
                        </div>
                        <div className="text-xs text-gray-600">
                          Duration: {phase.duration}
                        </div>
                        {(phase.startDate || phase.endDate) && (
                          <div className="text-xs text-gray-600">
                            {phase.startDate &&
                              `Start: ${formatDate(phase.startDate)}`}
                            {phase.startDate && phase.endDate && " • "}
                            {phase.endDate &&
                              `End: ${formatDate(phase.endDate)}`}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Terms and Conditions Summary */}
        {(formData.paymentTerms ||
          formData.specialConditions ||
          formData.contractNotes) && (
          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="bg-gray-50 border-l-4 border-gray-200 p-4 rounded-tl-lg rounded-tr-lg">
              <h3 className="text-sm font-medium text-gray-900 mb-1">
                Terms & Conditions
              </h3>
              <p className="text-xs text-gray-600">
                Contract terms and special conditions
              </p>
            </div>

            <div className="p-6 space-y-4">
              {formData.paymentTerms && (
                <div>
                  <div className="text-xs text-gray-500 mb-1">
                    Payment Terms
                  </div>
                  <div className="text-sm text-gray-900 whitespace-pre-wrap">
                    {formData.paymentTerms}
                  </div>
                </div>
              )}

              {formData.specialConditions && (
                <div>
                  <div className="text-xs text-gray-500 mb-1">
                    Special Conditions
                  </div>
                  <div className="text-sm text-gray-900 whitespace-pre-wrap">
                    {formData.specialConditions}
                  </div>
                </div>
              )}

              {formData.contractNotes && (
                <div>
                  <div className="text-xs text-gray-500 mb-1">
                    Additional Financial Terms
                  </div>
                  <div className="text-sm text-gray-900 whitespace-pre-wrap">
                    {formData.contractNotes}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Confirmation Checkboxes */}
        <div className="bg-gray-100 border border-gray-200 rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-4">
            Confirmación Requerida
          </h3>

          <div className="space-y-4">
            <label className="flex items-start space-x-3">
              <input
                type="checkbox"
                checked={formData.dataAccuracyConfirmed || false}
                onChange={(e) =>
                  updateFormData({ dataAccuracyConfirmed: e.target.checked })
                }
                className="mt-0.5 h-4 w-4 text-gray-600 border-gray-300 rounded focus:ring-gray-300"
              />
              <div className="text-sm">
                <div className="text-gray-900 font-medium"></div>
                <div className="text-gray-900 font-medium">
                  Confirmo que todas las informaciones del proyecto, detalles
                  del cliente y términos financieros ingresados arriba son
                  precisos y completos a la mejor de mi conocimiento.
                </div>
              </div>
            </label>

            <label className="flex items-start space-x-3">
              <input
                type="checkbox"
                checked={formData.authorityConfirmed || false}
                onChange={(e) =>
                  updateFormData({ authorityConfirmed: e.target.checked })
                }
                className="mt-0.5 h-4 w-4 text-gray-600 border-gray-300 rounded focus:ring-gray-300"
              />
              <div className="text-sm">
                <div className="text-gray-900 font-medium">
                  Confirmación de Autoridad
                </div>
                <div className="text-gray-700 text-xs mt-1">
                  Confirmo que tengo la autoridad para crear este proyecto. Una
                  vez creado, este proyecto generará un contrato formal y una
                  programación de pagos. El cliente será notificado y el
                  seguimiento de pagos comenzará automáticamente.
                </div>
              </div>
            </label>

            <label className="flex items-start space-x-3">
              <input
                type="checkbox"
                checked={formData.termsAccepted || false}
                onChange={(e) =>
                  updateFormData({ termsAccepted: e.target.checked })
                }
                className="mt-0.5 h-4 w-4 text-gray-600 border-gray-300 rounded focus:ring-gray-300"
              />
              <div className="text-sm">
                <div className="text-gray-900 font-medium">
                  Aceptación de Términos y Condiciones
                </div>
                <div className="text-gray-700 text-xs mt-1">
                  Acepto los términos y condiciones descritos anteriormente y
                  autorizo la creación de este proyecto con la estructura de
                  pago especificada y los términos contractuales.
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Final Notice */}
        <div className="bg-gray-100 border border-gray-200 rounded-lg p-4">
          <div className="text-sm">
            <div className="text-gray-600 font-medium mb-2">
              Important Notice
            </div>
            <div className="text-gray-600 text-xs space-y-1">
              <p>
                Once created, this project will generate a formal contract and
                payment schedule. The client will be notified and payment
                tracking will begin automatically.
              </p>
              <p>
                You can modify project details after creation, but changes to
                financial terms may require client agreement and contract
                amendments.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
