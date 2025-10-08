import { projectService } from "../services/ProjectService";
import { supabase } from "@/config/supabase";
import { newCashBoxService } from "@/services/cash/NewCashBoxService";
import { contractStorageService } from "../services/ContractStorageService";
import React, {
  createContext,
  useCallback,
  useEffect,
  useState,
} from "react";
import type { ProjectFormData } from "../types/project.types";

export interface ProjectWizardContextType {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  formData: Partial<ProjectFormData>;
  updateFormData: (data: Partial<ProjectFormData>) => void;
  canProceed: boolean;
  setCanProceed: (value: boolean) => void;
  isSubmitting: boolean;
  submitProject: () => Promise<boolean>;
  validateStep: (step: number) => boolean;
}

export const ProjectWizardContext = createContext<
  ProjectWizardContextType | undefined
>(undefined);

interface ProjectWizardProviderProps {
  children: React.ReactNode;
}

export function ProjectWizardProvider({
  children,
}: ProjectWizardProviderProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<ProjectFormData>>({});
  const [canProceed, setCanProceed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draftProjectId, setDraftProjectId] = useState<string | null>(null);

  // Load draft from database on mount
  useEffect(() => {
    const loadDraft = async () => {
      try {
        // Get any existing draft project for the current user
        const { data: drafts } = await supabase
          .from('projects')
          .select('*')
          .eq('status', 'draft')
          .order('updated_at', { ascending: false })
          .limit(1);

        if (drafts && drafts.length > 0) {
          const draft = drafts[0];
          setDraftProjectId(draft.id);
          
          // Convert database project to form data format
          const formDataFromDraft: Partial<ProjectFormData> = {
            projectName: draft.name,
            projectType: draft.project_type as ProjectFormData['projectType'],
            clientId: draft.client_id || undefined,
            clientName: draft.client_name,
            clientEmail: draft.client_email || '',
            clientPhone: draft.client_phone || '',
            clientTaxId: draft.client_tax_id || '',
            propertyAddress: draft.metadata?.propertyAddress || '',
            totalAmount: draft.total_amount,
            installmentCount: draft.installments_count,
            installmentAmount: draft.installment_amount || undefined,
            downPaymentAmount: draft.down_payment_amount,
            downPaymentPercentage: draft.down_payment_percentage || undefined,
            lateFeePercentage: draft.late_fee_percentage,
            estimatedStartDate: draft.start_date || '',
            estimatedEndDate: draft.estimated_end_date || '',
            projectDescription: draft.description || '',
            termsAccepted: false, // Never auto-accept terms
          };
          
          setFormData(formDataFromDraft);
        }
      } catch (error) {
        console.error("Error loading draft:", error);
      }
    };

    loadDraft();
  }, []);

  // Auto-save to database as draft project
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (Object.keys(formData).length > 0 && formData.projectName) {
        try {
          const draftData = {
            name: formData.projectName,
            client_id: formData.clientId || null,
            client_name: formData.clientName || 'Cliente sin nombre',
            client_email: formData.clientEmail || null,
            client_phone: formData.clientPhone || null,
            client_tax_id: formData.clientTaxId || null,
            project_type: formData.projectType || 'other',
            status: 'draft' as const,
            total_amount: formData.totalAmount || 0,
            down_payment_amount: formData.downPaymentAmount || 0,
            down_payment_percentage: formData.downPaymentPercentage || null,
            installments_count: formData.installmentCount || 1,
            installment_amount: formData.installmentAmount || null,
            late_fee_percentage: formData.lateFeePercentage || 0,
            start_date: formData.estimatedStartDate || null,
            estimated_end_date: formData.estimatedEndDate || null,
            description: formData.projectDescription || null,
            metadata: {
              propertyAddress: formData.propertyAddress || '',
              isDraft: true,
              lastSaved: new Date().toISOString(),
            },
          };

          if (draftProjectId) {
            // Update existing draft
            await supabase
              .from('projects')
              .update(draftData)
              .eq('id', draftProjectId);
          } else {
            // Create new draft with generated code
            const { data: newDraft } = await supabase
              .from('projects')
              .insert({
                ...draftData,
                code: `DRAFT-${Date.now()}`, // Temporary code for drafts
              })
              .select()
              .single();
            
            if (newDraft) {
              setDraftProjectId(newDraft.id);
            }
          }
        } catch (error) {
          console.error("Error auto-saving draft:", error);
        }
      }
    }, 2000); // Save after 2 seconds of inactivity

    return () => clearTimeout(timeoutId);
  }, [formData, draftProjectId]);

  const updateFormData = useCallback((data: Partial<ProjectFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  }, []);

  const validateStep = useCallback(
    (step: number): boolean => {
      switch (step) {
        case 1: // Project Basics
          return !!(
            formData.projectName &&
            formData.projectType
          );

        case 2: // Client Details
          return !!(
            formData.clientName &&
            formData.clientEmail &&
            formData.clientPhone &&
            formData.propertyAddress
          );

        case 3: // Payment Configuration
          const hasPaymentConfig = !!(
            formData.totalAmount &&
            formData.totalAmount > 0 &&
            formData.installmentCount &&
            formData.installmentCount >= 1 &&
            formData.installmentCount <= 120
          );
          
          // If there's a down payment, it must be confirmed
          const hasDownPayment = formData.downPaymentAmount && formData.downPaymentAmount > 0;
          const paymentConfirmed = !hasDownPayment || (hasDownPayment && formData.paymentConfirmation?.confirmed);
          
          return hasPaymentConfig && paymentConfirmed;

        case 4: // Terms & Conditions
          return !!formData.contractSigned; // Contract must be signed

        case 5: // Review & Confirm
          return !!formData.contractSigned; // Contract signature required

        default:
          return false;
      }
    },
    [formData]
  );

  const submitProject = useCallback(async (): Promise<boolean> => {
    try {
      setIsSubmitting(true);

      // Validate all steps
      for (let i = 1; i <= 5; i++) {
        if (!validateStep(i)) {
          console.error(`Step ${i} validation failed`);
          return false;
        }
      }

      // Submit the project using real Supabase service
      const result = await projectService.createProjectFromForm(formData as ProjectFormData);

      if (!result) {
        throw new Error('Failed to create project');
      }

      // Generate and upload signed contract PDF
      if (formData.contractSigned && result.id) {
        try {
          console.log('Generating and uploading signed contract PDF...');
          const contractData = await contractStorageService.uploadContract(
            result.id,
            formData as ProjectFormData
          );

          // Update project metadata with contract information
          await supabase
            .from('projects')
            .update({
              metadata: {
                ...(result.metadata || {}),
                contract: {
                  pdfPath: contractData.path,
                  pdfUrl: contractData.url,
                  signedBy: formData.clientSignature,
                  signedAt: formData.signatureDate,
                  generatedAt: new Date().toISOString(),
                },
              },
            })
            .eq('id', result.id);

          console.log('Contract PDF uploaded successfully:', contractData);
        } catch (error) {
          console.error('Error uploading contract PDF:', error);
          // Don't fail the project creation if PDF upload fails
          // The contract can be regenerated later if needed
        }
      }

      // Process payment confirmation if it exists
      if (formData.paymentConfirmation?.confirmed && formData.downPaymentAmount) {
        try {
          // Get the current user's organization ID
          const { data: { user } } = await supabase.auth.getUser();
          const organizationId = user?.id;

          if (organizationId && result.id) {
            console.log('Processing payment confirmation for new project:', {
              organizationId,
              projectId: result.id,
              amount: formData.downPaymentAmount,
              currency: formData.currency || 'ARS'
            });

            // Process the payment in both cash boxes
            const paymentResult = await cashBoxService.processPaymentToBothCashBoxes({
              organization_id: organizationId,
              project_id: result.id,
              amount: formData.downPaymentAmount,
              currency: formData.currency || 'ARS',
              payment_type: 'down_payment',
              description: `Anticipo inicial - ${formData.projectName}`,
              reference_number: formData.paymentConfirmation.referenceNumber,
              payment_method: formData.paymentConfirmation.paymentMethod,
              client_id: formData.clientId,
              installment_number: 0,
              exchange_rate: formData.exchangeRate || 1
            });

            console.log('Payment processed successfully:', paymentResult);
          }
        } catch (error) {
          console.error('Error processing payment confirmation:', error);
          // Don't fail the project creation if payment processing fails
          // The project is already created, payment can be processed later
        }
      }

      // Clear the draft from database if it was a saved draft
      if (draftProjectId) {
        await supabase
          .from('projects')
          .delete()
          .eq('id', draftProjectId);
        setDraftProjectId(null);
      }

      return true;
    } catch (error) {
      console.error("Error creating project:", error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateStep]);

  // Update canProceed when step changes or form data changes
  useEffect(() => {
    setCanProceed(validateStep(currentStep));
  }, [currentStep, formData, validateStep]);

  const value: ProjectWizardContextType = {
    currentStep,
    setCurrentStep,
    formData,
    updateFormData,
    canProceed,
    setCanProceed,
    isSubmitting,
    submitProject,
    validateStep,
  };

  return (
    <ProjectWizardContext.Provider value={value}>
      {children}
    </ProjectWizardContext.Provider>
  );
}
