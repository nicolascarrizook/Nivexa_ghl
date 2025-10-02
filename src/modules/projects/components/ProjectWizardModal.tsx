import React, { useContext, useEffect } from 'react';
import { X, ArrowRight, ArrowLeft, Check, AlertCircle } from 'lucide-react';
import { ProjectWizardContext } from '../contexts/ProjectWizardContext';

// Import existing wizard steps
import { ProjectBasicsStep } from './wizard/ProjectBasicsStep';
import { ClientDetailsStep } from './wizard/ClientDetailsStep';
import { PaymentConfigStep } from './wizard/PaymentConfigStep';
import { TermsConditionsStep } from './wizard/TermsConditionsStep';
import { ReviewConfirmStep } from './wizard/ReviewConfirmStep';
import { StepIndicator } from './wizard/StepIndicator';

interface ProjectWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  setHasUnsavedChanges: (value: boolean) => void;
  setIsAutoSaving: (value: boolean) => void;
}

const WIZARD_STEPS = [
  { number: 1, title: 'Información del Proyecto' },
  { number: 2, title: 'Datos del Cliente' },
  { number: 3, title: 'Configuración de Pago' },
  { number: 4, title: 'Términos y Condiciones' },
  { number: 5, title: 'Revisión y Confirmación' }
];

export function ProjectWizardModal({
  isOpen,
  onClose,
  setHasUnsavedChanges,
  setIsAutoSaving
}: ProjectWizardModalProps) {
  const context = useContext(ProjectWizardContext);

  if (!context) {
    throw new Error('ProjectWizardModal must be used within ProjectWizardProvider');
  }

  const {
    currentStep,
    setCurrentStep,
    formData,
    canProceed,
    isSubmitting,
    submitProject,
    validateStep
  } = context;

  // Track unsaved changes whenever form data changes
  useEffect(() => {
    if (Object.keys(formData).length > 0 && formData.projectName) {
      setHasUnsavedChanges(true);
      // Set auto-saving to true for a moment to indicate save
      setIsAutoSaving(true);
      const timer = setTimeout(() => setIsAutoSaving(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [formData, setHasUnsavedChanges, setIsAutoSaving]);

  const handleNext = () => {
    if (validateStep(currentStep) && currentStep < WIZARD_STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    const success = await submitProject();
    if (success) {
      setHasUnsavedChanges(false);
      onClose();
      // Reset to first step for next time
      setCurrentStep(1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <ProjectBasicsStep />;
      case 2:
        return <ClientDetailsStep />;
      case 3:
        return <PaymentConfigStep />;
      case 4:
        return <TermsConditionsStep />;
      case 5:
        return <ReviewConfirmStep />;
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop with reduced opacity to fix the black screen issue */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-30 transition-opacity"
          onClick={onClose}
        />

        {/* Modal with higher z-index */}
        <div className="relative z-10 bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Crear Nuevo Proyecto
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Complete los siguientes pasos para crear un nuevo proyecto
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
              aria-label="Cerrar modal"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="px-6 py-4 border-b border-gray-100">
            <StepIndicator
              steps={WIZARD_STEPS}
              currentStep={currentStep}
            />
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {renderStepContent()}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className={`
                  flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors
                  ${currentStep === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                `}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Anterior
              </button>

              <div className="flex items-center space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                
                {currentStep < WIZARD_STEPS.length ? (
                  <button
                    onClick={handleNext}
                    disabled={!canProceed}
                    className={`
                      flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors
                      ${canProceed
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'}
                    `}
                  >
                    Siguiente
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={!canProceed || isSubmitting}
                    className={`
                      flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors
                      ${canProceed && !isSubmitting
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'}
                    `}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Creando...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Crear Proyecto
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Auto-save indicator */}
            {formData.projectName && (
              <div className="mt-3 text-center">
                <p className="text-xs text-gray-500">
                  <AlertCircle className="inline h-3 w-3 mr-1" />
                  Los cambios se guardan automáticamente como borrador
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}