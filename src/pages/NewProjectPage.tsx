// Design System Components
import { 
  Button,
  PageLayout, 
  HeaderContentArea, 
  MainContentArea, 
  Section,
  Divider,
  PageTitle, 
  BodyText, 
  MutedText,
  ProjectFormSkeleton
} from '@/components';

// Project Components
import { EnterpriseClientDetailsStep } from "@modules/projects/components/wizard/EnterpriseClientDetailsStep";
import { EnterprisePaymentConfigStep } from "@modules/projects/components/wizard/EnterprisePaymentConfigStep";
import { EnterpriseProjectBasicsStep } from "@modules/projects/components/wizard/EnterpriseProjectBasicsStep";
import { EnterpriseReviewConfirmStep } from "@modules/projects/components/wizard/EnterpriseReviewConfirmStep";
import { EnterpriseStepIndicator } from "@modules/projects/components/wizard/EnterpriseStepIndicator";
import { EnterpriseTermsConditionsStep } from "@modules/projects/components/wizard/EnterpriseTermsConditionsStep";
import { ProjectWizardProvider } from "@modules/projects/contexts/ProjectWizardContext";
import { useProjectWizard } from "@modules/projects/hooks/useProjectWizard";
import { useNavigate } from "react-router-dom";

const WIZARD_STEPS = [
  { id: "basics", label: "Proyecto", component: EnterpriseProjectBasicsStep },
  { id: "client", label: "Cliente", component: EnterpriseClientDetailsStep },
  {
    id: "payment",
    label: "Financiación",
    component: EnterprisePaymentConfigStep,
  },
  { id: "terms", label: "Términos", component: EnterpriseTermsConditionsStep },
  {
    id: "review",
    label: "Confirmación",
    component: EnterpriseReviewConfirmStep,
  },
];

function NewProjectWizard() {
  const navigate = useNavigate();
  const {
    currentStep,
    setCurrentStep,
    canProceed,
    isSubmitting,
    submitProject,
  } = useProjectWizard();

  const CurrentStepComponent = WIZARD_STEPS[currentStep - 1].component;

  const handleNext = () => {
    if (currentStep < WIZARD_STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCancel = () => {
    if (
      window.confirm(
        "¿Estás seguro de que deseas cancelar? Se perderán todos los cambios no guardados."
      )
    ) {
      navigate("/projects");
    }
  };

  const handleSubmit = async () => {
    const success = await submitProject();
    if (success) {
      navigate("/projects");
    }
  };

  return (
    <PageLayout>
      {/* Header */}
      <Section background="white" border="bottom" spacing="sm" className="sticky top-0 z-30">
        <HeaderContentArea>
          <div className="flex items-center justify-between">
            <div>
              <PageTitle level={1} size="lg" className="text-gray-900">
                Nuevo Proyecto
              </PageTitle>
              <BodyText size="sm" className="text-gray-600 mt-1">
                Creación de un nuevo proyecto para el desarrollo de propiedad
                del cliente
              </BodyText>
            </div>
            <Button variant="ghost" size="sm" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        </HeaderContentArea>
      </Section>

      {/* Content */}
      <MainContentArea>
        <Section spacing="md">
          {/* Step Indicator */}
          <EnterpriseStepIndicator
            steps={WIZARD_STEPS}
            currentStep={currentStep}
          />

          {/* Step Content */}
          <div className="mt-8">
            {isSubmitting ? (
              <ProjectFormSkeleton />
            ) : (
              <Section background="white" border="around" spacing="lg">
                <CurrentStepComponent />
              </Section>
            )}
          </div>

          {/* Action Bar */}
          <Divider spacing="lg" />
          <div className="flex items-center justify-between">
            <div>
              {currentStep > 1 && (
                <Button
                  variant="secondary"
                  onClick={handlePrevious}
                  disabled={isSubmitting}
                  className="px-6 py-2"
                >
                  Previous
                </Button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="px-6 py-2"
              >
                Cancel
              </Button>

              {currentStep < WIZARD_STEPS.length ? (
                <Button
                  variant="primary"
                  onClick={handleNext}
                  disabled={!canProceed || isSubmitting}
                  className="px-6 py-2"
                >
                  Continue
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={handleSubmit}
                  disabled={!canProceed || isSubmitting}
                  className="px-6 py-2"
                >
                  {isSubmitting ? "Creating Project..." : "Create Project"}
                </Button>
              )}
            </div>
          </div>

          {/* Auto-save indicator */}
          <div className="mt-4 text-center">
            <MutedText size="xs">
              Changes are saved automatically
            </MutedText>
          </div>
        </Section>
      </MainContentArea>
    </PageLayout>
  );
}

export function NewProjectPage() {
  return (
    <ProjectWizardProvider>
      <NewProjectWizard />
    </ProjectWizardProvider>
  );
}
