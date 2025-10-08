import { useProjectWizard } from '../../hooks/useProjectWizard';

const STANDARD_TERMS = [
  {
    id: 'objeto_contrato',
    title: 'Primera: OBJETO DEL CONTRATO',
    content: 'El presente contrato se suscribe a los efectos de encomendar la tarea de dirección y construcción de la obra según las especificaciones técnicas y ubicación detalladas en el proyecto. La obra se ejecutará conforme a planos, memorias descriptivas y especificaciones técnicas aprobadas.',
  },
  {
    id: 'aporte_partes',
    title: 'Segunda: APORTE DE LAS PARTES',
    content: 'El Cliente aportará la suma total establecida en el proyecto, representando el 100% de la inversión para la construcción. Los pagos se realizarán según el cronograma acordado: un anticipo inicial y cuotas mensuales dentro de los primeros 10 días de cada mes.',
  },
  {
    id: 'diferencias_finalizacion',
    title: 'Tercera: DIFERENCIAS Y FINALIZACIÓN DE APORTES',
    content: 'En el caso de que el Cliente en el transcurso del contrato no cumpliera en tiempo y forma con los desembolsos dinerarios establecidos, la obra se amoldará a los ritmos de dichos desembolsos. La entrega final de obra será realizada una vez finalizados la totalidad de los aportes contractuales.',
  },
  {
    id: 'lugar_pago',
    title: 'Cuarta: LUGAR DE PAGO',
    content: 'Los desembolsos dinerarios deberán ser abonados durante los primeros 10 (diez) días de cada mes en las oficinas del Estudio o mediante transferencia bancaria a la cuenta designada. Se emitirá el comprobante correspondiente por cada pago recibido.',
  },
  {
    id: 'plazo_ejecucion',
    title: 'Quinta: PLAZO DE EJECUCIÓN',
    content: 'La tarea de proyecto, dirección y construcción de la obra se iniciará en la fecha establecida y se finalizará según el cronograma acordado. Los plazos podrán ser modificados por causas de fuerza mayor, condiciones climáticas adversas, o incumplimiento en los pagos del Cliente.',
  },
  {
    id: 'calidad_constructiva',
    title: 'Sexta: CALIDAD CONSTRUCTIVA',
    content: 'La obra se materializa de manera tradicional con materiales de primera calidad: estructura de hormigón armado según cálculo, mampostería de ladrillo hueco revocada, cubierta con estructura metálica y chapa galvanizada, instalaciones sanitarias y eléctricas completas, carpinterías de aluminio, aberturas de seguridad, pisos de porcelanato, y terminaciones de primera calidad en todos los rubros.',
  },
  {
    id: 'responsabilidad',
    title: 'Séptima: RESPONSABILIDAD',
    content: 'El Director de Obra será solidariamente responsable por las contingencias que pudieran surgir durante la ejecución de la obra y hasta su aprobación de final de obra. También será responsable por los vicios que pudieran surgir finalizada la obra por el plazo establecido por el Art. 1255 del Código Civil y Comercial de la Nación, sus acordes, concordantes y demás leyes complementarias.',
  },
  {
    id: 'domicilios_competencia',
    title: 'Octava: DOMICILIOS Y COMPETENCIA',
    content: 'Para todas las notificaciones derivadas del presente convenio, las partes constituyen los domicilios especiales denunciados en el contrato. En caso de litigio, las partes se someterán exclusivamente a la competencia de los tribunales ordinarios correspondientes, con expresa renuncia a cualesquiera otras que pudieran corresponderles.',
  },
  {
    id: 'sellado_ley',
    title: 'Novena: SELLADO DE LEY',
    content: 'El gasto de sellado del presente contrato será soportado según lo establecido por las partes de común acuerdo, conforme a la legislación vigente en materia de sellado de contratos.',
  },
  {
    id: 'normas',
    title: 'Décima: NORMAS',
    content: 'El presente contrato se regirá por las normas del Art. 1251 y siguientes del Código Civil y Comercial de la Nación, sus acordes, concordantes y leyes supletorias aplicables en materia de locación de obra y servicios profesionales.',
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
                <span className="text-xs text-tertiary">Moneda</span>
                <span className="text-sm text-gray-300">
                  {formData.currency === 'USD' ? 'Dólares (USD)' : 'Pesos (ARS)'}
                </span>
              </div>

              {formData.currency === 'USD' && formData.exchangeRate && (
                <div className="flex items-center justify-between py-2 border-b border-gray-800/30">
                  <span className="text-xs text-tertiary">Cotización</span>
                  <span className="text-sm text-gray-300">
                    1 USD = ${formData.exchangeRate.toLocaleString('es-AR')}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between py-2 border-b border-gray-800/30">
                <span className="text-xs text-tertiary">Valor Total</span>
                <span className="text-sm text-gray-600 font-medium">
                  {formData.currency === 'USD' ? 'USD ' : '$'}
                  {formData.totalAmount?.toLocaleString('es-AR') || '0'}
                </span>
              </div>

              {formData.currency === 'USD' && formData.totalAmount && formData.exchangeRate && (
                <div className="flex items-center justify-between py-2 border-b border-gray-800/30">
                  <span className="text-xs text-tertiary">Valor en Pesos</span>
                  <span className="text-sm text-gray-500">
                    ${(formData.totalAmount * formData.exchangeRate).toLocaleString('es-AR')}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between py-2 border-b border-gray-800/30">
                <span className="text-xs text-tertiary">Anticipo</span>
                <span className="text-sm text-gray-300 font-medium">
                  {formData.currency === 'USD' ? 'USD ' : '$'}
                  {formData.downPaymentAmount?.toLocaleString('es-AR') || '0'}
                  {formData.downPaymentPercentage && ` (${formData.downPaymentPercentage}%)`}
                </span>
              </div>

              {formData.adminFeeType !== 'none' && formData.adminFeeType && (
                <div className="flex items-center justify-between py-2 border-b border-gray-800/30">
                  <span className="text-xs text-tertiary">Comisión Adm.</span>
                  <span className="text-sm text-red-400">
                    {formData.adminFeeType === 'percentage' && formData.adminFeePercentage
                      ? `${formData.adminFeePercentage}% del anticipo`
                      : formData.adminFeeType === 'fixed' && formData.adminFeeAmount
                      ? `${formData.currency === 'USD' ? 'USD ' : '$'}${formData.adminFeeAmount.toLocaleString('es-AR')}`
                      : 'Manual'}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between py-2 border-b border-gray-800/30">
                <span className="text-xs text-tertiary">Plan de Pagos</span>
                <span className="text-sm text-gray-300">
                  {formData.installmentCount || 0} cuotas
                </span>
              </div>

              {formData.installmentAmount && (
                <div className="flex items-center justify-between py-2">
                  <span className="text-xs text-tertiary">Valor por Cuota</span>
                  <span className="text-sm text-gray-300 font-medium">
                    {formData.currency === 'USD' ? 'USD ' : '$'}
                    {formData.installmentAmount.toLocaleString('es-AR')}
                  </span>
                </div>
              )}
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