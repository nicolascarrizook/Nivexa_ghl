import { useProjectWizard } from '../../hooks/useProjectWizard';

const STANDARD_TERMS = [
  {
    id: 'payment_obligation',
    title: 'Obligación de Pago',
    content: 'El cliente se compromete a realizar todos los pagos según el cronograma establecido. Los pagos deben realizarse en las fechas acordadas sin excepción.',
  },
  {
    id: 'late_fees',
    title: 'Cargos por Mora',
    content: 'En caso de retraso en los pagos, se aplicarán los cargos por mora especificados. Estos cargos comenzarán a aplicarse después del período de gracia establecido.',
  },
  {
    id: 'project_changes',
    title: 'Cambios al Proyecto',
    content: 'Cualquier cambio al alcance del proyecto debe ser acordado por escrito y puede resultar en ajustes al precio y cronograma.',
  },
  {
    id: 'cancellation',
    title: 'Política de Cancelación',
    content: 'En caso de cancelación del proyecto, el anticipo no será reembolsable y se cobrarán los trabajos realizados hasta la fecha.',
  },
  {
    id: 'warranty',
    title: 'Garantía',
    content: 'Se ofrece garantía de 1 año en mano de obra y según especificaciones del fabricante para materiales.',
  },
];

export function TermsConditionsStep() {
  const { formData, updateFormData } = useProjectWizard();

  return (
    <div className="space-y-8">
      {/* Step Header */}
      <div>
        <h2 className="text-xl font-light text-primary mb-2">Términos y Condiciones</h2>
        <p className="text-sm text-tertiary">
          Revisa y acepta los términos contractuales del proyecto
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Column: Standard Terms */}
        <div className="xl:col-span-2 space-y-6">
          {/* Standard Terms Section */}
          <div className="card-flat p-6">
            <h3 className="text-base font-normal text-secondary mb-4">
              Términos Estándar del Contrato
            </h3>
            
            <div className="space-y-4">
              {STANDARD_TERMS.map((term) => (
                <div 
                  key={term.id}
                  className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/30"
                >
                  <h4 className="text-sm font-normal text-gray-300 mb-2">
                    {term.title}
                  </h4>
                  <p className="text-xs text-tertiary leading-relaxed">
                    {term.content}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Special Conditions */}
          <div className="card-flat p-6">
            <h3 className="text-base font-normal text-secondary mb-4">
              Condiciones Especiales
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-normal text-secondary mb-2">
                  Condiciones Adicionales
                </label>
                <textarea
                  value={formData.specialConditions || ''}
                  onChange={(e) => updateFormData({ specialConditions: e.target.value })}
                  className="textarea-field w-full"
                  placeholder="Agrega cualquier condición especial o acuerdo específico para este proyecto..."
                  rows={4}
                />
                <p className="text-xs text-tertiary mt-2">
                  Opcional: Incluye acuerdos especiales, excepciones o condiciones particulares
                </p>
              </div>

              <div>
                <label className="block text-sm font-normal text-secondary mb-2">
                  Notas Internas
                </label>
                <textarea
                  value={formData.contractNotes || ''}
                  onChange={(e) => updateFormData({ contractNotes: e.target.value })}
                  className="textarea-field w-full"
                  placeholder="Notas privadas sobre el contrato (no se mostrarán al cliente)..."
                  rows={3}
                />
                <p className="text-xs text-tertiary mt-2">
                  Estas notas son solo para tu referencia interna
                </p>
              </div>
            </div>
          </div>

          {/* Legal Compliance */}
          <div className="card-flat p-6">
            <h3 className="text-base font-normal text-secondary mb-4">
              Cumplimiento Legal
            </h3>
            
            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={formData.termsAccepted || false}
                  onChange={(e) => updateFormData({ termsAccepted: e.target.checked })}
                  className="mt-1 w-4 h-4 text-gray-600 bg-gray-800 border-gray-700 rounded focus:ring-red-500 focus:ring-2"
                />
                <div>
                  <p className="text-sm text-gray-300 group-hover:text-gray-200 transition-colors">
                    Confirmo que he revisado todos los términos y condiciones con el cliente
                  </p>
                  <p className="text-xs text-tertiary mt-1">
                    El cliente ha leído y aceptado estos términos
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Summary & Actions */}
        <div className="space-y-6">
          {/* Contract Summary */}
          <div className="card-flat p-6">
            <h3 className="text-base font-normal text-secondary mb-4">
              Resumen del Contrato
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-gray-800/30">
                <span className="text-xs text-tertiary">Proyecto</span>
                <span className="text-sm text-gray-300">
                  {formData.projectName || 'Sin nombre'}
                </span>
              </div>
              
              <div className="flex items-center justify-between py-2 border-b border-gray-800/30">
                <span className="text-xs text-tertiary">Cliente</span>
                <span className="text-sm text-gray-300">
                  {formData.clientName || 'Sin especificar'}
                </span>
              </div>
              
              <div className="flex items-center justify-between py-2 border-b border-gray-800/30">
                <span className="text-xs text-tertiary">Valor Total</span>
                <span className="text-sm text-gray-600">
                  ${formData.totalAmount?.toLocaleString('es-AR') || '0'}
                </span>
              </div>
              
              <div className="flex items-center justify-between py-2">
                <span className="text-xs text-tertiary">Plan de Pagos</span>
                <span className="text-sm text-gray-300">
                  {formData.installmentCount || 0} cuotas
                </span>
              </div>
            </div>
          </div>

          {/* Document Templates */}
          <div className="card-flat p-6">
            <h3 className="text-base font-normal text-secondary mb-4">
              Plantillas de Documentos
            </h3>
            
            <div className="space-y-3">
              <button
                type="button"
                className="w-full btn-ghost text-sm flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Contrato Estándar
                </span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </button>
              
              <button
                type="button"
                className="w-full btn-ghost text-sm flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Anexo de Pagos
                </span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </button>
              
              <button
                type="button"
                className="w-full btn-ghost text-sm flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                          d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Generar Contrato PDF
                </span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                        d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            
            <p className="text-xs text-tertiary mt-4">
              Los documentos se generarán con la información ingresada
            </p>
          </div>

          {/* Important Notice */}
          <div className="p-4 bg-gray-100/10 border border-gray-200/30 rounded-lg">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <h4 className="text-sm font-normal text-gray-600 mb-1">
                  Importante
                </h4>
                <p className="text-xs text-gray-600/70">
                  Asegúrate de revisar todos los términos con un asesor legal antes de presentarlos al cliente.
                  Este sistema genera documentos de referencia que deben ser validados según la legislación local.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}