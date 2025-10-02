import { useProjectWizard } from '../../hooks/useProjectWizard';
import { formatCurrency, formatDate, formatPhone } from '@/utils/formatters';

export function ReviewConfirmStep() {
  const { formData } = useProjectWizard();

  const getProjectTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      construction: 'Construcción Nueva',
      renovation: 'Remodelación',
      design: 'Diseño',
      other: 'Otro',
    };
    return types[type] || type;
  };

  const getPropertyTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      residential: 'Residencial',
      commercial: 'Comercial',
      industrial: 'Industrial',
    };
    return types[type] || type;
  };

  const getPaymentFrequencyLabel = (frequency: string) => {
    const frequencies: Record<string, string> = {
      monthly: 'Mensual',
      biweekly: 'Quincenal',
      weekly: 'Semanal',
      quarterly: 'Trimestral',
    };
    return frequencies[frequency] || frequency;
  };

  return (
    <div className="space-y-8">
      {/* Step Header */}
      <div>
        <h2 className="text-xl font-light text-primary mb-2">Revisión y Confirmación</h2>
        <p className="text-sm text-tertiary">
          Verifica que toda la información sea correcta antes de crear el proyecto
        </p>
      </div>

      {/* Success Preview Banner */}
      <div className="p-6 bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-gray-200/30 rounded-lg">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gray-100/20 rounded-full">
            <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-normal text-gray-600 mb-1">
              ¡Todo listo para crear el proyecto!
            </h3>
            <p className="text-sm text-gray-300">
              Revisa el resumen a continuación y confirma para crear el proyecto "{formData.projectName}"
            </p>
          </div>
        </div>
      </div>

      {/* Review Sections */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="card-flat p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-normal text-secondary">Información Básica</h3>
            <button
              type="button"
              className="text-xs text-gray-600 hover:text-gray-600 transition-colors"
            >
              Editar
            </button>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <span className="text-xs text-tertiary">Nombre del Proyecto</span>
              <span className="text-sm text-gray-300 text-right max-w-[60%]">
                {formData.projectName || 'Sin especificar'}
              </span>
            </div>
            <div className="flex items-start justify-between">
              <span className="text-xs text-tertiary">Tipo de Proyecto</span>
              <span className="text-sm text-gray-300">
                {formData.projectType ? getProjectTypeLabel(formData.projectType) : 'Sin especificar'}
              </span>
            </div>
            <div className="flex items-start justify-between">
              <span className="text-xs text-tertiary">Valor Estimado</span>
              <span className="text-sm text-gray-600 font-light">
                {formatCurrency(formData.estimatedValue || 0)}
              </span>
            </div>
            {formData.description && (
              <div className="pt-2 border-t border-gray-800/30">
                <p className="text-xs text-tertiary mb-1">Descripción</p>
                <p className="text-xs text-gray-400 italic">
                  {formData.description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Client Information */}
        <div className="card-flat p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-normal text-secondary">Información del Cliente</h3>
            <button
              type="button"
              className="text-xs text-gray-600 hover:text-gray-600 transition-colors"
            >
              Editar
            </button>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <span className="text-xs text-tertiary">Nombre</span>
              <span className="text-sm text-gray-300 text-right max-w-[60%]">
                {formData.clientName || 'Sin especificar'}
              </span>
            </div>
            <div className="flex items-start justify-between">
              <span className="text-xs text-tertiary">Email</span>
              <span className="text-sm text-gray-300 text-right max-w-[60%] break-all">
                {formData.clientEmail || 'Sin especificar'}
              </span>
            </div>
            <div className="flex items-start justify-between">
              <span className="text-xs text-tertiary">Teléfono</span>
              <span className="text-sm text-gray-300">
                {formData.clientPhone || 'Sin especificar'}
              </span>
            </div>
            {formData.additionalContacts && formData.additionalContacts.length > 0 && (
              <div className="pt-2 border-t border-gray-800/30">
                <p className="text-xs text-tertiary mb-1">
                  Contactos Adicionales: {formData.additionalContacts.length}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Property Information */}
        <div className="card-flat p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-normal text-secondary">Información de la Propiedad</h3>
            <button
              type="button"
              className="text-xs text-gray-600 hover:text-gray-600 transition-colors"
            >
              Editar
            </button>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <span className="text-xs text-tertiary">Dirección</span>
              <span className="text-sm text-gray-300 text-right max-w-[60%]">
                {formData.propertyAddress || 'Sin especificar'}
              </span>
            </div>
            <div className="flex items-start justify-between">
              <span className="text-xs text-tertiary">Ciudad</span>
              <span className="text-sm text-gray-300">
                {formData.city || 'Sin especificar'}
              </span>
            </div>
            <div className="flex items-start justify-between">
              <span className="text-xs text-tertiary">Código Postal</span>
              <span className="text-sm text-gray-300">
                {formData.zipCode || 'Sin especificar'}
              </span>
            </div>
            <div className="flex items-start justify-between">
              <span className="text-xs text-tertiary">Tipo de Propiedad</span>
              <span className="text-sm text-gray-300">
                {formData.propertyType ? getPropertyTypeLabel(formData.propertyType) : 'Sin especificar'}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Configuration */}
        <div className="card-flat p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-normal text-secondary">Configuración de Pagos</h3>
            <button
              type="button"
              className="text-xs text-gray-600 hover:text-gray-600 transition-colors"
            >
              Editar
            </button>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <span className="text-xs text-tertiary">Valor Total</span>
              <span className="text-sm text-gray-600 font-light">
                {formatCurrency(formData.totalAmount || 0)}
              </span>
            </div>
            {formData.downPaymentAmount && formData.downPaymentAmount > 0 && (
              <>
                <div className="flex items-start justify-between">
                  <span className="text-xs text-tertiary">Anticipo</span>
                  <span className="text-sm text-gray-300">
                    {formatCurrency(formData.downPaymentAmount)} ({formData.downPaymentPercentage}%)
                  </span>
                </div>
                <div className="flex items-start justify-between">
                  <span className="text-xs text-tertiary">A Financiar</span>
                  <span className="text-sm text-gray-600">
                    {formatCurrency((formData.totalAmount || 0) - formData.downPaymentAmount)}
                  </span>
                </div>
              </>
            )}
            <div className="flex items-start justify-between">
              <span className="text-xs text-tertiary">Plan de Cuotas</span>
              <span className="text-sm text-gray-300">
                {formData.installmentCount} cuotas de {formatCurrency(formData.installmentAmount || 0)}
              </span>
            </div>
            <div className="flex items-start justify-between">
              <span className="text-xs text-tertiary">Frecuencia</span>
              <span className="text-sm text-gray-300">
                {formData.paymentFrequency ? getPaymentFrequencyLabel(formData.paymentFrequency) : 'Mensual'}
              </span>
            </div>
            {formData.lateFeePercentage && formData.lateFeePercentage > 0 && (
              <div className="flex items-start justify-between">
                <span className="text-xs text-tertiary">Cargo por Mora</span>
                <span className="text-sm text-gray-300">
                  {formData.lateFeePercentage}% después de {formData.gracePeriodDays || 5} días
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Terms Acceptance Summary */}
      <div className="card-flat p-6">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${
            formData.termsAccepted 
              ? 'bg-gray-100/20 text-gray-600' 
              : 'bg-gray-100/20 text-gray-600'
          }`}>
            {formData.termsAccepted ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            )}
          </div>
          <div className="flex-1">
            <p className={`text-sm font-normal ${
              formData.termsAccepted ? 'text-gray-600' : 'text-gray-600'
            }`}>
              {formData.termsAccepted 
                ? 'Términos y condiciones aceptados' 
                : 'Los términos y condiciones no han sido aceptados'}
            </p>
            <p className="text-xs text-tertiary mt-0.5">
              {formData.termsAccepted 
                ? 'El cliente ha revisado y aceptado todos los términos contractuales' 
                : 'Debes aceptar los términos antes de crear el proyecto'}
            </p>
          </div>
        </div>
      </div>

      {/* Action Summary */}
      <div className="p-6 bg-gradient-to-r from-red-500/5 to-orange-500/5 border border-gray-200/20 rounded-lg">
        <h3 className="text-base font-normal text-gray-600 mb-4">
          ¿Qué sucederá al confirmar?
        </h3>
        
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-gray-100/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs text-gray-600">1</span>
            </div>
            <div>
              <p className="text-sm text-gray-300">Se creará el proyecto con toda la información ingresada</p>
              <p className="text-xs text-tertiary mt-0.5">El proyecto aparecerá en tu lista de proyectos activos</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-gray-100/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs text-gray-600">2</span>
            </div>
            <div>
              <p className="text-sm text-gray-300">Se generará el cronograma de pagos completo</p>
              <p className="text-xs text-tertiary mt-0.5">Podrás trackear cada pago y su estado</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-gray-100/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs text-gray-600">3</span>
            </div>
            <div>
              <p className="text-sm text-gray-300">Podrás enviar el contrato al cliente</p>
              <p className="text-xs text-tertiary mt-0.5">Genera y comparte documentos profesionales en PDF</p>
            </div>
          </div>
        </div>

        <div className="mt-6 p-3 bg-gray-900/10 border border-gray-200/20 rounded">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs text-gray-600">
              Podrás editar toda la información del proyecto después de crearlo
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}